import type { PlantDef, PlantKind } from '../engine/types';

export const PLANTS: Record<PlantKind, PlantDef> = {
  sunflower: {
    kind: 'sunflower',
    name: 'Tournesol',
    cost: 50,
    maxHp: 100,
    cooldownMs: 7500,
    sunProduceMs: 12000,
    sunProduceAmount: 25,
    color: '#f5d142',
    emoji: '🌻'
  },
  peashooter: {
    kind: 'peashooter',
    name: 'Lance-pois',
    cost: 100,
    maxHp: 100,
    cooldownMs: 7500,
    shootIntervalMs: 1500,
    projectileDamage: 20,
    color: '#3fa34d',
    emoji: '🌱'
  },
  snowpea: {
    kind: 'snowpea',
    name: 'Pois congelé',
    cost: 175,
    maxHp: 100,
    cooldownMs: 7500,
    shootIntervalMs: 1500,
    projectileDamage: 20,
    slowOnHitMs: 4000,
    color: '#7fc8e8',
    emoji: '❄️'
  },
  repeater: {
    kind: 'repeater',
    name: 'Répéteur',
    cost: 200,
    maxHp: 100,
    cooldownMs: 7500,
    shootIntervalMs: 1500,
    projectileDamage: 20,
    multiShot: 2,
    color: '#2f7a3a',
    emoji: '🌿'
  },
  wallnut: {
    kind: 'wallnut',
    name: 'Noix',
    cost: 50,
    maxHp: 600,
    cooldownMs: 20000,
    color: '#a87238',
    emoji: '🥥'
  },
  cherrybomb: {
    kind: 'cherrybomb',
    name: 'Cerise-bombe',
    cost: 150,
    maxHp: 9999,
    cooldownMs: 30000,
    fuseMs: 1200,
    explodeDamage: 1800,
    explodeRadius: 1,
    color: '#d23a3a',
    emoji: '🍒'
  },
  potatomine: {
    kind: 'potatomine',
    name: 'Patate-mine',
    cost: 25,
    maxHp: 200,
    cooldownMs: 20000,
    armMs: 14000,
    explodeDamage: 1800,
    explodeRadius: 0,
    color: '#b08a55',
    emoji: '🥔'
  }
};

export const PLANT_ORDER: PlantKind[] = [
  'sunflower',
  'peashooter',
  'snowpea',
  'repeater',
  'wallnut',
  'cherrybomb',
  'potatomine'
];
