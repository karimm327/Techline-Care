import Link from "next/link";
import { cn } from "@/lib/ui/cn";

// Pictogramme « ticket » de la marque (maquette Main.dc.html)
export default function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-accent text-white shadow-logo",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" />
        <path d="M14 6v2M14 11v2M14 16v1" />
      </svg>
    </span>
  );
}

// Logo complet cliquable : pastille + « TechLine Care »
export function Logo({
  href,
  compact = false,
}: {
  href: string;
  // Masque le texte (sidebar repliée)
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label="TechLine Care, accueil"
      className="flex shrink-0 items-center gap-2.5 rounded-sm text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-soft"
    >
      <LogoMark />
      {!compact && (
        <span className="font-display text-base font-semibold tracking-[-.01em]">
          TechLine<span className="font-medium text-fg-3"> Care</span>
        </span>
      )}
    </Link>
  );
}
