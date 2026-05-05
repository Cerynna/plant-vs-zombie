# Store Zustand

Fichier : [src/store/gameStore.ts](../src/store/gameStore.ts).

## Forme

```ts
type Store = GameState & { actions: Actions }
```

`GameState` est défini dans [src/engine/types.ts](../src/engine/types.ts).

## Champs principaux

| Champ                   | Type                              | Description                                    |
|-------------------------|-----------------------------------|------------------------------------------------|
| `version`               | `number`                          | Version du snapshot persisté                   |
| `status`                | `'idle' \| 'playing' \| 'paused' \| 'won' \| 'lost'` | État global de la partie       |
| `sun`                   | `number`                          | Quantité de soleil disponible                  |
| `selectedPlant`         | `PlantKind \| null`               | Plante sélectionnée pour la pose suivante      |
| `cooldowns`             | `Record<PlantKind, number>`       | Cooldown restant en ms par plante              |
| `plants`                | `Plant[]`                         | Plantes posées                                 |
| `zombies`               | `Zombie[]`                        | Zombies vivants                                |
| `projectiles`           | `Projectile[]`                    | Projectiles en vol                             |
| `sunTokens`             | `SunToken[]`                      | Soleils à collecter                            |
| `lawnmowers`            | `boolean[]`                       | Tondeuse encore disponible par ligne           |
| `waveIndex`             | `number`                          | Index de la vague courante                     |
| `waveTimer`             | `number`                          | Temps écoulé dans la vague courante (ms)       |
| `waveSpawnCursor`       | `number`                          | Index du prochain spawn à émettre              |
| `betweenWaves` / `betweenWavesTimer` | `boolean` / `number`   | Pause inter-vagues                             |
| `skySunTimer`           | `number`                          | Compte à rebours du prochain soleil du ciel    |
| `totalElapsedMs`        | `number`                          | Temps total joué (ms)                          |
| `rngSeed`               | `number`                          | Seed PRNG pour reproductibilité                |

## Actions

| Action                       | Effet                                                              |
|------------------------------|--------------------------------------------------------------------|
| `start()`                    | Lance/relance une partie (status `playing`, état réinitialisé)     |
| `pause()`                    | `status = 'paused'`                                                |
| `resume()`                   | `status = 'playing'` si paused                                     |
| `reset()`                    | Réinitialise et vide localStorage                                  |
| `selectPlant(kind \| null)`  | Active la sélection pour la prochaine pose                         |
| `placePlant(row, col)`       | Pose la plante sélectionnée si `canPlace` (assez de soleil, libre) |
| `removePlant(row, col)`      | Retire une plante (helper dev)                                     |
| `collectSun(id)`             | Crédite la valeur d'un jeton soleil                                |
| `tick(dtMs)`                 | Avance la simulation pure                                          |
| `loadFromStorage()`          | Restaure le snapshot localStorage                                  |

## Persistance

- Clé : `pvz-react-mvp:v1` (constants `SAVE_KEY` / `SAVE_VERSION`).
- Sauvegarde debouncée (500 ms) à chaque tick et à chaque pose.
- `version` mismatch → snapshot ignoré.
