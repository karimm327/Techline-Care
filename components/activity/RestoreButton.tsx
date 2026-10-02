"use client";

import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { notifier } from "@/components/ui/Toast";

// Bouton « Restaurer » d'une demande supprimée (ADMIN)
export default function RestoreButton({
  id,
  variante = "plein",
}: {
  id: string;
  variante?: "plein" | "lien";
}) {
  const router = useRouter();
  const [envoi, setEnvoi] = useState(false);

  async function restaurer() {
    setEnvoi(true);
    try {
      const res = await fetch(`/api/demands/${id}/restore`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "Restauration impossible.");
      }
      notifier({
        titre: "Demande restaurée",
        description: "Elle est de nouveau visible et modifiable.",
        ton: "succes",
      });
      router.refresh();
    } catch (e) {
      notifier({
        titre: "Restauration impossible",
        description: (e as Error).message,
        ton: "erreur",
      });
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Button
      variant={variante === "plein" ? "success" : "ghost"}
      size={variante === "plein" ? "md" : "sm"}
      onClick={restaurer}
      loading={envoi}
      loadingLabel="Restauration…"
      icon={
        <RotateCcw aria-hidden="true" strokeWidth={2.2} className="size-4" />
      }
    >
      Restaurer
    </Button>
  );
}
