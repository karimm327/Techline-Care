import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth/session";

// Protège /account et /account/rights : connexion obligatoire
export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireUser();
  return <>{children}</>;
}
