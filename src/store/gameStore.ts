import { create } from 'zustand';
import { PLANTS } from '@data/plants';
import { nextPassiveCost, passiveLevel, passiveMaxLevel } from '@data/passives';
import { isPlantUnlocked } from '@data/progression';
import { SAVE_KEY, SAVE_VERSION } from '@engine/constants';
import { canPlace, createInitialState } from '@engine/state';
import { tick as runTick } from '@engine/tick';
import type { GameState, PassiveId, PlantKind } from '@engine/types';

interface Actions {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  cycleSpeed: () => void;
  buyPassive: (id: PassiveId) => void;
  selectPlant: (kind: PlantKind | null) => void;
  toggleShovel: () => void;
  placePlant: (row: number, col: number) => void;
  removePlant: (row: number, col: number) => void;
  collectSun: (id: string) => void;
  tick: (dtMs: number) => void;
  loadFromStorage: () => void;
}

type Store = GameState & { actions: Actions };

function loadSaved(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (parsed.version !== SAVE_VERSION) return null;
    if (!parsed.floatingTexts) parsed.floatingTexts = [];
    return parsed;
  } catch {
    return null;
  }
}

function persist(state: GameState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(stripState(state)));
  } catch {
    // ignore quota errors
  }
}

function stripState(s: GameState): GameState {
  // Just save everything; state is small.
  return {
    version: s.version,
    status: s.status,
    speed: s.speed,
    sun: s.sun,
    passivePoints: s.passivePoints,
    passives: { ...s.passives },
    selectedPlant: s.selectedPlant,
    shovelMode: s.shovelMode,
    cooldowns: { ...s.cooldowns },
    plants: s.plants.map((p) => ({ ...p })),
    zombies: s.zombies.map((z) => ({ ...z })),
    projectiles: s.projectiles.map((p) => ({ ...p })),
    sunTokens: s.sunTokens.map((s2) => ({ ...s2 })),
    floatingTexts: [],
    lawnmowers: [...s.lawnmowers],
    waveIndex: s.waveIndex,
    waveTimer: s.waveTimer,
    waveSpawnCursor: s.waveSpawnCursor,
    betweenWaves: s.betweenWaves,
    betweenWavesTimer: s.betweenWavesTimer,
    skySunTimer: s.skySunTimer,
    totalElapsedMs: s.totalElapsedMs,
    rngSeed: s.rngSeed
  };
}

let saveDebounce = 0;
function schedulePersist(state: GameState) {
  const now = Date.now();
  if (now - saveDebounce < 500) return;
  saveDebounce = now;
  persist(state);
}

export const useGame = create<Store>((set) => {
  const initial = createInitialState();
  return {
    ...initial,
    actions: {
      start: () =>
        set((s) => {
          if (s.status === 'idle' || s.status === 'won' || s.status === 'lost') {
            // Carry passive progression across runs.
            const fresh = createInitialState({
              passivePoints: s.passivePoints,
              passives: { ...s.passives }
            });
            fresh.status = 'playing';
            persist(fresh);
            return fresh;
          }
          return { status: 'playing' as const };
        }),
      pause: () => set({ status: 'paused' }),
      resume: () =>
        set((s) => (s.status === 'paused' ? { status: 'playing' as const } : s)),
      reset: () => {
        const fresh = createInitialState();
        try {
          localStorage.removeItem(SAVE_KEY);
        } catch {}
        set(fresh);
      },
      cycleSpeed: () =>
        set((s) => {
          const cycle = [1, 2, 4];
          const i = cycle.indexOf(s.speed);
          return { speed: cycle[(i + 1) % cycle.length] };
        }),
      buyPassive: (id) =>
        set((s) => {
          const lvl = passiveLevel(s.passives, id);
          if (lvl >= passiveMaxLevel(id)) return s;
          const cost = nextPassiveCost(s.passives, id);
          if (cost == null || s.passivePoints < cost) return s;
          const next: GameState = {
            ...s,
            passivePoints: s.passivePoints - cost,
            passives: { ...s.passives, [id]: (lvl + 1) as 1 | 2 | 3 | 4 }
          };
          // Apply immediate side-effects of certain passives mid-run.
          if (id === 'toughPlants') {
            // We don't retro-buff existing plants; new value applies on placement.
          }
          schedulePersist(next);
          return next;
        }),
      selectPlant: (kind) => set({ selectedPlant: kind, shovelMode: false }),
      toggleShovel: () =>
        set((s) => ({ shovelMode: !s.shovelMode, selectedPlant: null })),
      placePlant: (row, col) =>
        set((s) => {
          if (s.shovelMode) {
            const exists = s.plants.some((p) => p.row === row && p.col === col);
            if (!exists) return s;
            const next: GameState = {
              ...s,
              plants: s.plants.filter((p) => !(p.row === row && p.col === col)),
              shovelMode: false
            };
            schedulePersist(next);
            return next;
          }
          const kind = s.selectedPlant;
          if (!kind) return s;
          const def = PLANTS[kind];
          // Repair: same plant kind on a damaged existing plant of the same kind.
          const existing = s.plants.find((p) => p.row === row && p.col === col);
          if (existing && existing.kind === kind) {
            const toughMul = [1, 1.25, 1.5, 2, 3][s.passives.toughPlants];
            const fullHp = def.maxHp * toughMul;
            // Nothing to repair.
            if (existing.hp >= fullHp) return s;
            // Same gating as a fresh plant: cooldown + sun + unlock.
            if (!isPlantUnlocked(kind, s.waveIndex)) return s;
            if (s.cooldowns[kind] > 0) return s;
            if (s.sun < def.cost) return s;
            const cdMul = [1, 0.9, 0.75, 0.6, 0.45][s.passives.cooldownCut];
            const next: GameState = {
              ...s,
              sun: s.sun - def.cost,
              cooldowns: { ...s.cooldowns, [kind]: def.cooldownMs * cdMul },
              plants: s.plants.map((p) =>
                p === existing ? { ...p, hp: fullHp } : p
              ),
              selectedPlant: null
            };
            schedulePersist(next);
            return next;
          }
          if (!canPlace(s, kind, row, col)) return s;
          const toughMul = [1, 1.25, 1.5, 2, 3][s.passives.toughPlants];
          const cdMul = [1, 0.9, 0.75, 0.6, 0.45][s.passives.cooldownCut];
          const next: GameState = {
            ...s,
            sun: s.sun - def.cost,
            cooldowns: { ...s.cooldowns, [kind]: def.cooldownMs * cdMul },
            plants: [
              ...s.plants,
              {
                id: `plant_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
                kind,
                row,
                col,
                hp: def.maxHp * toughMul,
                sunTimer: 0,
                shootTimer: 0,
                lifeTimer: 0,
                armed: false
              }
            ],
            selectedPlant: null
          };
          schedulePersist(next);
          return next;
        }),
      removePlant: (row, col) =>
        set((s) => ({
          ...s,
          plants: s.plants.filter((p) => !(p.row === row && p.col === col))
        })),
      collectSun: (id) =>
        set((s) => {
          const tok = s.sunTokens.find((t) => t.id === id);
          if (!tok) return s;
          return {
            ...s,
            sun: s.sun + tok.value,
            sunTokens: s.sunTokens.filter((t) => t.id !== id)
          };
        }),
      tick: (dtMs) =>
        set((s) => {
          if (s.status !== 'playing') return s;
          // shallow clone and let tick mutate the working copy
          const draft: GameState = {
            ...s,
            cooldowns: { ...s.cooldowns },
            plants: s.plants.map((p) => ({ ...p })),
            zombies: s.zombies.map((z) => ({ ...z })),
            projectiles: s.projectiles.map((p) => ({ ...p })),
            sunTokens: s.sunTokens.map((t) => ({ ...t })),
            floatingTexts: s.floatingTexts.map((f) => ({ ...f })),
            lawnmowers: [...s.lawnmowers]
          };
          const next = runTick(draft, dtMs);
          schedulePersist(next);
          return next;
        }),
      loadFromStorage: () => {
        const saved = loadSaved();
        if (saved) {
          // If saved status was 'playing', resume as paused so user can ack
          if (saved.status === 'playing') saved.status = 'paused';
          set(saved);
        }
      }
    }
  };
});

export function useActions() {
  return useGame((s) => s.actions);
}
