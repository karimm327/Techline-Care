"use client";

import { Command } from "cmdk";
import {
  Activity,
  ArrowRight,
  FilePlus2,
  Keyboard,
  LayoutDashboard,
  LogOut,
  Search,
  ShieldCheck,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { UtilisateurShell } from "@/components/layout/types";
import Avatar from "@/components/ui/Avatar";
import { useMonteClient } from "@/components/ui/Dialog";
import Kbd from "@/components/ui/Kbd";
import StatusBadge from "@/components/ui/StatusBadge";
import { useCoucheModale } from "@/lib/hooks/useCoucheModale";
import { libelleMod, useShortcuts } from "@/lib/hooks/useShortcuts";
import { dialogIn, voile } from "@/lib/motion";
import { cn } from "@/lib/ui/cn";
import {
  ouvrirAideRaccourcis,
  useCommandesContextuelles,
  useEvenement,
} from "@/lib/ui/commandes";

type ResultatDemande = {
  id: string;
  ref: string;
  title: string;
  status: string;
};
type ResultatPersonne = { id: string; nom: string; role: string };

type Props = { utilisateur: UtilisateurShell };

// Normalisation pour le filtrage local (sans accents, minuscules)
const normaliser = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

// Surligne le terme recherché dans un libellé
function Surligne({ texte, terme }: { texte: string; terme: string }) {
  const t = terme.trim().replace(/^#/, "");
  if (t.length < 2) return <>{texte}</>;
  const i = normaliser(texte).indexOf(normaliser(t));
  if (i < 0) return <>{texte}</>;
  return (
    <>
      {texte.slice(0, i)}
      <mark className="rounded-[3px] bg-st-encours/30 px-0.5 text-st-encours-fg">
        {texte.slice(i, i + t.length)}
      </mark>
      {texte.slice(i + t.length)}
    </>
  );
}

const classeItem =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2 text-fg-1 outline-none data-[selected=true]:bg-accent/20 data-[selected=true]:text-fg aria-disabled:opacity-50";

function Groupe({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <Command.Group
      heading={titre}
      className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[.08em] [&_[cmdk-group-heading]]:text-fg-4"
    >
      {children}
    </Command.Group>
  );
}

// Palette de commandes (F1) — Ctrl K / ⌘K ou clic sur la recherche du header. M09.
export default function CommandPalette({ utilisateur }: Props) {
  const router = useRouter();
  const chemin = usePathname();
  const params = useSearchParams();
  const monte = useMonteClient();
  const boite = useRef<HTMLDivElement>(null);
  const [ouvert, setOuvert] = useState(false);
  const [saisie, setSaisie] = useState("");
  const [demandes, setDemandes] = useState<ResultatDemande[]>([]);
  const [personnes, setPersonnes] = useState<ResultatPersonne[]>([]);
  const [chargement, setChargement] = useState(false);
  // Élément surligné : remis sur le premier résultat à chaque nouvelle recherche
  const [selection, setSelection] = useState("");
  const contextuelles = useCommandesContextuelles();

  const fermer = useCallback(() => setOuvert(false), []);
  const ouvrir = useCallback(() => {
    setSaisie("");
    setOuvert(true);
  }, []);
  useCoucheModale(ouvert, fermer, boite);
  useEvenement("palette", ouvrir);
  useShortcuts({ "mod+k": () => (ouvert ? fermer() : ouvrir()) });

  // /demands?palette=1 (bouton « Rechercher » de la page 404) ouvre la palette
  useEffect(() => {
    if (params.get("palette") === "1") {
      ouvrir();
      const p = new URLSearchParams(params.toString());
      p.delete("palette");
      router.replace(p.size ? `${chemin}?${p}` : chemin, { scroll: false });
    }
  }, [params, chemin, router, ouvrir]);

  // Recherche serveur, 200 ms après la frappe ; les réponses périmées sont ignorées
  useEffect(() => {
    const q = saisie.trim();
    if (!ouvert || q.length < 2) {
      setDemandes([]);
      setPersonnes([]);
      setChargement(false);
      return;
    }
    const controle = new AbortController();
    setChargement(true);
    const minuteur = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controle.signal,
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setDemandes(data.demandes ?? []);
        if (data.demandes?.[0]) setSelection(`demande-${data.demandes[0].id}`);
        setPersonnes(data.personnes ?? []);
      } catch {
        if (!controle.signal.aborted) {
          setDemandes([]);
          setPersonnes([]);
        }
      } finally {
        if (!controle.signal.aborted) setChargement(false);
      }
    }, 200);
    return () => {
      controle.abort();
      window.clearTimeout(minuteur);
    };
  }, [saisie, ouvert]);

  const aller = useCallback(
    (href: string) => {
      fermer();
      router.push(href);
    },
    [fermer, router],
  );

  const navigation = useMemo(
    () =>
      [
        {
          id: "nav-tableau",
          label: "Tableau de bord",
          href: "/demands",
          touche: "G puis D",
          icone: <LayoutDashboard strokeWidth={1.9} className="size-4" />,
        },
        utilisateur.estAdmin && {
          id: "nav-journal",
          label: "Journal d’activité",
          href: "/journal",
          touche: "G puis J",
          icone: <Activity strokeWidth={1.9} className="size-4" />,
        },
        {
          id: "nav-compte",
          label: "Mon compte",
          href: "/account",
          touche: "G puis C",
          icone: <User strokeWidth={1.9} className="size-4" />,
        },
        {
          id: "nav-droits",
          label: "Mes droits",
          href: "/account?onglet=droits",
          icone: <ShieldCheck strokeWidth={1.9} className="size-4" />,
        },
      ].filter(Boolean) as {
        id: string;
        label: string;
        href: string;
        touche?: string;
        icone: ReactNode;
      }[],
    [utilisateur.estAdmin],
  );

  const terme = normaliser(saisie.trim());
  const correspond = (...textes: (string | undefined)[]) =>
    !terme || textes.some((t) => t && normaliser(t).includes(terme));

  const actionsVisibles = contextuelles.filter((c) =>
    correspond(c.label, ...(c.motsCles ?? [])),
  );
  const navVisibles = navigation.filter((n) => correspond(n.label));
  const creerVisible = !utilisateur.lectureSeule;
  const autresVisibles = correspond(
    "raccourcis clavier aide",
    "déconnexion se déconnecter",
  );
  const mod = libelleMod();

  if (!monte) return null;

  return createPortal(
    <AnimatePresence>
      {ouvert && (
        <div className="fixed inset-0 z-palette flex items-start justify-center p-4 pt-[12vh]">
          <motion.div
            aria-hidden="true"
            className="fixed inset-0 bg-scrim/60 backdrop-blur-sm"
            variants={voile}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={fermer}
          />
          <motion.div
            ref={boite}
            role="dialog"
            aria-modal="true"
            aria-label="Palette de commandes"
            variants={dialogIn}
            initial="hidden"
            animate="show"
            exit="exit"
            className="relative w-full max-w-[640px] overflow-hidden rounded-[16px] border border-line-strong bg-surface shadow-xl ring-1 ring-accent-fg/10"
          >
            <Command
              label="Palette de commandes"
              shouldFilter={false}
              loop
              value={selection}
              onValueChange={setSelection}
            >
              <div className="flex items-center gap-3 border-b border-line px-[18px] py-4">
                <Search
                  aria-hidden="true"
                  strokeWidth={2}
                  className="size-[18px] shrink-0 text-accent-fg"
                />
                <Command.Input
                  data-autofocus
                  value={saisie}
                  onValueChange={setSaisie}
                  placeholder="Rechercher une demande, une personne, une action…"
                  className="min-w-0 flex-1 border-0 bg-transparent text-base text-fg outline-none placeholder:text-fg-4"
                />
                {chargement && (
                  <span
                    aria-hidden="true"
                    className="size-4 animate-spin rounded-full border-2 border-line-strong border-t-accent-fg"
                  />
                )}
                <Kbd>Échap</Kbd>
              </div>

              <Command.List className="max-h-[min(420px,60vh)] overflow-y-auto overscroll-contain p-2">
                <Command.Empty className="px-3 py-8 text-center text-fg-3">
                  {saisie.trim().length < 2
                    ? "Tapez au moins 2 caractères pour chercher une demande."
                    : chargement
                      ? "Recherche…"
                      : `Aucun résultat pour « ${saisie.trim()} ».`}
                </Command.Empty>

                {demandes.length > 0 && (
                  <Groupe titre="Demandes">
                    {demandes.map((d, i) => (
                      <motion.div
                        key={d.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                      >
                        <Command.Item
                          value={`demande-${d.id}`}
                          onSelect={() => aller(`/demands/${d.id}`)}
                          className={classeItem}
                        >
                          <span className="font-mono text-[11.5px] text-accent-fg">
                            {d.ref}
                          </span>
                          <span className="min-w-0 flex-1 truncate font-medium">
                            <Surligne texte={d.title} terme={saisie} />
                          </span>
                          <StatusBadge status={d.status} />
                        </Command.Item>
                      </motion.div>
                    ))}
                  </Groupe>
                )}

                {personnes.length > 0 && (
                  <Groupe titre="Personnes">
                    {personnes.map((p) => (
                      <Command.Item
                        key={p.id}
                        value={`personne-${p.id}`}
                        onSelect={() => aller(`/demands?agent=${p.id}`)}
                        className={classeItem}
                      >
                        <Avatar id={p.id} name={p.nom} size={24} decorative />
                        <span className="min-w-0 flex-1 truncate">
                          <Surligne texte={p.nom} terme={saisie} />
                        </span>
                        <span className="text-xs text-fg-3">
                          Voir ses demandes
                        </span>
                      </Command.Item>
                    ))}
                  </Groupe>
                )}

                {(actionsVisibles.length > 0 || creerVisible) && (
                  <Groupe titre="Actions">
                    {actionsVisibles.map((c) => (
                      <Command.Item
                        key={c.id}
                        value={c.id}
                        onSelect={() => {
                          fermer();
                          c.action();
                        }}
                        className={classeItem}
                      >
                        <span className="text-fg-3">
                          {c.icone ?? (
                            <ArrowRight strokeWidth={1.9} className="size-4" />
                          )}
                        </span>
                        <span className="flex-1">{c.label}</span>
                        {c.touche && <Kbd>{c.touche}</Kbd>}
                      </Command.Item>
                    ))}
                    {creerVisible && (
                      <Command.Item
                        value="action-creer"
                        onSelect={() =>
                          aller(
                            saisie.trim()
                              ? `/demands/new?titre=${encodeURIComponent(saisie.trim())}`
                              : "/demands/new",
                          )
                        }
                        className={classeItem}
                      >
                        <FilePlus2
                          strokeWidth={1.9}
                          className="size-4 text-fg-3"
                        />
                        <span className="flex-1">
                          {saisie.trim()
                            ? `Créer une demande « ${saisie.trim()} »`
                            : "Créer une demande"}
                        </span>
                        <Kbd>N</Kbd>
                      </Command.Item>
                    )}
                  </Groupe>
                )}

                {navVisibles.length > 0 && (
                  <Groupe titre="Navigation">
                    {navVisibles.map((n) => (
                      <Command.Item
                        key={n.id}
                        value={n.id}
                        onSelect={() => aller(n.href)}
                        className={classeItem}
                      >
                        <span className="text-fg-3">{n.icone}</span>
                        <span className="flex-1">{n.label}</span>
                        {n.touche && <Kbd>{n.touche}</Kbd>}
                      </Command.Item>
                    ))}
                  </Groupe>
                )}

                {autresVisibles && (
                  <Groupe titre="Autres">
                    <Command.Item
                      value="aide-raccourcis"
                      onSelect={() => {
                        fermer();
                        ouvrirAideRaccourcis();
                      }}
                      className={classeItem}
                    >
                      <Keyboard
                        strokeWidth={1.9}
                        className="size-4 text-fg-3"
                      />
                      <span className="flex-1">Raccourcis clavier</span>
                      <Kbd>?</Kbd>
                    </Command.Item>
                    <Command.Item
                      value="deconnexion"
                      onSelect={async () => {
                        await fetch("/api/auth/logout", {
                          method: "POST",
                        }).catch(() => {});
                        window.location.href = "/login";
                      }}
                      className={cn(classeItem, "text-danger-fg")}
                    >
                      <LogOut strokeWidth={1.9} className="size-4" />
                      <span className="flex-1">Déconnexion</span>
                    </Command.Item>
                  </Groupe>
                )}
              </Command.List>

              <div className="flex flex-wrap gap-4 border-t border-line px-[18px] py-2.5 text-xs text-fg-4">
                <span>↑↓ naviguer</span>
                <span>↵ ouvrir</span>
                <span>Échap fermer</span>
                <span className="ml-auto">{mod} K pour rouvrir</span>
              </div>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
