"use client";

import Kbd from "@/components/ui/Kbd";
import { ouvrirAideRaccourcis } from "@/lib/ui/commandes";

// « ? Raccourcis » du footer : ouvre la feuille d'aide (même effet que la touche ?)
export default function BoutonRaccourcis() {
  return (
    <button
      type="button"
      onClick={ouvrirAideRaccourcis}
      aria-keyshortcuts="?"
      className="inline-flex items-center gap-1.5 rounded-xs text-fg-2 transition-colors hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
    >
      <Kbd className="rounded-[5px] text-fg-1">?</Kbd>
      Raccourcis
    </button>
  );
}
