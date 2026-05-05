import type { ZombieDef, ZombieKind } from '../engine/types';

export const ZOMBIES: Record<ZombieKind, ZombieDef> = {
  // ─── Tier 1 — Sortie de tombe ──────────────────────────────
  normal: {
    kind: "normal",
    name: "Zombie",
    tier: 1,
    maxHp: 100,
    speed: 0.18,
    damagePerSecond: 50,
    color: "#7a8c5c",
    emoji: "🧟",
  },
  cone: {
    kind: "cone",
    name: "Zombie cône",
    tier: 1,
    maxHp: 240,
    speed: 0.16,
    damagePerSecond: 55,
    color: "#c46a2a",
    emoji: "🧟‍♂️",
  },

  // ─── Tier 2 — Énervé ───────────────────────────────────────
  bucket: {
    kind: "bucket",
    name: "Zombie seau",
    tier: 2,
    maxHp: 700,
    speed: 0.14,
    damagePerSecond: 60,
    color: "#9aa6b3",
    emoji: "🧛🏻",
  },
  runner: {
    kind: "runner",
    name: "Zombie sprinteur",
    tier: 2,
    maxHp: 90,
    speed: 0.34,
    damagePerSecond: 60,
    color: "#d04a4a",
    emoji: "🏃",
  },

  // ─── Tier 3 — Très énervé ──────────────────────────────────
  pole: {
    kind: "pole",
    name: "Zombie perche",
    tier: 3,
    maxHp: 240,
    speed: 0.28,
    damagePerSecond: 70,
    color: "#3aa0d4",
    emoji: "🤸",
  },
  dancer: {
    kind: "dancer",
    name: "Zombie disco",
    tier: 3,
    maxHp: 420,
    speed: 0.22,
    damagePerSecond: 80,
    hpRegenPerSec: 10,
    color: "#c43ad4",
    emoji: "🕺",
  },

  // ─── Tier 4 — En furie ─────────────────────────────────────
  gargantuan: {
    kind: "gargantuan",
    name: "Zombie colosse",
    tier: 4,
    maxHp: 2600,
    speed: 0.1,
    damagePerSecond: 200,
    color: "#5a3a78",
    emoji: "👹",
  },
  brain: {
    kind: "brain",
    name: "Zombie cerveau",
    tier: 4,
    maxHp: 1500,
    speed: 0.2,
    damagePerSecond: 130,
    hpRegenPerSec: 30,
    color: "#d46a8a",
    emoji: "🧠",
  },
};
