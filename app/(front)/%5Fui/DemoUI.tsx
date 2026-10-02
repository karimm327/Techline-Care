"use client";

import {
  ChevronDown,
  KanbanSquare,
  List,
  LogOut,
  Plus,
  RotateCw,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import Reveal from "@/components/motion/Reveal";
import Stagger from "@/components/motion/Stagger";
import Alert from "@/components/ui/Alert";
import Avatar, { AvatarStack } from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Checkbox from "@/components/ui/Checkbox";
import Dialog from "@/components/ui/Dialog";
import Drawer from "@/components/ui/Drawer";
import EmptyState from "@/components/ui/EmptyState";
import IconButton from "@/components/ui/IconButton";
import Input from "@/components/ui/Input";
import Kbd from "@/components/ui/Kbd";
import Menu from "@/components/ui/Menu";
import PriorityBars from "@/components/ui/PriorityBars";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Select from "@/components/ui/Select";
import Skeleton from "@/components/ui/Skeleton";
import StatusBadge from "@/components/ui/StatusBadge";
import Switch from "@/components/ui/Switch";
import Tabs, { TabPanel } from "@/components/ui/Tabs";
import Textarea from "@/components/ui/Textarea";
import Timeline from "@/components/ui/Timeline";
import { PRIORITES, STATUTS } from "@/lib/ui/status";

// Données fictives : cette page n'existe qu'en développement
const EQUIPE = [
  { id: "e1-emma", name: "Emma Bernard" },
  { id: "l2-lucas", name: "Lucas Petit" },
  { id: "s3-sarah", name: "Sarah Nguyen" },
  { id: "t4-tom", name: "Tom Renaud" },
  { id: "a5-alice", name: "Alice Martin" },
  { id: "b6-bruno", name: "Bruno Lefevre" },
];

function Bloc({
  titre,
  children,
  className,
}: {
  titre: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Reveal as="section">
      <Card className={className}>
        <h2 className="mb-4 font-display text-h2">{titre}</h2>
        {children}
      </Card>
    </Reveal>
  );
}

export default function DemoUI() {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [vue, setVue] = useState<"liste" | "kanban">("liste");
  const [priorite, setPriorite] = useState<"BASSE" | "NORMALE" | "HAUTE">(
    "NORMALE",
  );
  const [onglet, setOnglet] = useState<"commentaires" | "notes" | "pj">(
    "commentaires",
  );
  const [animations, setAnimations] = useState(true);
  const [coche, setCoche] = useState(false);
  const [dialogue, setDialogue] = useState(false);
  const [tiroir, setTiroir] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreurTitre, setErreurTitre] = useState("");

  const simulerChargement = () => {
    setChargement(true);
    window.setTimeout(() => setChargement(false), 1600);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-7 px-4 pb-16 pt-12 sm:px-8">
      <header>
        <p className="text-eyebrow uppercase text-accent-fg">
          Développement · refonte Ardoise
        </p>
        <h1 className="mt-1 font-display text-h1">Composants UI</h1>
        <p className="mt-1 text-fg-2">
          Démo de components/ui/* (visible seulement avec npm run dev).
          Référence : docs/refonte/maquette/Systeme.dc.html.
        </p>
      </header>

      <Stagger className="flex flex-col gap-7">
        <Bloc titre="Typographie">
          <div className="flex flex-col divide-y divide-line-soft">
            <p className="py-3 font-display text-display-xl">Display XL 46</p>
            <p className="py-3 font-display text-h1">Titre H1 32</p>
            <p className="py-3 font-display text-h2">Titre H2 22</p>
            <p className="py-3 font-display text-h3">Titre H3 16</p>
            <p className="py-3 font-display text-kpi tabular-nums">104</p>
            <p className="py-3">Texte courant 14 / 1.5</p>
            <p className="py-3 text-[12.5px] font-medium text-fg-3">
              Small 12.5 · légendes
            </p>
            <p className="py-3 text-eyebrow uppercase text-accent-fg">
              Eyebrow
            </p>
            <p className="py-3 font-mono text-xs font-medium">#7B20E1AA</p>
          </div>
        </Bloc>

        <Bloc titre="Boutons">
          <div className="flex flex-wrap items-center gap-2.5">
            <Button>Primaire</Button>
            <Button variant="secondary">Secondaire</Button>
            <Button variant="ghost">Fantôme</Button>
            <Button variant="danger" icon={<Trash2 className="size-4" />}>
              Danger
            </Button>
            <Button variant="success">Restaurer</Button>
            <Button size="sm" variant="secondary">
              Petit
            </Button>
            <Button size="lg">Grand</Button>
            <Button
              icon={<Plus strokeWidth={2.2} className="size-4" />}
              kbd="N"
            >
              Nouvelle demande
            </Button>
            <Button
              loading={chargement}
              loadingLabel="Enregistrement…"
              onClick={simulerChargement}
            >
              Enregistrer
            </Button>
            <Button disabled>Désactivé</Button>
            <IconButton label="Rafraîchir">
              <RotateCw strokeWidth={1.9} className="size-5" />
            </IconButton>
            <IconButton label="Supprimer" size={36}>
              <Trash2 strokeWidth={1.9} className="size-4" />
            </IconButton>
            <Kbd>Ctrl K</Kbd>
          </div>
        </Bloc>

        <Bloc titre="Statuts, priorités, avatars">
          <div className="flex flex-wrap items-center gap-2">
            {Object.keys(STATUTS).map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            {Object.keys(PRIORITES).map((p) => (
              <PriorityBars key={p} priority={p} />
            ))}
            <PriorityBars priority="HAUTE" showLabel={false} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Avatar id="a5-alice" name="Alice Martin" presence />
            <Avatar id="l2-lucas" name="Lucas Petit" size={42} />
            <Avatar id="e1-emma" name="Emma Bernard" size={24} />
            <AvatarStack people={EQUIPE} />
          </div>
        </Bloc>

        <div className="grid gap-5 lg:grid-cols-2">
          <Bloc titre="Champs">
            <div className="flex flex-col gap-4">
              <Input
                id="demo-titre"
                label="Titre"
                placeholder="Résumez la demande"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                maxLength={200}
                counter
                hint="Le focus affiche l'anneau indigo 4 px (M19)."
                error={erreurTitre}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setErreurTitre(
                      titre.trim().length < 4
                        ? "Le titre doit faire au moins 4 caractères."
                        : "",
                    )
                  }
                >
                  Valider le titre
                </Button>
              </div>
              <Textarea
                id="demo-description"
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                counter
              />
              <Select id="demo-agent" label="Agent" defaultValue="">
                <option value="">Non assignée</option>
                {EQUIPE.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
              <Checkbox
                label="Rester connecté 30 jours"
                checked={coche}
                onChange={(e) => setCoche(e.target.checked)}
              />
              <Checkbox label="Tout sélectionner (indéterminé)" indeterminate />
              <Switch
                label="Animations"
                description="Désactive les transitions décoratives."
                checked={animations}
                onChange={setAnimations}
              />
            </div>
          </Bloc>

          <Bloc titre="Segmented, onglets, menu">
            <div className="flex flex-col gap-5">
              <SegmentedControl
                label="Affichage"
                layoutId="demo-seg-vue"
                value={vue}
                onChange={setVue}
                options={[
                  {
                    value: "liste",
                    label: "Liste",
                    icon: <List className="size-4" />,
                  },
                  {
                    value: "kanban",
                    label: "Kanban",
                    icon: <KanbanSquare className="size-4" />,
                  },
                ]}
              />
              <SegmentedControl
                label="Priorité"
                layoutId="demo-seg-priorite"
                value={priorite}
                onChange={setPriorite}
                options={(["BASSE", "NORMALE", "HAUTE"] as const).map((p) => ({
                  value: p,
                  label: PRIORITES[p].label,
                  icon: (
                    <span
                      aria-hidden="true"
                      className={`size-2 rounded-full ${PRIORITES[p].barre}`}
                    />
                  ),
                }))}
              />
              <div>
                <Tabs
                  id="demo-onglets"
                  label="Conversation"
                  value={onglet}
                  onChange={setOnglet}
                  items={[
                    { value: "commentaires", label: "Commentaires", count: 4 },
                    { value: "notes", label: "Notes internes", count: 1 },
                    { value: "pj", label: "Pièces jointes", count: 0 },
                  ]}
                />
                <TabPanel
                  id="demo-onglets"
                  value={onglet}
                  active
                  className="pt-4 text-fg-2"
                >
                  Panneau « {onglet} ». Flèches gauche / droite pour changer
                  d'onglet.
                </TabPanel>
              </div>
              <Menu
                label="Compte"
                align="start"
                items={[
                  {
                    type: "header",
                    content: (
                      <p className="text-[13px] font-semibold">Alice Martin</p>
                    ),
                  },
                  {
                    label: "Mon compte",
                    icon: <User className="size-4" />,
                    href: "/account",
                  },
                  {
                    label: "Mes droits",
                    icon: <ShieldCheck className="size-4" />,
                    kbd: "G D",
                  },
                  { type: "separator" },
                  {
                    label: "Déconnexion",
                    icon: <LogOut className="size-4" />,
                    tone: "danger",
                  },
                ]}
                trigger={(props, ouvert) => (
                  <Button variant="secondary" {...props}>
                    Ouvrir le menu
                    <ChevronDown
                      aria-hidden="true"
                      className={`size-4 transition-transform duration-[250ms] ${ouvert ? "rotate-180" : ""}`}
                    />
                  </Button>
                )}
              />
            </div>
          </Bloc>
        </div>

        <Bloc titre="Dialogue et tiroir">
          <div className="flex flex-wrap gap-2.5">
            <Button onClick={() => setDialogue(true)}>
              Ouvrir le dialogue
            </Button>
            <Button variant="secondary" onClick={() => setTiroir(true)}>
              Ouvrir le tiroir
            </Button>
          </div>
          <Dialog
            open={dialogue}
            onClose={() => setDialogue(false)}
            title="Supprimer la demande ?"
            description="La demande sera masquée ; un administrateur peut la restaurer."
            footer={
              <>
                <Button variant="secondary" onClick={() => setDialogue(false)}>
                  Annuler
                </Button>
                <Button variant="danger" onClick={() => setDialogue(false)}>
                  Supprimer
                </Button>
              </>
            }
          >
            <Textarea
              id="demo-motif"
              label="Motif"
              rows={3}
              data-autofocus
              hint="5 caractères minimum."
            />
          </Dialog>
          <Drawer
            open={tiroir}
            onClose={() => setTiroir(false)}
            title="Notifications"
          >
            <p className="p-5 text-fg-2">
              Contenu du tiroir. Tab reste à l'intérieur, Échap ferme.
            </p>
          </Drawer>
        </Bloc>

        <div className="grid gap-5 lg:grid-cols-2">
          <Bloc titre="Alertes">
            <div className="flex flex-col gap-3">
              <Alert tone="info">
                Votre rôle « Lecture seule » permet de consulter, pas de
                modifier ni commenter.
              </Alert>
              <Alert tone="warning" title="SLA bientôt dépassé">
                Il reste 25 minutes pour traiter cette demande.
              </Alert>
              <Alert
                tone="danger"
                title="Impossible de charger les demandes"
                action={
                  <Button size="sm" variant="secondary">
                    Réessayer
                  </Button>
                }
              >
                La connexion au serveur a échoué. Vos données ne sont pas
                perdues.
              </Alert>
              <Alert tone="success" title="Demande restaurée" />
            </div>
          </Bloc>

          <Bloc titre="Frise">
            <Timeline
              items={[
                {
                  id: "1",
                  pastille: STATUTS.CLOTUREE.point,
                  titre: (
                    <>
                      <b>Lucas Petit</b> a modifié la demande
                    </>
                  ),
                  meta: "il y a 12 min",
                  changements: [
                    { champ: "Statut", avant: "En cours", apres: "Clôturée" },
                  ],
                },
                {
                  id: "2",
                  titre: (
                    <>
                      <b>Emma Bernard</b> a commenté
                    </>
                  ),
                  meta: "il y a 1 h",
                },
                {
                  id: "3",
                  pastille: STATUTS.NOUVELLE.point,
                  titre: (
                    <>
                      <b>Alice Martin</b> a créé la demande
                    </>
                  ),
                  meta: "hier à 16:20",
                },
              ]}
            />
          </Bloc>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Bloc titre="Squelettes (M14)">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>
            </div>
          </Bloc>
          <Bloc titre="Liste vide">
            <EmptyState
              title="Aucune demande pour l'instant"
              text="Créez la première pour démarrer le suivi."
              action={
                <Button icon={<Plus strokeWidth={2.2} className="size-4" />}>
                  Nouvelle demande
                </Button>
              }
            />
          </Bloc>
        </div>

        <Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {["Survolez-moi", "Carte interactive", "M05"].map((t) => (
              <Card key={t} interactive className="bg-surface-2">
                {t}
              </Card>
            ))}
          </div>
        </Reveal>
      </Stagger>
    </div>
  );
}
