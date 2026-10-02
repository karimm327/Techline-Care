import { notFound } from "next/navigation";

// Toute URL inconnue du site affiche la page 404 restylée (app/(front)/not-found.tsx).
// Les routes existantes (et /api/*) sont plus spécifiques et passent avant celle-ci.
export default function UrlInconnue() {
  notFound();
}
