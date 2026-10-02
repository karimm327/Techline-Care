# Avancement de la refonte « Ardoise »

Une ligne par étape de [PROMPTS.md](PROMPTS.md) : ce qui est fait, ce qui est reporté et pourquoi.

| Étape | Fait | Reporté / pourquoi |
|---|---|---|
| 0 | Dépendances installées (tailwind-merge fixé en 2.x pour Tailwind 3). Formatage biome et lint remis à plat. | — |
| 1 | Tokens, polices next/font, Tailwind, `cn()`, `lib/ui/status.ts` ; tokens complémentaires documentés dans 01-design-tokens.md. | — |
| 2 | `components/ui/*`, `lib/motion.ts`, Reveal/Stagger, MotionProvider, démo `/_ui` (dev uniquement). | — |
| 3 | AppShell, AppHeader, Breadcrumbs, Sidebar, AppFooter + `/api/health`, PublicHeader/Footer, PageHeader ; groupes (app)/(public) ; Navbar/Footer/AccountMenu supprimés ; plus de token en localStorage. | Cloche, Kanban, Stats, vues, équipe en ligne, raccourcis : masqués jusqu'à leur étape. |
| 4 | Tableau de bord : PageHeader « Bonjour {prénom} », 3 StatCard (CountUp + Sparkline sur 14 jours via `findDailyCounts`), filtres en URL (statut, priorité, catégorie, agent, q) avec popovers, tableau restylé (tri animé conservant les filtres, lignes en cascade), cartes mobile, pagination SQL, « Activité en direct » (ADMIN, rafraîchie toutes les 30 s), « Charge de l'équipe » (ADMIN, AGENT), toast de suppression avec « Annuler » (ADMIN), `loading.tsx` en squelette. `components/activity/actions.tsx` passé aux tokens. | KPI « 1re réponse » et colonne SLA : étape 10. Cases à cocher : étape 13 (avec les actions groupées, sinon elles ne servent à rien). Liste/Kanban : étape 11. Export CSV : étape 14. « Enregistrer la vue » : étape 13. |

## Décisions prises

- **Lint** (étape 0) : formatage biome de tout le code existant dans un commit séparé, `docs/` exclu de biome.
- **Couleurs** (étape 1) : chaque valeur de maquette absente du kit devient un token (documenté dans 01-design-tokens.md).
- **Fonctionnalités non livrées** (étape 3) : leurs entrées d'interface sont masquées, pas désactivées.
- **Cibles tactiles** (étape 3) : 44 px minimum sur écran tactile (`.cible-tactile`), valeurs de la maquette conservées à la souris.
- **KPI « Clôturées (7 jours) »** (étape 4) : compté à partir du journal (passages « Statut : … → CLOTUREE ») tant que `closed_at` n'existe pas (étape 10). Pas d'« objectif hebdo » : aucune donnée d'objectif n'existe, la barre d'objectif est omise.
- **Sous-titre du tableau de bord** (étape 4) : « N demandes attendent une prise en charge » = demandes au statut NOUVELLE.
- **« + Assigner »** dans la liste (étape 4) : lien vers l'édition de la demande (pas d'assignation en ligne avant les actions groupées).
- **Recherche du tableau de bord** (étape 4) : champ ajouté dans la barre de filtres (paramètre `q`), la maquette n'en montrait pas.
- **Toast après suppression** (étape 4) : la redirection passe `?supprimee=<id>` (au lieu de `1`) pour permettre « Annuler » ; `?supprimee=1` reste accepté.
