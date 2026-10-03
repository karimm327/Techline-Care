import { type NextRequest, NextResponse } from "next/server";
import { exigerConnexion } from "@/lib/auth";
import {
  type FiltresDemandes,
  findDemandsFiltrees,
} from "@/lib/db/queries/demand.queries";
import { reference } from "@/lib/ui/format";
import { libellePriorite, libelleStatut } from "@/lib/ui/status";

const liste = (v: string | null) =>
  (v ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

// Valeur CSV : guillemets doublés, champ entre guillemets s'il contient ; " ou un retour
// à la ligne ; préfixe « ' » contre l'injection de formules dans Excel (=, +, -, @)
function cellule(v: unknown): string {
  let t = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(t)) t = `'${t}`;
  return /[;"\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
}

const date = (d: string | null) =>
  d
    ? new Date(d).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

// Export CSV des demandes correspondant aux filtres du tableau de bord (F15)
// Format Excel français : séparateur « ; », BOM UTF-8
export async function GET(req: NextRequest) {
  const garde = exigerConnexion(req);
  if ("refus" in garde) return garde.refus;

  const p = req.nextUrl.searchParams;
  const filtres: FiltresDemandes = {
    statuts: liste(p.get("statut")),
    priorites: liste(p.get("priorite")),
    categories: liste(p.get("categorie")),
    agents: liste(p.get("agent")),
    sla: liste(p.get("sla")),
    q: p.get("q") ?? undefined,
  };

  try {
    const lignes = await findDemandsFiltrees(filtres, 5000);
    const entetes = [
      "Référence",
      "Titre",
      "Statut",
      "Priorité",
      "Catégorie",
      "Agent",
      "Créée le",
      "Échéance",
      "Clôturée le",
    ];
    const corps = lignes.map((d) =>
      [
        reference(d.id_demand),
        d.title,
        libelleStatut(d.status),
        libellePriorite(d.priority),
        d.category,
        d.agent_full_name ?? "Non assignée",
        date(d.created_at),
        date(d.due_at),
        date(d.closed_at),
      ]
        .map(cellule)
        .join(";"),
    );
    const csv = `﻿${[entetes.join(";"), ...corps].join("\r\n")}\r\n`;
    const jour = new Date().toISOString().slice(0, 10);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="demandes-${jour}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
