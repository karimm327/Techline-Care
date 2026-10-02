import { redirect } from "next/navigation";
import ConnexionForm from "@/components/auth/ConnexionForm";
import { getSessionUser } from "@/lib/auth/session";
import { cn } from "@/lib/ui/cn";

// Cartes-tickets décoratives du fond (M18) : illustration, sans lien avec les données réelles
const CARTES = [
  {
    ref: "#4F1A92C0",
    titre: "Demande aide logement",
    etiquette: "Haute",
    couleur: "text-prio-haute-fg",
    position: "left-[14%] top-[52%] [--r:-4deg] [animation-duration:6s]",
  },
  {
    ref: "#7B20E1AA",
    titre: "Suivi dossier allocation",
    etiquette: "En cours",
    couleur: "text-st-encours-fg",
    position:
      "left-[46%] top-[64%] [--r:3deg] [animation-delay:1.2s] [animation-duration:7.2s]",
  },
  {
    ref: "#06BB93AF",
    titre: "Mise à jour situation familiale",
    etiquette: "Clôturée",
    couleur: "text-st-cloturee-fg",
    position:
      "left-[22%] top-[78%] [--r:2deg] [animation-delay:2.1s] [animation-duration:8.1s]",
  },
];

export default async function LoginPage() {
  // Déjà connecté : directement au tableau de bord
  if (await getSessionUser()) redirect("/demands");

  return (
    <div className="flex flex-1 flex-wrap">
      {/* Présentation : grille animée + cartes flottantes */}
      <section className="relative min-h-[280px] flex-[1_1_520px] animate-grid overflow-hidden border-line bg-bg-sunken bg-[linear-gradient(rgb(var(--grille))_1px,transparent_1px),linear-gradient(90deg,rgb(var(--grille))_1px,transparent_1px)] bg-[length:48px_48px] md:min-h-[520px] md:border-r">
        <div className="relative z-[2] max-w-[560px] px-6 pt-10 sm:px-16 sm:pt-[72px]">
          <p className="mb-3.5 animate-rise text-xs font-semibold uppercase tracking-[.1em] text-accent-fg">
            Portail des demandes
          </p>
          <h1 className="animate-rise font-display text-[34px] font-semibold leading-[1.08] tracking-[-.03em] [animation-delay:80ms] sm:text-display-xl">
            Le support de l’équipe,
            <br />
            <span className="text-accent-fg">sans friction.</span>
          </h1>
          <p className="mt-[18px] max-w-[440px] animate-rise text-base text-fg-2 [animation-delay:160ms]">
            Créez, suivez et clôturez les demandes, avec un historique complet
            de chaque action.
          </p>
        </div>
        <div aria-hidden="true" className="hidden md:block">
          {CARTES.map((c) => (
            <div
              key={c.ref}
              className={cn(
                "absolute w-[250px] animate-float rounded-[14px] border border-line-strong bg-surface-2/[.92] px-4 py-3.5 shadow-lg",
                c.position,
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-fg-4">{c.ref}</span>
                <span
                  className={cn(
                    "rounded-full bg-fg/[.06] px-2 py-0.5 text-[11.5px] font-semibold",
                    c.couleur,
                  )}
                >
                  {c.etiquette}
                </span>
              </div>
              <p className="mt-2 font-semibold text-fg">{c.titre}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Connexion */}
      <section className="flex flex-[1_1_420px] items-center justify-center px-6 py-12">
        <ConnexionForm />
      </section>
    </div>
  );
}
