import type { OptionsFormulaire } from "@/components/demand/DemandForm";
import { findAllCategories } from "@/lib/db/queries/category.queries";
import { findChargeEquipe } from "@/lib/db/queries/demand.queries";
import { findAllPriorities } from "@/lib/db/queries/priority.queries";
import { findAllStatuses } from "@/lib/db/queries/status.queries";

// Listes du formulaire de demande, chargées côté serveur (catégories, priorités, statuts, agents + charge)
export async function chargerOptionsFormulaire(): Promise<OptionsFormulaire> {
  const [categories, priorites, statuts, agents] = await Promise.all([
    findAllCategories(),
    findAllPriorities(),
    findAllStatuses(),
    findChargeEquipe(),
  ]);
  return {
    categories: categories.map((c: { id_category: string; label: string }) => ({
      id: c.id_category,
      label: c.label,
    })),
    priorites: priorites.map(
      (p: {
        id_priority: string;
        label: string;
        first_response_minutes: number | null;
        resolution_minutes: number | null;
      }) => ({
        id: p.id_priority,
        label: p.label,
        reponseMinutes: p.first_response_minutes,
        resolutionMinutes: p.resolution_minutes,
      }),
    ),
    statuts: statuts.map((s: { id_status: string; label: string }) => ({
      id: s.id_status,
      label: s.label,
    })),
    agents: agents.map((a) => ({
      id: a.id_user,
      nom: a.nom,
      ouvertes: a.ouvertes,
    })),
  };
}
