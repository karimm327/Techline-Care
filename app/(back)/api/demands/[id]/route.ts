import { type NextRequest, NextResponse } from "next/server";
import { exigerConnexion } from "@/lib/auth";
import { logActivity } from "@/lib/db/queries/activity.queries";
import { findCategoryById } from "@/lib/db/queries/category.queries";
import {
  findDemandById,
  findLabelsForDemandIds,
  findPriorityIdByLabel,
  findStatusIdByLabel,
  softDeleteDemand,
  updateDemand,
  updateDemandPartielle,
} from "@/lib/db/queries/demand.queries";
import { findPriorityById } from "@/lib/db/queries/priority.queries";
import { findStatusById } from "@/lib/db/queries/status.queries";
import { findAgentById } from "@/lib/db/queries/user.queries";
import { resumerChangements } from "@/lib/demandes/changements";
import { notifierChangements } from "@/lib/notifications";
import { erreursDemande } from "@/lib/schemas/demand.schema";

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

    // Règles partagées avec le formulaire
    const erreurs = erreursDemande({ title, description });
    const premiere = erreurs.title ?? erreurs.description;
    if (premiere) {
      return NextResponse.json({ message: premiere }, { status: 400 });
    }

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
    await notifierChangements({
      idDemand: id,
      idActeur: garde.user.id,
      agentAvant: demandCheck.id_assigned_agent,
      agentApres: idAssignedAgent || null,
      nouveauStatut:
        idStatus !== demandCheck.id_status
          ? (await findLabelsForDemandIds({ status: idStatus })).status
          : null,
    });

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

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Mise à jour partielle : { status?, priority?, agentId? } (codes NOUVELLE, HAUTE…).
// Utilisée par le menu « Changer le statut », le Kanban et les actions groupées.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const garde = exigerConnexion(req, ["ADMIN", "AGENT"]);
  if ("refus" in garde) return garde.refus;
  const { id } = await params;
  if (!UUID.test(id)) {
    return NextResponse.json(
      { message: "Demande introuvable" },
      { status: 404 },
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { status, priority, agentId } = body as {
      status?: unknown;
      priority?: unknown;
      agentId?: unknown;
    };

    const avant = await findDemandById(id);
    if (!avant) {
      return NextResponse.json(
        { message: "Demande introuvable" },
        { status: 404 },
      );
    }
    if (avant.deleted_at) {
      return NextResponse.json(
        {
          message:
            "Cette demande a été supprimée : elle ne peut plus être modifiée.",
        },
        { status: 410 },
      );
    }

    const champs: {
      idStatus?: string;
      idPriority?: string;
      idAssignedAgent?: string | null;
    } = {};
    if (status !== undefined) {
      const idStatus =
        typeof status === "string" ? await findStatusIdByLabel(status) : null;
      if (!idStatus) {
        return NextResponse.json(
          { message: "Statut invalide" },
          { status: 400 },
        );
      }
      champs.idStatus = idStatus;
    }
    if (priority !== undefined) {
      const idPriority =
        typeof priority === "string"
          ? await findPriorityIdByLabel(priority)
          : null;
      if (!idPriority) {
        return NextResponse.json(
          { message: "Priorité invalide" },
          { status: 400 },
        );
      }
      champs.idPriority = idPriority;
    }
    if (agentId !== undefined) {
      if (agentId === null || agentId === "") {
        champs.idAssignedAgent = null;
      } else if (
        typeof agentId === "string" &&
        UUID.test(agentId) &&
        (await findAgentById(agentId)).length > 0
      ) {
        champs.idAssignedAgent = agentId;
      } else {
        return NextResponse.json(
          { message: "Agent invalide" },
          { status: 400 },
        );
      }
    }

    const ok = await updateDemandPartielle(id, champs);
    if (!ok) {
      return NextResponse.json(
        { message: "Demande introuvable" },
        { status: 404 },
      );
    }

    const details = await resumerChangements(avant, {
      title: avant.title,
      description: avant.description,
      idCategory: avant.id_category,
      idPriority: champs.idPriority ?? avant.id_priority,
      idStatus: champs.idStatus ?? avant.id_status,
      idAssignedAgent:
        champs.idAssignedAgent !== undefined
          ? champs.idAssignedAgent
          : avant.id_assigned_agent,
    });
    if (details) {
      await logActivity({
        action: "MODIFICATION",
        idUser: garde.user.id,
        idDemand: id,
        details,
      });
    }
    await notifierChangements({
      idDemand: id,
      idActeur: garde.user.id,
      agentAvant: avant.id_assigned_agent,
      agentApres:
        champs.idAssignedAgent !== undefined
          ? champs.idAssignedAgent
          : avant.id_assigned_agent,
      nouveauStatut:
        champs.idStatus && champs.idStatus !== avant.id_status
          ? (status as string)
          : null,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
