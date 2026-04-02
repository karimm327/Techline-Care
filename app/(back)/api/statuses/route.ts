import { NextResponse } from "next/server";
import {findAllStatuses} from "@/lib/db/queries/status.queries";

export async function GET() {
    try {
        const result = await findAllStatuses();

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { message: "Erreur serveur (priorities)" },
            { status: 500 }
        );
    }
}