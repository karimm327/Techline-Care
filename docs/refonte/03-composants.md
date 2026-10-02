# 03 — Composants UI (`components/ui/*`)

Tous les composants : TypeScript, `cn()` (`lib/ui/cn.ts` = `twMerge(clsx(...))`), classes issues des tokens,
`forwardRef` pour les éléments de formulaire. Référence : `maquette/Systeme.dc.html` › Composants.

## Données de présentation centralisées — `lib/ui/status.ts`

```ts
export const STATUTS = {
  NOUVELLE: { label: "Nouvelle", point: "bg-st-nouvelle", badge: "text-st-nouvelle-fg bg-st-nouvelle/15 ring-st-nouvelle/35", touche: "1" },
  EN_COURS: { label: "En cours", point: "bg-st-encours", badge: "text-st-encours-fg bg-st-encours/15 ring-st-encours/35", touche: "2" },
  CLOTUREE: { label: "Clôturée", point: "bg-st-cloturee", badge: "text-st-cloturee-fg bg-st-cloturee/15 ring-st-cloturee/35", touche: "3" },
  ANNULEE:  { label: "Annulée",  point: "bg-st-annulee",  badge: "text-st-annulee-fg bg-st-annulee/15 ring-st-annulee/35",   touche: "4" },
} as const;
export const PRIORITES = {
  HAUTE: { label: "Haute", niveau: 3, barre: "bg-prio-haute" },
  NORMALE: { label: "Normale", niveau: 2, barre: "bg-prio-normale" },
  BASSE: { label: "Basse", niveau: 1, barre: "bg-prio-basse" },
} as const;
```

Remplace les objets `STATUTS` / `PRIORITES` dupliqués dans `demands/page.tsx` et `demands/[id]/page.tsx`.

## Catalogue

| Composant | Props | Styles clés |
|---|---|---|
| `Button` | `variant: primary \| secondary \| ghost \| danger \| success`, `size: sm(32) \| md(40) \| lg(48)`, `loading`, `icon`, `kbd` | primary `bg-accent text-white hover:brightness-110 hover:shadow-glow active:scale-[.96]` ; secondary `bg-surface border border-line-strong/70 text-fg-2 hover:bg-surface-2` ; ghost `bg-transparent text-accent-fg hover:bg-surface-2` ; danger `bg-danger/15 text-danger-fg` ; `loading` → spinner 16 px (`border-2 border-white/35 border-t-white animate-spin`) + libellé « …ion… » ; toujours `rounded-sm font-semibold transition` (M06). |
| `IconButton` | `label` (obligatoire → `aria-label`), `size 36 \| 44` | `rounded-sm text-fg-2 hover:bg-surface-2 hover:text-fg` |
| `Kbd` | `children` | `font-mono text-[11px] px-1.5 py-0.5 rounded-xs border border-line-strong bg-bg text-fg-2` |
| `Badge` / `StatusBadge` | `status` | `inline-flex items-center gap-[7px] h-[26px] px-2.5 rounded-[7px] text-[12.5px] font-semibold ring-1 ring-inset` + point 7 px. Changement de statut : transition couleurs 350 ms (M12). |
| `PriorityBars` | `priority`, `showLabel`, `size` | 3 barres `w-[3px] rounded-[1px]` hauteurs 5/9/13 ; HAUTE ajoute un point 7 px `animate-pulse` (M08). |
| `SlaPill` | `dueAt`, `closedAt`, `status` | calcule `late/warn/ok/done` (cf. tokens), icône horloge 12 px, `h-6 px-2.5 rounded-full text-xs font-semibold`. Se met à jour toutes les 60 s (`useNow(60_000)`), sans ré-animer. |
| `SlaRing` | `ratio` (0–1 restant), `label` | SVG 64–76 px, r=42, `stroke-dasharray=264`, couleur : > .5 vert, > .15 ambre, sinon corail ; entrée M17. |
| `Avatar` | `name`, `id`, `size 24–42`, `presence?` | couleur hashée, initiales, point présence 11 px. `AvatarStack` : chevauchement −8 px, bordure 2 px couleur du fond, « +N ». |
| `Card` | `as`, `interactive` | `rounded-md bg-surface border border-line p-5 sm:p-6` ; `interactive` → hover M05 (`hover:-translate-y-[3px] hover:shadow-md hover:border-[#56637A] transition duration-[280ms] ease-out`). |
| `StatCard` | `label`, `value`, `unit`, `trend`, `tone`, `spark: number[]`, `hint` | valeur `text-kpi font-display tabular-nums` + `CountUp` (M02) ; sparkline 104×36 tracée M02 ; chip tendance à droite. |
| `CountUp` | `value`, `decimals`, `duration=1100` | rAF easeOutCubic ; `prefers-reduced-motion` → valeur finale directe ; formate en `fr-FR` (virgule). |
| `Sparkline` | `data`, `color` | path SVG, `stroke-dasharray`/`offset` = longueur réelle (`getTotalLength`) puis `animate-draw`. |
| `SegmentedControl` | `options`, `value`, `onChange` | conteneur `p-1 rounded-[11px] bg-bg-sunken border border-line` ; pastille `bg-surface-3 shadow-sm rounded-lg` animée `layoutId` ressort (M04). `role="radiogroup"`, flèches clavier. |
| `Tabs` | `items`, `value` | soulignement 2 px `bg-accent` animé `layoutId` (M04) ; compteur pastille par onglet ; `role="tablist"`. |
| `Input`, `Textarea`, `Select` | + `label`, `hint`, `error`, `counter` | `h-[46px] px-3.5 rounded-[11px] border border-[#465166] bg-bg text-fg text-[14.5px] hover:border-[#56637A] focus:border-accent-soft focus:shadow-focus focus:bg-[#262D3A] transition` (M19) ; `error` → bordure danger + message `text-danger-fg` + `animate-shake` une fois. |
| `Checkbox`, `Switch` | | Switch 44×26, pouce 20 px qui glisse en ressort 300 ms, piste `bg-accent` / `bg-[#465166]`. |
| `ChoiceCard` | `icon`, `label`, `selected` | catégorie du formulaire : `h-14 rounded-xl border` ; sélection → bordure couleur catégorie, `ring-[3px] ring-accent/20`, `-translate-y-0.5`. |
| `Menu` / `Dropdown` | | `bg-surface-2 border border-line-strong rounded-xl p-1.5 shadow-lg animate-menu` ; items 38 px ; raccourci `Kbd` à droite. Accessible : `role="menu"`, flèches, Échap. |
| `Dialog` | `title`, `onClose` | fond `bg-[#11151C]/60 backdrop-blur-sm animate-fade` ; boîte `bg-surface border border-line-strong rounded-2xl shadow-xl` entrée M09 ; focus piégé. Utilisé pour suppression (motif obligatoire) et confirmations. |
| `Drawer` | `side`, `width=400` | M10 ; même fond que Dialog. |
| `Toaster` | (sonner) | restylé : `bg-surface-2 border-line-strong rounded-[14px] shadow-xl`, icône ronde 30 px teintée, barre de progression 3 px en bas (M11), action « Annuler ». |
| `Skeleton` | `className` | `bg-[linear-gradient(90deg,#343D4D_0%,#414B5E_45%,#343D4D_90%)] bg-[length:1200px_100%] animate-shimmer rounded-md` (M14). |
| `EmptyState` | `icon`, `title`, `text`, `action` | illustration de 2 cartes flottantes + pastille « + » qui pop (voir `maquette/States.dc.html`). |
| `Alert` | `tone: info \| warning \| danger \| success` | `rounded-xl border p-4 flex gap-3.5`, fond teinte 10 %, bordure 38 % ; `danger` → `animate-shake` à l’apparition. |
| `Timeline` | `items` | ligne `border-l-2 border-line`, pastilles 12 px `ring-4 ring-surface`, diff « ~~ancien~~ → **nouveau** », entrée en cascade 55 ms. |
| `ConfettiBurst` | `trigger` | 22 particules absolues, `--dx/--dy/--r` calculés en cercle, `animate-burst` ; `aria-hidden` ; rien si reduced-motion. |
| `TypingIndicator` | `names` | 3 points `animate-bounce3` décalés 150 ms + « Emma Bernard est en train d’écrire… ». |
| `DropZone` | `onFiles`, `accept`, `maxSize` | bordure pointillée 1.5 px `animate-drop` pendant le survol de fichiers ; liste de fichiers avec barre de progression `animate-bar`. |

## Icônes

`lucide-react` (déjà installé), `strokeWidth={1.9}`, tailles 14/16/18/20. Le logo ticket est un SVG
dédié (`components/brand/LogoMark.tsx`, path dans `maquette/Main.dc.html`). Jamais d’emoji.
