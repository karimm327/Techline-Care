"use client";

import { Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Switch from "@/components/ui/Switch";
import { notifier } from "@/components/ui/Toast";
import type { Preferences } from "@/lib/db/queries/preference.queries";

type Props = {
  initiales: Preferences;
  // « notifications » : quatre interrupteurs ; « affichage » : animations, densité, vue
  section: "notifications" | "affichage";
};

// Préférences enregistrées dès le changement (PATCH), appliquées à toute l'application (F14)
export default function PreferencesCompte({ initiales, section }: Props) {
  const router = useRouter();
  const [prefs, setPrefs] = useState(initiales);

  async function changer<K extends keyof Preferences>(
    cle: K,
    valeur: Preferences[K],
  ) {
    const avant = prefs;
    setPrefs({ ...prefs, [cle]: valeur });
    // Effet immédiat sur la page courante (sans attendre le rechargement serveur)
    const html = document.documentElement;
    if (cle === "motion") html.classList.toggle("no-motion", !valeur);
    if (cle === "theme")
      html.classList.toggle("theme-clair", valeur === "clair");
    if (cle === "density")
      html.classList.toggle("density-compact", valeur === "compact");
    try {
      const res = await fetch("/api/users/me/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [cle]: valeur }),
      });
      if (!res.ok) throw new Error();
      notifier({ titre: "Préférence enregistrée", ton: "succes", duree: 2500 });
      router.refresh();
    } catch {
      setPrefs(avant);
      notifier({ titre: "Enregistrement impossible", ton: "erreur" });
    }
  }

  if (section === "notifications") {
    return (
      <div className="flex flex-col divide-y divide-line-soft">
        <Switch
          label="Une demande m’est assignée"
          description="Notification immédiate dans la cloche"
          checked={prefs.notify_assign}
          onChange={(v) => changer("notify_assign", v)}
          className="py-3.5"
        />
        <Switch
          label="On me mentionne (@)"
          description="Dans un commentaire ou une note interne"
          checked={prefs.notify_mention}
          onChange={(v) => changer("notify_mention", v)}
          className="py-3.5"
        />
        <Switch
          label="SLA bientôt dépassé"
          description="30 minutes avant l’échéance, puis au dépassement"
          checked={prefs.notify_sla}
          onChange={(v) => changer("notify_sla", v)}
          className="py-3.5"
        />
        <Switch
          label="Résumé quotidien par e-mail"
          description="Préférence enregistrée : l’envoi d’e-mails n’est pas encore en place"
          checked={prefs.notify_digest}
          onChange={(v) => changer("notify_digest", v)}
          className="py-3.5"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-line-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 py-3.5">
        <div>
          <p className="font-semibold">Thème</p>
          <p className="text-[12.5px] text-fg-3">
            TechLine Care (sombre, par défaut) ou clair
          </p>
        </div>
        <SegmentedControl<"sombre" | "clair">
          label="Thème"
          layoutId="seg-theme"
          value={prefs.theme}
          onChange={(v) => changer("theme", v)}
          options={[
            {
              value: "sombre",
              label: "TechLine Care",
              icon: (
                <Moon aria-hidden="true" strokeWidth={1.9} className="size-4" />
              ),
            },
            {
              value: "clair",
              label: "Clair",
              icon: (
                <Sun aria-hidden="true" strokeWidth={1.9} className="size-4" />
              ),
            },
          ]}
        />
      </div>
      <Switch
        label="Animations"
        description="Désactivées automatiquement si votre système demande moins de mouvement"
        checked={prefs.motion}
        onChange={(v) => changer("motion", v)}
        className="py-3.5"
      />
      <Switch
        label="Densité compacte"
        description="Lignes de tableau plus serrées"
        checked={prefs.density === "compact"}
        onChange={(v) => changer("density", v ? "compact" : "confort")}
        className="py-3.5"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 py-3.5">
        <div>
          <p className="font-semibold">Vue par défaut du tableau de bord</p>
          <p className="text-[12.5px] text-fg-3">
            Utilisée quand aucun mode n’est choisi
          </p>
        </div>
        <SegmentedControl<"liste" | "kanban">
          label="Vue par défaut du tableau de bord"
          layoutId="seg-vue-defaut"
          value={prefs.default_view}
          onChange={(v) => changer("default_view", v)}
          options={[
            { value: "liste", label: "Liste" },
            { value: "kanban", label: "Kanban" },
          ]}
        />
      </div>
    </div>
  );
}
