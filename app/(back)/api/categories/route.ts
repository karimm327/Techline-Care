import { NextResponse } from "next/server";
import {findAllCategories} from "@/lib/db/queries/category.queries";

export async function GET() {
    try {
        const result = await findAllCategories();

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { message: "Erreur serveur (categories)" },
            { status: 500 }
        );
    }
}