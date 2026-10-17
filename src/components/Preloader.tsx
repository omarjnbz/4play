"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Mark } from "./Mark";
import { prefersReducedMotion } from "@/lib/scroll";

export const INTRO_EVENT = "4play:intro";

declare global {
  interface Window {
    __4playIntro?: boolean;
  }
}

function announceIntro() {
  window.__4playIntro = true;
  window.dispatchEvent(new Event(INTRO_EVENT));
}

export function onIntro(cb: () => void) {
  if (window.__4playIntro) {
    cb();
    return () => {};
  }
  window.addEventListener(INTRO_EVENT, cb, { once: true });
  return () => window.removeEventListener(INTRO_EVENT, cb);
}

export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion() || getComputedStyle(el).display === "none") {
      announceIntro();
      return;
    }

    const tri = el.querySelector<SVGPathElement>("[data-mark-tri]");
    const eye = el.querySelector<SVGGElement>("[data-mark-eye]");
    const mark = el.querySelector<SVGSVGElement>("svg");
    const len = tri?.getTotalLength() ?? 300;
    const counter = { v: 0 };

    const tl = gsap.timeline({
      defaults: { ease: "expo.inOut" },
      onComplete: () => {
        el.style.display = "none";
      },
    });

    tl.set(tri, { strokeDasharray: len, strokeDashoffset: len })
      .set(eye, { scaleY: 0 })
      .to(tri, { strokeDashoffset: 0, duration: 1.1 }, 0)
      .to(
        counter,
        {
          v: 100,
          duration: 1.4,
          ease: "power2.inOut",
          onUpdate: () => {
            if (count.current) count.current.textContent = String(Math.round(counter.v)).padStart(3, "0");
          },
        },
        0,
      )
      .to(eye, { scaleY: 1, duration: 0.45, ease: "back.out(2.4)" }, 0.95)
      .to("[data-pre-fade]", { autoAlpha: 0, duration: 0.3, ease: "power2.out" }, 1.5)
      .to(mark, { scale: 38, duration: 1.1, ease: "expo.in", transformOrigin: "50% 68%" }, 1.55)
      .add(announceIntro, 2.35)
      .to(el, { autoAlpha: 0, duration: 0.35, ease: "none" }, 2.35);

    // Never trap the page behind the loader.
    const failsafe = window.setTimeout(() => {
      tl.progress(1);
    }, 6000);

    return () => {
      window.clearTimeout(failsafe);
      tl.kill();
    };
  }, []);

  return (
    <div
      ref={root}
      className="preloader fixed inset-0 z-[100] flex-col items-center justify-center overflow-hidden bg-ink text-bone"
      aria-hidden="true"
    >
      <Mark className="w-[clamp(84px,12vw,140px)] text-gold will-change-transform" strokeWidth={4} />
      <div data-pre-fade className="mt-8 flex items-center gap-4">
        <span ref={count} className="label tabular-nums text-bone">
          000
        </span>
        <span className="h-px w-16 bg-line" />
        <span className="label text-mute">Opening the third eye</span>
      </div>
    </div>
  );
}
