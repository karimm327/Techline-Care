import { NextResponse } from "next/server";
import {findAllPriorities} from "@/lib/db/queries/priority.queries";

export async function GET() {
    try {
        const result = await findAllPriorities();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { message: "Erreur serveur (priorities)" },
            { status: 500 }
        );
    }
}