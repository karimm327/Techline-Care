"use client";

import { CircleHelp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/LogoMark";
import { classesBouton } from "@/components/ui/Button";

// Header des pages publiques : logo + aide (sur /login) ou accès à l'application
export default function PublicHeader({ connecte }: { connecte: boolean }) {
  const chemin = usePathname();

  return (
    <header className="sticky top-0 z-header flex min-h-header items-center justify-between gap-3.5 border-b border-line-strong/70 bg-bg/85 px-4 py-2.5 backdrop-blur-md sm:px-5">
      <Logo href={connecte ? "/demands" : "/login"} />
      {chemin === "/login" ? (
        <a
          href="mailto:support@techline-care.fr"
          className={classesBouton({ variant: "ghost" })}
        >
          <CircleHelp aria-hidden="true" strokeWidth={1.9} className="size-4" />
          Besoin d’aide ?
        </a>
      ) : connecte ? (
        <Link
          href="/demands"
          className={classesBouton({ variant: "secondary" })}
        >
          Tableau de bord
        </Link>
      ) : (
        <Link href="/login" className={classesBouton()}>
          Connexion
        </Link>
      )}
    </header>
  );
}
