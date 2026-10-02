import { type NextRequest, NextResponse } from "next/server";
import { exigerConnexion } from "@/lib/auth";
import { logActivity } from "@/lib/db/queries/activity.queries";
import { findCategoryById } from "@/lib/db/queries/category.queries";
import {
  findDemandById,
  findLabelsForDemandIds,
  softDeleteDemand,
  updateDemand,
} from "@/lib/db/queries/demand.queries";
import { findPriorityById } from "@/lib/db/queries/priority.queries";
import { findStatusById } from "@/lib/db/queries/status.queries";
import { findAgentById } from "@/lib/db/queries/user.queries";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Connexion obligatoire + rôle LECTURE interdit
  const garde = exigerConnexion(req, ["ADMIN", "AGENT"]);
  if ("refus" in garde) return garde.refus;

  const { id } = await params;

  try {
    const body = await req.json();

    const {
      title,
      description,
      idCategory,
      idPriority,
      idStatus,
      idAssignedAgent,
    } = body;

    // Vérifier existence demande
    const demandCheck = await findDemandById(id);

    if (!demandCheck) {
      return NextResponse.json(
        { message: "Demande introuvable" },
        { status: 404 },
      );
    }
    if (demandCheck.deleted_at) {
      return NextResponse.json(
        {
          message:
            "Cette demande a été supprimée : elle ne peut plus être modifiée.",
        },
        { status: 410 },
      );
    }

    // Vérifier catégorie
    const catCheck = await findCategoryById(idCategory);

    if (catCheck.length === 0) {
      return NextResponse.json(
        { message: "Catégorie invalide" },
        { status: 400 },
      );
    }

    // Vérifier priorité
    const prioCheck = await findPriorityById(idPriority);

    if (prioCheck.length === 0) {
      return NextResponse.json(
        { message: "Priorité invalide" },
        { status: 400 },
      );
    }

    // Vérifier statut
    const statusCheck = await findStatusById(idStatus);

    if (statusCheck.length === 0) {
      return NextResponse.json({ message: "Statut invalide" }, { status: 400 });
    }

    // Vérifier agent
    if (idAssignedAgent) {
      const agentCheck = await findAgentById(idAssignedAgent);

      if (agentCheck.length === 0) {
        return NextResponse.json(
          { message: "Agent invalide" },
          { status: 400 },
        );
      }
    }

    // UPDATE
    await updateDemand(
      title,
      description,
      idCategory,
      idPriority,
      idStatus,
      idAssignedAgent,
      id,
    );

    // Journal d'activité : résumé de ce qui a changé
    const details = await resumerChangements(demandCheck, {
      title,
      description,
      idCategory,
      idPriority,
      idStatus,
      idAssignedAgent,
    });
    if (details) {
      await logActivity({
        action: "MODIFICATION",
        idUser: garde.user.id,
        idDemand: id,
        details,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // Gestion propre Zod
    if ((error as Error).name === "ZodError") {
      return NextResponse.json({ message: error }, { status: 400 });
    }

    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// Supprimer une demande (suppression douce + motif obligatoire)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const garde = exigerConnexion(req, ["ADMIN", "AGENT"]);
  if ("refus" in garde) return garde.refus;

  const { id } = await params;

  try {
    const body = await req.json().catch(() => ({}));
    const raison = typeof body.reason === "string" ? body.reason.trim() : "";

    if (raison.length < 5) {
      return NextResponse.json(
        {
          message:
            "Indique pourquoi tu supprimes la demande (5 caractères minimum).",
        },
        { status: 400 },
      );
    }
    if (raison.length > 500) {
      return NextResponse.json(
        { message: "Le motif ne doit pas dépasser 500 caractères." },
        { status: 400 },
      );
    }

    const demande = await findDemandById(id);
    if (!demande) {
      return NextResponse.json(
        { message: "Demande introuvable" },
        { status: 404 },
      );
    }
    if (demande.deleted_at) {
      return NextResponse.json(
        { message: "Cette demande est déjà supprimée." },
        { status: 410 },
      );
    }

    await softDeleteDemand(id, garde.user.id, raison);
    await logActivity({
      action: "SUPPRESSION",
      idUser: garde.user.id,
      idDemand: id,
      details: raison,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// Ex. : "Statut : NOUVELLE → EN_COURS · Agent : aucun → Lucas Petit"
type DemandeAvant = {
  title?: string | null;
  description?: string | null;
  id_category?: string | null;
  id_priority?: string | null;
  id_status?: string | null;
  id_assigned_agent?: string | null;
};
type DemandeApres = {
  title?: string | null;
  description?: string | null;
  idCategory?: string | null;
  idPriority?: string | null;
  idStatus?: string | null;
  idAssignedAgent?: string | null;
};

async function resumerChangements(
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
