import type { PlantKind } from '../engine/types';

/** Wave (1-based) at which each plant becomes available. */
export const PLANT_UNLOCK_WAVE: Record<PlantKind, number> = {
  sunflower: 1,
  peashooter: 1,
  snowpea: 6,
  wallnut: 11,
  cherrybomb: 16,
  repeater: 21,
  potatomine: 26
};

/** waveIndex is 0-based (state.waveIndex). */
export function isPlantUnlocked(kind: PlantKind, waveIndex: number): boolean {
  return waveIndex + 1 >= PLANT_UNLOCK_WAVE[kind];
}
