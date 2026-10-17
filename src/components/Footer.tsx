import Image from "next/image";
import { Icon } from "./Icon";
import { Mark } from "./Mark";
import { artist, mixes, socials } from "@/lib/content";

const columns = [
  {
    title: "Sound",
    links: [
      { label: "The 4PLAY sound", href: "#sound" },
      { label: "Light desk", href: "#sound" },
    ],
  },
  {
    title: "Sets",
    links: [
      { label: "Latest sets", href: "#sets" },
      ...mixes.slice(0, 3).map((m) => ({ label: m.title, href: m.href })),
    ],
  },
  {
    title: "Venues",
    links: [
      { label: "New Delhi", href: "#venues" },
      { label: "Gurugram", href: "#venues" },
      { label: "Dharamkot", href: "#venues" },
    ],
  },
  {
    title: "Booking",
    links: [
      { label: "Send an inquiry", href: `mailto:${artist.email}` },
      { label: "WhatsApp", href: artist.whatsappHref },
      { label: "Download EPK", href: artist.epk },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink pt-24 pb-8 text-bone">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
        <div className="flex flex-col items-center text-center">
          <p className="font-serif text-2xl italic">Follow the journey</p>
          <ul className="mt-6 flex flex-wrap justify-center border border-line">
            {socials.map((s) => (
              <li key={s.label} className="border-line not-last:border-r">
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="grid size-14 place-items-center text-bone-2 transition-colors hover:bg-bone hover:text-ink sm:size-16"
                >
                  <Icon name={s.icon} className="size-5" label={s.label} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Footer" className="mt-20 grid grid-cols-2 gap-10 sm:grid-cols-4">
          {columns.map((c) => (
            <div key={c.title}>
              <p className="text-sm font-extrabold uppercase">{c.title}</p>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => {
                  const external = l.href.startsWith("http");
                  return (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                        className="text-sm text-mute transition-colors hover:text-bone"
                      >
                        {l.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-20 overflow-hidden border-y border-line py-10">
          <Image
            src="/media/logo.png"
            alt="4PLAY"
            width={1920}
            height={636}
            sizes="(min-width: 1400px) 1340px, 92vw"
            className="mx-auto h-auto w-full max-w-[1340px]"
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="flex items-center gap-3 text-xs text-mute">
            <Mark className="size-4 text-gold" strokeWidth={10} />© 2026 {artist.alias} · {artist.name} · {artist.city}
          </p>
          <a href="#top" className="label text-mute transition-colors hover:text-bone">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
