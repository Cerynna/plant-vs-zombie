# Conventions

## Règles dures

1. **Jamais de logique gameplay dans les composants React.** Les composants lisent `useGame(selector)` et appellent `useActions()`. Tout le reste vit dans `engine/` ou `store/`.
2. **`engine/tick.ts` reste prévisible.** Pas d'accès à `window`, pas de fetch, pas de `localStorage`. Seul `Math.random` est toléré pour les ids ; la logique de spawn passe par `mulberry32(seed)`.
3. **Les stats ne vivent qu'ici :** `src/data/`. Le moteur lit ces tables, l'UI aussi pour l'affichage des cartes.
4. **Le snapshot est complet.** Si tu ajoutes un champ à `GameState`, ajoute-le aussi dans `createInitialState` ET dans `stripState`, et bumpe `SAVE_VERSION` si la migration n'est pas triviale.
5. **TypeScript strict.** `strict: true` dans `tsconfig`. Pas de `any` implicite.

## Style

- Imports relatifs courts ; pas d'alias configuré.
- Composants en PascalCase, fichiers du même nom.
- Types métier en PascalCase ; champs en camelCase.
- Toutes les durées en millisecondes, sauf vitesses (cells/seconde) qui sont multipliées par `dtMs/1000` dans `tick`.

## Zones d'extension

| Tu veux...                            | Modifie...                                                        |
|---------------------------------------|-------------------------------------------------------------------|
| Ajouter une plante                    | `data/plants.ts` (+ logique éventuelle dans `tick.ts`)            |
| Ajouter un zombie                     | `data/zombies.ts` (+ comportement dans `tick.ts` si spécial)      |
| Ajouter une vague                     | `data/waves.ts`                                                   |
| Changer la grille                     | `engine/constants.ts` (`ROWS`, `COLS`)                            |
| Ajouter un mode (jour/nuit, piscine)  | Nouveau champ `GameState` + adaptation `tick.ts` + UI             |
| Modifier l'équilibrage                | `data/*.ts` uniquement                                            |
| Ajouter un effet visuel               | `ui/Board.tsx` + `ui/styles.css`                                  |

## Tests (à venir)

`engine/tick.ts` est conçu pour être testé en isolation : créer un `GameState`, appliquer N ticks, vérifier les invariants. Aucun mocking React requis.
