import { NextResponse } from "next/server";
import {findAllAgents} from "@/lib/db/queries/user.queries";

export async function GET(request:Request) {

    const { searchParams } = new URL(request.url);

    const role = searchParams.get("role");

    try {
        const result : any = role?.toLowerCase() == "agent" ? await findAllAgents() : [];
        console.log(result);

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { message: "Erreur serveur" },
            { status: 500 }
        );
    }
}