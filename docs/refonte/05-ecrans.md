# 05 — Écrans

Pour chaque écran : route, fichier maquette, structure, données, rôles, animations.
Les nouveautés qui dépendent du back (SLA, notifications…) sont détaillées dans [06-features.md](06-features.md) ;
tant qu’elles ne sont pas livrées, **masquer le bloc** (pas de fausses données en production).

---

## 01 · Tableau de bord — `/demands`
Maquette : `maquette/Main.dc.html` (Play : Liste/Kanban, Ctrl K, cloche, cases à cocher).
Fichier : `app/(front)/(app)/demands/page.tsx` (server) + composants clients dans `components/demands/`.

1. **PageHeader** : surtitre « Pilotage · {jour long fr} », titre « Bonjour {prénom} », sous-titre calculé
   (« N demandes attendent une prise en charge, dont M en priorité haute » ; si 0 : « Tout est à jour »).
   Actions : `SegmentedControl` Liste/Kanban (état dans l’URL `?mode=kanban`, défaut = préférence), « Exporter CSV » (secondary).
2. **KPI** (grille `repeat(auto-fit,minmax(220px,1fr))`, 4 `StatCard`) :
   Demandes ouvertes (NOUVELLE + EN_COURS, détail « x nouvelles · y en cours ») ·
   Non assignées (ton corail, chip « n urgentes ») · 1re réponse moyenne (h, objectif SLA) ·
   Clôturées 7 jours (barre d’objectif). Sparkline = 14 derniers jours (`findDailyCounts`).
3. **Barre de filtres** : chips actives (accent, croix), chips d’ajout pointillées « + Priorité / Catégorie / Agent »
   (popover multi-sélection), bouton « Enregistrer la vue » (ghost, icône signet). Filtres dans l’URL
   (`?statut=…&priorite=…&categorie=…&agent=…&q=…`).
4. **Vue Liste** — carte `rounded-2xl` :
   - en-tête « Toutes les demandes » + « 1–10 sur N » ;
   - **barre d’actions groupées** (M15) dès 1 sélection : « N sélectionnées · Assigner… · Changer le statut… · Priorité… · Annuler » ;
   - colonnes : case · Demande (titre 600 + `#REF` mono) · Statut · Priorité · Catégorie · Agent (avatar + nom, ou bouton pointillé « + Assigner ») · SLA · Mise à jour (relative) ;
   - en-têtes triables (`SortableHeader` restylé : flèche animée) ; lignes en cascade 45 ms ;
   - mobile : cartes (titre, ref·date, badge, priorité, catégorie, agent) ;
   - pagination restylée (page active `bg-accent`), 10 par page conservé.
5. **Vue Kanban** (M13) : 3 colonnes NOUVELLE / EN_COURS / CLOTUREE (+ ANNULEE repliée) ;
   en-tête colonne : point couleur, libellé, compteur, « + » ; cartes `bg-surface-2` : ref, barres de priorité,
   titre, catégorie, SLA court, avatar. Déposer = changer le statut (même API que le menu). LECTURE : drag désactivé.
6. **Bas de page** (grille 2 colonnes) : « Activité en direct » (badge LIVE pulsant, 5 derniers événements, lien journal — **ADMIN**)
   et « Charge de l’équipe » (barres par agent, ouvertes / agent — ADMIN, AGENT).
7. Bannière après suppression (`?supprimee=1`) → remplacée par un **toast** avec « Annuler » (restaure).

## 02 · Fiche demande — `/demands/[id]`
Maquette : `maquette/Detail.dc.html` (Play : changer le statut, onglets).

1. **Hero** `rounded-[20px] bg-surface` :
   - ligne 1 : « ← Demandes » (ghost) · ref mono en pastille accent · « Copier le lien » · à droite **présence** (« Lucas consulte aussi cette demande », pile d’avatars) ;
   - titre `text-[30px] font-display` · badges statut / priorité (point pulsant si HAUTE) / catégorie · « Créée il y a 3 jours par … » ;
   - actions : « Modifier » (secondary, kbd E) · **« Changer le statut »** (primary + menu des 4 statuts avec raccourcis 1–4). Choix → mise à jour optimiste, M12, toast ;
   - séparateur puis **stepper** 3 étapes (ligne qui se remplit) + carte **SLA** (`SlaRing`, « 1 h 40 restantes », échéance). ANNULEE : stepper remplacé par un `Alert` neutre.
2. **Colonne principale** (≈ 2/3) :
   - **Description** (texte `whitespace-pre-line`, liens auto) + **pièces jointes** (puce type de fichier, nom, taille, téléchargement) ;
   - **Conversation** : `Tabs` Commentaires (n) / Notes internes (n, ADMIN+AGENT) / Pièces jointes (n).
     Commentaires : avatar 36 px, nom · date, bulle `bg-surface-2 rounded-[4px_14px_14px_14px]`, **@mentions** surlignées `bg-accent/20 text-accent-fg-2`, réactions (+1). `TypingIndicator` (M16).
     **Composer** : textarea auto-grandissante, barre B / I / @ / trombone, **réponses rapides** (chips), case « Note interne », « Envoyer Ctrl ↵ ». LECTURE : remplacé par un `Alert info`. Demande supprimée : commentaires fermés.
3. **Colonne latérale** (≈ 1/3) : Détails (catégorie, créée le, modifiée, 1re réponse) · Agent assigné (carte avec présence + « Réassigner ») + **Abonnés** (avatars + « Suivre ») · **Demandes liées** · **Historique** (`Timeline`, diffs).
4. **Vue ADMIN d’une demande supprimée** : `Alert danger` en haut (date, auteur, motif) + bouton vert « Restaurer » (M voir 04, recomposition).

## 03 · Nouvelle demande / Modifier — `/demands/new`, `/demands/[id]/edit`
Maquette : `maquette/Form.dc.html` (réglage `mode` new/edit). Réécrit `components/demand/DemandForm.tsx`.

- En-tête : surtitre (« Pilotage · nouvelle demande » / « Modification · #REF »), titre ; en édition, pastille ambre « N modifications non enregistrées ».
- **Formulaire** (≈ 2/3) :
  - Titre (compteur « n/200 », `maxLength` 200) → **détection de doublons** : dès 4 caractères, debounce 300 ms, `GET /api/demands/similaires?q=` ; bloc info bleu avec liens (M01 court) ;
  - Catégorie : 4 `ChoiceCard` (Social, Administratif, Santé, Autre) chargées depuis `/api/categories` ;
  - Priorité : `SegmentedControl` 3 options avec point couleur + texte d’aide SLA sous le contrôle ;
  - Description : onglets Écrire / Aperçu (markdown léger) ;
  - Pièces jointes : `DropZone` (PDF, PNG, JPG, 10 Mo) + liste avec progression ;
  - Agent : select avec charge (« · n ouverte ») + suggestion « X est le moins chargé » ; en édition, champ Statut.
- **Colonne latérale collante** (`sticky top-[88px]`) : **aperçu en direct** de la carte Kanban · checklist « Prête à envoyer » (4 points, barre) · SLA estimé.
- **Barre d’actions collante en bas** (`sticky bottom-4`, verre dépoli) : « Brouillon enregistré automatiquement · il y a 8 s » (localStorage `tl.brouillon`) · Annuler · « Créer la demande Ctrl ↵ » (loading).
- Validation : schéma zod existant (`lib/schemas/demand.schema.ts`) côté client et serveur ; erreurs sous chaque champ (shake).
- Succès : redirection vers la fiche + toast.

## 04 · Journal d’activité — `/journal` (ADMIN)
Maquette : `maquette/Journal.dc.html` (Play : cliquer un compteur pour filtrer).

- En-tête + actions « période » (popover dates) et « Exporter CSV ».
- **5 compteurs-filtres** (Création, Modification, Suppression, Restauration, Commentaire) : point, nombre, mini-barre ; cliquer = filtre `?action=` (ré-cliquer = retirer).
- Recherche (acteur, titre) + total d’événements.
- **Frise groupée par jour** (« Aujourd’hui », « Hier », date longue) avec titre de groupe collant ; événement : pastille ronde colorée sur la ligne, acteur · badge action · lien demande (barré rouge si supprimée), diff `champ : ~~ancien~~ → nouveau`, motif de suppression, bouton « Restaurer » (si supprimée), heure.
- Pagination « Charger plus » (curseur `created_at`).

## 05 · Mon compte — `/account` (+ `/account/rights`)
Maquette : `maquette/Account.dc.html` (Play : 5 onglets, jauge mot de passe).

- **Carte profil** : bandeau à motif de points qui défile (`animate-grid`), avatar 88 px `rounded-xl` (pop), nom, e-mail, rôle ; 4 stats (assignées, en cours, clôturées, commentaires — requêtes existantes de la page actuelle).
- **Onglets** (état dans `?onglet=`) :
  - **Profil** : prénom, nom, e-mail (lecture seule) + carte « Besoin d’aide ? » (support, horaires, signaler un problème) ;
  - **Sécurité** : changement de mot de passe (API existante `/api/users/me/password`) + jauge de force 4 segments + **sessions actives** (révoquer) ;
  - **Notifications** : 4 `Switch` (assignation, mention, SLA, résumé quotidien) ;
  - **Préférences** : Animations, Densité compacte, Raccourcis clavier, Vue par défaut (Liste/Kanban) ;
  - **Mes droits** : matrice actions × rôles (ADMIN / AGENT / LECTURE), colonne du rôle courant surlignée. `/account/rights` redirige vers `/account?onglet=droits`.

## 06 · Statistiques — `/stats` (nouvelle page, ADMIN + AGENT)
Maquette : `maquette/Analytics.dc.html`.

- Sélecteur de période 7 j / 14 j / 30 j / 90 j (`?periode=`).
- 4 KPI : Demandes créées (+ variation vs période précédente), Délai moyen de résolution, **SLA respectés** (anneau), Taux de réouverture.
- **Créées vs clôturées** (recharts `AreaChart` : 2 courbes 2.6 px, aire sous « créées » à 12 %, grille horizontale #353E4E, tooltip `bg-surface-2`, animation 1500 ms).
- **Par catégorie** : donut (épaisseur 18, total au centre) + légende.
- **Pics d’arrivée** : carte de chaleur jour × heure (5 × 9, 6 niveaux d’opacité de `accent-soft`, cellules qui « pop » en cascade 18 ms).
- **Performance des agents** : tableau (avatar, clôturées, délai moyen, barre SLA colorée par seuil 90 / 80).

## 07 · Connexion — `/login`
Maquette : `maquette/Login.dc.html` (Play : afficher le mot de passe, soumission → erreur).

- Deux colonnes (`flex-wrap`, la gauche passe au-dessus sur mobile, hauteur réduite à 280 px).
- Gauche `bg-bg-sunken` + grille 48 px animée (M18) : surtitre, titre `text-[46px]` « Le support de l’équipe, **sans friction.** », sous-titre, 3 cartes-tickets flottantes (`aria-hidden`).
- Droite : formulaire 400 px — E-mail, Mot de passe (+ œil, « Oublié ? » → mailto support), « Rester connecté 30 jours », bouton 50 px avec spinner, message d’erreur `Alert danger` + shake.
- Logique : reprendre `components/auth/LoginForm.tsx` (appel `/api/auth/login` inchangé) ; **supprimer** l’écriture du token dans `localStorage` (le cookie httpOnly suffit).

## 08 · Pages légales — `/confidentialite`, `/mentions-legales`
Maquette : `maquette/Legal.dc.html`.

- Layout public. Barre de lecture 3 px en haut (scroll). Sommaire collant à gauche avec section active (IntersectionObserver), bascule Confidentialité / Mentions légales.
- Sections en cartes numérotées `01`, `02`… ; texte max 68 caractères par ligne, interligne 1.75.
- **Garder le texte juridique actuel des pages** (seule la mise en forme change).

## 09 · États système
Maquette : `maquette/States.dc.html`.

| État | Fichier | Contenu |
|---|---|---|
| 404 | `app/not-found.tsx` | « 404 » 96 px avec glitch (M20), « Cette demande n’existe pas ou a été supprimée », boutons Tableau de bord / Rechercher Ctrl K |
| Liste vide | `EmptyState` | illustration cartes flottantes, « Aucune demande pour l’instant », CTA (masqué pour LECTURE) |
| Chargement | `loading.tsx` par route | squelettes à la forme réelle (M14) |
| Erreur | `error.tsx` par segment | `Alert danger` + « Réessayer » (`reset()`), icône qui tourne pendant la nouvelle tentative |
| Supprimée (admin) | fiche | bandeau pointillé corail + Restaurer |
| Lecture seule | partout | `Alert info` + boutons désactivés avec infobulle « Votre rôle ne permet pas… » |
| Hors ligne | `OfflineToast` | écoute `online/offline`, pastille ambre « Hors ligne — reconnexion… » |
