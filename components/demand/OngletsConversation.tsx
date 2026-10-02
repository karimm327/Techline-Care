"use client";

import { type ReactNode, useState } from "react";
import Tabs, { TabPanel } from "@/components/ui/Tabs";

export type OngletConversation = {
  value: string;
  label: string;
  count?: number;
  contenu: ReactNode;
};

// Onglets de la conversation (Commentaires, puis Notes internes et Pièces jointes à leur étape)
export default function OngletsConversation({
  onglets,
}: {
  onglets: OngletConversation[];
}) {
  const [actif, setActif] = useState(onglets[0]?.value ?? "");
  return (
    <div>
      <Tabs
        id="conversation"
        label="Conversation"
        items={onglets.map(({ value, label, count }) => ({
          value,
          label,
          count,
        }))}
        value={actif}
        onChange={setActif}
        className="-mx-1.5 -mt-1.5 mb-[18px]"
      />
      {onglets.map((o) => (
        <TabPanel
          key={o.value}
          id="conversation"
          value={o.value}
          active={o.value === actif}
        >
          {o.contenu}
        </TabPanel>
      ))}
    </div>
  );
}
