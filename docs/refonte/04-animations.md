# 04 — Catalogue d’animations M01–M20

Démos en boucle : `maquette/Systeme.dc.html` › « Catalogue d’animations ».
Dans l’application, chaque animation se joue **une fois, au déclencheur indiqué** (sauf les boucles
signalées « infini »).

## Règles générales

1. **Trois courbes seulement** : `ease-out` `cubic-bezier(.22,1,.36,1)` pour les entrées,
   `ease-in-out` `(.65,0,.35,1)` pour les tracés et remplissages, `spring` `(.34,1.56,.64,1)` pour
   pastilles, toasts et pop.
2. On n’anime que `transform`, `opacity`, `filter`, `stroke-dashoffset`, `box-shadow`, `background-color`.
   **Jamais** `width`/`height`/`top`/`left` (sauf barre de progression en `scaleX`).
3. Sortie = 70 % de la durée d’entrée, courbe `ease-in`.
4. Accessibilité : `prefers-reduced-motion` **ou** préférence « Animations : non » ⇒ classe
   `no-motion` sur `<html>` ⇒ durées réduites à 0,01 ms (cf. `tokens.css`) ; côté `motion`,
   `<MotionConfig reducedMotion="user">` + hook `useMotionAllowed()`. Les compteurs affichent la valeur finale,
   les confettis ne s’affichent pas.
5. Pas plus d’**un élément en boucle infinie par zone** (une cloche, un point pulsant par ligne).

## `lib/motion.ts` (à créer)

```ts
"use client";
import type { Transition, Variants } from "motion/react";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;
export const SPRING: Transition = { type: "spring", stiffness: 420, damping: 34, mass: 0.9 };
export const SPRING_SOFT: Transition = { type: "spring", stiffness: 260, damping: 26 };

// M01 — cascade d’entrée
export const pageStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
export const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.56, ease: EASE_OUT } },
};

// M09 — palette / dialogue
export const dialogIn: Variants = {
  hidden: { opacity: 0, y: -10, scale: 0.97, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.28, ease: EASE_OUT } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.16 } },
};

// M10 — tiroir
export const drawerRight: Variants = {
  hidden: { x: "104%" },
  show: { x: 0, transition: { duration: 0.38, ease: EASE_OUT } },
  exit: { x: "104%", transition: { duration: 0.26, ease: [0.4, 0, 1, 1] } },
};
```

Composant utilitaire `components/motion/Reveal.tsx` : `<Reveal as="section" delay={i}>` = `motion.section` avec `rise`.
`components/motion/Stagger.tsx` : conteneur `pageStagger`, enfants `Reveal`.

## Catalogue

| ID | Nom | Où / déclencheur | Propriétés | Durée · courbe | Implémentation |
|---|---|---|---|---|---|
| **M01** | Entrée de page en cascade | Montage de chaque page (en-tête, KPI, filtres, tableau, cartes) | opacity 0→1, translateY 14→0 | 560 ms · ease-out ; +60 ms par bloc, max 8 blocs (au-delà : sans délai) | `Stagger` + `Reveal`, ou classe `animate-rise` + `style={{animationDelay}}` dans les Server Components |
| **M02** | Compteur KPI + sparkline | 1er affichage du tableau de bord / Stats, changement de période | valeur 0→N ; `stroke-dashoffset` L→0 | 1100 ms easeOutCubic ; tracé 1500 ms ease-in-out, délai 350 ms | `CountUp` (rAF) + `Sparkline` (`animate-draw`) ; décimales en `fr-FR` |
| **M03** | Indicateur de navigation | Changement de route | la barre 3 px glisse vers l’item actif | ressort `SPRING` | `motion.span layoutId="nav-indicator"` dans l’item actif de la Sidebar |
| **M04** | Encre d’onglet / segmented | Liste↔Kanban, onglets de fiche et compte, priorité du formulaire | pastille `translateX`, soulignement `scaleX` | 350 ms spring | `layoutId` par groupe (`seg-view`, `tab-detail`…) |
| **M05** | Survol de carte | Hover KPI, cartes Kanban, aperçu, résumé journal | translateY −3 px, `shadow-md`, bordure #56637A | 280 ms ease-out | classes `Card interactive` ; désactivé sur `(hover: none)` |
| **M06** | Bouton primaire | Tous les boutons | hover brightness 1.12 + `shadow-glow` ; active scale .96 ; spinner en chargement | 140 / 200 ms | classes `Button` ; `loading` remplace l’icône par le spinner, largeur figée |
| **M07** | Cloche + badge | Header si non-lues > 0 ; rejoué à chaque nouvelle notification | rotate ±16° amorti ; badge `ping` | 6 s cycle ; 1.8 s | `animate-swing` + `animate-ping` ; à chaque nouvelle notif : retirer/remettre la classe (`key`) |
| **M08** | Pulsation priorité haute | Point à côté de « Haute », SLA dépassé | box-shadow 0→9 px transparent | 1.8 s infini · ease-out | `animate-pulse` (Tailwind étendu) |
| **M09** | Palette Ctrl K | Ctrl K / ⌘K, clic sur la recherche | fond fade + blur 6 px ; boîte scale .97→1, y −10→0, blur 6→0 ; résultats en cascade 50 ms ; surlignage du terme | 200 / 280 ms ease-out ; sortie 160 ms | `cmdk` dans `AnimatePresence` + `dialogIn` |
| **M10** | Tiroir notifications / sidebar mobile | Clic cloche ; menu mobile | translateX 104 %→0 ; items en cascade 60 ms | 380 ms ease-out ; sortie 260 ms | `drawerRight` / `drawerLeft` |
| **M11** | Toast | Après créer, modifier, changer statut, supprimer, restaurer, commenter | y 24→0, scale .94→1 ; barre `scaleX` 1→0 ; pause au survol | 450 ms spring ; 6 s | `sonner` + `toast.custom` (`components/ui/Toast.tsx`) avec action « Annuler » quand réversible |
| **M12** | Changement de statut | Menu « Changer le statut », drop Kanban, raccourcis 1–4 | badge : couleurs 350 ms ; stepper : remplissage `scaleX` 700 ms + pastille courante `scale 1.08` + halo 6 px ; **vers CLOTUREE : 22 confettis** | 350 / 700 / 900 ms | `StatusBadge` (transition-colors), `StatusStepper` (motion), `ConfettiBurst` ancré au bouton |
| **M13** | Glisser-déposer Kanban | Saisie d’une carte (souris, toucher, clavier Espace) | carte : rotate −3°, `shadow-lg`, flottement ; colonne cible : bordure pointillée pulsée ; autres cartes : réordonnancement FLIP | 200 ms prise ; 1.4 s pulse ; 300 ms FLIP | `@dnd-kit/core` `DragOverlay` + `motion` `layout` ; drop = PATCH optimiste, rollback animé (carte revient en 300 ms + toast erreur) |
| **M14** | Squelette | Tout chargement > 300 ms | dégradé qui balaie | 1.5 s infini · linear | `app/(front)/(app)/demands/loading.tsx` etc. avec `Skeleton` reprenant la forme réelle |
| **M15** | Barre d’actions groupées | 1re case cochée | slide-down y −12→0 | 320 ms ease-out ; sortie 200 ms | `AnimatePresence` ; sur mobile, barre fixée en bas (y 24→0) |
| **M16** | « En train d’écrire » | Autre utilisateur qui tape sur la même fiche | 3 points translateY −5 px, décalés 150 ms | 1.2 s infini | `TypingIndicator` ; signal via `/api/demands/[id]/presence` (cf. 06-features) |
| **M17** | Anneau SLA | Fiche demande, Stats | `stroke-dashoffset` C→valeur ; couleur selon seuil | 1.6 s ease-out | `SlaRing` ; mise à jour minute par minute **sans** rejouer l’entrée |
| **M18** | Fond de connexion | Page `/login` | grille 48 px qui défile ; 3 cartes-tickets flottantes ±14 px (rotations −4°, 3°, 2°) ; erreur → shake du message | 6 s linear ; 6–8 s ; shake 450 ms | CSS pur (`animate-grid`, `animate-float` + `--r`) |
| **M19** | Focus de champ | Tous les champs | bordure #7C8CFF + anneau 4 px accent 25 % + fond #262D3A | 180 ms ease | classes `Input` ; `focus-visible:outline-2 outline-offset-2 outline-accent-soft` pour boutons/liens |
| **M20** | Glitch 404 | `app/not-found.tsx` | translate/skew 2 images sur 3,5 s | 3.5 s steps(1) | `animate-glitch` |

## Micro-interactions complémentaires

- **Ligne de tableau** : hover `bg-[#303949]` 180 ms, titre → `text-accent-fg-2`. Ligne sélectionnée `bg-accent/10`.
- **Header** : compactage 64→56 px après 8 px de scroll (200 ms).
- **Chevron de menu** : rotation 180° 250 ms.
- **Switch** : pouce en ressort 300 ms.
- **Jauge mot de passe** : 4 segments, couleur + `scaleX(.92→1)` en ressort 350 ms.
- **Liste « Prête à envoyer »** : case qui se coche en `scale .9→1` ressort, barre de progression 500 ms.
- **Barre de lecture (pages légales)** : `scaleX` = progression du scroll (hook `useScrollProgress`), 3 px, halo accent.
- **Restauration d’une demande** : la carte « se recompose » (blur 6→0, scale .96→1, 400 ms) + toast vert.
- **Suppression** : la ligne s’efface (opacity→0, height→0 via `motion` `layout`, 300 ms) + toast « Annuler » (10 s).
