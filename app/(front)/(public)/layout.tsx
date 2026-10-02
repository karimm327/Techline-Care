import type { ReactNode } from "react";
import PublicFooter from "@/components/layout/PublicFooter";
import PublicHeader from "@/components/layout/PublicHeader";
import { getSessionUser } from "@/lib/auth/session";

// Pages publiques : /login, /confidentialite, /mentions-legales
export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const connecte = !!(await getSessionUser());
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader connecte={connecte} />
      <main className="flex flex-1 flex-col">{children}</main>
      <PublicFooter />
    </div>
  );
}
