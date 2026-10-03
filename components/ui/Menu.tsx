"use client";

import Link from "next/link";
import {
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { indexDepuisTouche } from "@/lib/ui/clavier";
import { cn } from "@/lib/ui/cn";

export type ElementMenu =
  | {
      type?: "item";
      label: string;
      icon?: ReactNode;
      href?: string;
      onSelect?: () => void;
      tone?: "danger";
    }
  | { type: "separator" }
  | { type: "header"; content: ReactNode };

export type ProprietesDeclencheur = {
  ref: Ref<HTMLButtonElement>;
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls": string;
  onClick: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
};

type Props = {
  items: ElementMenu[];
  // Nom accessible du menu
  label: string;
  // Rend le bouton déclencheur : étaler `props` sur un vrai <button>
  trigger: (props: ProprietesDeclencheur, ouvert: boolean) => ReactNode;
  align?: "start" | "end";
  className?: string;
};

// Menu déroulant accessible : flèches, Début/Fin, Échap, Tab et clic extérieur ferment
export default function Menu({
  items,
  label,
  trigger,
  align = "end",
  className,
}: Props) {
  const [ouvert, setOuvert] = useState(false);
  const idMenu = useId();
  const racine = useRef<HTMLDivElement>(null);
  const declencheur = useRef<HTMLButtonElement>(null);
  const refsItems = useRef<(HTMLElement | null)[]>([]);
  const focusInitial = useRef<"premier" | "dernier">("premier");

  const actionnables = items
    .map((it, i) => ({ it, i }))
    .filter(({ it }) => it.type === undefined || it.type === "item");

  const fermer = useCallback((rendreFocus = true) => {
    setOuvert(false);
    if (rendreFocus) declencheur.current?.focus();
  }, []);

  // Focus sur le premier (ou dernier) item à l'ouverture
  useEffect(() => {
    if (!ouvert) return;
    const liste = refsItems.current.filter(Boolean);
    const cible =
      focusInitial.current === "dernier" ? liste[liste.length - 1] : liste[0];
    cible?.focus();
  }, [ouvert]);

  // Clic en dehors
  useEffect(() => {
    if (!ouvert) return;
    const dehors = (e: MouseEvent) => {
      if (!racine.current?.contains(e.target as Node)) fermer(false);
    };
    document.addEventListener("mousedown", dehors);
    return () => document.removeEventListener("mousedown", dehors);
  }, [ouvert, fermer]);

  const surToucheItem = (e: KeyboardEvent, rang: number) => {
    if (e.key === "Escape") {
      e.preventDefault();
      fermer();
      return;
    }
    if (e.key === "Tab") {
      fermer(false);
      return;
    }
    const cible = indexDepuisTouche(e, rang, actionnables.length, "vertical");
    if (cible === null) return;
    e.preventDefault();
    refsItems.current[cible]?.focus();
  };

  const proprietes: ProprietesDeclencheur = {
    ref: declencheur,
    "aria-haspopup": "menu",
    "aria-expanded": ouvert,
    "aria-controls": idMenu,
    onClick: () => {
      focusInitial.current = "premier";
      setOuvert((v) => !v);
    },
    onKeyDown: (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        focusInitial.current = e.key === "ArrowUp" ? "dernier" : "premier";
        setOuvert(true);
      }
    },
  };

  let rang = -1;
  refsItems.current = [];

  return (
    <div ref={racine} className={cn("relative", className)}>
      {trigger(proprietes, ouvert)}
      {ouvert && (
        <div
          id={idMenu}
          role="menu"
          aria-label={label}
          className={cn(
            "absolute top-full z-overlay mt-2 min-w-[232px] animate-menu rounded-[14px] border border-line-strong bg-surface-2 p-1.5 shadow-lg",
            align === "end"
              ? "right-0 origin-top-right"
              : "left-0 origin-top-left",
          )}
        >
          {items.map((it, i) => {
            if (it.type === "separator") {
              return (
                <hr
                  // biome-ignore lint/suspicious/noArrayIndexKey: liste statique
                  key={`sep-${i}`}
                  className="my-1.5 border-line-strong/60"
                />
              );
            }
            if (it.type === "header") {
              return (
                // biome-ignore lint/suspicious/noArrayIndexKey: liste statique
                <div key={`entete-${i}`} className="px-3 pb-2 pt-1.5">
                  {it.content}
                </div>
              );
            }
            rang += 1;
            const monRang = rang;
            const classes = cn(
              "cible-tactile flex h-[38px] w-full items-center gap-2.5 rounded-[9px] px-3 text-left text-[13.5px] outline-none transition-colors duration-150",
              "focus-visible:bg-surface-3 hover:bg-surface-3",
              it.tone === "danger"
                ? "text-danger-fg"
                : "text-fg-1 hover:text-fg focus-visible:text-fg",
            );
            const contenu = (
              <>
                {it.icon && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "inline-flex",
                      it.tone !== "danger" && "text-fg-3",
                    )}
                  >
                    {it.icon}
                  </span>
                )}
                <span className="flex-1">{it.label}</span>
              </>
            );
            const choisir = () => {
              it.onSelect?.();
              fermer(!it.href);
            };
            return it.href ? (
              <Link
                key={it.label}
                ref={(el) => {
                  refsItems.current[monRang] = el;
                }}
                href={it.href}
                role="menuitem"
                tabIndex={-1}
                onClick={choisir}
                onKeyDown={(e) => surToucheItem(e, monRang)}
                className={classes}
              >
                {contenu}
              </Link>
            ) : (
              <button
                key={it.label}
                ref={(el) => {
                  refsItems.current[monRang] = el;
                }}
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={choisir}
                onKeyDown={(e) => surToucheItem(e, monRang)}
                className={classes}
              >
                {contenu}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
