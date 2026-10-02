import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DemoUI from "./DemoUI";

export const metadata: Metadata = {
  title: "Composants UI — TechLine Care",
  robots: { index: false, follow: false },
};

// Page de démonstration des composants (URL /_ui). Disponible en développement uniquement.
export default function PageDemoUI() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <DemoUI />;
}
