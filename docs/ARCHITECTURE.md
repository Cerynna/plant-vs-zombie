# Architecture

## Principes

1. **React = rendu uniquement.** Aucun composant ne mute l'état métier directement.
2. **Zustand = source unique de vérité.** Tout l'état du jeu vit dans `useGame`.
3. **Moteur pur isolé.** `src/engine/tick.ts` est une fonction qui prend un état + dt et retourne un nouvel état. Pas d'effets de bord (hors `Math.random` pour les ids).
4. **Données séparées du moteur.** Stats des plantes/zombies/vagues dans `src/data/`, pour faciliter l'équilibrage sans toucher à la logique.
5. **Persistance simple.** Snapshot complet sérialisé dans `localStorage` à chaque tick (debounce 500 ms).

## Arborescence

```
src/
├── data/             # Tables de stats (plantes, zombies, vagues)
│   ├── plants.ts
│   ├── zombies.ts
│   └── waves.ts
├── engine/           # Logique pure et types métier
│   ├── constants.ts  # Constantes globales (ROWS, COLS, TICK_MS, ...)
│   ├── types.ts      # Types métier (GameState, Plant, Zombie, ...)
│   ├── state.ts      # createInitialState, helpers (canPlace, ...)
│   ├── rng.ts        # PRNG seedé (mulberry32)
│   └── tick.ts       # Fonction tick(state, dtMs)
├── store/            # Zustand store + persistance
│   └── gameStore.ts
├── ui/               # Composants React + styles
│   ├── App.tsx
│   ├── Board.tsx
│   ├── Hud.tsx
│   ├── SeedBar.tsx
│   ├── Overlay.tsx
│   └── styles.css
└── main.tsx
```

## Boucle de simulation

- `App.tsx` lance un `setInterval(TICK_MS)` quand `status === 'playing'`.
- À chaque interval, on calcule `dt = now - last` (clampé à 250 ms) et on appelle `actions.tick(dt)`.
- L'action `tick` clone l'état (shallow + tableaux d'entités), appelle `runTick` (pur), persiste, et `set()` le résultat.

## Persistance

- Clé : `pvz-react-mvp:v1` (voir `SAVE_KEY` / `SAVE_VERSION`).
- Sérialisation directe du `GameState` (pas d'`actions`).
- Au chargement, si `version` ne matche pas, on ignore le snapshot.
- Quand on reprend une partie en cours sauvegardée, on la met automatiquement en `paused`.
