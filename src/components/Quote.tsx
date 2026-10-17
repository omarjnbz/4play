"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

export function Quote() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 80%", end: "center 45%", scrub: 0.8 },
      });
      tl.fromTo("[data-q-left]", { xPercent: -70 }, { xPercent: 0, ease: "none" }, 0)
        .fromTo("[data-q-right]", { xPercent: 70 }, { xPercent: 0, ease: "none" }, 0)
        .fromTo(
          "[data-q-photo]",
          { clipPath: "polygon(50% 40%, 62% 62%, 38% 62%)" },
          { clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", ease: "none" },
          0,
        )
        .fromTo("[data-q-img]", { scale: 1.35 }, { scale: 1, ease: "none" }, 0);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} aria-label="In his words" className="relative overflow-hidden bg-ink-2 py-24 sm:py-36">
      <div
        aria-hidden="true"
        data-q-left
        className="absolute top-1/2 left-0 h-[130%] w-[34vw] -translate-y-1/2 bg-bone [clip-path:polygon(0_0,100%_50%,0_100%)]"
      />
      <div
        aria-hidden="true"
        data-q-right
        className="absolute top-1/2 right-0 h-[130%] w-[34vw] -translate-y-1/2 bg-bone [clip-path:polygon(100%_0,0_50%,100%_100%)]"
      />

      <figure className="relative mx-auto grid max-w-[1100px] items-center gap-0 px-4 sm:px-8 md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
        <div data-q-photo className="relative aspect-[1.1/1] w-full overflow-hidden [clip-path:polygon(50%_0%,100%_100%,0%_100%)]">
          <div data-q-img className="absolute inset-0">
            <Image
              src="/media/hands.jpg"
              alt="Black-and-white close-up of 4PLAY's hand on the mixer"
              fill
              sizes="(min-width: 768px) 55vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
        <blockquote className="relative z-10 -mt-10 bg-ink p-7 sm:p-10 md:-ml-24 md:mt-24">
          <p className="font-serif text-[clamp(1.9rem,3.6vw,3.2rem)] leading-[1.05] italic">
            “I don’t just play music. I build a journey.”
          </p>
          <figcaption className="label mt-6 text-mute">
            — Nikunj Sharma, <span className="text-gold">4PLAY</span>
          </figcaption>
        </blockquote>
      </figure>
    </section>
  );
}
