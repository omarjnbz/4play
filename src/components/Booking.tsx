import Image from "next/image";
import { Icon } from "./Icon";
import { artist } from "@/lib/content";

const mailto = `mailto:${artist.email}?subject=${encodeURIComponent("Booking inquiry — 4PLAY")}&body=${encodeURIComponent(
  "Event / venue:\nCity:\nDate:\nSet length:\nSound system:\n",
)}`;

export function Booking() {
  return (
    <section id="booking" aria-labelledby="booking-title" className="relative bg-bone py-28 text-ink sm:py-36">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
        <p data-fade className="label mb-6 text-ink/60">
          Bookings · Collaborations · Curated events
        </p>
        <h2 id="booking-title" data-split className="display max-w-[12ch] text-[clamp(2.2rem,10.5vw,9rem)]">
          Let’s build something
        </h2>

        <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <div>
            <ul className="divide-y divide-ink/15 border-y border-ink/15">
              <li data-fade>
                <a href={mailto} className="group flex items-center justify-between gap-4 py-6">
                  <span>
                    <span className="label block text-ink/60">Email</span>
                    <span className="mt-1 block text-[clamp(1.1rem,2.6vw,2rem)] font-extrabold break-all">{artist.email}</span>
                  </span>
                  <Icon name="solar:letter-linear" className="size-7 shrink-0 transition-transform duration-500 group-hover:-rotate-12" />
                </a>
              </li>
              <li data-fade>
                <a href={artist.whatsappHref} target="_blank" rel="noreferrer" className="group flex items-center justify-between gap-4 py-6">
                  <span>
                    <span className="label block text-ink/60">WhatsApp</span>
                    <span className="mt-1 block text-[clamp(1.1rem,2.6vw,2rem)] font-extrabold">{artist.whatsapp}</span>
                  </span>
                  <Icon name="simple-icons:whatsapp" className="size-7 shrink-0 transition-transform duration-500 group-hover:-rotate-12" />
                </a>
              </li>
              <li data-fade className="flex items-center justify-between gap-4 py-6">
                <span>
                  <span className="label block text-ink/60">Based in</span>
                  <span className="mt-1 block text-[clamp(1.1rem,2.6vw,2rem)] font-extrabold">New Delhi · Available worldwide</span>
                </span>
                <Icon name="solar:map-point-linear" className="size-7 shrink-0" />
              </li>
            </ul>

            <div data-fade className="mt-10 flex flex-wrap gap-3">
              <a
                href={mailto}
                className="bg-ink px-6 py-4 text-sm font-extrabold tracking-wide text-bone uppercase transition-colors hover:bg-ink-3"
              >
                Send an inquiry
              </a>
              <a
                href={artist.epk}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 border border-ink/30 px-6 py-4 text-sm font-extrabold tracking-wide uppercase transition-colors hover:border-ink hover:bg-ink/5"
              >
                <Icon name="solar:download-minimalistic-linear" className="size-4" /> Download EPK
              </a>
            </div>
          </div>

          <aside data-fade aria-labelledby="rider-title" className="bg-ink text-bone">
            <div className="relative aspect-[3/2] overflow-hidden">
              <Image src="/media/mixer.jpg" alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover grayscale" />
            </div>
            <div className="p-7">
              <p className="label text-gold">Tech rider</p>
              <h3 id="rider-title" className="display mt-3 text-2xl">
                Adaptable · Industry standard
              </h3>
              <p className="mt-4 text-bone-2">
                Comfortable across professional consoles, mixers, CDJs, monitoring and club systems.
              </p>
              <dl className="mt-6 border-t border-line pt-4">
                <dt className="label text-mute">Preferred</dt>
                <dd className="mt-1 font-bold">CDJ-3000 / CDJ-2000NXS2 + DJM-900NXS2 or equivalent</dd>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
