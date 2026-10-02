import type { ReactNode } from "react";
import AppShell from "@/components/layout/AppShell";

// Pages de l'application (connexion obligatoire) : /demands, /journal, /account
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
