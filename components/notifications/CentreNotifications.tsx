"use client";

import {
  AtSign,
  Bell,
  CheckCheck,
  CircleAlert,
  Clock,
  MessageSquare,
  RefreshCw,
  UserPlus,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import Button from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import IconButton from "@/components/ui/IconButton";
import Tabs from "@/components/ui/Tabs";
import { notifier } from "@/components/ui/Toast";
import type {
  Notification,
  TypeNotification,
} from "@/lib/db/queries/notification.queries";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { cn } from "@/lib/ui/cn";
import { ilYA } from "@/lib/ui/format";

const STYLES: Record<TypeNotification, { icone: ReactNode; teinte: string }> = {
  MENTION: {
    icone: <AtSign strokeWidth={2.2} className="size-4" />,
    teinte: "bg-accent/25 text-accent-fg-2",
  },
  ASSIGNATION: {
    icone: <UserPlus strokeWidth={2.2} className="size-4" />,
    teinte: "bg-st-nouvelle/15 text-st-nouvelle-fg",
  },
  SLA_DEPASSE: {
    icone: <CircleAlert strokeWidth={2.2} className="size-4" />,
    teinte: "bg-prio-haute/15 text-prio-haute-fg",
  },
  SLA_PROCHE: {
    icone: <Clock strokeWidth={2.2} className="size-4" />,
    teinte: "bg-st-encours/15 text-st-encours-fg",
  },
  STATUT: {
    icone: <RefreshCw strokeWidth={2.2} className="size-4" />,
    teinte: "bg-success/15 text-success-fg",
  },
  COMMENTAIRE: {
    icone: <MessageSquare strokeWidth={2.2} className="size-4" />,
    teinte: "bg-surface-3 text-fg-1",
  },
};

const ONGLETS = [
  { value: "tout", label: "Tout" },
  { value: "mentions", label: "Mentions" },
  { value: "assignees", label: "Assignées" },
];

// Cloche du header (M07) + tiroir des notifications (M10) — F5
export default function CentreNotifications() {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  // Relance l'animation de la cloche à chaque nouvelle notification
  const [secousse, setSecousse] = useState(0);
  const { notifications, nonLues, onglet, setOnglet, chargement, marquerLues } =
    useNotifications((n) => {
      setSecousse((s) => s + 1);
      notifier({
        titre: "Nouvelle notification",
        description: n.message,
        ton: "info",
        duree: 5000,
      });
    });

  const ouvrir = (n: Notification) => {
    if (!n.read_at) marquerLues([n.id]);
    setOuvert(false);
    if (n.id_demand) router.push(`/demands/${n.id_demand}`);
  };

  return (
    <>
      <IconButton
        label={
          nonLues > 0
            ? `Notifications, ${nonLues} non lue${nonLues > 1 ? "s" : ""}`
            : "Notifications"
        }
        size={44}
        aria-haspopup="dialog"
        aria-expanded={ouvert}
        onClick={() => setOuvert(true)}
        className="relative"
      >
        <Bell
          key={secousse}
          aria-hidden="true"
          strokeWidth={1.9}
          className={cn(
            "size-5 origin-[50%_3px]",
            nonLues > 0 && "animate-swing",
          )}
        />
        {nonLues > 0 && (
          <span
            aria-hidden="true"
            className="absolute right-2 top-2 size-[9px]"
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-prio-haute" />
            <span className="absolute inset-0 rounded-full border-2 border-bg bg-prio-haute" />
          </span>
        )}
      </IconButton>

      <Drawer
        open={ouvert}
        onClose={() => setOuvert(false)}
        title="Notifications"
        header={(idTitre) => (
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-[18px]">
            <h2 id={idTitre} className="font-display text-lg font-semibold">
              Notifications
            </h2>
            <IconButton
              label="Fermer"
              size={36}
              onClick={() => setOuvert(false)}
            >
              <X aria-hidden="true" strokeWidth={1.9} className="size-[18px]" />
            </IconButton>
          </div>
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-line px-4 pt-1">
            <Tabs
              id="notifications"
              label="Filtrer les notifications"
              items={ONGLETS.map((o) => ({
                ...o,
                count: o.value === "tout" && nonLues > 0 ? nonLues : undefined,
              }))}
              value={onglet}
              onChange={setOnglet}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-2" aria-live="polite">
            {chargement ? (
              <p className="px-3 py-8 text-center text-fg-3">Chargement…</p>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-surface-2 text-fg-3">
                  <Bell
                    aria-hidden="true"
                    strokeWidth={1.9}
                    className="size-5"
                  />
                </span>
                <p className="font-semibold">Rien de nouveau</p>
                <p className="text-[13px] text-fg-3">
                  Les mentions, assignations et alertes SLA apparaîtront ici.
                </p>
              </div>
            ) : (
              <ol className="flex flex-col">
                {notifications.map((n, i) => {
                  const st = STYLES[n.type] ?? STYLES.COMMENTAIRE;
                  return (
                    <motion.li
                      key={n.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.12 + Math.min(i, 8) * 0.06,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => ouvrir(n)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-[10px] p-3 text-left transition-colors hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft",
                          !n.read_at && "bg-accent/[.07]",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-full",
                            st.teinte,
                          )}
                        >
                          {st.icone}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13.5px] text-fg-1">
                            {n.message}
                          </span>
                          <span className="mt-0.5 block text-xs text-fg-4">
                            {ilYA(n.created_at)}
                          </span>
                        </span>
                        {!n.read_at && (
                          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent-soft">
                            <span className="sr-only">Non lue</span>
                          </span>
                        )}
                      </button>
                    </motion.li>
                  );
                })}
              </ol>
            )}
          </div>

          <div className="border-t border-line px-5 py-3.5">
            <Button
              variant="secondary"
              className="w-full"
              disabled={nonLues === 0}
              onClick={() => marquerLues()}
              icon={
                <CheckCheck
                  aria-hidden="true"
                  strokeWidth={2}
                  className="size-4"
                />
              }
            >
              Tout marquer comme lu
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  );
}
