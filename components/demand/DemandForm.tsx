"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import TexteAvecLiens from "@/components/demand/TexteAvecLiens";
import PageHeader from "@/components/layout/PageHeader";
import Alert from "@/components/ui/Alert";
import Avatar from "@/components/ui/Avatar";
import Button, { classesBouton } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ChoiceCard from "@/components/ui/ChoiceCard";
import Input from "@/components/ui/Input";
import Kbd from "@/components/ui/Kbd";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { notifier } from "@/components/ui/Toast";
import { erreursDemande } from "@/lib/schemas/demand.schema";
import { cn } from "@/lib/ui/cn";
import { reference } from "@/lib/ui/format";
import {
  estCodePriorite,
  estCodeStatut,
  PRIORITES,
  STATUTS,
  styleCategorie,
} from "@/lib/ui/status";

export type OptionsFormulaire = {
  categories: { id: string; label: string }[];
  priorites: { id: string; label: string }[];
  statuts: { id: string; label: string }[];
  agents: { id: string; nom: string; ouvertes: number }[];
};

export type ValeursDemande = {
  title: string;
  description: string;
  id_category: string;
  id_priority: string;
  id_status: string;
  id_assigned_agent: string | null;
};

type Props = {
  mode: "new" | "edit";
  demandeId?: string;
  initial?: ValeursDemande;
  options: OptionsFormulaire;
  // Titre pré-rempli depuis la palette Ctrl K (création uniquement)
  titreSuggere?: string;
};

type Champs = {
  titre: string;
  description: string;
  categorie: string;
  priorite: string;
  statut: string;
  agent: string;
};

const CLE_BROUILLON = "tl.brouillon";
const ORDRE_PRIORITES = ["BASSE", "NORMALE", "HAUTE"];

function ilYaSecondes(depuis: number, maintenant: number) {
  const s = Math.max(0, Math.round((maintenant - depuis) / 1000));
  if (s < 5) return "à l’instant";
  if (s < 60) return `il y a ${s} s`;
  return `il y a ${Math.round(s / 60)} min`;
}

// Formulaire de création / modification d'une demande (même composant pour new et edit)
export default function DemandForm({
  mode,
  demandeId,
  initial,
  options,
  titreSuggere,
}: Props) {
  const router = useRouter();
  const edition = mode === "edit";
  const priorites = useMemo(
    () =>
      [...options.priorites].sort(
        (a, b) =>
          ORDRE_PRIORITES.indexOf(a.label) - ORDRE_PRIORITES.indexOf(b.label),
      ),
    [options.priorites],
  );
  const prioriteParDefaut =
    priorites.find((p) => p.label === "NORMALE")?.id ?? priorites[0]?.id ?? "";

  const depart: Champs = useMemo(
    () => ({
      titre: initial?.title ?? titreSuggere ?? "",
      description: initial?.description ?? "",
      categorie: initial?.id_category ?? "",
      priorite: initial?.id_priority ?? prioriteParDefaut,
      statut: initial?.id_status ?? "",
      agent: initial?.id_assigned_agent ?? "",
    }),
    [initial, prioriteParDefaut, titreSuggere],
  );

  const [champs, setChamps] = useState<Champs>(depart);
  const [ongletDescription, setOngletDescription] = useState<
    "ecrire" | "apercu"
  >("ecrire");
  const [tente, setTente] = useState(false);
  const [erreurServeur, setErreurServeur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [brouillonA, setBrouillonA] = useState<number | null>(null);
  const [brouillonRestaure, setBrouillonRestaure] = useState(false);
  const [maintenant, setMaintenant] = useState(() => Date.now());
  const formulaire = useRef<HTMLFormElement>(null);

  const modifier = (cle: keyof Champs, valeur: string) =>
    setChamps((c) => ({ ...c, [cle]: valeur }));

  // Brouillon (création uniquement) : restauration au montage, sauvegarde 800 ms après la frappe
  useEffect(() => {
    // Un titre suggéré par la palette prime sur un ancien brouillon
    if (edition || titreSuggere) return;
    try {
      const brut = localStorage.getItem(CLE_BROUILLON);
      if (!brut) return;
      const b = JSON.parse(brut) as Partial<Champs> & { savedAt?: number };
      if (b.titre || b.description) {
        setChamps((c) => ({
          ...c,
          titre: b.titre ?? c.titre,
          description: b.description ?? c.description,
          categorie: b.categorie ?? c.categorie,
          priorite: b.priorite || c.priorite,
          agent: b.agent ?? c.agent,
        }));
        setBrouillonA(b.savedAt ?? Date.now());
        setBrouillonRestaure(true);
      }
    } catch {
      // brouillon illisible ou stockage indisponible : on l'ignore
    }
  }, [edition, titreSuggere]);

  useEffect(() => {
    if (edition) return;
    if (!champs.titre && !champs.description) return;
    const minuteur = window.setTimeout(() => {
      try {
        const savedAt = Date.now();
        localStorage.setItem(
          CLE_BROUILLON,
          JSON.stringify({ ...champs, savedAt }),
        );
        setBrouillonA(savedAt);
      } catch {
        // stockage indisponible : pas de brouillon
      }
    }, 800);
    return () => window.clearTimeout(minuteur);
  }, [champs, edition]);

  useEffect(() => {
    const minuteur = window.setInterval(() => setMaintenant(Date.now()), 5000);
    return () => window.clearInterval(minuteur);
  }, []);

  // Validation (zod pour titre / description, choix obligatoires pour le reste)
  const erreursZod = erreursDemande({
    title: champs.titre,
    description: champs.description,
  });
  const erreurs = {
    titre: erreursZod.title,
    description: erreursZod.description,
    categorie: champs.categorie ? undefined : "Choisissez une catégorie.",
    priorite: champs.priorite ? undefined : "Choisissez une priorité.",
    statut: edition && !champs.statut ? "Choisissez un statut." : undefined,
  };
  const valide = Object.values(erreurs).every((e) => !e);
  const afficher = (e?: string) => (tente ? e : undefined);

  const modifications = edition
    ? (Object.keys(champs) as (keyof Champs)[]).filter(
        (k) => champs[k].trim() !== depart[k].trim(),
      ).length
    : 0;

  const envoyer = useCallback(async () => {
    setTente(true);
    setErreurServeur("");
    if (!valide || envoi) {
      formulaire.current
        ?.querySelector<HTMLElement>("[aria-invalid=true]")
        ?.focus();
      return;
    }
    setEnvoi(true);
    try {
      const res = await fetch(
        edition ? `/api/demands/${demandeId}` : "/api/demands",
        {
          method: edition ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: champs.titre.trim(),
            description: champs.description.trim(),
            idCategory: champs.categorie,
            idPriority: champs.priorite,
            idAssignedAgent: champs.agent || null,
            ...(edition && { idStatus: champs.statut }),
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string"
            ? data.message
            : edition
              ? "Erreur lors de la mise à jour."
              : "Erreur lors de la création.",
        );
      }
      const id = edition ? demandeId : data.id;
      if (!edition) {
        try {
          localStorage.removeItem(CLE_BROUILLON);
        } catch {
          // rien à nettoyer
        }
      }
      notifier({
        titre: edition ? "Modifications enregistrées" : "Demande créée",
        description: champs.titre.trim(),
        ton: "succes",
      });
      router.push(id ? `/demands/${id}` : "/demands");
      router.refresh();
    } catch (err) {
      setErreurServeur((err as Error).message);
      setEnvoi(false);
    }
  }, [valide, envoi, edition, demandeId, champs, router]);

  // Ctrl / ⌘ + Entrée envoie depuis n'importe quel champ du formulaire
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        envoyer();
      }
    };
    const f = formulaire.current;
    f?.addEventListener("keydown", surTouche);
    return () => f?.removeEventListener("keydown", surTouche);
  }, [envoyer]);

  const categorie = options.categories.find((c) => c.id === champs.categorie);
  const priorite = priorites.find((p) => p.id === champs.priorite);
  const agent = options.agents.find((a) => a.id === champs.agent);
  const moinsCharge = [...options.agents].sort(
    (a, b) => a.ouvertes - b.ouvertes,
  )[0];
  const checklist = [
    { label: "Titre explicite", ok: champs.titre.trim().length >= 8 },
    { label: "Catégorie choisie", ok: !!champs.categorie },
    {
      label: "Description détaillée",
      ok: champs.description.trim().length >= 40,
    },
  ];
  const faits = checklist.filter((c) => c.ok).length;

  const optionsPriorite = priorites.map((p) => {
    const code = estCodePriorite(p.label) ? p.label : null;
    return {
      value: p.id,
      label: code ? PRIORITES[code].label : p.label,
      icon: (
        <span
          aria-hidden="true"
          className={cn(
            "size-2 rounded-full",
            code ? PRIORITES[code].barre : "bg-fg-3",
            code === "HAUTE" && champs.priorite === p.id && "animate-pulse",
          )}
        />
      ),
    };
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow={
          edition && demandeId
            ? `Modification · ${reference(demandeId)}`
            : "Pilotage · nouvelle demande"
        }
        title={edition ? "Modifier la demande" : "Nouvelle demande"}
        subtitle={
          edition
            ? "Les changements sont enregistrés dans l’historique de la demande."
            : "Décrivez le besoin : il sera créé avec le statut « Nouvelle »."
        }
        actions={
          edition && modifications > 0 ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-st-encours/15 px-3 py-1.5 text-[12.5px] font-semibold text-st-encours-fg">
              <span
                aria-hidden="true"
                className="size-[7px] animate-live rounded-full bg-st-encours"
              />
              {modifications} modification{modifications > 1 ? "s" : ""} non
              enregistrée{modifications > 1 ? "s" : ""}
            </span>
          ) : undefined
        }
      />

      {brouillonRestaure && (
        <Alert
          tone="info"
          action={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setChamps(depart);
                setBrouillonRestaure(false);
                setBrouillonA(null);
                try {
                  localStorage.removeItem(CLE_BROUILLON);
                } catch {
                  // rien à effacer
                }
              }}
            >
              Repartir de zéro
            </Button>
          }
        >
          Votre brouillon précédent a été restauré.
        </Alert>
      )}

      <form
        ref={formulaire}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          envoyer();
        }}
        className="flex flex-col gap-5"
      >
        {erreurServeur && (
          <Alert tone="danger" title="La demande n’a pas pu être enregistrée">
            {erreurServeur}
          </Alert>
        )}

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
          <div className="flex min-w-0 flex-col gap-5">
            <Card className="flex animate-rise flex-col gap-5 [animation-delay:80ms]">
              <Input
                id="f-titre"
                label="Titre de la demande"
                value={champs.titre}
                onChange={(e) => modifier("titre", e.target.value)}
                maxLength={200}
                counter
                placeholder="Ex. Suivi dossier allocation"
                error={afficher(erreurs.titre)}
              />

              <fieldset>
                <legend className="mb-2 text-[13px] font-semibold text-fg-1">
                  Catégorie
                </legend>
                <div
                  role="radiogroup"
                  aria-label="Catégorie"
                  aria-invalid={afficher(erreurs.categorie) ? true : undefined}
                  aria-describedby={
                    afficher(erreurs.categorie)
                      ? "f-categorie-erreur"
                      : undefined
                  }
                  className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5"
                >
                  {options.categories.map((c, i) => {
                    const s = styleCategorie(c.label, i);
                    return (
                      <ChoiceCard
                        key={c.id}
                        icon={s.lettre}
                        pastilleClass={s.pastille}
                        bordureClass={s.bordure}
                        label={c.label}
                        selected={champs.categorie === c.id}
                        onSelect={() => modifier("categorie", c.id)}
                      />
                    );
                  })}
                </div>
                {afficher(erreurs.categorie) && (
                  <p
                    id="f-categorie-erreur"
                    className="mt-2 animate-shake text-[12.5px] font-medium text-danger-fg"
                  >
                    {erreurs.categorie}
                  </p>
                )}
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-[13px] font-semibold text-fg-1">
                  Priorité
                </legend>
                <SegmentedControl
                  label="Priorité"
                  layoutId="seg-priorite"
                  value={champs.priorite}
                  onChange={(v) => modifier("priorite", v)}
                  options={optionsPriorite}
                  className="grid w-full grid-cols-3 rounded-xl [&>button]:h-10"
                />
              </fieldset>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span
                    id="f-description-titre"
                    className="text-[13px] font-semibold text-fg-1"
                  >
                    Description
                  </span>
                  <SegmentedControl
                    label="Mode d’édition de la description"
                    layoutId="seg-description"
                    size="sm"
                    value={ongletDescription}
                    onChange={setOngletDescription}
                    options={[
                      { value: "ecrire", label: "Écrire" },
                      { value: "apercu", label: "Aperçu" },
                    ]}
                    className="rounded-[9px] p-[3px] [&>button]:h-7"
                  />
                </div>
                {ongletDescription === "ecrire" ? (
                  <Textarea
                    id="f-description"
                    aria-labelledby="f-description-titre"
                    value={champs.description}
                    onChange={(e) => modifier("description", e.target.value)}
                    rows={7}
                    placeholder="Contexte, démarches déjà faites, ce qui est attendu…"
                    error={afficher(erreurs.description)}
                  />
                ) : (
                  <div className="min-h-[170px] whitespace-pre-line break-words rounded-[11px] border border-line-field bg-bg px-3.5 py-3 leading-[1.7] text-fg-1">
                    {champs.description.trim() ? (
                      <TexteAvecLiens texte={champs.description} />
                    ) : (
                      <span className="text-fg-4">Rien à prévisualiser.</span>
                    )}
                  </div>
                )}
              </div>
            </Card>

            <Card className="flex animate-rise flex-wrap gap-5 [animation-delay:140ms]">
              <Select
                id="f-agent"
                label="Agent assigné"
                value={champs.agent}
                onChange={(e) => modifier("agent", e.target.value)}
                wrapperClassName="flex-[1_1_260px]"
                hint={
                  moinsCharge && !champs.agent ? (
                    <span className="text-success-fg">
                      Suggestion : {moinsCharge.nom} est le moins chargé.
                    </span>
                  ) : undefined
                }
              >
                <option value="">Non assignée</option>
                {options.agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nom} · {a.ouvertes} ouverte{a.ouvertes > 1 ? "s" : ""}
                  </option>
                ))}
              </Select>
              {edition && (
                <Select
                  id="f-statut"
                  label="Statut"
                  value={champs.statut}
                  onChange={(e) => modifier("statut", e.target.value)}
                  wrapperClassName="flex-[1_1_260px]"
                  error={afficher(erreurs.statut)}
                >
                  {options.statuts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {estCodeStatut(s.label)
                        ? STATUTS[s.label].label
                        : s.label}
                    </option>
                  ))}
                </Select>
              )}
            </Card>
          </div>

          {/* Colonne collante : aperçu en direct + checklist */}
          <aside className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-[88px]">
            <Card className="animate-rise [animation-delay:120ms]">
              <p className="mb-3 text-eyebrow uppercase text-fg-4">
                Aperçu en direct
              </p>
              <div className="rounded-xl border border-line-card bg-surface-2 px-4 py-3.5 transition-[transform,box-shadow] duration-[280ms] ease-out [@media(hover:hover)]:hover:-translate-y-[3px] [@media(hover:hover)]:hover:shadow-md">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-fg-4">
                    {edition && demandeId ? reference(demandeId) : "#NOUVELLE"}
                  </span>
                  {priorite && estCodePriorite(priorite.label) && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11.5px] font-semibold",
                        PRIORITES[priorite.label].badge,
                      )}
                    >
                      {PRIORITES[priorite.label].label}
                    </span>
                  )}
                </div>
                <p className="mb-2.5 mt-2 break-words font-semibold leading-snug">
                  {champs.titre.trim() || "Sans titre"}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-[6px] bg-surface px-2 py-0.5 text-[11.5px] text-fg-2">
                    {categorie?.label ?? "—"}
                  </span>
                  {agent && <Avatar id={agent.id} name={agent.nom} size={24} />}
                </div>
              </div>
            </Card>

            <Card className="animate-rise [animation-delay:180ms]">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold">Prête à envoyer</p>
                <span className="text-[12.5px] tabular-nums text-fg-3">
                  {faits}/{checklist.length}
                </span>
              </div>
              <div
                aria-hidden="true"
                className="mb-3.5 h-1.5 overflow-hidden rounded-full bg-bg-sunken"
              >
                <div
                  className={cn(
                    "h-full origin-left rounded-full transition-[transform,background-color] duration-500 ease-out",
                    faits === checklist.length ? "bg-success" : "bg-accent",
                  )}
                  style={{ transform: `scaleX(${faits / checklist.length})` }}
                />
              </div>
              <ul className="flex flex-col gap-2.5">
                {checklist.map((c) => (
                  <li
                    key={c.label}
                    className="flex items-center gap-2.5 text-[13.5px] text-fg-1"
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-5 items-center justify-center rounded-[6px] transition-transform duration-300 ease-spring",
                        c.ok
                          ? "scale-100 bg-success text-ink"
                          : "scale-90 ring-2 ring-inset ring-line-hover",
                      )}
                    >
                      {c.ok && <Check strokeWidth={3} className="size-3.5" />}
                    </span>
                    {c.label}
                    <span className="sr-only">
                      {c.ok ? " : fait" : " : à compléter"}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </aside>
        </div>

        {/* Barre d'actions collante */}
        <div className="sticky bottom-4 z-sticky flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-line-strong bg-surface/90 px-4 py-3 shadow-lg backdrop-blur-md">
          <span className="text-[12.5px] text-fg-3" aria-live="polite">
            {edition
              ? modifications > 0
                ? "Modifications en attente d’enregistrement"
                : "Aucune modification"
              : brouillonA
                ? `Brouillon enregistré automatiquement · ${ilYaSecondes(brouillonA, maintenant)}`
                : "Le brouillon est enregistré automatiquement sur cet appareil"}
          </span>
          <div className="flex gap-2">
            <Link
              href={edition && demandeId ? `/demands/${demandeId}` : "/demands"}
              className={classesBouton({
                variant: "ghost",
                className: "text-fg-1",
              })}
            >
              Annuler
            </Link>
            <Button
              type="submit"
              loading={envoi}
              loadingLabel="Envoi…"
              className="px-[18px]"
            >
              {edition ? "Enregistrer" : "Créer la demande"}
              <Kbd className="ml-1 hidden border-fg/30 bg-fg/10 text-current sm:inline-flex">
                Ctrl ↵
              </Kbd>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
