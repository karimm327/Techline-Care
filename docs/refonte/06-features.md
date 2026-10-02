# 06 — Nouvelles fonctionnalités : back + UI/UX

SQL : [`sql/migration-refonte.sql`](sql/migration-refonte.sql) (idempotent, exécuté au démarrage comme la v1).
Conventions : requêtes dans `lib/db/queries/*.queries.ts`, routes dans `app/(back)/api/**`,
garde `exigerConnexion(req, rolesAutorises)` de `lib/auth`, journalisation via les fonctions de
`activity.queries.ts`, validation zod dans `lib/schemas/`.

Légende rôles : **A** = ADMIN, **G** = AGENT, **L** = LECTURE.

---

## F1 · Palette de commandes (Ctrl K) — priorité haute
- **UI** : `components/command/CommandPalette.tsx` (`cmdk`), montée dans l’AppShell. Ouverture Ctrl K / ⌘K / clic sur la recherche du header. Groupes : *Demandes* (recherche titre + ref, terme surligné `bg-st-encours/30`), *Actions* contextuelles (Créer « {saisie} », M’assigner la sélection, Changer le statut…), *Navigation* (G puis D/S/J/C). Pied : « ↑↓ naviguer · ↵ ouvrir · Échap fermer ». M09.
- **API** : `GET /api/search?q=` → `{ demandes: [{id, ref, title, status}], personnes: [...] }` (10 max, `ILIKE` + `id_demand::text ILIKE 'q%'` pour la ref). Rôles A G L.

## F2 · Raccourcis clavier — priorité haute
- `lib/hooks/useShortcuts.ts` : ignorés si focus dans un champ ou préférence désactivée.
- Globaux : `Ctrl K` palette, `N` nouvelle demande, `G D` tableau, `G S` stats, `G J` journal, `?` aide.
- Fiche : `E` modifier, `1–4` statut, `A` m’assigner, `C` focus commentaire, `Ctrl ↵` envoyer.
- Feuille d’aide : `Dialog` listant les raccourcis en `Kbd`.

## F3 · Kanban — priorité haute
- **UI** : `components/demands/KanbanBoard.tsx` (`@dnd-kit/core` + `sortable`). M13. Clavier : Espace pour saisir, flèches, Espace pour déposer, annonces `aria-live` en français.
- **API** : existante `PATCH /api/demands/[id]` avec `{ status }`. Ajouter côté serveur : passage en CLOTUREE ⇒ `closed_at = now()` ; sortie de CLOTUREE ⇒ `closed_at = NULL`, `reopened_count + 1`. Rôles A G.

## F4 · SLA — priorité haute
- **Règle** : `due_at = created_at + priorities.resolution_minutes` à la création et au changement de priorité. `first_response_at` = 1er commentaire non interne d’un A/G autre que le créateur.
- **Calcul d’état** (`lib/sla.ts`, pur, testé) : `late` si `now > due_at` et non clôturée ; `warn` si restant < 25 % ; `done` si clôturée avant `due_at` ; sinon `ok`. Libellés « Dépassé · 25 min », « 1 h 40 », « 1 j 4 h », « Respecté ».
- **UI** : `SlaPill` (liste, Kanban), `SlaRing` (fiche), KPI « 1re réponse moyenne », Stats « SLA respectés ».
- **Notifications** : job léger à chaque requête `GET /api/notifications` (pas de cron) : crée `SLA_PROCHE` (30 min avant) / `SLA_DEPASSE` une seule fois par demande (vérifier l’existence).
- V1 en minutes **calendaires** ; heures ouvrées en phase 2.

## F5 · Notifications + @mentions — priorité haute
- **Création** : à l’assignation (`ASSIGNATION` → agent), au commentaire (`COMMENTAIRE` → agent + abonnés sauf l’auteur), à la mention (`MENTION`), au changement de statut (`STATUT` → créateur + abonnés), SLA (F4). Respecter `user_preferences.notify_*`.
- **Mentions** : dans le composer, `@` ouvre une liste (`GET /api/users/agents` existant + admins), insère `@Prénom Nom` ; côté serveur, parser `@Prénom Nom` des utilisateurs actifs ⇒ `comment_mentions` + notification. Affichage : surlignage `bg-accent/20 text-accent-fg-2 rounded px-1`.
- **API** : `GET /api/notifications?onglet=tout|mentions|assignees` (30 dernières + `unread`), `POST /api/notifications/read` `{ ids? }` (tout si vide).
- **UI** : cloche (compteur, M07), `NotificationDrawer` (M10) avec onglets Tout / Mentions / Assignées, item = icône teintée par type, texte, temps relatif, point non lu ; clic = marque lu + ouvre la fiche. Polling 30 s (`useNotifications`), pause onglet caché (`visibilitychange`). Nouvelle notif ⇒ relance M07 + toast discret.

## F6 · Actions groupées — priorité moyenne
- **UI** : cases dans la liste, « tout sélectionner » dans l’en-tête (état indéterminé), barre M15.
- **API** : `PATCH /api/demands/bulk` `{ ids: uuid[] (≤ 50), status?, priority?, agentId? }` — transaction, une ligne de journal par demande. Rôles A G. Toast « N demandes mises à jour » + Annuler (renvoie les anciennes valeurs).

## F7 · Vues enregistrées — priorité moyenne
- Une vue = la query string des filtres. **API** : `GET/POST /api/views`, `PATCH/DELETE /api/views/[id]` (propriétaire uniquement). Max 10 par utilisateur.
- **UI** : bouton « Enregistrer la vue » → popover (nom, couleur parmi 6 pastilles) ; section Sidebar « Vues enregistrées », réordonnables (dnd), item actif si la query courante correspond. 2 vues par défaut proposées : « Urgentes non assignées » (`priorite=HAUTE&agent=aucun`), « SLA bientôt dépassé » (`sla=warn,late`).

## F8 · Notes internes, réactions, réponses rapides — priorité moyenne
- `comments.is_internal` : visible A G seulement (filtrer en SQL selon le rôle). Style : bulle `bg-st-encours/10 border border-dashed border-st-encours/40` + étiquette « Note interne ».
- Réactions : `POST /api/comments/[id]/reactions` (bascule). Affichage « +1 · 2 », état actif accent.
- Réponses rapides : `GET /api/quick-replies` ; chips sous le composer + `/` au début du message ouvre la liste.

## F9 · Pièces jointes — priorité moyenne
- Stockage disque local : `UPLOAD_DIR` (env, défaut `./uploads`, **ajouté au .gitignore**). Nom stocké = uuid ; nom d’origine en base.
- **API** : `POST /api/demands/[id]/attachments` (multipart, `request.formData()`, 10 Mo max, MIME : pdf, png, jpeg, webp ; vérifier la signature des premiers octets), `GET /api/attachments/[id]` (stream avec `Content-Disposition`, contrôle d’accès = accès à la demande), `DELETE` (auteur ou A, suppression douce). Journal « PIECE_JOINTE ».
- **UI** : `DropZone` (formulaire + onglet), progression via `XMLHttpRequest.upload.onprogress`, puce de type (PDF corail, IMG bleu, autre gris).

## F10 · Détection de doublons — priorité moyenne
- **API** : `GET /api/demands/similaires?q=&exclude=` : demandes ouvertes dont le titre partage ≥ 1 mot de 4+ lettres (normalisé sans accents via `unaccent` si dispo, sinon `lower`), 3 résultats.
- **UI** : bloc info sous le titre (formulaire), lien vers la fiche ; bouton « Lier comme doublon » en édition.

## F11 · Abonnés & demandes liées — priorité basse
- `POST/DELETE /api/demands/[id]/watchers` (soi-même ; A peut ajouter n’importe qui). Créateur et agent abonnés automatiquement.
- `POST/DELETE /api/demands/[id]/links` `{ targetId, kind }`. Affichage dans la colonne latérale (ref, titre, point statut).

## F12 · Présence temps réel légère — priorité basse
- `POST /api/demands/[id]/presence` `{ state: "VIEW" | "TYPING" }` toutes les 15 s (et à la frappe, throttle 3 s) ; `GET` renvoie les utilisateurs vus < 30 s.
- **UI** : pile d’avatars « Lucas consulte aussi cette demande » (hero), `TypingIndicator` (M16) si `TYPING` < 6 s. Carte « Équipe en ligne » de la sidebar = utilisateurs avec `last_seen_at` < 5 min (`GET /api/presence/equipe`).

## F13 · Statistiques — priorité moyenne
- **API** : `GET /api/stats?periode=7|14|30|90` (A G) → `{ kpi: {crees, variation, delaiMoyenH, slaRespectes, reouverture}, serie: [{jour, crees, cloturees}], categories: [{label, n}], heatmap: number[5][9], agents: [{id, nom, cloturees, delaiMoyenH, sla}] }`. Requêtes `date_trunc('day')`, `EXTRACT(ISODOW/HOUR)`, `generate_series` pour les jours vides.
- **UI** : `app/(front)/(app)/stats/page.tsx` (server, fetch des données) + composants clients recharts (couleurs tokens, animations 1500 ms désactivées si reduced-motion).

## F14 · Préférences & sessions — priorité moyenne
- **API** : `GET/PATCH /api/users/me/preferences` (crée la ligne à la volée). `GET /api/users/me/sessions`, `DELETE /api/users/me/sessions/[id]`.
- Sessions : à la connexion, insérer `user_sessions` et mettre `sid` dans le JWT ; `verifierToken` refuse un `sid` révoqué (requête légère avec cache mémoire 60 s).
- Le layout lit `motion` ⇒ classe `no-motion` sur `<html>` ; `density=compact` ⇒ classe `density-compact` (lignes 40 px au lieu de 52).

## F15 · Export CSV — priorité basse
- `GET /api/demands/export?<mêmes filtres>` → `text/csv; charset=utf-8` avec BOM, séparateur `;` (Excel FR), colonnes : ref, titre, statut, priorité, catégorie, agent, créée le, échéance, clôturée le.

## F16 · Santé du service — priorité basse
- `GET /api/health` (public) : `SELECT 1` avec timeout 2 s → `{ status: "ok" | "degrade" | "ko", latenceMs }`. Utilisé par la pastille du footer.

---

## Ordre de livraison conseillé

1. Fondations (tokens, layout, composants) — sans back.
2. Refonte des écrans existants à fonctionnalités constantes.
3. F1, F2, F3, F4, F5 (gros gain d’usage).
4. F6, F7, F8, F9, F10, F13, F14.
5. F11, F12, F15, F16.
