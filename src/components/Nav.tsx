"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { artist, nav, socials } from "@/lib/content";
import { lockScroll, prefersReducedMotion, scrollToTarget } from "@/lib/scroll";

const CLOSED = "polygon(50% -20%, 50% -20%, 50% -20%)";
const OPEN = "polygon(50% -220%, 300% 160%, -200% 160%)";

export function Nav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  // Hide on scroll down, reveal on scroll up.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      if (Math.abs(y - last) > 6) setHidden(y > last && y > 240);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    tl.current?.kill();
    lockScroll(open);

    if (open) {
      el.style.visibility = "visible";
      if (reduced) {
        el.style.clipPath = "none";
      } else {
        tl.current = gsap
          .timeline()
          .fromTo(el, { clipPath: CLOSED }, { clipPath: OPEN, duration: 1, ease: "expo.inOut" })
          .fromTo(
            el.querySelectorAll("[data-menu-item]"),
            { yPercent: 100, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.06, ease: "expo.out" },
            0.45,
          )
          .fromTo(el.querySelectorAll("[data-menu-fade]"), { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.6);
      }
      el.querySelector<HTMLAnchorElement>("a[data-menu-link]")?.focus({ preventScroll: true });
    } else if (el.style.visibility === "visible") {
      const done = () => {
        el.style.visibility = "hidden";
      };
      if (reduced) done();
      else tl.current = gsap.timeline({ onComplete: done }).to(el, { clipPath: CLOSED, duration: 0.8, ease: "expo.inOut" });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>("a, button");
        const first = toggle.current!;
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    window.setTimeout(() => scrollToTarget(href), prefersReducedMotion() ? 0 : 450);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[60] transition-[transform,background-color] duration-500 ease-[var(--ease-out)] ${
          hidden && !open ? "-translate-y-full" : "translate-y-0"
        } ${solid && !open ? "bg-ink/75 backdrop-blur-md" : "bg-transparent"}`}
      >
        <div className="flex items-center justify-between px-4 py-4 sm:px-8 sm:py-5">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              go("#top");
            }}
            className="block"
          >
            <Image src="/media/logo.png" alt="4PLAY — home" width={145} height={48} className="h-7 w-auto sm:h-8" preload />
          </a>
          <button
            ref={toggle}
            type="button"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((o) => !o)}
            className="group flex items-center gap-3 py-2 text-sm font-extrabold tracking-wide uppercase"
          >
            <span className="relative block h-3 w-6" aria-hidden="true">
              <span
                className={`absolute left-0 h-[3px] w-full bg-current transition-transform duration-500 ease-[var(--ease-out)] ${
                  open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0 group-hover:-translate-y-0.5"
                }`}
              />
              <span
                className={`absolute left-0 h-[3px] w-full bg-current transition-transform duration-500 ease-[var(--ease-out)] ${
                  open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0 group-hover:translate-y-0.5"
                }`}
              />
            </span>
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      <div
        id="site-menu"
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!open}
        style={{ visibility: "hidden", clipPath: CLOSED }}
        className="fixed inset-0 z-[55] overflow-y-auto bg-ink text-bone"
      >
        <div className="mx-auto grid min-h-full max-w-[1400px] grid-rows-[1fr_auto] px-4 pt-24 pb-6 sm:px-8">
          <div className="grid items-center gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
            <div data-menu-fade className="relative hidden aspect-[4/5] max-h-[62vh] overflow-hidden md:block">
              {nav.map((item, i) => (
                <Image
                  key={item.href}
                  src={item.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 40vw, 0px"
                  className={`object-cover transition-[opacity,transform] duration-700 ease-[var(--ease-out)] ${
                    i === active ? "scale-100 opacity-100" : "scale-110 opacity-0"
                  }`}
                />
              ))}
              <span className="label absolute bottom-3 left-3 z-10 bg-ink/70 px-2 py-1 text-bone/80">
                {nav[active].note}
              </span>
            </div>

            <nav aria-label="Primary">
              <ul>
                {nav.map((item, i) => (
                  <li key={item.href} className="overflow-hidden border-b border-line">
                    <a
                      data-menu-item
                      data-menu-link
                      href={item.href}
                      tabIndex={open ? 0 : -1}
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      onClick={(e) => {
                        e.preventDefault();
                        go(item.href);
                      }}
                      className="group relative flex items-baseline gap-4 py-3 sm:gap-6 sm:py-4"
                    >
                      <span className="label w-6 shrink-0 text-mute">{item.n}</span>
                      <span
                        className={`display text-[clamp(2.4rem,6.5vw,5.5rem)] transition-colors duration-300 ${
                          i === active ? "text-bone" : "text-bone/35"
                        }`}
                      >
                        {item.label}
                      </span>
                      <span className="label hidden text-mute transition-colors group-hover:text-gold sm:inline">
                        {item.note}
                      </span>
                      <span
                        aria-hidden="true"
                        className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div data-menu-fade className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
            <a
              href={artist.epk}
              target="_blank"
              rel="noreferrer"
              tabIndex={open ? 0 : -1}
              className="label underline decoration-line underline-offset-4 hover:decoration-gold"
            >
              Download EPK
            </a>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    tabIndex={open ? 0 : -1}
                    className="label underline decoration-line underline-offset-4 hover:decoration-gold"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
