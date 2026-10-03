import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/ui/cn";

// Pagination numérotée : 1 … (page-1) page (page+1) … dernière (tableau de bord, journal)
export default function Pagination({
  page,
  totalPages,
  lien,
}: {
  page: number;
  totalPages: number;
  lien: (p: number) => string;
}) {
  if (totalPages <= 1) return null;
  const numeros: (number | "…")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) numeros.push(p);
    else if (numeros[numeros.length - 1] !== "…") numeros.push("…");
  }
  const base =
    "cible-tactile inline-flex h-9 min-w-9 items-center justify-center rounded-[9px] px-2.5 text-[13px] font-semibold transition-colors duration-[180ms] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft";
  const inactif = `${base} cursor-not-allowed text-fg-4`;
  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">
      {page > 1 ? (
        <Link
          href={lien(page - 1)}
          className={cn(base, "text-fg-2 hover:bg-surface-2 hover:text-fg")}
          aria-label="Page précédente"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
        </Link>
      ) : (
        <span className={inactif} aria-hidden="true">
          <ChevronLeft className="size-4" />
        </span>
      )}
      {numeros.map((n, i) =>
        n === "…" ? (
          <span key={`e-${numeros[i - 1]}`} className="px-1 text-fg-4">
            …
          </span>
        ) : (
          <Link
            key={n}
            href={lien(n)}
            aria-current={n === page ? "page" : undefined}
            className={cn(
              base,
              n === page
                ? "bg-accent text-white"
                : "text-fg-2 hover:bg-surface-2 hover:text-fg",
            )}
          >
            {n}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link
          href={lien(page + 1)}
          className={cn(base, "text-fg-2 hover:bg-surface-2 hover:text-fg")}
          aria-label="Page suivante"
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      ) : (
        <span className={inactif} aria-hidden="true">
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
