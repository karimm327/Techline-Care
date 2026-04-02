import { NextResponse } from "next/server";
import {findDemandById, updateDemand} from "@/lib/db/queries/demand.queries";
import {findCategoryById} from "@/lib/db/queries/category.queries";
import {findPriorityById} from "@/lib/db/queries/priority.queries";
import {findAgentById} from "@/lib/db/queries/user.queries";
import {findStatusById} from "@/lib/db/queries/status.queries";

export async function PUT(req: Request, {params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    try {
        const body = await req.json();

        const {
            title,
            description,
            idCategory,
            idPriority,
            idStatus,
            idAssignedAgent
        } = body;

        // Vérifier existence demande
        const demandCheck = await findDemandById(id);

        if (!demandCheck) {
            return NextResponse.json(
                { message: "Demande introuvable" },
                { status: 404 }
            );
        }

        // Vérifier catégorie
        const catCheck = await findCategoryById(idCategory);

        if (catCheck.length === 0) {
            return NextResponse.json(
                { message: "Catégorie invalide" },
                { status: 400 }
            );
        }

        // Vérifier priorité
        const prioCheck = await findPriorityById(idPriority);

        if (prioCheck.length === 0) {
            return NextResponse.json(
                { message: "Priorité invalide" },
                { status: 400 }
            );
        }

        // Vérifier statut
        const statusCheck = await findStatusById(idStatus);

        if (statusCheck.length === 0) {
            return NextResponse.json(
                { message: "Statut invalide" },
                { status: 400 }
            );
        }

        // Vérifier agent
        if (idAssignedAgent) {
            const agentCheck = await findAgentById(idAssignedAgent);

            if (agentCheck.length === 0) {
                return NextResponse.json(
                    { message: "Agent invalide" },
                    { status: 400 }
                );
            }
        }

        // UPDATE
        await updateDemand(title, description, idCategory, idPriority, idStatus, idAssignedAgent, id);

        return NextResponse.json({ success: true });

    } catch (error: any) {

        // Gestion propre Zod
        if (error.name === "ZodError") {
            return NextResponse.json(
                { message: error },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Erreur serveur" },
            { status: 500 }
        );
    }
}