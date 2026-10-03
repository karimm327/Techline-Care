"use client";

import { Download } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { classesBouton } from "@/components/ui/Button";
import { normaliserRequete } from "@/lib/ui/vues";

// « Exporter CSV » : les filtres courants du tableau de bord sont transmis à l'export (F15)
export default function BoutonExport() {
  const params = useSearchParams();
  const requete = normaliserRequete(params.toString())
    .replace(/(^|&)mode=[^&]*/, "")
    .replace(/^&/, "");
  return (
    <a
      href={`/api/demands/export${requete ? `?${requete}` : ""}`}
      download
      className={classesBouton({ variant: "secondary" })}
    >
      <Download aria-hidden="true" strokeWidth={2} className="size-[15px]" />
      Exporter CSV
    </a>
  );
}
