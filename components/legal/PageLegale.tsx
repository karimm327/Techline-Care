"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/ui/cn";

export type SectionLegale = { id: string; titre: string; contenu: ReactNode };

type Props = {
  courante: "confidentialite" | "mentions-legales";
  titre: string;
  sousTitre?: string;
  sections: SectionLegale[];
};

const PAGES = [
  {
    cle: "confidentialite",
    label: "Confidentialité",
    href: "/confidentialite",
  },
  {
    cle: "mentions-legales",
    label: "Mentions légales",
    href: "/mentions-legales",
  },
] as const;

// Progression du défilement de la page (0 → 1)
function useScrollProgress() {
  const [progression, setProgression] = useState(0);
  useEffect(() => {
    const lire = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgression(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    lire();
    window.addEventListener("scroll", lire, { passive: true });
    window.addEventListener("resize", lire);
    return () => {
      window.removeEventListener("scroll", lire);
      window.removeEventListener("resize", lire);
    };
  }, []);
  return progression;
}

// Mise en page des pages légales : barre de lecture, sommaire collant (section active), cartes numérotées
export default function PageLegale({
  courante,
  titre,
  sousTitre,
  sections,
}: Props) {
  const progression = useScrollProgress();
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const observateur = new IntersectionObserver(
      (entrees) => {
        const visible = entrees
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-80px 0px -60% 0px" },
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observateur.observe(el);
    }
    return () => observateur.disconnect();
  }, [sections]);

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-palette h-[3px] origin-left bg-accent-soft shadow-glow-nav"
        style={{ transform: `scaleX(${progression})` }}
      />
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 pb-16 pt-8 sm:px-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav
            aria-label="Pages légales"
            className="mb-6 flex rounded-[11px] border border-line bg-bg-sunken p-1"
          >
            {PAGES.map((p) => (
              <Link
                key={p.cle}
                href={p.href}
                aria-current={p.cle === courante ? "page" : undefined}
                className={cn(
                  "cible-tactile flex h-9 flex-1 items-center justify-center rounded-lg px-2 text-[12.5px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft",
                  p.cle === courante
                    ? "bg-surface-3 text-fg shadow-sm"
                    : "text-fg-3 hover:text-fg-1",
                )}
              >
                {p.label}
              </Link>
            ))}
          </nav>
          <nav aria-label="Sommaire" className="hidden lg:block">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[.08em] text-fg-4">
              Sommaire
            </p>
            <ol className="flex flex-col gap-0.5 border-l border-line">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={active === s.id ? "location" : undefined}
                    className={cn(
                      "-ml-px flex gap-2.5 border-l-2 py-1.5 pl-3 pr-2 text-[13px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft",
                      active === s.id
                        ? "border-accent font-semibold text-fg"
                        : "border-transparent text-fg-3 hover:text-fg-1",
                    )}
                  >
                    <span className="font-mono text-[11.5px] text-fg-4">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {s.titre}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="min-w-0">
          <header className="mb-6 animate-rise">
            <p className="text-eyebrow uppercase text-accent-fg">
              Informations légales
            </p>
            <h1 className="mt-1 font-display text-[28px] font-semibold leading-tight tracking-[-.02em] sm:text-h1">
              {titre}
            </h1>
            {sousTitre && <p className="mt-1.5 text-fg-2">{sousTitre}</p>}
          </header>
          <div className="flex flex-col gap-4">
            {sections.map((s, i) => (
              <section
                key={s.id}
                id={s.id}
                aria-labelledby={`${s.id}-titre`}
                className="animate-rise scroll-mt-24 rounded-md border border-line bg-surface p-5 sm:p-6"
                style={{ animationDelay: `${80 + Math.min(i, 8) * 60}ms` }}
              >
                <h2
                  id={`${s.id}-titre`}
                  className="mb-2.5 flex items-baseline gap-3 font-display text-h3"
                >
                  <span className="font-mono text-xs font-medium text-accent-fg">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.titre}
                </h2>
                <div className="max-w-[68ch] leading-[1.75] text-fg-1">
                  {s.contenu}
                </div>
              </section>
            ))}
          </div>
        </article>
      </div>
    </>
  );
}
