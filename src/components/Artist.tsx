import Image from "next/image";

const shots = [
  { src: "/media/blue.webp", alt: "4PLAY in the crowd under blue light", w: 690, h: 1035, cls: "md:left-[2%] md:top-[4%] md:w-[24%]", speed: 8 },
  { src: "/media/violet.webp", alt: "4PLAY behind the decks in violet light, wearing sunglasses", w: 690, h: 862, cls: "md:right-[6%] md:top-0 md:w-[22%]", speed: 16 },
  { src: "/media/red.webp", alt: "4PLAY mixing in red light with the crowd behind", w: 690, h: 862, cls: "md:left-[30%] md:top-[34%] md:w-[26%]", speed: 4 },
  { src: "/media/magenta.webp", alt: "4PLAY performing under magenta light", w: 690, h: 690, cls: "md:right-[2%] md:top-[44%] md:w-[24%]", speed: 12 },
  { src: "/media/mixer.jpg", alt: "Close-up of a DJ mixer's knobs and faders", w: 678, h: 452, cls: "md:left-[5%] md:top-[64%] md:w-[20%]", speed: 20 },
];

const facts = [
  ["Background", "Architecture · Design · Production · Dance"],
  ["Plays", "Hypnotic techno · Rominimal · Minimal house · Psytech · Hard groove"],
  ["Signature", "Minimal Indian touches inside a deep, groove-led journey"],
] as const;

export function Artist() {
  return (
    <section aria-labelledby="artist-title" className="relative overflow-hidden bg-ink py-28 sm:py-36">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
        <div className="relative md:h-[118vh] md:min-h-[880px]">
          <p
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[18%] hidden text-center font-serif text-[15vw] leading-[0.82] text-transparent italic [-webkit-text-stroke:1px_rgb(241_237_228/0.35)] md:block"
            data-parallax="6"
          >
            Built for
            <br />
            rooms that
            <br />
            move
          </p>

          <div className="grid grid-cols-2 gap-3 md:block">
            {shots.map((s, i) => (
              <div key={s.src} className={`relative md:absolute ${s.cls} ${i === 4 ? "col-span-2" : ""}`}>
                <div className="overflow-hidden" data-parallax={s.speed}>
                  <Image src={s.src} alt={s.alt} width={s.w} height={s.h} sizes="(min-width: 768px) 26vw, 50vw" className="h-auto w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 grid gap-12 md:mt-10 md:grid-cols-[minmax(0,6fr)_minmax(0,6fr)]">
          <h2 id="artist-title" data-split className="display text-[clamp(2rem,9.6vw,5rem)] md:text-[clamp(2.4rem,5.5vw,5rem)]">
            Rhythm, movement, composition
          </h2>
          <div>
            <p data-fade className="text-lg leading-relaxed text-bone-2">
              Nikunj Sharma plays as 4PLAY. Before the booth there was architecture, design, music production and dance,
              so his sets are built like spaces: deep, hypnotic openings, driving peak-time moments, and a progression of
              tension and release that keeps the floor locked from the first groove to the final track.
            </p>
            <dl className="mt-10 divide-y divide-line border-y border-line">
              {facts.map(([k, v], i) => (
                <div key={k} data-fade={i * 0.06} className="grid grid-cols-[8rem_1fr] gap-4 py-4">
                  <dt className="label pt-1 text-mute">{k}</dt>
                  <dd className="text-bone">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
