export type PlantKind =
  | 'sunflower'
  | 'peashooter'
  | 'wallnut'
  | 'snowpea'
  | 'repeater'
  | 'cherrybomb'
  | 'potatomine';
export type ZombieKind =
  | 'normal'
  | 'cone'
  | 'bucket'
  | 'runner'
  | 'pole'
  | 'dancer'
  | 'gargantuan'
  | 'brain';

export interface PlantDef {
  kind: PlantKind;
  name: string;
  cost: number;
  maxHp: number;
  cooldownMs: number;
  /** Sunflower: produces sun every X ms */
  sunProduceMs?: number;
  sunProduceAmount?: number;
  /** Peashooter: shoots projectile every X ms when zombie in row */
  shootIntervalMs?: number;
  projectileDamage?: number;
  /** Snow pea: applies a slow effect to hit zombie (ms) */
  slowOnHitMs?: number;
  /** Repeater: number of peas per shot */
  multiShot?: number;
  /** Cherry bomb / potato mine: explosion damage and radius (cells) */
  explodeDamage?: number;
  explodeRadius?: number;
  /** Cherry bomb: fuse before exploding (ms) */
  fuseMs?: number;
  /** Potato mine: arming delay before it can detonate (ms) */
  armMs?: number;
  color: string;
  emoji: string;
}

export interface ZombieDef {
  kind: ZombieKind;
  name: string;
  maxHp: number;
  /** cells per second */
  speed: number;
  /** damage per second when eating a plant */
  damagePerSecond: number;
  /** Optional: hp regenerated per second (capped at maxHp) */
  hpRegenPerSec?: number;
  /** Tier label for HUD/wave naming (1..4) */
  tier?: 1 | 2 | 3 | 4;
  color: string;
  emoji: string;
}

export interface Plant {
  id: string;
  kind: PlantKind;
  row: number;
  col: number;
  hp: number;
  /** ms accumulator for next sun production */
  sunTimer: number;
  /** ms accumulator for next shot */
  shootTimer: number;
  /** ms accumulator for fuse / arming (cherry, potato) */
  lifeTimer: number;
  /** Potato mine ready to detonate */
  armed: boolean;
}

export interface Zombie {
  id: string;
  kind: ZombieKind;
  row: number;
  /** continuous column position; starts at COLS, walks toward 0 */
  x: number;
  hp: number;
  /** id of the plant currently being eaten, if any */
  eatingPlantId: string | null;
  /** Remaining slow duration in ms (snow pea) */
  slowMs: number;
}

export interface Projectile {
  id: string;
  row: number;
  /** continuous column position */
  x: number;
  damage: number;
  /** Slow effect duration applied on hit (snow pea) */
  slowMs?: number;
}

export interface SunToken {
  id: string;
  /** screen position in board cell units */
  row: number;
  col: number;
  value: number;
  /** ms remaining before disappearing */
  ttl: number;
}

export type FloatingTextKind = 'damage' | 'crit' | 'explode' | 'heal';

export interface FloatingText {
  id: string;
  /** board cell coords (continuous) */
  row: number;
  x: number;
  text: string;
  kind: FloatingTextKind;
  /** ms remaining */
  ttl: number;
  /** total ms lifetime, for animation progress */
  life: number;
}

export interface WaveSpawn {
  /** time offset (ms) from wave start */
  at: number;
  kind: ZombieKind;
  row?: number; // random if undefined
}

export interface WaveDef {
  id: number;
  name: string;
  spawns: WaveSpawn[];
  /** ms break before next wave starts after last zombie dead */
  postDelayMs: number;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'won' | 'lost';

export type PassiveId =
  | 'autoCollect'
  | 'sunYield'
  | 'startingSun'
  | 'fastShoot'
  | 'strongPea'
  | 'toughPlants'
  | 'cooldownCut'
  | 'longFreeze'
  | 'fastMine';

export type PassiveLevel = 0 | 1 | 2 | 3 | 4;

export interface GameState {
  version: number;
  status: GameStatus;
  speed: number;
  sun: number;
  passivePoints: number;
  passives: Record<PassiveId, PassiveLevel>;
  selectedPlant: PlantKind | null;
  shovelMode: boolean;
  cooldowns: Record<PlantKind, number>; // remaining ms
  plants: Plant[];
  zombies: Zombie[];
  projectiles: Projectile[];
  sunTokens: SunToken[];
  floatingTexts: FloatingText[];
  lawnmowers: boolean[]; // index = row, true if available
  waveIndex: number;
  waveTimer: number; // ms since current wave started
  waveSpawnCursor: number; // index of next spawn to trigger in current wave
  betweenWaves: boolean;
  betweenWavesTimer: number; // countdown ms before next wave
  skySunTimer: number;
  totalElapsedMs: number;
  rngSeed: number;
}
