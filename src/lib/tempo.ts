// Site-wide tempo: stopped by default, set by tap tempo, or detected live from
// the microphone. `pulse` is read every animation frame (no React involved);
// `useTempo()` exposes the slower-changing state to components.

import { useSyncExternalStore } from "react";

export type TempoStatus =
  | "stopped" // nothing driving the beat
  | "tapping" // manual tap tempo
  | "starting" // waiting for mic permission
  | "listening" // mic on, sound but no steady beat yet (talking, ambience)
  | "no-signal" // mic on, silence
  | "locked" // mic on, beat detected
  | "waiting" // mic granted, audio held by the browser until the first tap
  | "blocked"; // mic permission denied or unavailable

export type TempoState = {
  status: TempoStatus;
  bpm: number | null;
  listening: boolean;
};

// Hot values for render loops.
export const pulse = {
  running: false,
  bpm: 124,
  beatAt: 0, // performance.now() of the latest downbeat
  level: 1, // 0..1 loudness, scales the pulse when listening
};

let state: TempoState = { status: "stopped", bpm: null, listening: false };
const listeners = new Set<() => void>();

function set(next: Partial<TempoState>) {
  const merged = { ...state, ...next };
  if (merged.status === state.status && merged.bpm === state.bpm && merged.listening === state.listening) return;
  state = merged;
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

const SERVER: TempoState = { status: "stopped", bpm: null, listening: false };

export function useTempo() {
  return useSyncExternalStore(subscribe, () => state, () => SERVER);
}

/* ---------------------------------- Tap ---------------------------------- */

let taps: number[] = [];

export function tap() {
  if (state.listening) {
    endSession();
    set({ listening: false });
  }
  const now = performance.now();
  taps = [...taps.filter((t) => now - t < 2000), now].slice(-5);
  pulse.beatAt = now;
  pulse.level = 1;
  if (taps.length < 2) {
    // A single tap just fires one hit; tempo needs a second tap.
    if (state.status !== "tapping") pulse.running = false;
    return;
  }
  const interval = (taps[taps.length - 1] - taps[0]) / (taps.length - 1);
  const bpm = Math.round(Math.min(180, Math.max(70, 60000 / interval)));
  pulse.bpm = bpm;
  pulse.running = true;
  set({ status: "tapping", bpm });
}

export function stop() {
  stopListening();
  taps = [];
  pulse.running = false;
  set({ status: "stopped", bpm: null, listening: false });
}

/* ------------------------------- Listening ------------------------------- */

// Runs on the audio thread: two one-pole low-passes isolate the kick/bass,
// then every 512 samples it posts [lowBandRms, fullBandRms].
const WORKLET = `
class EnergyProcessor extends AudioWorkletProcessor {
  constructor() { super(); this.a = 1 - Math.exp(-2 * Math.PI * 150 / sampleRate); this.l1 = 0; this.l2 = 0; this.lo = 0; this.full = 0; this.n = 0; }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (!ch) return true;
    for (let i = 0; i < ch.length; i++) {
      const x = ch[i];
      this.l1 += this.a * (x - this.l1);
      this.l2 += this.a * (this.l1 - this.l2);
      this.lo += this.l2 * this.l2;
      this.full += x * x;
    }
    this.n += ch.length;
    if (this.n >= 512) {
      this.port.postMessage([Math.sqrt(this.lo / this.n), Math.sqrt(this.full / this.n)]);
      this.lo = 0; this.full = 0; this.n = 0;
    }
    return true;
  }
}
registerProcessor("energy", EnergyProcessor);
`;

const MIN_BPM = 70;
const MAX_BPM = 180;
const SILENCE = 0.0025; // full-band RMS below this is "nothing playing"
// A real beat autocorrelates strongly at one period AND repeats at two;
// speech and ambience fail one or both (measured: music ~0.85/0.75, talk ~0.12/0.0).
const MIN_CONFIDENCE = 0.22;
const MIN_REPEAT = 0.1;

type Session = { stream: MediaStream; close: () => void };
let session: Session | null = null;
let startToken = 0;

// Chrome/Edge expose raw mic frames without Web Audio, which (unlike an
// AudioContext) doesn't need a user gesture, so listening can start on load.
type TrackProcessorCtor = new (init: { track: MediaStreamTrack }) => { readable: ReadableStream<AudioData> };
function trackProcessor(): TrackProcessorCtor | null {
  const ctor = (globalThis as { MediaStreamTrackProcessor?: TrackProcessorCtor }).MediaStreamTrackProcessor;
  return typeof ctor === "function" ? ctor : null;
}

// Main-thread twin of the worklet: low-band and full-band RMS per 512 samples.
function createEnergyMeter(sampleRate: number, onBlock: (low: number, full: number) => void) {
  const a = 1 - Math.exp((-2 * Math.PI * 150) / sampleRate);
  let l1 = 0;
  let l2 = 0;
  let lo = 0;
  let full = 0;
  let n = 0;
  return (ch: Float32Array, len: number) => {
    for (let i = 0; i < len; i++) {
      const x = ch[i];
      l1 += a * (x - l1);
      l2 += a * (l1 - l2);
      lo += l2 * l2;
      full += x * x;
      if (++n >= 512) {
        onBlock(Math.sqrt(lo / n), Math.sqrt(full / n));
        lo = 0;
        full = 0;
        n = 0;
      }
    }
  };
}

function readFrames(track: MediaStreamTrack, Processor: TrackProcessorCtor) {
  const reader = new Processor({ track }).readable.getReader();
  let alive = true;
  let meter: ReturnType<typeof createEnergyMeter> | null = null;
  let buf = new Float32Array(0);
  void (async () => {
    while (alive) {
      const { value, done } = await reader.read();
      if (done || !value) break;
      try {
        if (!meter) meter = createEnergyMeter(value.sampleRate, createDetector(value.sampleRate / 512));
        const len = value.numberOfFrames;
        if (buf.length < len) buf = new Float32Array(len);
        value.copyTo(buf, { planeIndex: 0, format: "f32-planar" });
        meter(buf, len);
      } finally {
        value.close();
      }
    }
  })().catch(() => {});
  return () => {
    alive = false;
    void reader.cancel().catch(() => {});
  };
}

async function runWorklet(ctx: AudioContext, stream: MediaStream) {
  const url = URL.createObjectURL(new Blob([WORKLET], { type: "application/javascript" }));
  try {
    await ctx.audioWorklet.addModule(url);
  } finally {
    URL.revokeObjectURL(url);
  }
  const source = ctx.createMediaStreamSource(stream);
  const node = new AudioWorkletNode(ctx, "energy");
  // Browsers only render nodes that reach the destination; a muted gain keeps
  // the analyser running without playing the mic back out of the speakers.
  const mute = ctx.createGain();
  mute.gain.value = 0;
  source.connect(node).connect(mute).connect(ctx.destination);
  const detector = createDetector(ctx.sampleRate / 512);
  node.port.onmessage = (e: MessageEvent<[number, number]>) => detector(e.data[0], e.data[1]);
  return () => {
    node.port.onmessage = null;
    node.disconnect();
    void ctx.close();
  };
}

// Visitors who switch the mic off aren't auto-listened to again.
const PREF = "4play:auto-listen";
function rememberChoice(on: boolean) {
  try {
    localStorage.setItem(PREF, on ? "on" : "off");
  } catch {}
}
function choseOff() {
  try {
    return localStorage.getItem(PREF) === "off";
  } catch {
    return false;
  }
}

export async function startListening() {
  if (session || state.status === "starting") return;
  const token = ++startToken;
  taps = [];
  pulse.running = false;
  rememberChoice(true);
  set({ status: "starting", bpm: null, listening: true });

  const Processor = trackProcessor();
  // Without the frame reader we need Web Audio. Create it now, inside the
  // click when there is one: the permission prompt would consume the gesture.
  const ctx = Processor ? null : new AudioContext();
  const resumed = ctx?.resume().catch(() => {});

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
  } catch {
    void ctx?.close();
    if (token === startToken) set({ status: "blocked", bpm: null, listening: false });
    return;
  }
  // Stopped (or restarted) while the permission prompt was open.
  if (token !== startToken || !state.listening) {
    stream.getTracks().forEach((t) => t.stop());
    void ctx?.close();
    return;
  }

  if (Processor) {
    const close = readFrames(stream.getAudioTracks()[0], Processor);
    session = { stream, close };
    set({ status: "no-signal" });
    return;
  }

  await resumed;
  const audio = ctx!;
  session = { stream, close: await runWorklet(audio, stream) };
  if (audio.state === "running") {
    set({ status: "no-signal" });
    return;
  }
  // Started without a gesture (auto-start): the browser holds audio until the
  // visitor first touches the page, then we pick up immediately.
  set({ status: "waiting" });
  const wake = () => void audio.resume().catch(() => {});
  audio.onstatechange = () => {
    if (audio.state === "running" && state.status === "waiting") set({ status: "no-signal" });
  };
  for (const type of ["pointerdown", "keydown", "touchend"]) {
    window.addEventListener(type, wake, { once: true, capture: true });
  }
}

function endSession() {
  startToken++;
  if (session) {
    session.close();
    session.stream.getTracks().forEach((t) => t.stop());
    session = null;
  }
  pulse.running = false;
  pulse.level = 1;
}

export function stopListening() {
  if (!session && !state.listening) return;
  rememberChoice(false);
  endSession();
  set({ status: "stopped", bpm: null, listening: false });
}

let autoTried = false;

// Start listening on page load unless the visitor previously switched it off
// or has blocked the mic. Shows the browser's permission prompt on first visit.
export async function autoListen() {
  if (autoTried || typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return;
  autoTried = true;
  if (choseOff()) return;
  try {
    const permission = await navigator.permissions?.query({ name: "microphone" as PermissionName });
    if (permission?.state === "denied") {
      set({ status: "blocked", bpm: null, listening: false });
      return;
    }
  } catch {}
  if (state.listening || state.status === "tapping") return;
  await startListening();
}

// Beat tracker: onset envelope from low-band energy flux, tempo from its
// autocorrelation (weighted toward club tempos), phase from detected kicks.
function createDetector(fps: number) {
  const size = Math.round(fps * 8);
  const onset = new Float32Array(size);
  let write = 0;
  let filled = 0;
  let prevLog = 0;
  let mean = 0;
  let variance = 0;
  let level = 0;
  let quietFor = 0;
  let sinceEstimate = 0;
  let lastOnsetAt = 0;
  let misses = 0;
  const estimates: number[] = [];

  const minLag = Math.floor((60 * fps) / MAX_BPM);
  const maxLag = Math.ceil((60 * fps) / MIN_BPM);
  const maxWindow = Math.round(fps * 6);
  const minWindow = Math.round(fps * 3.5);
  const x = new Float32Array(maxWindow);

  function estimate() {
    // Copy the latest window (up to 6s) in time order, mean-removed.
    const window = Math.min(filled, maxWindow);
    let sum = 0;
    for (let i = 0; i < window; i++) {
      const v = onset[(write - window + i + size) % size];
      x[i] = v;
      sum += v;
    }
    const m = sum / window;
    let r0 = 0;
    for (let i = 0; i < window; i++) {
      x[i] -= m;
      r0 += x[i] * x[i];
    }
    if (r0 <= 1e-9) return null;

    const ac = (lag: number) => {
      let s = 0;
      for (let i = lag; i < window; i++) s += x[i] * x[i - lag];
      return s / r0;
    };
    const r = new Float32Array(maxLag * 2 + 2);
    for (let lag = minLag - 1; lag <= Math.min(maxLag * 2 + 1, window - 1); lag++) r[lag] = ac(lag);

    let best = -1;
    let bestScore = -Infinity;
    for (let lag = minLag; lag <= maxLag; lag++) {
      const bpm = (60 * fps) / lag;
      const prior = Math.exp(-0.5 * (Math.log2(bpm / 126) / 0.45) ** 2);
      const score = (r[lag] + 0.5 * (r[lag * 2] || 0)) * prior;
      if (score > bestScore) {
        bestScore = score;
        best = lag;
      }
    }
    if (best < 0) return null;
    // Parabolic interpolation for sub-frame lag precision.
    const a = r[best - 1];
    const b = r[best];
    const c = r[best + 1];
    const denom = a - 2 * b + c;
    const shift = denom !== 0 ? Math.max(-0.5, Math.min(0.5, (0.5 * (a - c)) / denom)) : 0;
    return { bpm: (60 * fps) / (best + shift), confidence: b, repeat: r[best * 2] || 0 };
  }

  return (low: number, full: number) => {
    const now = performance.now();

    // Loudness and silence.
    level = level * 0.9 + full * 0.1;
    pulse.level = Math.min(1, 0.35 + level * 12);
    if (level < SILENCE) {
      quietFor += 1 / fps;
      if (quietFor > 1.2) {
        pulse.running = false;
        estimates.length = 0;
        set({ status: "no-signal", bpm: null });
      }
    } else {
      quietFor = 0;
      if (state.status === "no-signal") set({ status: "listening" });
    }

    // Onset strength: positive change in log low-band energy.
    const lg = Math.log1p(low * 400);
    const o = Math.max(0, lg - prevLog);
    prevLog = lg;
    onset[write] = o;
    write = (write + 1) % size;
    filled = Math.min(size, filled + 1);

    // Kick detection for phase: adaptive threshold over ~1s.
    mean = mean * 0.985 + o * 0.015;
    variance = variance * 0.985 + (o - mean) ** 2 * 0.015;
    const period = 60000 / pulse.bpm;
    const isOnset = o > mean + 2 * Math.sqrt(variance) && o > 0.02;
    if (isOnset && now - lastOnsetAt > period * 0.55) {
      lastOnsetAt = now;
      if (pulse.running) {
        // Snap the downbeat only when the kick lands near where we expect one,
        // so off-beat hats don't drag the phase.
        const since = (now - pulse.beatAt) % period;
        const offset = Math.min(since, period - since);
        if (offset < period * 0.3) pulse.beatAt = now;
      }
    }

    // Re-estimate tempo twice a second once there's enough history.
    sinceEstimate += 1;
    if (sinceEstimate >= fps / 2 && filled >= minWindow && quietFor === 0) {
      sinceEstimate = 0;
      const est = estimate();
      if (est && est.confidence > MIN_CONFIDENCE && est.repeat > MIN_REPEAT) {
        misses = 0;
        estimates.push(est.bpm);
        if (estimates.length > 6) estimates.shift();
        const sorted = [...estimates].sort((p, q) => p - q);
        const median = sorted[Math.floor(sorted.length / 2)];
        const bpm = Math.round(median);
        if (!pulse.running) pulse.beatAt = lastOnsetAt || now;
        pulse.bpm = median;
        pulse.running = true;
        set({ status: "locked", bpm });
      } else if (level >= SILENCE && ++misses >= 3) {
        pulse.running = false;
        estimates.length = 0;
        set({ status: "listening", bpm: null });
      }
    }
  };
}
