"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

// The brand triangle grows from a point until it becomes the next (bone) section.
export function TriangleWipe() {
  const root = useRef<HTMLDivElement>(null);
  const shape = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const tri = shape.current;
    if (!el || !tri) return;
    if (prefersReducedMotion()) {
      tri.style.setProperty("--s", "220vmax");
      return;
    }
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.6 },
        })
        .fromTo(tri, { "--s": "0vmax" }, { "--s": "220vmax", ease: "power3.in" })
        .fromTo("[data-wipe-copy]", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.25 }, 0.55);
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
        />
        <div data-wipe-copy className="absolute inset-x-0 bottom-[12svh] flex justify-center px-4 text-ink">
          <p className="label">Press play — long-form journeys ahead</p>
        </div>
      </div>
    </div>
  );
}
