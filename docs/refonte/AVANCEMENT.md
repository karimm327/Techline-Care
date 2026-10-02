# Avancement de la refonte « Ardoise »

Une ligne par étape de [PROMPTS.md](PROMPTS.md) : ce qui est fait, ce qui est reporté et pourquoi.

| Étape | Fait | Reporté / pourquoi |
|---|---|---|
| 0 | Dépendances installées (tailwind-merge fixé en 2.x pour Tailwind 3). Formatage biome et lint remis à plat. | — |
| 1 | Tokens, polices next/font, Tailwind, `cn()`, `lib/ui/status.ts` ; tokens complémentaires documentés dans 01-design-tokens.md. | — |
| 2 | `components/ui/*`, `lib/motion.ts`, Reveal/Stagger, MotionProvider, démo `/_ui` (dev uniquement). | — |
| 3 | AppShell, AppHeader, Breadcrumbs, Sidebar, AppFooter + `/api/health`, PublicHeader/Footer, PageHeader ; groupes (app)/(public) ; Navbar/Footer/AccountMenu supprimés ; plus de token en localStorage. | Cloche, Kanban, Stats, vues, équipe en ligne, raccourcis : masqués jusqu'à leur étape. |
| 4 | Tableau de bord : PageHeader « Bonjour {prénom} », 3 StatCard (CountUp + Sparkline sur 14 jours via `findDailyCounts`), filtres en URL (statut, priorité, catégorie, agent, q) avec popovers, tableau restylé (tri animé conservant les filtres, lignes en cascade), cartes mobile, pagination SQL, « Activité en direct » (ADMIN, rafraîchie toutes les 30 s), « Charge de l'équipe » (ADMIN, AGENT), toast de suppression avec « Annuler » (ADMIN), `loading.tsx` en squelette. `components/activity/actions.tsx` passé aux tokens. | KPI « 1re réponse » et colonne SLA : étape 10. Cases à cocher : étape 13 (avec les actions groupées, sinon elles ne servent à rien). Liste/Kanban : étape 11. Export CSV : étape 14. « Enregistrer la vue » : étape 13. |
| 5 | Fiche demande aux tokens (fin de la palette noir/vert) : hero (retour, référence, copier le lien, badges, « Créée … par … » lu dans le journal), menu « Changer le statut » (PATCH, mise à jour optimiste, retour arrière + toast d'erreur, toast avec « Annuler »), StatusStepper animé (M12), ConfettiBurst vers CLOTUREE, Alert pour ANNULEE ; description avec liens auto ; onglet Commentaires (bulles, avatars) ; composer restylé (auto-extensible, Ctrl+Entrée) ; colonne Détails / Agent (charge réelle) / Historique en Timeline avec diffs ; vue ADMIN d'une demande supprimée (bandeau pointillé + Restaurer restylé). Nouveau `PATCH /api/demands/[id]` partiel. | SLA (anneau, 1re réponse) : étape 10. Notes internes, réactions, mentions, réponses rapides, case « Note interne » : étape 12. Pièces jointes : étape 13. Présence, abonnés, demandes liées : étape 15. Raccourcis E / 1–4 : étape 9. Barre B / I du composer non reprise : aucun rendu Markdown des commentaires n'est prévu. |

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
- **PATCH partiel** (étape 5) : la doc parlait d'un « PATCH existant », mais l'API n'avait qu'un PUT complet. Ajout de `PATCH /api/demands/[id]` `{ status?, priority?, agentId? }` (codes, pas d'identifiants) ; le PUT est inchangé. Le résumé des modifications pour le journal est mis en commun (`lib/demandes/changements.ts`).
- **Auteur de la demande** (étape 5) : lu dans l'entrée CREATION du journal tant que `created_by` n'existe pas (étape 10).
- **« Réassigner »** (étape 5) : lien vers le formulaire d'édition (pas d'assignation en ligne).
