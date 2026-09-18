import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.redirect(
            new URL("/login", request.url)
        );
    }

    try {
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error("JWT_SECRET manquant");
        }

        jwt.verify(token, secret);

        return NextResponse.next();
    } catch {
        const response = NextResponse.redirect(
            new URL("/login", request.url)
        );

        // Supprime le cookie invalide
        response.cookies.delete("token");

        return response;
    }
}

export const config = {
    matcher: ["/demands/:path*"],
};
