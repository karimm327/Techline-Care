import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { Role } from "@/lib/types/Role";

export type AuthUser = {
    id: string;
    email: string;
    role: Role;
};

export function getUserFromRequest(req: NextRequest): AuthUser | null {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as AuthUser;

        return decoded;
    } catch {
        return null;
    }
}

export function requireRole(userRole: Role, allowed: Role[]) {
    if (!allowed.includes(userRole)) {
        throw new Error("FORBIDDEN");
    }
}