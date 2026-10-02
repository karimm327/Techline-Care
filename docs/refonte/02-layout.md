# 02 — Layout : header, sidebar, footer

Référence : `maquette/Main.dc.html` (app) et `maquette/Login.dc.html`, `maquette/Legal.dc.html` (public).
Anatomie annotée : `maquette/Systeme.dc.html` sections « Anatomie ».

## Arborescence cible

```
app/(front)/layout.tsx            → <html class={fonts + (prefs.motion ? "" : "no-motion")}> + <Toaster/>
app/(front)/(app)/layout.tsx      → AppShell : Header + Sidebar + <main> + AppFooter + CommandPalette + NotificationDrawer
app/(front)/(public)/layout.tsx   → PublicHeader + <main> + PublicFooter
```

Déplacer les pages (les URL ne changent pas, les groupes de routes sont invisibles) :
- `(app)` : `demands/**`, `journal`, `account/**`, `stats` (nouvelle).
- `(public)` : `login`, `confidentialite`, `mentions-legales`.

`AppShell` est un **Server Component** : il lit `getSessionUser()` + le profil (nom, rôle, préférences)
et passe ces données aux composants clients. **La Navbar actuelle qui décode le JWT depuis
`localStorage` est supprimée.**

## Header applicatif — `components/layout/AppHeader.tsx` (client)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ [1 Logo] │ [2 Pilotage › Tableau de bord]   [3 🔍 Rechercher…  Ctrl K]  [4 + Nouvelle demande N] [5 🔔•] [6 (AM) Alice Martin ▾] │
└───────────────────────────────────────────────────────────────────────────────┘
```

| Zone | Détail |
|---|---|
| Conteneur | `sticky top-0 z-header min-h-header flex flex-wrap items-center gap-3.5 px-5 py-2.5 bg-bg/85 backdrop-blur-md border-b border-line-strong/70`. Après 8 px de scroll : `min-h-14` + `shadow-sm`, transition 200 ms (hook `useScrolled(8)`). |
| 1 Logo | Pastille 34×34 `rounded-[10px] bg-accent` + `shadow-[0_6px_18px_-6px_rgb(var(--accent)/.9),inset_0_1px_0_rgba(255,255,255,.25)]`, icône ticket (SVG en maquette), texte « TechLine **Care** » `font-display font-semibold text-base`, « Care » en `text-fg-3 font-medium`. Lien `/demands`. |
| 2 Fil d’Ariane | `components/layout/Breadcrumbs.tsx`, construit depuis `usePathname()` + table de libellés ; dernier segment `text-fg font-medium`, chevrons 14 px. Masqué `< md` (`hidden md:flex`). Séparateur vertical 1×22 `bg-line-strong` avant. |
| 3 Recherche | **Bouton** (pas un input) `flex-1 max-w-[460px] ml-auto h-10 rounded-sm border border-line-strong bg-surface text-fg-3` ; ouvre la palette (M09). Badge `kbd` « Ctrl K » (« ⌘K » si `navigator.platform` Mac). |
| 4 CTA | `Button variant="primary"` + icône plus + libellé masqué `< md` + kbd « N ». **Masqué pour le rôle LECTURE.** |
| 5 Cloche | Bouton-icône 44×44, `aria-label="Notifications, N non lues"`. Si N > 0 : icône `animate-swing` (M07) + badge 9 px `bg-prio-haute` avec halo `animate-ping`. Ouvre `NotificationDrawer`. |
| 6 Compte | Avatar 34 px + point présence + nom (13/600) + rôle (11.5 `text-fg-3`), chevron qui pivote 180°. Menu déroulant (`animate-menu`, origine haut-droite) : Mon compte, Mes droits, Préférences, séparateur, Déconnexion (`text-danger-fg`). Clic extérieur + Échap ferment. |

## Sidebar — `components/layout/Sidebar.tsx` (client)

- Largeur 248 px (`w-sidebar`), repliable à 72 px (icônes + infobulles). État mémorisé dans `localStorage("tl.sidebar")` (préférence locale sans enjeu).
- `bg-bg-sunken border-r border-line px-3 py-4.5 flex flex-col gap-5`.
- Titres de section : `text-[11px] font-semibold uppercase tracking-[.08em] text-fg-4 px-3 mb-1.5`.
- Item : `h-10 px-3 rounded-[9px] flex items-center gap-2.5 text-fg-2 hover:bg-[#2F3847] hover:text-fg transition-colors`.
- **Item actif** : `bg-accent/15 text-fg font-semibold`, icône `text-accent-fg`, **barre lumineuse** 3 px à gauche (`bg-accent shadow-[0_0_12px_rgb(var(--accent))]`) animée d’un item à l’autre avec `motion` `layoutId="nav-indicator"` (M03).
- Compteurs : pastille `rounded-full bg-surface-2 text-[11.5px] font-semibold px-2` (ex. « Mes demandes 3 »). Badge « NOUVEAU » vert sur Statistiques pendant 30 jours.

Sections (visibilité par rôle) :

| Section | Items | Rôles |
|---|---|---|
| Pilotage | Tableau de bord `/demands`, Mes demandes `/demands?vue=moi`, Kanban `/demands?mode=kanban`, Statistiques `/stats` | tous (Stats : ADMIN, AGENT) |
| Vues enregistrées | vues de l’utilisateur (pastille couleur 8 px) + « Nouvelle vue » | tous |
| Administration | Journal d’activité `/journal`, Équipe & rôles `/admin/equipe` (phase 2) | ADMIN |
| Bas de sidebar | Carte « Équipe en ligne » : point vert `animate-live` + « N actifs » + pile d’avatars (−8 px) | tous |

**Mobile (< 1024 px)** : la sidebar devient un tiroir gauche (bouton menu dans le header),
`translate-x` −100 % → 0 en 300 ms `ease-out`, fond `bg-black/50 backdrop-blur-[2px]`, focus piégé, Échap ferme.

## Footer applicatif — `components/layout/AppFooter.tsx` (server)

```
TechLine Care  © 2026  [v2.0.0]     ● Tous les services opérationnels   Support : lun.–ven., 9 h – 18 h     Confidentialité  Mentions légales  RGPD  [?] Raccourcis
```

- `border-t border-line bg-bg-sunken px-7 py-4 flex flex-wrap items-center justify-between gap-3.5 text-[12.5px] text-fg-3`.
- Version : lue depuis `package.json` (`process.env.npm_package_version` ou import JSON), dans un `kbd` mono.
- **Statut des services** (client `StatusPill`) : `GET /api/health` toutes les 60 s → vert « Tous les services opérationnels » (point `animate-ping`), ambre « Ralentissements », corail « Incident en cours ».
- « ? Raccourcis » ouvre la feuille des raccourcis (même raccourci `?` au clavier).

## Header / footer publics

- `PublicHeader` : logo + à droite « Besoin d’aide ? » (`mailto:support@techline-care.fr`) sur `/login`, bouton « Connexion » ailleurs.
- `PublicFooter` : « © 2026 TechLine Care » + Confidentialité / Mentions légales. Pas de pastille de statut.

## Zone de contenu

- `<main className="flex-1 min-w-0 px-4 sm:px-8 pt-7 pb-10 flex flex-col gap-6">`.
- **En-tête de page standard** (`components/layout/PageHeader.tsx`) : surtitre `text-eyebrow uppercase text-accent-fg` · titre `text-h1 font-display` · sous-titre `text-fg-2` · actions à droite (wrap sous 640 px). Entre en M01.
- Largeur : pleine largeur pour le tableau de bord, `max-w-6xl` pour les fiches et formulaires.

## Responsive

| Point de rupture | Comportement |
|---|---|
| < 640 px | padding 16 px, en-têtes en colonne, tableau → cartes (`md:hidden`), barre d’actions groupées en bas d’écran |
| < 768 px | fil d’Ariane et libellés du header masqués |
| < 1024 px | sidebar en tiroir ; colonne latérale de la fiche passe sous le contenu |
| ≥ 1280 px | grilles KPI 4 colonnes, Kanban 3–4 colonnes |
