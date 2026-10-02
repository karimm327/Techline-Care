# 01 — Design tokens « Ardoise »

Source : [`tokens.css`](tokens.css) (variables) + [`tailwind.tokens.js`](tailwind.tokens.js) (classes).
Référence visuelle : `maquette/Systeme.dc.html`.

## Intention

Thème **mi-sombre** : ni blanc éblouissant, ni noir. Des ardoises bleutées superposées en 5 niveaux,
un accent indigo unique, et des couleurs de statut qui se distinguent **aussi par la luminosité**
(lisibles pour les daltoniens).

## Couleurs → classes Tailwind

| Rôle | Token | Hex | Classe |
|---|---|---|---|
| Sidebar, footer | `--bg-sunken` | #1F2530 | `bg-bg-sunken` |
| Page | `--bg` | #232A36 | `bg-bg` |
| Carte | `--surface` | #2B3341 | `bg-surface` |
| Menu, bulle, carte Kanban | `--surface-2` | #343D4D | `bg-surface-2` |
| Sélection, pastille | `--surface-3` | #3C4558 | `bg-surface-3` |
| Bordure | `--line` | #3A4354 | `border-line` |
| Bordure overlay | `--line-strong` | #4E5A6E | `border-line-strong` |
| Séparateur de ligne | `--line-soft` | #353E4E | `border-line-soft` |
| Texte principal | `--fg` | #ECEFF4 | `text-fg` |
| Texte secondaire | `--fg-2` | #B4BDCC | `text-fg-2` |
| Légende | `--fg-3` | #96A1B3 | `text-fg-3` |
| Métadonnée (≥ 12 px) | `--fg-4` | #7F8A9D | `text-fg-4` |
| Bouton primaire | `--accent` | #5462E8 | `bg-accent text-white` |
| Lien, icône active | `--accent-fg` | #A5AFFF | `text-accent-fg` |
| Fond actif | accent 16 % | — | `bg-accent/15` |

### Statuts (badge = texte `-fg` + fond 13 % + anneau 34 %)

| Statut | Point | Texte | Classes badge |
|---|---|---|---|
| NOUVELLE | #6CB6FF | #8EC5FF | `text-st-nouvelle-fg bg-st-nouvelle/15 ring-1 ring-inset ring-st-nouvelle/35` |
| EN_COURS | #F2B544 | #F5C567 | `text-st-encours-fg bg-st-encours/15 ring-st-encours/35` |
| CLOTUREE | #45D19B | #62DDA9 | `text-st-cloturee-fg bg-st-cloturee/15 ring-st-cloturee/35` |
| ANNULEE | #F07C8C | #FF9DAA | `text-st-annulee-fg bg-st-annulee/15 ring-st-annulee/35` |

### Priorités (3 barres 3 px de haut 5 / 9 / 13 px)

| Priorité | Couleur | Barres pleines | Extra |
|---|---|---|---|
| HAUTE | #FF8A6B | 3 | point pulsant (M08) |
| NORMALE | #F2B544 | 2 | — |
| BASSE | #8C97A9 | 1 | — |
| barre vide | #465166 | — | — |

### SLA (pastille arrondie)

| État | Règle | Texte / fond |
|---|---|---|
| `late` | échéance dépassée | `text-prio-haute-fg bg-prio-haute/15` + libellé « Dépassé · 25 min » |
| `warn` | < 25 % du délai restant | `text-st-encours-fg bg-st-encours/10` |
| `ok` | sinon | `text-fg-2 bg-fg-2/10` |
| `done` | clôturée dans les temps | `text-st-cloturee-fg bg-st-cloturee/10` + « Respecté » |

### Avatars (couleur stable par personne)

Palette : `#E0796B #3FA7A0 #C08A2E #5C7CFA #7E5BEF #3E8ED0 #C2588F #4C9F5A`.
Index = hash simple de `id_user` modulo 8. Texte blanc, initiales (2 lettres), point de présence
vert #45D19B bordé de la couleur du fond.

## Typographie (next/font/google)

```ts
// app/fonts.ts
import { Space_Grotesk, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
export const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display" });
export const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans" });
export const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });
```

| Style | Police | Taille / graisse | Usage |
|---|---|---|---|
| `text-display-xl` | display | 46 / 600, −0.03em | Connexion, 404 |
| `text-h1` | display | 32 / 600 | Titre de page |
| `text-h2` | display | 22 / 600 | Section |
| `text-h3` | display | 16 / 600 | Titre de carte |
| `text-kpi` | display | 38 / 600, `tabular-nums` | Chiffres |
| body | sans | 14 / 400, interligne 1.5 | Texte |
| small | sans | 12.5 / 500 | Méta |
| `text-eyebrow` | sans | 12 / 600, MAJ, 0.08em, `text-accent-fg` | Surtitre |
| mono | mono | 11.5–12 / 500 | `#7B20E1AA`, `kbd` |

## Rayons, ombres, espacements

- Rayons : `rounded-xs` 6 (kbd), `rounded-sm` 10 (boutons, champs), `rounded-md` 16 (cartes), `rounded-lg` 20 (hero), `rounded-xl` 24 (avatar profil).
- Ombres : `shadow-sm` (pastille), `shadow-md` (hover carte), `shadow-lg` (menu), `shadow-xl` (palette, dialogue), `shadow-glow` (hover bouton primaire), `shadow-focus` (focus champ).
- Grille de 4 px. Padding page 32 px (16 px < 640 px). Gap cartes 16–20 px. Padding carte 20–24 px.
- Hauteurs de contrôle : 32 (compact), 36–40 (standard), 44–50 (CTA, champs).

## Compléments (ajoutés à l'étape 1)

Valeurs présentes dans la maquette mais absentes du kit initial, ajoutées dans `styles/tokens.css`
et `lib/ui/tailwind.tokens.js` pour qu'aucune couleur ne soit écrite en dur :

| Token | Hex | Classe | Usage |
|---|---|---|---|
| `--fg-1` | #D5DAE3 | `text-fg-1` | libellés de champ |
| `--surface-hover` | #2F3847 | `bg-surface-hover` | survol item de navigation |
| `--surface-row` | #303949 | `bg-surface-row` | survol ligne de tableau |
| `--surface-inset` | #272E3B | `bg-surface-inset` | encart dans une carte |
| `--field-focus` | #262D3A | `bg-field-focus` | fond de champ au focus |
| `--line-hover` | #56637A | `border-line-hover` | bordure au survol (M05) |
| `--line-field` | #465166 | `border-line-field` / `bg-line-field` | bordure de champ, barre de priorité vide |
| `--line-card` | #424C5F | `border-line-card` | carte Kanban |
| `--ink` | #1A1F28 | `text-ink` | texte sur pastille colorée |
| `--scrim` | #11151C | `bg-scrim/60` | voile des dialogues / tiroirs |
| `--skeleton-hi` | #414B5E | `via-skeleton-hi` | reflet du squelette |
| `--avatar-1…8` | palette avatars | `bg-avatar-1…8` | via `avatarColor(id)` |
