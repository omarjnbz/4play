"use client";

import { Icon } from "./Icon";
import { startListening, stop, stopListening, tap, useTempo, type TempoStatus } from "@/lib/tempo";

const READOUT: Record<TempoStatus, string> = {
  stopped: "Stopped",
  tapping: "",
  starting: "Mic…",
  listening: "Listening",
  "no-signal": "No signal",
  waiting: "Mic ready",
  locked: "",
  blocked: "Mic blocked",
};

const HINT: Record<TempoStatus, string> = {
  stopped: "Tap the beat · or listen",
  tapping: "Tap again to adjust",
  starting: "Allow microphone access",
  listening: "Waiting for a beat",
  "no-signal": "Play some music",
  waiting: "Tap anywhere to start",
  locked: "Live from your mic",
  blocked: "Allow mic in browser",
};

// Hero corner: tap tempo + live BPM detection from the microphone.
export function TempoControl({ cssPulse }: { cssPulse: boolean }) {
  const { status, bpm, listening } = useTempo();
  const running = status === "tapping" || status === "locked";
  const readout = bpm ? `${bpm} BPM` : READOUT[status];

  return (
    <div data-hero-in className="flex items-end gap-2.5 sm:gap-3">
      <div className="flex flex-col items-end gap-1.5 text-right">
        <button
          type="button"
          onClick={tap}
          aria-label={`Tap tempo. ${readout}. Tap along to the beat to set the tempo of the visuals.`}
          className="group label flex touch-manipulation items-center gap-2.5 py-1 text-bone"
        >
          <span
            data-beat-dot
            className={`size-2 rounded-full transition-colors group-active:bg-gold ${running ? "bg-teal" : "bg-mute"} ${
              cssPulse && running ? "beat-css" : ""
            }`}
            style={bpm ? ({ "--beat": `${60 / bpm}s` } as React.CSSProperties) : undefined}
          />
          <span className="tabular-nums">{readout}</span>
          {status === "locked" && (
            <span className="rounded-sm bg-ember px-1.5 py-0.5 text-[0.55rem] leading-none tracking-[0.14em] text-ink">
              Live
            </span>
          )}
        </button>
        <p className="label text-[0.6rem] whitespace-nowrap text-mute">{HINT[status]}</p>
        <span className="sr-only" aria-live="polite">
          {readout}
        </span>
      </div>

      {status === "tapping" && (
        <button
          type="button"
          onClick={stop}
          aria-label="Stop the tempo"
          className="grid size-10 place-items-center rounded-full border border-line text-bone-2 transition-colors hover:border-bone hover:text-bone"
        >
          <Icon name="solar:stop-bold" className="size-4" />
        </button>
      )}

      <button
        type="button"
        onClick={() => (listening ? stopListening() : void startListening())}
        aria-pressed={listening}
        aria-label={listening ? "Stop listening" : "Listen with the microphone to detect the BPM"}
        className={`relative grid size-10 shrink-0 place-items-center rounded-full border transition-colors ${
          listening ? "border-ember bg-ember text-ink" : "border-line text-bone-2 hover:border-bone hover:text-bone"
        }`}
      >
        {listening && (
          <span aria-hidden="true" className="absolute inset-0 rounded-full border border-ember motion-safe:animate-ping" />
        )}
        <Icon name={listening ? "solar:microphone-3-bold" : "solar:microphone-3-linear"} className="size-5" />
      </button>
    </div>
  );
}

// Compact chip for the header while the mic is live, so it's always visible and stoppable.
export function TempoChip() {
  const { status, bpm, listening } = useTempo();
  if (!listening) return null;
  return (
    <button
      type="button"
      onClick={stopListening}
      aria-label={`Microphone is on${bpm ? `, ${bpm} BPM` : ""}. Stop listening`}
      className="label flex items-center gap-2 rounded-full border border-ember/60 px-3 py-1.5 text-bone transition-colors hover:bg-ember hover:text-ink"
    >
      <span className="size-1.5 rounded-full bg-ember motion-safe:animate-pulse" />
      <span className="tabular-nums">{bpm ? `${bpm} BPM` : status === "no-signal" ? "No signal" : status === "waiting" ? "Tap to start" : "Listening"}</span>
    </button>
  );
}
