import {NextResponse} from "next/server";
import {findCommentsByDemandId} from "@/lib/db/queries/comment.queries";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log(body);
        // TODO A faire apres le auth pour ne pas utiliser un utilisateur en dur
        return NextResponse.json({success: true});
    } catch (error: any) {
        return NextResponse.json(
            {error: error.message},
            {status: 400}
        );
    }
}

export async function GET(req: Request, {params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    try {
        const result = await findCommentsByDemandId(id);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { message: "Erreur serveur (comments)" },
            { status: 500 }
        );
    }
}