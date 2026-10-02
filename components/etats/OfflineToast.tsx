"use client";

import { useEffect, useState } from "react";
import { notifier } from "@/components/ui/Toast";

// Pastille « Hors ligne — reconnexion… » tant que le navigateur est hors ligne
export default function OfflineToast() {
  const [horsLigne, setHorsLigne] = useState(false);

  useEffect(() => {
    const sync = () => setHorsLigne(!navigator.onLine);
    const retour = () => {
      setHorsLigne(false);
      notifier({ titre: "Connexion rétablie", ton: "succes", duree: 3000 });
    };
    sync();
    window.addEventListener("offline", sync);
    window.addEventListener("online", retour);
    return () => {
      window.removeEventListener("offline", sync);
      window.removeEventListener("online", retour);
    };
  }, []);

  if (!horsLigne) return null;
  return (
    <output className="fixed bottom-5 left-5 z-toast flex animate-pop items-center gap-3 rounded-full border border-line-strong bg-surface-2 px-3.5 py-3 text-[13px] text-fg shadow-lg">
      <span
        aria-hidden="true"
        className="size-2 animate-live rounded-full bg-st-encours"
      />
      Hors ligne — reconnexion…
    </output>
  );
}
