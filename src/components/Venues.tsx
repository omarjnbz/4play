"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Mark } from "./Mark";
import { venues } from "@/lib/content";
import { prefersReducedMotion, scrollToTarget } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

const rows = [
  { items: venues.slice(0, 5), reverse: false, fill: 1 },
  { items: venues.slice(5, 10), reverse: true, fill: 2 },
  { items: venues.slice(10, 15), reverse: false, fill: 0 },
];

export function Venues() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const tweens = gsap.utils.toArray<HTMLElement>("[data-track]").map((track, i) => {
        const reverse = track.dataset.reverse === "1";
        return gsap.fromTo(
          track,
          { xPercent: reverse ? -50 : 0 },
          { xPercent: reverse ? 0 : -50, duration: 34 + i * 7, ease: "none", repeat: -1 },
        );
      });

      // Scroll speed pushes the marquee, then it eases back to cruise.
      const speed = { v: 1 };
      const apply = () => tweens.forEach((t) => t.timeScale(speed.v));
      ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => tweens.forEach((t) => (self.isActive ? t.play() : t.pause())),
        onUpdate: (self) => {
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 350, 5);
          gsap.to(speed, { v: boost, duration: 0.2, overwrite: true, onUpdate: apply });
          gsap.to(speed, { v: 1, duration: 1.2, delay: 0.2, ease: "power2.out", onUpdate: apply });
        },
      });

      gsap.fromTo(
        "[data-venue-photo]",
        { clipPath: "inset(18% 22% 18% 22%)", scale: 1.25 },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 85%", end: "center center", scrub: true },
        },
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="venues"
      ref={root}
      aria-labelledby="venues-title"
      className="relative overflow-hidden bg-ink py-28 sm:py-36"
    >
      <p className="label absolute top-28 left-4 hidden origin-top-left translate-y-40 -rotate-90 text-mute sm:left-8 sm:block">
        On the road — venues played
      </p>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6 sm:pl-10">
          <h2 id="venues-title" data-split className="display max-w-[14ch] text-[clamp(2.4rem,6vw,5.5rem)]">
            Delhi to the Himalayas
          </h2>
          <p data-fade className="max-w-sm font-serif text-xl leading-snug text-bone-2 italic">
            Late nights in New Delhi and Gurugram clubs, sunsets on the Dharamkot mountain circuit.
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="relative mx-auto aspect-[4/5] w-[min(78vw,460px)] overflow-hidden" data-venue-photo>
          <Image
            src="/media/sunset.webp"
            alt="4PLAY playing a sunset set at EDM Hostel, Dharamkot, mountains behind"
            fill
            sizes="(min-width: 640px) 460px, 78vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-ink/35" />
        </div>

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-1 sm:gap-2" aria-hidden="true">
          {rows.map((row, r) => (
            <div key={r} className="overflow-hidden whitespace-nowrap">
              <div data-track data-reverse={row.reverse ? "1" : "0"} className="inline-flex will-change-transform">
                {[0, 1].map((copy) => (
                  <div key={copy} className="flex shrink-0 items-center">
                    {row.items.map((v, i) => (
                      <span key={v.name} className="flex items-center">
                        <span
                          className={`display px-4 text-[clamp(2.6rem,7.5vw,7rem)] sm:px-6 ${
                            i === row.fill ? "text-bone" : "outline-text-bone opacity-70"
                          }`}
                        >
                          {v.name}
                        </span>
                        <Mark className="size-[clamp(1rem,2vw,1.75rem)] shrink-0 text-gold" strokeWidth={10} />
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accessible, non-animated venue list */}
      <ul className="sr-only">
        {venues.map((v) => (
          <li key={v.name}>
            {v.name}, {v.city}
          </li>
        ))}
      </ul>

      <div className="mx-auto mt-14 flex max-w-[1400px] flex-col items-center gap-6 px-4 text-center sm:px-8">
        <p data-fade className="label text-mute">
          New Delhi · Gurugram · Dharamkot, Himachal Pradesh · Available worldwide
        </p>
        <a
          data-fade
          href="#booking"
          onClick={(e) => {
            e.preventDefault();
            scrollToTarget("#booking");
          }}
          className="bg-bone px-6 py-3.5 text-sm font-extrabold tracking-wide text-ink uppercase transition-colors duration-300 hover:bg-gold"
        >
          Request a date
        </a>
      </div>
    </section>
  );
}
