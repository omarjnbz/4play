"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { Icon } from "./Icon";
import { Mark } from "./Mark";
import { onIntro } from "./Preloader";
import { useMedia } from "./Media";
import { artist, videos } from "@/lib/content";
import { prefersReducedMotion, scrollToTarget } from "@/lib/scroll";

const HeroScene = dynamic(() => import("./HeroScene").then((m) => m.HeroScene), { ssr: false });

const featured = videos.find((v) => v.id === "L4EVeP8at2c")!;

let webglSupport: boolean | undefined;
function canRunScene() {
  if (webglSupport === undefined) {
    const probe = document.createElement("canvas");
    webglSupport = !prefersReducedMotion() && !!(probe.getContext("webgl2") || probe.getContext("webgl"));
  }
  return webglSupport;
}
const noop = () => () => {};

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const supported = useSyncExternalStore(noop, canRunScene, () => false);
  const [failed, setFailed] = useState(false);
  const webgl = supported && !failed;
  const [sceneReady, setSceneReady] = useState(false);
  const { playVideo } = useMedia();

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    let ctx: gsap.Context | undefined;
    const off = onIntro(() => {
      ctx = gsap.context(() => {
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .fromTo(
            "[data-hero-word]",
            { yPercent: 110, autoAlpha: 1 },
            { yPercent: 0, duration: 1.4, stagger: 0.09 },
            0.15,
          )
          .fromTo(
            "[data-hero-in]",
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.07 },
            0.3,
          );
      }, el);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, []);

  const onReady = useCallback(() => setSceneReady(true), []);
  const onFail = useCallback(() => {
    setFailed(true);
    setSceneReady(false);
  }, []);

  return (
    <section
      id="top"
      ref={root}
      aria-label="Introduction"
      className="relative isolate h-[100svh] min-h-[640px] w-full overflow-hidden bg-ink"
    >
      {/* Static first frame: duotone poster, always present beneath the canvas */}
      <div
        className={`duotone-wrap grain absolute inset-0 transition-opacity duration-700 ${sceneReady ? "opacity-0" : "opacity-100"}`}
      >
        <Image
          src="/media/booth.jpg"
          alt="4PLAY leaning over the decks under green club light"
          fill
          preload
          sizes="100vw"
          className="duotone object-cover object-[50%_30%]"
        />
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-ink via-ink/30 to-transparent" />
      </div>

      {webgl && <HeroScene image="/media/booth.jpg" onReady={onReady} onFail={onFail} />}

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-end px-4 pb-[15svh] text-center">
        <p data-hero-in className="label mb-5 text-bone/90 [text-shadow:0_1px_14px_rgb(0_0_0/0.9)]">
          <span className="text-gold">Now playing</span> — hypnotic techno journey
        </p>
        <h1 className="display text-[clamp(2.5rem,12.4vw,10rem)] md:text-[clamp(3rem,9.6vw,10rem)] text-bone">
          <span className="sr-only">4PLAY — Nikunj Sharma. Latest set: </span>
          <span aria-hidden="true" className="block">
            <span className="split-word">
              <span data-hero-word>Total</span>
            </span>{" "}
            <span className="split-word">
              <span data-hero-word>Hypnosis</span>
            </span>
          </span>
        </h1>
        <div data-hero-in className="pointer-events-auto mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => playVideo(featured)}
            className="group flex items-center gap-2.5 bg-bone px-5 py-3.5 sm:gap-3 sm:px-6 text-sm font-extrabold tracking-wide text-ink uppercase transition-[background-color,transform] duration-300 hover:bg-gold active:scale-[0.97]"
          >
            <Icon name="solar:play-bold" className="size-4 transition-transform duration-300 group-hover:scale-125" />
            Listen now
          </button>
          <a
            href="#booking"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget("#booking");
            }}
            className="border border-bone/40 px-5 py-3.5 sm:px-6 text-sm font-extrabold tracking-wide text-bone uppercase transition-colors duration-300 hover:border-bone hover:bg-bone/10"
          >
            Book 4PLAY
          </a>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 grid grid-cols-[1fr_auto_1fr] items-end gap-4 px-4 pb-6 sm:px-8">
        <p data-hero-in className="label hidden leading-relaxed text-bone/70 sm:block">
          {artist.name} a.k.a. {artist.alias}
          <br />
          {artist.role} — {artist.city}
        </p>
        <a
          data-hero-in
          href="#venues"
          onClick={(e) => {
            e.preventDefault();
            scrollToTarget("#venues");
          }}
          className="label col-start-2 flex flex-col items-center gap-2 text-bone/80 transition-colors hover:text-bone"
        >
          Scroll down
          <Mark className="size-3.5 text-gold motion-safe:animate-bounce" strokeWidth={10} />
        </a>
        <p data-hero-in className="label flex items-center justify-end gap-2.5 text-bone/70" aria-label="124 beats per minute">
          <span data-beat-dot className="size-2 rounded-full bg-teal" />
          124 BPM
        </p>
      </div>
    </section>
  );
}
