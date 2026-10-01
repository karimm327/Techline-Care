import { NextRequest, NextResponse } from "next/server";
import { exigerConnexion } from "@/lib/auth";
import {findAllAgents} from "@/lib/db/queries/user.queries";

export async function GET(req: NextRequest) {
    const garde = exigerConnexion(req);
    if ("refus" in garde) return garde.refus;
    try {
        const result = await findAllAgents();

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { message: "Erreur serveur (agents)" },
            { status: 500 }
        );
    }
}