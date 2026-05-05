import type { WaveDef, WaveSpawn, ZombieKind } from "../engine/types";

const TOTAL_WAVES = 100;

// Tiny seeded PRNG so wave generation stays deterministic.
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Each entry: [zombie kind, wave it unlocks at, base spawn weight].
 * Weight is multiplied by a per-wave tier curve so newer kinds gradually
 * dominate older ones as the run progresses.
 */
const ZOMBIE_POOL: Array<{
  kind: ZombieKind;
  unlock: number;
  weight: number;
  tier: number;
}> = [
  { kind: "normal", unlock: 1, weight: 10, tier: 1 },
  { kind: "cone", unlock: 3, weight: 6, tier: 1 },
  { kind: "bucket", unlock: 8, weight: 5, tier: 2 },
  { kind: "runner", unlock: 13, weight: 4, tier: 2 },
  { kind: "pole", unlock: 20, weight: 4, tier: 3 },
  { kind: "dancer", unlock: 28, weight: 3, tier: 3 },
  { kind: "gargantuan", unlock: 38, weight: 1, tier: 4 },
  { kind: "brain", unlock: 60, weight: 2, tier: 4 },
];

function pickKind(r: () => number, waveId: number): ZombieKind {
  // Higher tiers gain weight as the wave id grows, while lower tiers fade.
  const entries = ZOMBIE_POOL.filter((e) => waveId >= e.unlock).map((e) => {
    const since = waveId - e.unlock;
    const tierBoost = 1 + since * 0.07; // newer kinds get heavier over time
    const tierFade = e.tier === 1 ? Math.max(0.4, 1 - waveId * 0.012) : 1;
    return { kind: e.kind, w: e.weight * tierBoost * tierFade };
  });
  const total = entries.reduce((sum, e) => sum + e.w, 0);
  let roll = r() * total;
  for (const e of entries) {
    roll -= e.w;
    if (roll <= 0) return e.kind;
  }
  return entries[entries.length - 1].kind;
}

function generateWave(id: number): WaveDef {
  const r = rng(0xc0ffee + id * 7919);

  // Difficulty curve — counts grow steadily and milestones spike.
  const isMilestone = id % 10 === 0;
  const isFinal = id === TOTAL_WAVES;
  const baseCount = 3 + Math.floor(id * 0.7);
  const milestoneBonus = isMilestone ? 6 + Math.floor(id / 10) : 0;
  const count = Math.min(40, baseCount + milestoneBonus);

  // Spawn pacing tightens with waves.
  const firstAt = id === 1 ? 15000 : Math.max(1500, 8000 - id * 90);
  const minGap = Math.max(800, 5500 - id * 60);
  const maxGap = Math.max(minGap + 700, 11000 - id * 110);

  const spawns: WaveSpawn[] = [];
  let t = firstAt;
  for (let i = 0; i < count; i++) {
    spawns.push({ at: Math.round(t), kind: pickKind(r, id) });
    t += minGap + r() * (maxGap - minGap);
  }

  // Boss waves: guarantee a gargantuan once unlocked.
  if (isMilestone && id >= 40) {
    spawns.push({ at: Math.round(t + 1200), kind: "gargantuan" });
  }

  // Tier label for the wave name.
  // const tierLabel =
  //   id >= 60
  //     ? "Apocalypse"
  //     : id >= 38
  //       ? "En furie"
  //       : id >= 20
  //         ? "Très énervés"
  //         : id >= 8
  //           ? "Énervés"
  //           : "Sortie de tombe";

  const name = `Vague ${id}`;

  // const name = isFinal
  //   ? 'Vague finale — Apocalypse'
  //   : isMilestone
  //     ? `Vague ${id} — Horde · ${tierLabel}`
  //     : `Vague ${id} · ${tierLabel}`;

  return {
    id,
    name,
    postDelayMs: isFinal
      ? 0
      : isMilestone
        ? 18000
        : Math.max(5000, 14000 - id * 100),
    spawns,
  };
}

export const WAVES: WaveDef[] = Array.from({ length: TOTAL_WAVES }, (_, i) =>
  generateWave(i + 1),
);
