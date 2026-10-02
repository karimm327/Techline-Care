import { type NextRequest, NextResponse } from "next/server";
import { exigerConnexion } from "@/lib/auth";
import { logActivity } from "@/lib/db/queries/activity.queries";
import { findCategoryById } from "@/lib/db/queries/category.queries";
import { createDemand } from "@/lib/db/queries/demand.queries";
import { findPriorityById } from "@/lib/db/queries/priority.queries";
import { findAgentById } from "@/lib/db/queries/user.queries";
import { erreursDemande } from "@/lib/schemas/demand.schema";

export async function POST(req: NextRequest) {
  // Connexion obligatoire + rôle LECTURE interdit
  const garde = exigerConnexion(req, ["ADMIN", "AGENT"]);
  if ("refus" in garde) return garde.refus;

  try {
    const body = await req.json();

    const { title, description, idCategory, idPriority, idAssignedAgent } =
      body;

    // VALIDATIONS (règles partagées avec le formulaire)
    const erreurs = erreursDemande({ title, description });
    const premiere = erreurs.title ?? erreurs.description;
    if (premiere) {
      return NextResponse.json({ message: premiere }, { status: 400 });
    }

    if (!idCategory || !idPriority) {
      return NextResponse.json(
        { message: "Catégorie et priorité obligatoires" },
        { status: 400 },
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

    // Vérifier agent (si fourni)
    if (idAssignedAgent) {
      const agentCheck = await findAgentById(idAssignedAgent);

      if (agentCheck.length === 0) {
        return NextResponse.json(
          { message: "Agent invalide" },
          { status: 400 },
        );
      }
    }

    // Insertion
    const result = await createDemand(
      title.trim(),
      description.trim(),
      idCategory,
      idPriority,
      idAssignedAgent,
    );

    // Journal d'activité
    await logActivity({
      action: "CREATION",
      idUser: garde.user.id,
      idDemand: result.rows[0].id_demand,
      details: `Demande créée : « ${title} »`,
    });

    return NextResponse.json({
      id: result.rows[0].id_demand,
    });
  } catch (error) {
    console.log(error);
    let errorMessage: unknown = "Erreur serveur (demands)";

    if ((error as Error)?.name === "ZodError") {
      errorMessage = error;
    }

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
