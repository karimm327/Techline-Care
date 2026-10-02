"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { notifier } from "@/components/ui/Toast";

// Après une suppression (?supprimee=<id>) : toast de confirmation ; « Annuler » restaure (ADMIN)
export default function ToastSuppression({ admin }: { admin: boolean }) {
  const params = useSearchParams();
  const router = useRouter();
  const chemin = usePathname();
  const deja = useRef(false);
  const id = params.get("supprimee");

  useEffect(() => {
    if (!id || deja.current) return;
    deja.current = true;

    // Retire le paramètre de l'URL pour ne pas rejouer le toast
    const suivant = new URLSearchParams(params.toString());
    suivant.delete("supprimee");
    const q = suivant.toString();
    router.replace(`${chemin}${q ? `?${q}` : ""}`, { scroll: false });

    const restaurable = admin && id !== "1";
    notifier({
      titre: "Demande supprimée",
      description: admin
        ? "Le motif est enregistré dans le journal d’activité."
        : "Un administrateur peut la restaurer.",
      ton: "info",
      action: restaurable
        ? {
            label: "Annuler",
            onClick: async () => {
              const res = await fetch(`/api/demands/${id}/restore`, {
                method: "POST",
              });
              if (res.ok) {
                notifier({ titre: "Demande restaurée", ton: "succes" });
                router.refresh();
              } else {
                notifier({
                  titre: "Restauration impossible",
                  description: "Réessayez depuis le journal d’activité.",
                  ton: "erreur",
                });
              }
            },
          }
        : undefined,
    });
  }, [id, admin, params, router, chemin]);

  return null;
}
