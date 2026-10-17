"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "./Icon";
import { useMedia } from "./Media";
import { videos } from "@/lib/content";
import { prefersReducedMotion } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

const COLS = 18;
const ROWS = 11;
const live = videos.find((v) => v.id === "9cC_tpEmfLU")!;

export function FeaturedLive() {
  const root = useRef<HTMLElement>(null);
  const { playVideo } = useMedia();

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-glyph]", {
        scale: 0,
        autoAlpha: 0,
        duration: 0.6,
        ease: "back.out(2)",
        stagger: { grid: [ROWS, COLS], from: "center", amount: 1.1 },
        scrollTrigger: { trigger: el, start: "top 70%", once: true },
      });
      gsap.fromTo(
        "[data-live-thumb]",
        { yPercent: 12 },
        {
          yPercent: -12,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} aria-labelledby="live-title" className="relative overflow-hidden bg-ink py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 grid content-evenly px-4 sm:px-8"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: COLS * ROWS }, (_, i) => (
          <span key={i} className="grid place-items-center">
            <span
              data-glyph
              className={
                (i + Math.floor(i / COLS)) % 2 === 0
                  ? "block size-2.5 bg-bone/25 [clip-path:polygon(50%_0,100%_100%,0_100%)]"
                  : "block size-1.5 rounded-full bg-teal/40"
              }
            />
          </span>
        ))}
      </div>

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-10 px-4 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="relative z-10 bg-ink/85 p-6 backdrop-blur-[2px] sm:p-10 lg:-mr-24">
          <p data-fade className="label mb-5 text-gold">
            Live from the mountains
          </p>
          <h2 id="live-title" data-split className="display text-[clamp(2rem,4.4vw,4rem)]">
            4PLAY live @ Hide Out Stays, Dharamkot
          </h2>
          <p data-fade className="mt-6 max-w-md text-bone-2">
            A hypnotic groove techno set recorded in the Himalayas. Short loops, polyrhythms and controlled energy, from the
            first groove to the last track.
          </p>
          <button
            data-fade
            type="button"
            onClick={() => playVideo(live)}
            className="mt-8 flex items-center gap-3 bg-bone px-6 py-3.5 text-sm font-extrabold tracking-wide text-ink uppercase transition-colors duration-300 hover:bg-gold"
          >
            <Icon name="solar:play-bold" className="size-4" />
            Watch the set
          </button>
        </div>

        <button
          type="button"
          onClick={() => playVideo(live)}
          aria-label={`Play video: ${live.title}, ${live.place}`}
          className="group relative block aspect-video w-full overflow-hidden"
        >
          <div data-live-thumb className="absolute -inset-y-[14%] inset-x-0">
            <Image
              src={`/media/yt/${live.id}.jpg`}
              alt=""
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-105"
            />
          </div>
          <span className="absolute inset-0 bg-ink/20 transition-colors duration-500 group-hover:bg-ink/0" />
          <span className="absolute right-5 bottom-5 grid size-16 place-items-center rounded-full bg-bone text-ink transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-110">
            <Icon name="solar:play-bold" className="size-6 translate-x-0.5" />
          </span>
        </button>
      </div>
    </section>
  );
}
