import { COLS, ROWS, SAVE_VERSION, SKY_SUN_INTERVAL_MS, SUN_START } from './constants';
import type { GameState, PlantKind } from './types';
import { PLANTS, PLANT_ORDER } from '../data/plants';
import { isPlantUnlocked } from '../data/progression';
import { effStartingSunBonus, emptyPassives } from '../data/passives';

export function createInitialState(carry?: { passivePoints: number; passives: ReturnType<typeof emptyPassives> }): GameState {
  const cooldowns = {} as Record<PlantKind, number>;
  for (const k of PLANT_ORDER) cooldowns[k] = 0;
  const passives = carry?.passives ?? emptyPassives();
  const passivePoints = carry?.passivePoints ?? 0;
  return {
    version: SAVE_VERSION,
    status: 'idle',
    speed: 1,
    sun: SUN_START + effStartingSunBonus(passives),
    passivePoints,
    passives,
    selectedPlant: null,
    shovelMode: false,
    cooldowns,
    plants: [],
    zombies: [],
    projectiles: [],
    sunTokens: [],
    floatingTexts: [],
    lawnmowers: Array.from({ length: ROWS }, () => true),
    waveIndex: 0,
    waveTimer: 0,
    waveSpawnCursor: 0,
    betweenWaves: false,
    betweenWavesTimer: 0,
    skySunTimer: SKY_SUN_INTERVAL_MS,
    totalElapsedMs: 0,
    rngSeed: Math.floor(Math.random() * 0xffffffff)
  };
}

export function canPlace(state: GameState, kind: PlantKind, row: number, col: number): boolean {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;
  if (!isPlantUnlocked(kind, state.waveIndex)) return false;
  if (state.cooldowns[kind] > 0) return false;
  if (state.sun < PLANTS[kind].cost) return false;
  if (state.plants.some((p) => p.row === row && p.col === col)) return false;
  return true;
}
