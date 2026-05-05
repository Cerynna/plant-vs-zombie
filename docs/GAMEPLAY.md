# Gameplay

## Grille

- 5 lignes (`ROWS`) x 9 colonnes (`COLS`).
- Les zombies entrent à `x = COLS - 0.01` et marchent vers `x = -0.5`.
- À `x <= -0.5`, si une tondeuse est encore disponible sur la ligne, elle élimine tous les zombies de la ligne et est consommée. Sinon : défaite.

## Soleil

- Départ : 50 ☀️.
- Soleil du ciel : un jeton de 25 ☀️ apparaît toutes les 10 s à une position aléatoire (TTL 10 s).
- Tournesols : produisent 25 ☀️ toutes les 12 s, jeton TTL 12 s, à collecter au clic.

## Plantes (`src/data/plants.ts`)

| Plante      | Coût | HP  | CD pose  | Particularité                              |
|-------------|------|-----|----------|---------------------------------------------|
| Tournesol   | 50   | 100 | 7.5 s    | +25 ☀️ / 12 s                               |
| Lance-pois  | 100  | 100 | 7.5 s    | Tire 20 dégâts toutes les 1.5 s si cible    |
| Noix        | 50   | 600 | 20 s     | Tank, ne fait rien d'autre                  |

## Zombies (`src/data/zombies.ts`)

| Zombie       | HP  | Vitesse (cells/s) | DPS (sur plante) |
|--------------|-----|-------------------|------------------|
| Normal       | 100 | 0.4               | 50               |
| Cône         | 240 | 0.4               | 50               |

## Combat

- Un projectile avance à 4 cells/s, touche le premier zombie de la rangée croisé (fenêtre ±0.4).
- Un zombie sur la même cellule qu'une plante s'arrête et la mange (`damagePerSecond * dt`).
- Plantes/zombies retirés quand `hp <= 0`.

## Vagues (`src/data/waves.ts`)

- 3 vagues, chacune avec une liste d'évènements `{at, kind, row?}`.
- `at` est en ms depuis le début de la vague. `row` est aléatoire si non précisé.
- Une vague se termine quand tous les spawns ont été émis ET que la liste de zombies est vide. Pause inter-vague (`postDelayMs`).
- Vague 3 terminée → victoire.

## Conditions de fin

- **Défaite** : un zombie atteint `x <= -0.5` sans tondeuse disponible sur sa ligne.
- **Victoire** : dernière vague nettoyée.

## Constantes ajustables

Toutes dans [src/engine/constants.ts](../src/engine/constants.ts) :
`TICK_MS`, `SUN_START`, `SKY_SUN_INTERVAL_MS`, `SKY_SUN_VALUE`, `PROJECTILE_SPEED`, `SAVE_VERSION`.
