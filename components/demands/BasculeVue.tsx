"use client";

import { Columns3, List } from "lucide-react";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { useParametresUrl } from "@/lib/hooks/useParametresUrl";

export type ModeVue = "liste" | "kanban";

// Liste ↔ Kanban (M04) : le mode est gardé dans l'URL (?mode=kanban), les filtres sont conservés
export default function BasculeVue({ mode }: { mode: ModeVue }) {
  const { modifier } = useParametresUrl();
  return (
    <SegmentedControl<ModeVue>
      label="Mode d’affichage"
      layoutId="seg-vue"
      value={mode}
      onChange={(v) => modifier({ mode: v, page: null })}
      options={[
        {
          value: "liste",
          label: "Liste",
          icon: (
            <List aria-hidden="true" strokeWidth={2} className="size-[15px]" />
          ),
        },
        {
          value: "kanban",
          label: "Kanban",
          icon: (
            <Columns3
              aria-hidden="true"
              strokeWidth={2}
              className="size-[15px]"
            />
          ),
        },
      ]}
    />
  );
}
