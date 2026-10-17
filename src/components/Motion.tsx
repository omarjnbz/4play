"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { prefersReducedMotion, setLenis } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

// Splits a plain-text heading into masked words. The full sentence stays
// available to assistive tech; the animated copy is hidden from it.
function splitWords(el: HTMLElement) {
  if (el.dataset.splitDone) return Array.from(el.querySelectorAll<HTMLElement>(".split-word > span"));
  const text = el.textContent?.trim() ?? "";
  el.dataset.splitDone = "1";
  const sr = document.createElement("span");
  sr.className = "sr-only";
  sr.textContent = text;
  const visual = document.createElement("span");
  visual.setAttribute("aria-hidden", "true");
  const inner: HTMLElement[] = [];
  text.split(/\s+/).forEach((word, i, all) => {
    const mask = document.createElement("span");
    mask.className = "split-word";
    const w = document.createElement("span");
    w.textContent = word;
    mask.appendChild(w);
    visual.appendChild(mask);
    if (i < all.length - 1) visual.appendChild(document.createTextNode(" "));
    inner.push(w);
  });
  el.replaceChildren(sr, visual);
  return inner;
}

export function Motion() {
  useEffect(() => {
    const reduced = prefersReducedMotion();
    let lenis: Lenis | null = null;
    const tick = (time: number) => lenis?.raf(time * 1000);

    if (!reduced) {
      lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95, anchors: { duration: 1.6 } });
      setLenis(lenis);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    const ctx = gsap.context(() => {
      if (reduced) return;

      gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
        const words = splitWords(el);
        if (!words.length) return;
        gsap.from(words, {
          yPercent: 115,
          rotate: 4,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.07,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-fade]").forEach((el) => {
        gsap.from(el, {
          y: 36,
          autoAlpha: 0,
          duration: 1,
          ease: "expo.out",
          delay: Number(el.dataset.fade) || 0,
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });

      const wide = window.matchMedia("(min-width: 768px)").matches;
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        if (!wide) return;
        const amount = Number(el.dataset.parallax) || 10;
        gsap.fromTo(
          el,
          { yPercent: amount },
          {
            yPercent: -amount,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    });

    // Re-measure once fonts and images settle.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis?.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
