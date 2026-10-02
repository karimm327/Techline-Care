import Link from "next/link";
import { Logo } from "@/components/brand/LogoMark";
import { classesBouton } from "@/components/ui/Button";

// 404 — « 404 » avec glitch (M20). Utilisée par notFound() et par les URL inconnues.
export default function PageIntrouvable() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex min-h-header items-center border-b border-line-strong/70 bg-bg/85 px-4 py-2.5 sm:px-5">
        <Logo href="/demands" />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p
          aria-hidden="true"
          className="animate-glitch font-display text-[96px] font-bold leading-none tracking-[-.04em] text-line-strong"
        >
          <span className="text-accent-fg">4</span>0
          <span className="text-accent-fg">4</span>
        </p>
        <h1 className="mt-3.5 font-display text-[17px] font-semibold">
          Cette demande n’existe pas ou a été supprimée
        </h1>
        <p className="mb-[18px] mt-1.5 max-w-[340px] text-fg-3">
          Vérifiez le lien, ou retrouvez-la depuis le tableau de bord.
        </p>
        <Link href="/demands" className={classesBouton()}>
          Tableau de bord
        </Link>
      </main>
    </div>
  );
}
