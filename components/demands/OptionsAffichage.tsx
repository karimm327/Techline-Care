"use client";

import { Check, Columns3, Download, List, MoreHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import IconButton from "@/components/ui/IconButton";
import Menu from "@/components/ui/Menu";
import { useParametresUrl } from "@/lib/hooks/useParametresUrl";
import { cn } from "@/lib/ui/cn";
import { normaliserRequete } from "@/lib/ui/vues";

export type ModeVue = "liste" | "kanban";

const coche = <Check strokeWidth={2.4} className="size-4 text-accent-fg" />;

// Menu « ⋯ » tout à droite des filtres : affichage Liste / Kanban et export CSV des filtres courants
export default function OptionsAffichage({ mode }: { mode: ModeVue }) {
  const { modifier } = useParametresUrl();
  const params = useSearchParams();
  const requete = normaliserRequete(params.toString())
    .replace(/(^|&)mode=[^&]*/, "")
    .replace(/^&/, "");

  return (
    <Menu
      label="Options d’affichage"
      align="end"
      items={[
        {
          type: "header",
          content: (
            <p className="text-[11px] font-semibold uppercase tracking-[.08em] text-fg-4">
              Affichage
            </p>
          ),
        },
        {
          label: mode === "liste" ? "Liste (actuel)" : "Liste",
          icon:
            mode === "liste" ? (
              coche
            ) : (
              <List strokeWidth={2} className="size-4" />
            ),
          onSelect: () => modifier({ mode: "liste", page: null }),
        },
        {
          label: mode === "kanban" ? "Kanban (actuel)" : "Kanban",
          icon:
            mode === "kanban" ? (
              coche
            ) : (
              <Columns3 strokeWidth={2} className="size-4" />
            ),
          onSelect: () => modifier({ mode: "kanban", page: null }),
        },
        { type: "separator" },
        {
          label: "Exporter CSV",
          icon: <Download strokeWidth={2} className="size-4" />,
          onSelect: () => {
            window.location.href = `/api/demands/export${requete ? `?${requete}` : ""}`;
          },
        },
      ]}
      trigger={(props, ouvert) => (
        <IconButton
          {...props}
          label="Options d’affichage"
          size={36}
          className={cn(
            "border border-line-strong/70 bg-surface",
            ouvert && "bg-surface-2 text-fg",
          )}
        >
          <MoreHorizontal
            aria-hidden="true"
            strokeWidth={2}
            className="size-[18px]"
          />
        </IconButton>
      )}
    />
  );
}
