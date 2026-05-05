import { PLANTS } from '@data/plants';
import { ZOMBIES } from '@data/zombies';
import { WAVES } from '@data/waves';
import {
  effAutoCollectMs,
  effFastMineMul,
  effFastShootMul,
  effLongFreezeMul,
  effStrongPeaMul,
  effSunYieldMul
} from '@data/passives';
import { COLS, PROJECTILE_SPEED, ROWS, SKY_SUN_INTERVAL_MS, SKY_SUN_VALUE } from './constants';
import { mulberry32 } from './rng';
import type { GameState, Zombie } from './types';

let _idCounter = 1;
function nextId(prefix: string): string {
  _idCounter += 1;
  return `${prefix}_${_idCounter}_${Math.floor(Math.random() * 1e6)}`;
}

function pushFloat(
  state: GameState,
  row: number,
  x: number,
  text: string,
  kind: 'damage' | 'crit' | 'explode' | 'heal'
) {
  state.floatingTexts.push({
    id: nextId('flt'),
    row,
    x,
    text,
    kind,
    ttl: 700,
    life: 700
  });
}

/** Pure-ish tick: mutates the given draft state. Caller is expected to pass a working copy. */
export function tick(state: GameState, dtMs: number): GameState {
  if (state.status !== 'playing') return state;

  state.totalElapsedMs += dtMs;
  const dt = dtMs / 1000;
  const rand = mulberry32(state.rngSeed + Math.floor(state.totalElapsedMs));
  state.rngSeed = (state.rngSeed + dtMs) >>> 0;

  // Cooldowns
  for (const k of Object.keys(state.cooldowns) as Array<keyof typeof state.cooldowns>) {
    if (state.cooldowns[k] > 0) {
      state.cooldowns[k] = Math.max(0, state.cooldowns[k] - dtMs);
    }
  }

  // Age floating combat texts
  if (state.floatingTexts.length) {
    state.floatingTexts = state.floatingTexts.filter((f) => {
      f.ttl -= dtMs;
      return f.ttl > 0;
    });
  }

  // Sky sun spawn
  state.skySunTimer -= dtMs;
  if (state.skySunTimer <= 0) {
    state.skySunTimer += SKY_SUN_INTERVAL_MS;
    const col = Math.floor(rand() * COLS);
    const row = Math.floor(rand() * ROWS);
    state.sunTokens.push({
      id: nextId('sun'),
      row,
      col,
      value: Math.round(SKY_SUN_VALUE * effSunYieldMul(state.passives)),
      ttl: effAutoCollectMs(state.passives)
    });
  }

  // Sun tokens: auto-collect after TTL elapses (30s on board)
  const remainingSun: typeof state.sunTokens = [];
  for (const s of state.sunTokens) {
    s.ttl -= dtMs;
    if (s.ttl <= 0) {
      state.sun += s.value;
    } else {
      remainingSun.push(s);
    }
  }
  state.sunTokens = remainingSun;

  // Plants
  const explosions: Array<{ row: number; col: number; radius: number; damage: number }> = [];
  for (const plant of state.plants) {
    const def = PLANTS[plant.kind];

    // Sun-producing plants
    if (def.sunProduceMs && def.sunProduceAmount) {
      plant.sunTimer += dtMs;
      if (plant.sunTimer >= def.sunProduceMs) {
        plant.sunTimer -= def.sunProduceMs;
        state.sunTokens.push({
          id: nextId('sun'),
          row: plant.row,
          col: plant.col,
          value: Math.round(def.sunProduceAmount * effSunYieldMul(state.passives)),
          ttl: effAutoCollectMs(state.passives)
        });
      }
    }

    // Cherry bomb fuse
    if (def.fuseMs && def.explodeDamage != null && def.explodeRadius != null) {
      plant.lifeTimer += dtMs;
      if (plant.lifeTimer >= def.fuseMs) {
        explosions.push({
          row: plant.row,
          col: plant.col,
          radius: def.explodeRadius,
          damage: def.explodeDamage
        });
        plant.hp = 0; // mark for removal below
      }
    }

    // Potato mine: arm then detonate when zombie steps on the cell
    if (def.armMs && def.explodeDamage != null && def.explodeRadius != null) {
      const mineArm = def.armMs * effFastMineMul(state.passives);
      if (!plant.armed) {
        plant.lifeTimer += dtMs;
        if (plant.lifeTimer >= mineArm) plant.armed = true;
      } else {
        const trigger = state.zombies.find(
          (z) => z.row === plant.row && Math.floor(z.x) === plant.col
        );
        if (trigger) {
          explosions.push({
            row: plant.row,
            col: plant.col,
            radius: def.explodeRadius,
            damage: def.explodeDamage
          });
          plant.hp = 0;
        }
      }
    }

    // Shooters (peashooter, snowpea, repeater)
    if (def.shootIntervalMs && def.projectileDamage) {
      const interval = def.shootIntervalMs * effFastShootMul(state.passives);
      const target = state.zombies.find((z) => z.row === plant.row && z.x >= plant.col);
      if (target) {
        plant.shootTimer += dtMs;
        if (plant.shootTimer >= interval) {
          plant.shootTimer -= interval;
          const shots = def.multiShot ?? 1;
          for (let i = 0; i < shots; i++) {
            state.projectiles.push({
              id: nextId('proj'),
              row: plant.row,
              x: plant.col + 0.5 - i * 0.35,
              damage: def.projectileDamage * effStrongPeaMul(state.passives),
              slowMs: def.slowOnHitMs
                ? def.slowOnHitMs * effLongFreezeMul(state.passives)
                : undefined
            });
          }
        }
      } else {
        plant.shootTimer = Math.min(plant.shootTimer + dtMs, interval);
      }
    }
  }

  // Apply explosions (after iterating plants)
  for (const ex of explosions) {
    for (const z of state.zombies) {
      if (Math.abs(z.row - ex.row) <= ex.radius && Math.abs(z.x - ex.col) <= ex.radius + 0.5) {
        z.hp -= ex.damage;
        pushFloat(state, z.row, z.x, `💥 ${Math.round(ex.damage)}`, 'explode');
      }
    }
  }

  // Projectiles
  for (const p of state.projectiles) {
    p.x += PROJECTILE_SPEED * dt;
  }
  // Projectile collisions
  state.projectiles = state.projectiles.filter((p) => {
    if (p.x > COLS) return false;
    const hit = state.zombies.find(
      (z) => z.row === p.row && z.x <= p.x + 0.4 && z.x >= p.x - 0.4
    );
    if (hit) {
      hit.hp -= p.damage;
      if (p.slowMs) hit.slowMs = Math.max(hit.slowMs, p.slowMs);
      pushFloat(
        state,
        hit.row,
        hit.x,
        `${Math.round(p.damage)}`,
        p.slowMs ? 'crit' : 'damage'
      );
      return false;
    }
    return true;
  });

  // Zombies
  for (const z of state.zombies) {
    const def = ZOMBIES[z.kind];
    if (z.slowMs > 0) z.slowMs = Math.max(0, z.slowMs - dtMs);
    const speedMul = z.slowMs > 0 ? 0.5 : 1;
    // Passive HP regeneration (e.g. dancer, brain) — only outside combat damage tick;
    // we still apply it always for simplicity, capped at maxHp.
    if (def.hpRegenPerSec) {
      z.hp = Math.min(def.maxHp, z.hp + def.hpRegenPerSec * dt);
    }
    // Check if eating a plant on its current cell
    const cellCol = Math.floor(z.x);
    const plantHere = state.plants.find((pl) => pl.row === z.row && pl.col === cellCol);
    if (plantHere) {
      z.eatingPlantId = plantHere.id;
      plantHere.hp -= def.damagePerSecond * dt;
    } else {
      z.eatingPlantId = null;
      z.x -= def.speed * speedMul * dt;
    }
  }

  // Remove dead plants
  state.plants = state.plants.filter((p) => p.hp > 0);
  // Remove dead zombies
  state.zombies = state.zombies.filter((z) => z.hp > 0);

  // Zombies reaching house
  const reached = state.zombies.filter((z) => z.x <= -0.5);
  for (const z of reached) {
    if (state.lawnmowers[z.row]) {
      // trigger lawnmower: remove all zombies in row, consume mower
      state.lawnmowers[z.row] = false;
      state.zombies = state.zombies.filter((other) => other.row !== z.row);
      break;
    } else {
      state.status = 'lost';
      return state;
    }
  }

  // Waves
  const currentWave = WAVES[state.waveIndex];
  if (currentWave) {
    if (!state.betweenWaves) {
      state.waveTimer += dtMs;
      while (
        state.waveSpawnCursor < currentWave.spawns.length &&
        currentWave.spawns[state.waveSpawnCursor].at <= state.waveTimer
      ) {
        const spawn = currentWave.spawns[state.waveSpawnCursor];
        const row = spawn.row ?? Math.floor(rand() * ROWS);
        spawnZombie(state, spawn.kind, row);
        state.waveSpawnCursor += 1;
      }
      // wave complete?
      if (
        state.waveSpawnCursor >= currentWave.spawns.length &&
        state.zombies.length === 0
      ) {
        // Award one passive point per wave cleared
        state.passivePoints += 1;
        if (state.waveIndex >= WAVES.length - 1) {
          state.status = 'won';
          return state;
        }
        state.betweenWaves = true;
        state.betweenWavesTimer = currentWave.postDelayMs;
      }
    } else {
      state.betweenWavesTimer -= dtMs;
      if (state.betweenWavesTimer <= 0) {
        state.betweenWaves = false;
        state.waveIndex += 1;
        state.waveTimer = 0;
        state.waveSpawnCursor = 0;
      }
    }
  }

  return state;
}

function spawnZombie(state: GameState, kind: Zombie['kind'], row: number) {
  const def = ZOMBIES[kind];
  state.zombies.push({
    id: nextId('zomb'),
    kind,
    row,
    x: COLS - 0.01,
    hp: def.maxHp,
    eatingPlantId: null,
    slowMs: 0
  });
}
