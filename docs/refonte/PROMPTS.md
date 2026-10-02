# Prompts Claude Code — refonte TechLine Care

À copier **un par un**, dans l’ordre, dans une session Claude Code ouverte à la racine du projet.
Chaque prompt est autonome. Après chaque étape : vérifier dans le navigateur (`npm run dev`), puis commiter.

> Astuce : commencez chaque session par « Lis docs/refonte/README.md avant tout. »

---

## Étape 0 — Préparation

```
Lis docs/refonte/README.md et les fichiers qu'il référence (01 à 06), sans rien modifier.
Crée une branche refonte/ardoise. Installe les dépendances listées dans le README
(npm i motion @dnd-kit/core @dnd-kit/sortable cmdk sonner recharts clsx tailwind-merge).
Fais-moi un résumé en 10 lignes du plan et signale toute incohérence entre la doc et le code actuel.
```

## Étape 1 — Tokens, polices, Tailwind

```
Applique docs/refonte/01-design-tokens.md :
1. Copie docs/refonte/tokens.css vers styles/tokens.css et importe-le en tête de styles/globals.css
   (avant @tailwind). Donne à body : bg-bg text-fg font-sans antialiased, sélection de texte bg-accent/40.
2. Copie docs/refonte/tailwind.tokens.js vers lib/ui/tailwind.tokens.js et branche-le dans
   tailwind.config.js (theme.extend). Garde le content existant.
3. Crée app/fonts.ts (Space Grotesk, IBM Plex Sans, JetBrains Mono via next/font/google, variables
   --font-display/--font-sans/--font-mono) et applique les classes sur <html> dans app/(front)/layout.tsx.
4. Crée lib/ui/cn.ts (clsx + tailwind-merge) et lib/ui/status.ts (STATUTS, PRIORITES, avatarColor(id)).
Ne touche pas encore aux pages. npm run lint et npm run build doivent passer.
```

## Étape 2 — Composants UI de base

```
Crée la bibliothèque components/ui/ décrite dans docs/refonte/03-composants.md :
Button, IconButton, Kbd, StatusBadge, PriorityBars, Avatar, AvatarStack, Card, Input, Textarea, Select,
Checkbox, Switch, SegmentedControl, Tabs, Menu, Dialog, Drawer, Skeleton, EmptyState, Alert, Timeline.
Crée aussi lib/motion.ts et components/motion/Reveal.tsx + Stagger.tsx (docs/refonte/04-animations.md),
avec <MotionConfig reducedMotion="user"> dans un provider client monté dans le layout.
Reproduis exactement les styles de docs/refonte/maquette/Systeme.dc.html (section Composants).
Accessibilité : rôles ARIA, navigation clavier sur Menu/Tabs/SegmentedControl, focus piégé dans Dialog/Drawer.
Crée une page de démo temporaire app/(front)/_ui/page.tsx qui affiche tous les composants (accessible
seulement en développement) pour que je puisse vérifier.
```

## Étape 3 — Layout : header, sidebar, footer

```
Implémente docs/refonte/02-layout.md :
- groupes de routes (app) et (public) sans changer les URL (déplace les dossiers existants) ;
- AppShell server (getSessionUser + profil), AppHeader, Breadcrumbs, Sidebar (indicateur layoutId M03,
  repliable, tiroir mobile), AppFooter (+ StatusPill qui appelle /api/health — crée la route F16),
  PublicHeader, PublicFooter, PageHeader ;
- supprime components/Navbar.tsx, components/Footer.tsx et components/AccountMenu.tsx une fois remplacés ;
- la déconnexion garde l'appel POST /api/auth/logout ; plus aucune lecture de localStorage("token").
Le bouton recherche du header ouvre pour l'instant un Dialog vide (la palette arrive à l'étape 9).
Masque « Nouvelle demande » pour le rôle LECTURE et la section Administration hors ADMIN.
Référence pixel : docs/refonte/maquette/Main.dc.html (header, sidebar, footer).
```

## Étape 4 — Tableau de bord (liste)

```
Refais app/(front)/(app)/demands/page.tsx selon docs/refonte/05-ecrans.md §01, vue Liste uniquement
pour l'instant : PageHeader « Bonjour {prénom} », 4 StatCard avec CountUp + Sparkline (crée
findDailyCounts dans demand.queries.ts pour les 14 derniers jours), barre de filtres en URL
(statut, priorité, catégorie, agent, q), tableau restylé (SortableHeader animé, cases à cocher,
lignes en cascade), cartes mobile, pagination restylée, « Activité en direct » (ADMIN) et
« Charge de l'équipe ». Remplace la bannière ?supprimee=1 par un toast sonner (Toaster restylé, M11).
La colonne SLA et le KPI « 1re réponse » restent masqués tant que l'étape 10 n'est pas faite.
Ajoute app/(front)/(app)/demands/loading.tsx avec des Skeleton (M14).
Référence : docs/refonte/maquette/Main.dc.html.
```

## Étape 5 — Fiche demande

```
Refais app/(front)/(app)/demands/[id]/page.tsx selon docs/refonte/05-ecrans.md §02 en supprimant
la palette noir/vert actuelle : hero (ref, copier le lien, badges, actions), menu « Changer le statut »
(client, PATCH existant, mise à jour optimiste, StatusBadge + StatusStepper animés, ConfettiBurst
vers CLOTUREE, toast), colonne principale (Description, Conversation avec Tabs — seulement
Commentaires pour l'instant), colonne latérale (Détails, Agent, Historique en Timeline avec diffs).
Garde la logique existante : suppression douce, vue admin d'une demande supprimée + RestoreButton
restylé, règles LECTURE. Restyle CommentForm (composer de la maquette, Ctrl+Entrée pour envoyer).
Référence : docs/refonte/maquette/Detail.dc.html.
```

## Étape 6 — Formulaire création / édition

```
Réécris components/demand/DemandForm.tsx selon docs/refonte/05-ecrans.md §03 : titre avec compteur,
ChoiceCard catégories, SegmentedControl priorité (M04), description Écrire/Aperçu, sélection d'agent
avec charge, colonne collante « Aperçu en direct » + checklist « Prête à envoyer », barre d'actions
collante en bas, brouillon automatique en localStorage (tl.brouillon, nettoyé après envoi),
Ctrl+Entrée pour envoyer, erreurs zod sous les champs avec shake. Même composant pour new et edit
(edit ajoute le champ Statut et la pastille « modifications non enregistrées »).
Les pièces jointes et les doublons arrivent aux étapes 12-13 : laisse les emplacements prêts mais masqués.
Référence : docs/refonte/maquette/Form.dc.html.
```

## Étape 7 — Journal, Compte, Pages légales, Connexion

```
Applique docs/refonte/05-ecrans.md §04, §05, §07, §08 :
- /journal : compteurs-filtres, recherche, frise groupée par jour, diffs, Restaurer, « Charger plus » ;
- /account : carte profil + Tabs Profil / Sécurité (API mot de passe existante + jauge de force) /
  Mes droits (matrice des rôles) ; les onglets Notifications et Préférences et les sessions arrivent à
  l'étape 14 (masqués). /account/rights redirige vers /account?onglet=droits ;
- /login : deux colonnes, fond animé M18, cartes flottantes, erreur avec shake, plus d'écriture
  du token dans localStorage ;
- /confidentialite et /mentions-legales : layout public, barre de lecture, sommaire collant avec
  section active. GARDE le texte juridique actuel mot pour mot.
Références : maquette/Journal, Account, Login, Legal (.dc.html).
```

## Étape 8 — États système

```
Applique docs/refonte/05-ecrans.md §09 : app/not-found.tsx (glitch M20), error.tsx par segment (app)
avec Alert + Réessayer, EmptyState pour les listes vides, OfflineToast global, boutons désactivés +
infobulle pour LECTURE. Vérifie que chaque route a un loading.tsx en squelette.
Référence : docs/refonte/maquette/States.dc.html.
```

## Étape 9 — Palette Ctrl K + raccourcis (F1, F2)

```
Implémente F1 et F2 de docs/refonte/06-features.md : route GET /api/search, CommandPalette (cmdk,
animation M09, surlignage du terme, groupes Demandes / Actions / Navigation), hook useShortcuts
(ignoré dans les champs), feuille d'aide « ? ». Branche le bouton recherche du header et le « ? » du footer.
```

## Étape 10 — Migration v2 + SLA (F4)

```
Copie docs/refonte/sql/migration-refonte.sql vers lib/db/scripts/v2/migration-refonte.sql et exécute-le
dans lib/db/index.ts juste après la migration v1 (même gestion d'erreur). Mets à jour schema.sql et
seed.sql pour une base neuve (ajoute ANNULEE). Puis F4 : lib/sla.ts (pur, avec tests unitaires simples
via node:test), calcul de due_at à la création / changement de priorité, first_response_at,
closed_at / reopened_count dans le PATCH. Affiche SlaPill (liste), SlaRing (fiche), KPI 1re réponse.
Ajoute ANNULEE à lib/types/DemandStatus.ts et supprime STATUS_STYLES.
```

## Étape 11 — Kanban (F3)

```
Implémente F3 : KanbanBoard avec @dnd-kit (DragOverlay, M13, accessibilité clavier et annonces en
français), basculé par le SegmentedControl Liste/Kanban (?mode=kanban). Drop = PATCH statut optimiste
avec rollback animé et toast d'erreur. Drag désactivé pour LECTURE.
Référence : docs/refonte/maquette/Main.dc.html (bouton Kanban en mode Play).
```

## Étape 12 — Notifications, mentions, notes internes, réactions, réponses rapides (F5, F8)

```
Implémente F5 et F8 de docs/refonte/06-features.md : création des notifications aux bons endroits
(assignation, commentaire, mention, statut, SLA), routes /api/notifications, NotificationDrawer (M10)
avec onglets, cloche animée (M07) et polling 30 s, autocomplétion @ dans le composer, onglet
Notes internes (A/G), réactions +1, chips de réponses rapides et « / ».
```

## Étape 13 — Actions groupées, vues enregistrées, pièces jointes, doublons (F6, F7, F9, F10)

```
Implémente F6, F7, F9, F10 de docs/refonte/06-features.md : barre d'actions groupées (M15) +
PATCH /api/demands/bulk transactionnel, vues enregistrées (API + section Sidebar), pièces jointes
(UPLOAD_DIR dans .env et .gitignore, contrôle MIME par signature, DropZone avec progression, onglet
Pièces jointes de la fiche), détection de doublons dans le formulaire.
```

## Étape 14 — Statistiques, préférences, sessions, export (F13, F14, F15)

```
Implémente F13 (page /stats avec recharts, couleurs des tokens, lien Sidebar), F14 (préférences en
base appliquées au layout : no-motion, density-compact, vue par défaut ; sessions révocables via sid
dans le JWT) et F15 (export CSV des filtres courants). Active les onglets Notifications et Préférences
de /account.
Référence : docs/refonte/maquette/Analytics.dc.html et Account.dc.html.
```

## Étape 15 — Présence, abonnés, liens + recette finale (F11, F12)

```
Implémente F11 et F12. Puis fais une recette complète :
- chaque écran comparé à sa maquette (docs/refonte/maquette/*.dc.html), à 1440 px et 375 px ;
- les 3 rôles (ADMIN, AGENT, LECTURE) avec les comptes du seed ;
- navigation au clavier seule (Tab, Échap, raccourcis), contrastes, prefers-reduced-motion ;
- grep : plus aucune couleur en dur (bg-[#, text-slate-, bg-blue-, text-gray-) dans app/ et components/.
Liste ce qui reste à faire, puis npm run lint && npm run build.
```
