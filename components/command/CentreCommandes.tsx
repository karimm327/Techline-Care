"use client";

import { useRouter } from "next/navigation";
import { Suspense, useCallback, useState } from "react";
import type { UtilisateurShell } from "@/components/layout/types";
import Dialog from "@/components/ui/Dialog";
import Kbd from "@/components/ui/Kbd";
import { libelleMod, useShortcuts } from "@/lib/hooks/useShortcuts";
import { useEvenement } from "@/lib/ui/commandes";
import CommandPalette from "./CommandPalette";

// sequence : touches à enchaîner (« G puis D ») ; sinon combinaison ou plage (« 1 à 4 »)
type Raccourci = {
  touches: string[];
  label: string;
  sequence?: boolean;
  plage?: boolean;
};

function listeRaccourcis(u: UtilisateurShell, mod: string) {
  const general: Raccourci[] = [
    { touches: [mod, "K"], label: "Ouvrir la palette de commandes" },
    { touches: ["?"], label: "Afficher cette aide" },
    { touches: ["G", "D"], label: "Aller au tableau de bord", sequence: true },
    { touches: ["G", "C"], label: "Aller à mon compte", sequence: true },
  ];
  if (u.estAdmin)
    general.push({
      touches: ["G", "J"],
      label: "Aller au journal d’activité",
      sequence: true,
    });
  if (!u.lectureSeule)
    general.push({ touches: ["N"], label: "Nouvelle demande" });

  const fiche: Raccourci[] = u.lectureSeule
    ? []
    : [
        { touches: ["E"], label: "Modifier la demande" },
        { touches: ["1", "4"], label: "Changer le statut", plage: true },
        { touches: ["A"], label: "M’assigner la demande" },
        { touches: ["C"], label: "Écrire un commentaire" },
        {
          touches: [mod, "↵"],
          label: "Envoyer le commentaire / le formulaire",
        },
      ];
  return { general, fiche };
}

function Ligne({ r }: { r: Raccourci }) {
  const lien = r.sequence ? "puis" : r.plage ? "à" : null;
  return (
    <li className="flex items-center justify-between gap-4 border-t border-line-soft py-2.5 first:border-t-0">
      <span className="text-fg-1">{r.label}</span>
      <span className="flex shrink-0 items-center gap-1 text-xs text-fg-4">
        {r.touches.map((t, i) => (
          <span key={t} className="flex items-center gap-1">
            {i > 0 && lien && <span>{lien}</span>}
            <Kbd>{t}</Kbd>
          </span>
        ))}
      </span>
    </li>
  );
}

// Palette Ctrl K + raccourcis globaux (F2) + feuille d'aide « ? », montés une seule fois dans l'AppShell
export default function CentreCommandes({
  utilisateur,
}: {
  utilisateur: UtilisateurShell;
}) {
  const router = useRouter();
  const [aide, setAide] = useState(false);
  const ouvrirAide = useCallback(() => setAide(true), []);
  useEvenement("aide", ouvrirAide);

  useShortcuts({
    "?": ouvrirAide,
    "g d": () => router.push("/demands"),
    "g c": () => router.push("/account"),
    ...(utilisateur.estAdmin ? { "g j": () => router.push("/journal") } : {}),
    ...(utilisateur.lectureSeule
      ? {}
      : { n: () => router.push("/demands/new") }),
  });

  const mod = typeof window === "undefined" ? "Ctrl" : libelleMod();
  const { general, fiche } = listeRaccourcis(utilisateur, mod);

  return (
    <>
      <Suspense fallback={null}>
        <CommandPalette utilisateur={utilisateur} />
      </Suspense>
      <Dialog
        open={aide}
        onClose={() => setAide(false)}
        title="Raccourcis clavier"
        description="Désactivables dans Mon compte › Préférences. Ils sont ignorés pendant la saisie dans un champ."
        size="lg"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <section>
            <h3 className="mb-1 text-eyebrow uppercase text-fg-4">Partout</h3>
            <ul>
              {general.map((r) => (
                <Ligne key={r.label} r={r} />
              ))}
            </ul>
          </section>
          {fiche.length > 0 && (
            <section>
              <h3 className="mb-1 text-eyebrow uppercase text-fg-4">
                Sur une fiche demande
              </h3>
              <ul>
                {fiche.map((r) => (
                  <Ligne key={r.label} r={r} />
                ))}
              </ul>
            </section>
          )}
        </div>
      </Dialog>
    </>
  );
}
