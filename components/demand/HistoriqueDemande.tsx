import { styleAction } from "@/components/activity/actions";
import Timeline, { type ElementFrise } from "@/components/ui/Timeline";
import type { LigneJournal } from "@/lib/db/queries/activity.queries";
import { analyserDetails } from "@/lib/demandes/changements";
import { dateHeure, ilYA } from "@/lib/ui/format";
import {
  estCodeStatut,
  libellePriorite,
  libelleStatut,
  STATUTS,
} from "@/lib/ui/status";

// Codes du journal (NOUVELLE, HAUTE…) → libellés lisibles
const lisible = (champ: string, valeur: string) => {
  if (champ === "Statut") return libelleStatut(valeur);
  if (champ === "Priorité") return libellePriorite(valeur);
  return valeur;
};

// Historique d'une demande sous forme de frise avec diffs « ancien → nouveau »
export function elementsHistorique(lignes: LigneJournal[]): ElementFrise[] {
  return lignes.map((h) => {
    const s = styleAction(h.action);
    const { changements, autres } =
      h.action === "MODIFICATION"
        ? analyserDetails(h.details)
        : { changements: [], autres: [] };
    const nouveauStatut = changements.find((c) => c.champ === "Statut")?.apres;
    const pastille =
      nouveauStatut && estCodeStatut(nouveauStatut)
        ? STATUTS[nouveauStatut].point
        : s.point;
    let contenu: React.ReactNode = null;
    if (h.action === "COMMENTAIRE" && h.details) {
      contenu = (
        <p className="line-clamp-2 text-[13px] italic text-fg-3">
          « {h.details} »
        </p>
      );
    } else if (h.action === "SUPPRESSION" && h.details) {
      contenu = <p className="text-[13px] text-fg-2">Motif : {h.details}</p>;
    } else if (autres.length > 0) {
      contenu = <p className="text-[13px] text-fg-2">{autres.join(" · ")}</p>;
    }
    return {
      id: h.id_activity_log,
      pastille,
      titre: <b className="font-semibold">{s.label}</b>,
      meta: (
        <>
          {h.actor_label} ·{" "}
          <time dateTime={h.created_at} title={dateHeure(h.created_at)}>
            {ilYA(h.created_at)}
          </time>
        </>
      ),
      changements: changements.map((c) => ({
        champ: c.champ,
        avant: lisible(c.champ, c.avant),
        apres: lisible(c.champ, c.apres),
      })),
      contenu,
    };
  });
}

export default function HistoriqueDemande({
  lignes,
}: {
  lignes: LigneJournal[];
}) {
  if (lignes.length === 0) {
    return (
      <p className="text-[13px] text-fg-3">
        Aucune action enregistrée pour l’instant.
      </p>
    );
  }
  return <Timeline items={elementsHistorique(lignes)} />;
}
