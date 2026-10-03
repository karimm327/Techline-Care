import {
  ChartColumn,
  FilePlus2,
  History,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import { redirect } from "next/navigation";
import ConnexionForm from "@/components/auth/ConnexionForm";
import { getSessionUser } from "@/lib/auth/session";

// Photo d'ambiance (à déposer dans public/images/connexion.jpg, format paysage ≥ 1600 px)
const PHOTO = "/images/connexion.jpg";

// Ce que permet l'application, affiché en bas de la photo
const ATOUTS: { icone: LucideIcon; titre: string; texte: string }[] = [
  {
    icone: FilePlus2,
    titre: "Nouvelle demande",
    texte: "Créée en quelques secondes",
  },
  {
    icone: ListChecks,
    titre: "Suivi des demandes",
    texte: "Statut, priorité, agent",
  },
  {
    icone: History,
    titre: "Journal d’activité",
    texte: "Chaque action tracée",
  },
  {
    icone: ChartColumn,
    titre: "Statistiques",
    texte: "Délais et charge d’équipe",
  },
];

export default async function LoginPage() {
  // Déjà connecté : directement au tableau de bord
  if (await getSessionUser()) redirect("/demands");

  return (
    <div className="flex flex-1 flex-wrap">
      {/* Présentation : photo d'équipe + atouts de l'outil */}
      <section
        className="relative flex min-h-[320px] flex-[1_1_520px] flex-col justify-between overflow-hidden bg-bg-sunken bg-cover bg-center md:min-h-[560px]"
        style={{ backgroundImage: `url(${PHOTO})` }}
      >
        {/* Voile pour garder le texte lisible quelle que soit la photo */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-scrim/95 via-scrim/55 to-scrim/30"
        />

        <div className="relative max-w-[560px] px-6 pt-10 sm:px-14 sm:pt-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[.1em] text-accent-fg-2">
            Portail des demandes
          </p>
          <h1 className="font-display text-[32px] font-semibold leading-[1.1] tracking-[-.03em] text-fg sm:text-[42px]">
            Le support de l’équipe, sans friction.
          </h1>
          <p className="mt-4 max-w-[440px] text-base text-fg-1">
            Créez, suivez et clôturez les demandes de support, avec un
            historique complet de chaque action.
          </p>
        </div>

        <ul className="relative grid gap-x-8 gap-y-5 border-t border-fg/15 px-6 py-7 sm:grid-cols-2 sm:px-14 xl:grid-cols-4">
          {ATOUTS.map(({ icone: Icone, titre, texte }) => (
            <li key={titre} className="flex items-start gap-3">
              <Icone
                aria-hidden="true"
                strokeWidth={1.8}
                className="mt-0.5 size-5 shrink-0 text-accent-fg-2"
              />
              <div>
                <p className="text-[14px] font-semibold text-fg">{titre}</p>
                <p className="text-[12.5px] text-fg-2">{texte}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="absolute bottom-1.5 right-3 text-[11px] text-fg-3">
          Photo :{" "}
          <a
            href="https://unsplash.com/photos/people-working-at-desks-in-a-modern-office-CXxH2EiX760"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xs underline-offset-2 hover:text-fg-1 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
          >
            Vitaly Gariev / Unsplash
          </a>
        </p>
      </section>

      {/* Connexion */}
      <section className="flex flex-[1_1_420px] items-center justify-center px-6 py-12">
        <ConnexionForm />
      </section>
    </div>
  );
}
