"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

// The brand triangle grows from a point carrying a stage photo, then washes to
// bone so it becomes the next section.
export function TriangleWipe() {
  const root = useRef<HTMLDivElement>(null);
  const shape = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const tri = shape.current;
    if (!el || !tri || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.6 },
        })
        .fromTo(tri, { "--s": "7vmax" }, { "--s": "220vmax", ease: "power2.in", duration: 1 }, 0)
        .fromTo("[data-wipe-img]", { scale: 1.45, rotate: -4 }, { scale: 1, rotate: 0, duration: 0.8 }, 0)
        .fromTo("[data-wipe-title]", { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.12 }, 0.5)
        .to("[data-wipe-title]", { autoAlpha: 0, duration: 0.12 }, 0.68)
        .fromTo("[data-wipe-fade]", { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0.72)
        .fromTo("[data-wipe-copy]", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.2 }, 0.8);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} aria-hidden="true" className="wipe relative bg-ink">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div
          ref={shape}
          className="absolute inset-0 bg-bone"
          style={
            {
              "--s": "220vmax",
              clipPath:
                "polygon(50% calc(55% - var(--s)), calc(50% + var(--s) * 0.866) calc(55% + var(--s) * 0.5), calc(50% - var(--s) * 0.866) calc(55% + var(--s) * 0.5))",
            } as React.CSSProperties
          }
        >
          <div data-wipe-img className="absolute inset-0 origin-[50%_55%]">
            <Image src="/media/red.webp" alt="" fill sizes="100vw" className="object-cover object-[50%_35%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/30" />
          </div>
          <p
            data-wipe-title
            className="display invisible absolute inset-x-0 top-[58%] text-center text-[clamp(2rem,6vw,5.5rem)] text-bone"
          >
            Press play
          </p>
          {/* Static state (no JS / reduced motion) is plain bone; GSAP fades it in at the end */}
          <div data-wipe-fade className="absolute inset-0 bg-bone" />
        </div>
        <div data-wipe-copy className="absolute inset-x-0 bottom-[12svh] flex justify-center px-4 text-ink">
          <p className="label">Long-form journeys ahead</p>
        </div>
      </div>
    </div>
  );
}
