"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { Icon } from "./Icon";
import type { Mix, Video } from "@/lib/content";
import { prefersReducedMotion } from "@/lib/scroll";

type MediaApi = {
  playMix: (mix: Mix) => void;
  playVideo: (video: Video) => void;
  current: Mix | null;
};

const MediaContext = createContext<MediaApi | null>(null);

export function useMedia() {
  const ctx = useContext(MediaContext);
  if (!ctx) throw new Error("useMedia must be used inside <MediaProvider>");
  return ctx;
}

export function MediaProvider({ children }: { children: React.ReactNode }) {
  const [mix, setMix] = useState<Mix | null>(null);
  const [video, setVideo] = useState<Video | null>(null);
  const dockRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const playMix = useCallback((m: Mix) => setMix(m), []);
  const playVideo = useCallback((v: Video) => {
    returnFocus.current = document.activeElement as HTMLElement;
    setVideo(v);
  }, []);

  useEffect(() => {
    if (!mix || !dockRef.current || prefersReducedMotion()) return;
    gsap.fromTo(dockRef.current, { yPercent: 120 }, { yPercent: 0, duration: 0.9, ease: "expo.out" });
  }, [mix]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (video && !d.open) d.showModal();
    if (!video && d.open) d.close();
  }, [video]);

  const closeVideo = () => {
    setVideo(null);
    returnFocus.current?.focus();
  };

  return (
    <MediaContext.Provider value={{ playMix, playVideo, current: mix }}>
      {children}

      {mix && (
        <aside
          ref={dockRef}
          aria-label="Now playing"
          className="fixed right-3 bottom-3 left-3 z-50 overflow-hidden rounded-sm border border-line bg-ink-2/95 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9)] backdrop-blur-md sm:left-auto sm:w-[420px]"
        >
          <div className="flex items-center gap-3 p-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-full motion-safe:animate-[spin_6s_linear_infinite]">
              <Image src={mix.cover} alt="" fill sizes="48px" className="object-cover" />
              <span className="absolute inset-[42%] rounded-full bg-ink-2" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="label text-teal">Now playing · Audiomack</p>
              <p className="truncate text-sm font-bold">{mix.title}</p>
            </div>
            <a
              href={mix.href}
              target="_blank"
              rel="noreferrer"
              className="grid size-9 place-items-center rounded-full text-bone-2 transition-colors hover:bg-bone/10 hover:text-bone"
            >
              <Icon name="solar:arrow-right-up-linear" className="size-5" label={`Open ${mix.title} on Audiomack`} />
            </a>
            <button
              type="button"
              onClick={() => setMix(null)}
              className="grid size-9 place-items-center rounded-full text-bone-2 transition-colors hover:bg-bone/10 hover:text-bone"
            >
              <Icon name="solar:close-square-linear" className="size-5" label="Close player" />
            </button>
          </div>
          <iframe
            key={mix.slug}
            title={`${mix.title} — 4PLAY on Audiomack`}
            src={mix.embed}
            className="block h-[252px] w-full border-0 bg-ink"
            allow="autoplay; encrypted-media"
            loading="lazy"
          />
        </aside>
      )}

      <dialog
        ref={dialogRef}
        onClose={closeVideo}
        aria-label={video ? `${video.title} — video` : "Video"}
        className="m-auto w-[min(1200px,calc(100vw-24px))] overflow-visible bg-transparent p-0 text-bone"
      >
        {video && (
          <div>
            <div className="mb-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="label text-gold">{video.place}</p>
                <p className="display truncate text-xl sm:text-2xl">{video.title}</p>
              </div>
              <button
                type="button"
                onClick={closeVideo}
                autoFocus
                className="label flex shrink-0 items-center gap-2 rounded-full border border-line px-4 py-2 transition-colors hover:bg-bone hover:text-ink"
              >
                Close <Icon name="solar:close-square-linear" className="size-4" />
              </button>
            </div>
            <div className="relative aspect-video w-full overflow-hidden bg-ink">
              <iframe
                title={video.title}
                src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
                className="absolute inset-0 size-full border-0"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </dialog>
    </MediaContext.Provider>
  );
}
