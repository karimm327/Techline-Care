import { findLabelsForDemandIds } from "@/lib/db/queries/demand.queries";

/* Résumé des modifications d'une demande pour le journal d'activité, et lecture inverse
   pour l'affichage des diffs (fiche demande, journal). */

// Ex. : "Statut : NOUVELLE → EN_COURS · Agent : aucun → Lucas Petit"
export type DemandeAvant = {
  title?: string | null;
  description?: string | null;
  id_category?: string | null;
  id_priority?: string | null;
  id_status?: string | null;
  id_assigned_agent?: string | null;
};
export type DemandeApres = {
  title?: string | null;
  description?: string | null;
  idCategory?: string | null;
  idPriority?: string | null;
  idStatus?: string | null;
  idAssignedAgent?: string | null;
};

export async function resumerChangements(
  avant: DemandeAvant,
  apres: DemandeApres,
): Promise<string> {
  const parties: string[] = [];
  if ((apres.title ?? "") !== (avant.title ?? ""))
    parties.push("Titre modifié");
  if ((apres.description ?? "") !== (avant.description ?? ""))
    parties.push("Description modifiée");

  const champs = [
    {
      cle: "category",
      nom: "Catégorie",
      av: avant.id_category,
      ap: apres.idCategory,
    },
    {
      cle: "priority",
      nom: "Priorité",
      av: avant.id_priority,
      ap: apres.idPriority,
    },
    { cle: "status", nom: "Statut", av: avant.id_status, ap: apres.idStatus },
    {
      cle: "agent",
      nom: "Agent",
      av: avant.id_assigned_agent,
      ap: apres.idAssignedAgent,
    },
  ].filter((c) => (c.av || null) !== (c.ap || null));

  if (champs.length > 0) {
    const ids = (cote: "av" | "ap") =>
      Object.fromEntries(champs.map((c) => [c.cle, c[cote] || null]));
    const [lAvant, lApres] = await Promise.all([
      findLabelsForDemandIds(ids("av")),
      findLabelsForDemandIds(ids("ap")),
    ]);
    for (const c of champs) {
      const k = c.cle as keyof typeof lAvant;
      parties.push(
        `${c.nom} : ${lAvant[k] ?? "aucun"} → ${lApres[k] ?? "aucun"}`,
      );
    }
  }
  return parties.join(" · ");
}

export type Changement = { champ: string; avant: string; apres: string };

// « Statut : NOUVELLE → EN_COURS · Titre modifié » → [{ champ, avant, apres }] + mentions libres
export function analyserDetails(details: string | null | undefined): {
  changements: Changement[];
  autres: string[];
} {
  const changements: Changement[] = [];
  const autres: string[] = [];
  for (const partie of (details ?? "").split(" · ")) {
    const m = /^([^:]+) : (.*) → (.*)$/.exec(partie.trim());
    if (m) changements.push({ champ: m[1], avant: m[2], apres: m[3] });
    else if (partie.trim()) autres.push(partie.trim());
  }
  return { changements, autres };
}
