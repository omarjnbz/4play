"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { channels } from "@/lib/content";

type Levels = Record<(typeof channels)[number]["id"], number>;

const INITIAL: Levels = { hypnotic: 85, groove: 55, house: 20, psychedelic: 40, energy: 25, vibe: 15 };

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function LightDesk() {
  const [levels, setLevels] = useState<Levels>(INITIAL);

  const mix = useMemo(() => {
    let total = 0;
    const rgb = [0, 0, 0];
    let bpm = 0;
    let lead: (typeof channels)[number] = channels[0];
    for (const ch of channels) {
      const w = (levels[ch.id] / 100) ** 2;
      const c = hexToRgb(ch.light);
      rgb.forEach((_, i) => (rgb[i] += c[i] * w));
      bpm += ch.bpm * w;
      total += w;
      if (levels[ch.id] > levels[lead.id]) lead = ch;
    }
    const safe = total || 1;
    const color = `rgb(${rgb.map((v) => Math.round(v / safe)).join(" ")})`;
    return { color, bpm: Math.round(total ? bpm / safe : 124), lead };
  }, [levels]);

  const solo = (id: keyof Levels) =>
    setLevels((prev) => {
      const next = { ...prev };
      (Object.keys(next) as (keyof Levels)[]).forEach((k) => (next[k] = k === id ? 100 : 12));
      return next;
    });

  return (
    <section
      id="sound"
      aria-labelledby="sound-title"
      className="relative overflow-hidden bg-ink py-28 sm:py-36"
      style={{ "--light": mix.color } as React.CSSProperties}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-1/4 left-1/2 h-[90vh] w-[120vw] -translate-x-1/2 opacity-30 transition-[background] duration-700"
        style={{ background: "radial-gradient(closest-side, var(--light), transparent)" }}
      />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p data-fade className="label mb-5 text-gold">
              Music identity
            </p>
            <h2 id="sound-title" data-split className="display text-[clamp(2.8rem,8vw,7.5rem)]">
              The 4PLAY sound
            </h2>
          </div>
          <p data-fade className="max-w-sm font-serif text-xl leading-snug text-bone-2 italic">
            Six moods, mixed live. Push the faders and the room changes with you. No fixed formula: the crowd decides.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10">
          {/* Stage: the photo for the leading mood, lit by the mixed colour */}
          <div className="relative aspect-[4/5] overflow-hidden bg-ink-2 sm:aspect-[5/4] lg:aspect-auto lg:min-h-[620px]">
            {channels.map((ch) => (
              <Image
                key={ch.id}
                src={ch.image}
                alt={ch.id === mix.lead.id ? `4PLAY on stage — ${ch.label.toLowerCase()} lighting` : ""}
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className={`object-cover grayscale transition-[opacity,transform] duration-700 ease-[var(--ease-out)] ${
                  ch.id === mix.lead.id ? "scale-100 opacity-100" : "scale-105 opacity-0"
                }`}
              />
            ))}
            <div
              className="absolute inset-0 mix-blend-color transition-[background-color] duration-500"
              style={{ backgroundColor: "var(--light)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8" aria-live="polite">
              <p className="label text-bone/70">
                Leading channel · <span className="tabular-nums">{mix.bpm}</span> BPM
              </p>
              <p className="display mt-2 text-[clamp(2.4rem,6vw,5.5rem)]">{mix.lead.label}</p>
              <p className="mt-3 max-w-md text-bone-2">{mix.lead.line}</p>
            </div>
          </div>

          {/* Desk */}
          <div className="flex flex-col rounded-sm border border-line bg-ink-2 p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <p className="label text-mute">4PLAY · Light desk</p>
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-full transition-colors duration-500" style={{ background: "var(--light)" }} />
                <span className="label tabular-nums text-bone">{mix.bpm} BPM</span>
              </span>
            </div>

            <div className="grid flex-1 grid-cols-6 gap-1.5 sm:gap-3">
              {channels.map((ch, i) => {
                const v = levels[ch.id];
                const isLead = ch.id === mix.lead.id;
                return (
                  <div key={ch.id} className="flex flex-col items-center gap-3 rounded-sm bg-ink/60 py-3">
                    <span className="label text-[0.6rem] text-mute">CH{i + 1}</span>
                    {/* Gain knob reflects the fader */}
                    <span aria-hidden="true" className="relative grid size-8 place-items-center rounded-full border border-line bg-ink-3">
                      <span
                        className="absolute top-1 left-1/2 h-2.5 w-0.5 origin-[50%_12px] -translate-x-1/2 rounded-full bg-bone transition-transform duration-300"
                        style={{ transform: `translateX(-50%) rotate(${-135 + v * 2.7}deg)` }}
                      />
                    </span>
                    <div className="flex h-44 items-stretch gap-1.5 sm:h-56">
                      {/* LED meter bouncing on the channel tempo */}
                      <span aria-hidden="true" className="relative w-1.5 overflow-hidden rounded-full bg-ink-3">
                        <span
                          className="meter absolute inset-0 rounded-full"
                          style={
                            {
                              background: `linear-gradient(to top, ${ch.light}, ${ch.light} 70%, #fff)`,
                              "--beat": `${60 / ch.bpm}s`,
                              "--hi": v / 100,
                              "--lo": (v / 100) * 0.35,
                            } as React.CSSProperties
                          }
                        />
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={v}
                        onChange={(e) => setLevels((p) => ({ ...p, [ch.id]: Number(e.target.value) }))}
                        aria-label={`${ch.label} level`}
                        aria-valuetext={`${v} percent`}
                        className="fader"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => solo(ch.id)}
                      aria-label={`Solo ${ch.label}`}
                      className={`label w-full px-0.5 text-center text-[0.62rem] leading-tight tracking-[0.12em] transition-colors ${
                        isLead ? "text-bone" : "text-mute hover:text-bone"
                      }`}
                    >
                      <span
                        className="mx-auto mb-1.5 block h-1 w-5 rounded-full transition-opacity"
                        style={{ background: ch.light, opacity: isLead ? 1 : 0.3 }}
                      />
                      {ch.short}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between gap-4 border-t border-line pt-4">
              <p className="label text-mute">Tap a name to solo · drag to blend</p>
              <button
                type="button"
                onClick={() => setLevels(INITIAL)}
                className="label rounded-full border border-line px-3 py-1.5 text-bone transition-colors hover:bg-bone hover:text-ink"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <p
          data-fade
          className="mt-20 max-w-5xl font-serif text-[clamp(1.8rem,4vw,3.4rem)] leading-[1.08] text-bone italic"
        >
          Short loops. Polyrhythms. Deep grooves. Psychedelic textures.{" "}
          <span className="text-gold">Controlled energy.</span>
        </p>
      </div>
    </section>
  );
}
