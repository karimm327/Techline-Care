import { NextResponse } from "next/server";
import {findAllAgents} from "@/lib/db/queries/user.queries";

export async function GET() {
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