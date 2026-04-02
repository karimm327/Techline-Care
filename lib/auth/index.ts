import {Role} from "@/lib/types/Role";

export function requireRole(userRole: Role, allowed: Role[]) {
    if (!allowed.includes(userRole)) {
        throw new Error("FORBIDDEN");
    }
}
