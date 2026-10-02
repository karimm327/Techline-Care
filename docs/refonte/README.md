# Refonte graphique TechLine Care — kit d'implémentation

Maquette validée : https://claude.ai/artifact/5Tb4WYkcYdCBR72iV5drWr
Copie locale des écrans (HTML de référence, styles exacts) : [`maquette/`](maquette/)

Ce dossier contient tout ce qu'il faut pour que Claude Code applique la refonte **étape par étape**,
sans casser l'existant (API, auth par cookie, suppression douce, journal).

## Contenu

| Fichier | Rôle |
|---|---|
| [PROMPTS.md](PROMPTS.md) | **Point d'entrée.** 16 étapes (0 à 15) à donner à Claude Code, dans l'ordre. |
| [01-design-tokens.md](01-design-tokens.md) | Couleurs, typo, rayons, ombres, z-index. |
| [tokens.css](tokens.css) | Variables CSS prêtes à importer. |
| [tailwind.tokens.js](tailwind.tokens.js) | Extension Tailwind 3 branchée sur les variables. |
| [02-layout.md](02-layout.md) | Header, sidebar, footer, layouts public / app, responsive. |
| [03-composants.md](03-composants.md) | Bibliothèque `components/ui/*` : API et styles de chaque composant. |
| [04-animations.md](04-animations.md) | Catalogue M01–M20 : déclencheur, propriétés, durée, courbe, code. |
| [05-ecrans.md](05-ecrans.md) | Spécification écran par écran (01 à 09) mappée sur les routes. |
| [06-features.md](06-features.md) | Nouvelles fonctionnalités : SQL, API, UI/UX, règles de rôles. |
| [sql/migration-refonte.sql](sql/migration-refonte.sql) | Migration v2 idempotente (nouvelles tables / colonnes). |

## Règles pour Claude Code (à respecter dans chaque prompt)

1. **Ne jamais casser l'API existante** (`app/(back)/api/**`) : on ajoute, on ne renomme pas.
2. **Aucune couleur en dur** dans les composants : uniquement les classes Tailwind issues des tokens
   (`bg-surface`, `text-fg-2`, `border-line`, `text-st-encours`…). Les `bg-[#111]`, `bg-blue-600`,
   `text-slate-*` actuels doivent disparaître.
3. **Français** pour tous les libellés, commentaires et noms de fonctions métier (convention du projet).
4. **Accessibilité** : vrais `<button>` / `<a>`, `aria-label` sur les boutons-icônes, focus visible,
   contrastes ≥ 4.5:1 (les tokens sont calibrés pour ça), cibles ≥ 44 px.
5. **Animations** : toujours via les presets de `lib/motion.ts` ou les classes `animate-*` ;
   toutes respectent `prefers-reduced-motion` **et** la préférence utilisateur « Animations ».
6. **Server Components par défaut** ; `"use client"` seulement pour l'interactif.
7. Après chaque prompt : `npm run lint` et `npm run build` doivent passer.
8. Référence visuelle : ouvrir le fichier `docs/refonte/maquette/<Écran>.dc.html` correspondant
   et reproduire les valeurs (espacements, tailles, couleurs) — c'est la source de vérité.

## Dépendances ajoutées

```bash
npm i motion @dnd-kit/core @dnd-kit/sortable cmdk sonner recharts clsx tailwind-merge
```

- `motion` (ex-Framer Motion) : layout animations, ressorts, AnimatePresence.
- `@dnd-kit/*` : Kanban accessible au clavier.
- `cmdk` : palette Ctrl K.
- `sonner` : toasts (restylés aux tokens).
- `recharts` : graphiques de la page Statistiques.
- `clsx` + `tailwind-merge` : helper `cn()`.

## Nettoyage prévu

- Supprimer `components/AccountMenu.tsx` (reste e-commerce, JSX invalide, jamais importé).
- Remplacer `app/(front)/account/rights/page.tsx` (statuts inexistants en base) par la matrice des droits.
- Unifier `lib/types/DemandStatus.ts` (ajouter `ANNULEE`) et supprimer `STATUS_STYLES` au profit de `lib/ui/status.ts`.
- La Navbar ne lit plus le JWT dans `localStorage` : l'utilisateur vient du serveur (`getSessionUser`).
