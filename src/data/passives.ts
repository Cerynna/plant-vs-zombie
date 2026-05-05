import type { PassiveId, PassiveLevel } from '../engine/types';

export interface PassiveDef {
  id: PassiveId;
  name: string;
  emoji: string;
  description: string;
  /** Cost per level, length defines max level */
  costs: number[];
}

export const PASSIVES: Record<PassiveId, PassiveDef> = {
  autoCollect: {
    id: 'autoCollect',
    name: 'Aimant à soleil',
    emoji: '🧲',
    description:
      'Réduit le délai avant qu’un soleil non collecté soit ramassé automatiquement (30s → 20s → 10s → 5s).',
    costs: [1, 2, 3, 4]
  },
  sunYield: {
    id: 'sunYield',
    name: 'Tournesols rayonnants',
    emoji: '☀️',
    description:
      'Tournesols et soleils du ciel donnent plus (+10% / +25% / +50% / +100%).',
    costs: [1, 2, 3, 4]
  },
  startingSun: {
    id: 'startingSun',
    name: 'Cagnotte initiale',
    emoji: '💰',
    description: 'Soleil supplémentaire au démarrage (+50 / +125 / +250 / +500).',
    costs: [1, 2, 2, 3]
  },
  fastShoot: {
    id: 'fastShoot',
    name: 'Cadence améliorée',
    emoji: '⚡',
    description:
      'Réduit l’intervalle entre les tirs des plantes shooter (-10% / -20% / -30% / -45%).',
    costs: [1, 2, 3, 4]
  },
  strongPea: {
    id: 'strongPea',
    name: 'Pois renforcés',
    emoji: '💥',
    description: 'Augmente les dégâts des projectiles (+15% / +30% / +50% / +75%).',
    costs: [1, 2, 3, 4]
  },
  toughPlants: {
    id: 'toughPlants',
    name: 'Plantes coriaces',
    emoji: '🛡️',
    description:
      'Augmente les PV de toutes les plantes posées (+25% / +50% / +100% / +200%).',
    costs: [1, 2, 3, 4]
  },
  cooldownCut: {
    id: 'cooldownCut',
    name: 'Replantation rapide',
    emoji: '⏱️',
    description:
      'Réduit les cooldowns de pose des cartes (-10% / -25% / -40% / -55%).',
    costs: [1, 2, 3, 4]
  },
  longFreeze: {
    id: 'longFreeze',
    name: 'Gel persistant',
    emoji: '❄️',
    description:
      'Augmente la durée du ralentissement du pois congelé (+25% / +50% / +100% / +200%).',
    costs: [1, 1, 2, 2]
  },
  fastMine: {
    id: 'fastMine',
    name: 'Mines réactives',
    emoji: '💣',
    description:
      'Réduit le délai d’armement des patates-mines (-25% / -50% / -75% / -90%).',
    costs: [1, 2, 2, 3]
  }
};

export const PASSIVE_ORDER: PassiveId[] = [
  'autoCollect',
  'sunYield',
  'startingSun',
  'fastShoot',
  'strongPea',
  'toughPlants',
  'cooldownCut',
  'longFreeze',
  'fastMine'
];

/** Multipliers/values per passive level. Index 0 = no level (base). */
const PASSIVE_VALUES = {
  autoCollectMs: [30000, 20000, 10000, 5000, 5000], // level 0..4 (cap)
  sunYieldMul: [1, 1.1, 1.25, 1.5, 2],
  startingSunBonus: [0, 50, 125, 250, 500],
  fastShootMul: [1, 0.9, 0.8, 0.7, 0.55],
  strongPeaMul: [1, 1.15, 1.3, 1.5, 1.75],
  toughPlantsMul: [1, 1.25, 1.5, 2, 3],
  cooldownCutMul: [1, 0.9, 0.75, 0.6, 0.45],
  longFreezeMul: [1, 1.25, 1.5, 2, 3],
  fastMineMul: [1, 0.75, 0.5, 0.25, 0.1]
} as const;

export function passiveLevel(
  passives: Record<PassiveId, PassiveLevel>,
  id: PassiveId
): PassiveLevel {
  return (passives[id] ?? 0) as PassiveLevel;
}

export function passiveMaxLevel(id: PassiveId): number {
  return PASSIVES[id].costs.length;
}

export function nextPassiveCost(
  passives: Record<PassiveId, PassiveLevel>,
  id: PassiveId
): number | null {
  const lvl = passiveLevel(passives, id);
  if (lvl >= passiveMaxLevel(id)) return null;
  return PASSIVES[id].costs[lvl];
}

// ---- Effect getters used by the engine ----

export function effAutoCollectMs(p: Record<PassiveId, PassiveLevel>): number {
  return PASSIVE_VALUES.autoCollectMs[passiveLevel(p, 'autoCollect')];
}
export function effSunYieldMul(p: Record<PassiveId, PassiveLevel>): number {
  return PASSIVE_VALUES.sunYieldMul[passiveLevel(p, 'sunYield')];
}
export function effStartingSunBonus(p: Record<PassiveId, PassiveLevel>): number {
  return PASSIVE_VALUES.startingSunBonus[passiveLevel(p, 'startingSun')];
}
export function effFastShootMul(p: Record<PassiveId, PassiveLevel>): number {
  return PASSIVE_VALUES.fastShootMul[passiveLevel(p, 'fastShoot')];
}
export function effStrongPeaMul(p: Record<PassiveId, PassiveLevel>): number {
  return PASSIVE_VALUES.strongPeaMul[passiveLevel(p, 'strongPea')];
}
export function effToughPlantsMul(p: Record<PassiveId, PassiveLevel>): number {
  return PASSIVE_VALUES.toughPlantsMul[passiveLevel(p, 'toughPlants')];
}
export function effCooldownCutMul(p: Record<PassiveId, PassiveLevel>): number {
  return PASSIVE_VALUES.cooldownCutMul[passiveLevel(p, 'cooldownCut')];
}
export function effLongFreezeMul(p: Record<PassiveId, PassiveLevel>): number {
  return PASSIVE_VALUES.longFreezeMul[passiveLevel(p, 'longFreeze')];
}
export function effFastMineMul(p: Record<PassiveId, PassiveLevel>): number {
  return PASSIVE_VALUES.fastMineMul[passiveLevel(p, 'fastMine')];
}

export function emptyPassives(): Record<PassiveId, PassiveLevel> {
  const obj = {} as Record<PassiveId, PassiveLevel>;
  for (const id of PASSIVE_ORDER) obj[id] = 0;
  return obj;
}
