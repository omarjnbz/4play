"use client";

import Image from "next/image";
import { Icon } from "./Icon";
import { useMedia } from "./Media";
import { mixes, soundcloudSet, videos } from "@/lib/content";

export function LatestSets() {
  const { playMix, playVideo, current } = useMedia();

  return (
    <section id="sets" aria-labelledby="sets-title" className="relative bg-bone pt-10 pb-28 text-ink sm:pb-36">
      <div className="absolute top-10 bottom-28 left-4 hidden w-px bg-ink/15 sm:left-8 lg:block" aria-hidden="true" />
      <p
        className="label absolute top-10 left-4 hidden origin-top-left translate-x-3 translate-y-32 -rotate-90 text-ink/60 sm:left-8 lg:block"
        aria-hidden="true"
      >
        Latest sets
      </p>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-8 lg:pl-20">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <h2 id="sets-title" data-split className="display text-[clamp(3rem,9vw,8.5rem)]">
            Latest sets
          </h2>
          <div data-fade className="max-w-xs">
            <p className="font-serif text-xl leading-snug italic">
              Long-form journeys, recorded live and in the bedroom studio. Press play and keep browsing.
            </p>
            <a
              href="https://audiomack.com/4playinthehouse"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 bg-ink px-5 py-3 text-xs font-extrabold tracking-wide text-bone uppercase transition-colors hover:bg-ink-3"
            >
              All sets on Audiomack <Icon name="solar:arrow-right-up-linear" className="size-4" />
            </a>
          </div>
        </div>

        <ul className="mt-16 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:mt-24 lg:gap-x-24">
          {mixes.map((mix, i) => {
            const playing = current?.slug === mix.slug;
            return (
              <li key={mix.slug} data-fade={(i % 2) * 0.1} className={i % 2 === 1 ? "sm:mt-28" : ""}>
                <button
                  type="button"
                  onClick={() => playMix(mix)}
                  aria-label={`Play ${mix.title}, ${mix.length}`}
                  aria-pressed={playing}
                  className="group relative block aspect-square w-full overflow-hidden bg-ink shadow-[0_40px_60px_-30px_rgb(8_9_10/0.55)]"
                >
                  <Image
                    src={mix.cover}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 45vw, 100vw"
                    className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-[1.04]"
                  />
                  <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/80 to-transparent" />
                  <span className="absolute bottom-5 left-5 flex items-center gap-4 text-left text-bone">
                    <span className="grid size-14 shrink-0 place-items-center rounded-full border border-bone/70 transition-[background-color,color,transform] duration-500 ease-[var(--ease-out)] group-hover:scale-110 group-hover:bg-bone group-hover:text-ink">
                      <Icon name={playing ? "solar:pause-bold" : "solar:play-bold"} className="size-5" />
                    </span>
                    <span className="label text-bone/80">{playing ? "In the player" : mix.length}</span>
                  </span>
                </button>
                <div className="mt-5 flex items-baseline justify-between gap-4">
                  <h3 className="display text-[clamp(1.4rem,2.4vw,2.1rem)]">{mix.title}</h3>
                </div>
                <p className="label mt-2 text-ink/60">{mix.tag}</p>
              </li>
            );
          })}
          <li data-fade className="flex flex-col justify-center border-t border-ink/15 pt-8 sm:mt-28">
            <p className="label text-ink/60">Also on SoundCloud</p>
            <a
              href={soundcloudSet.href}
              target="_blank"
              rel="noreferrer"
              className="group mt-3 flex items-center justify-between gap-4"
            >
              <span className="display text-[clamp(1.4rem,2.4vw,2.1rem)] underline decoration-ink/20 underline-offset-8 transition-colors group-hover:decoration-ink">
                {soundcloudSet.title}
              </span>
              <Icon name="simple-icons:soundcloud" className="size-7 shrink-0" />
            </a>
          </li>
        </ul>

        <div className="mt-28 flex flex-wrap items-end justify-between gap-6 border-t border-ink/15 pt-10">
          <h3 data-split className="display text-[clamp(2rem,5vw,4.5rem)]">
            Live on video
          </h3>
          <a
            href="https://www.youtube.com/channel/UCOKtgOsxMCBn6bMHFzVTFXQ"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-extrabold tracking-wide uppercase underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
          >
            <Icon name="simple-icons:youtube" className="size-4" /> YouTube channel
          </a>
        </div>

        <ul className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v, i) => (
            <li key={v.id} data-fade={(i % 3) * 0.08}>
              <button
                type="button"
                onClick={() => playVideo(v)}
                aria-label={`Play video: ${v.title}, ${v.place}`}
                className="group block w-full text-left"
              >
                <span className="relative block aspect-video overflow-hidden bg-ink">
                  <Image
                    src={`/media/yt/${v.id}.jpg`}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                    className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 bg-ink/80 px-2 py-1 label text-bone">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="absolute right-3 bottom-3 grid size-11 place-items-center rounded-full bg-bone text-ink opacity-0 transition-[opacity,transform] duration-500 ease-[var(--ease-out)] group-hover:opacity-100 group-focus-visible:opacity-100 max-sm:opacity-100">
                    <Icon name="solar:play-bold" className="size-4 translate-x-px" />
                  </span>
                </span>
                <span className="mt-4 block text-lg leading-tight font-extrabold uppercase">{v.title}</span>
                <span className="label mt-1.5 block text-ink/60">{v.place}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
