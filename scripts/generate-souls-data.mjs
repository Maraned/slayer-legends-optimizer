/**
 * generate-souls-data.mjs
 *
 * Generates src/data/souls-data.json (SOULSDATA) for the Soul Dungeon system.
 *
 * Soul Dungeon structure:
 *  - 130 stages total, grouped into 7 tiers
 *  - Each stage has a single boss fight scaled by stage number
 *  - Souls currency and gold/EXP rewards scale with stage
 *  - 12 milestone stages unlock Soul Weapons (matching equipment.json soulWeapons)
 *
 * Soul Weapon milestones (from equipment.json):
 *  Stage  30 → fire_blade       (Inferno Blade,      Epic)
 *  Stage  35 → water_trident    (Tidal Trident,       Epic)
 *  Stage  40 → earth_hammer     (Granite Hammer,      Epic)
 *  Stage  45 → wind_daggers     (Gale Daggers,        Epic)
 *  Stage  70 → fire_greatsword  (Volcanic Greatsword, Legendary)
 *  Stage  75 → water_bow        (Abyssal Bow,         Legendary)
 *  Stage  80 → earth_axe        (Tectonic Axe,        Legendary)
 *  Stage  85 → wind_scythe      (Cyclone Scythe,      Legendary)
 *  Stage  90 → light_sword      (Radiant Sword,       Legendary)
 *  Stage  95 → dark_staff       (Void Staff,          Legendary)
 *  Stage 120 → light_spear      (Divine Spear,        Mythic)
 *  Stage 130 → dark_scythe      (Reaper Scythe,       Mythic)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, '../src/data/souls-data.json');

// ── Tier definitions ──────────────────────────────────────────────────────────
const TIERS = [
  { name: 'Novice',       minStage: 1,   maxStage: 10,  energyCost: 3,  powerBase: 500   },
  { name: 'Apprentice',   minStage: 11,  maxStage: 30,  energyCost: 4,  powerBase: 2000  },
  { name: 'Intermediate', minStage: 31,  maxStage: 50,  energyCost: 5,  powerBase: 8000  },
  { name: 'Advanced',     minStage: 51,  maxStage: 70,  energyCost: 6,  powerBase: 25000 },
  { name: 'Expert',       minStage: 71,  maxStage: 90,  energyCost: 7,  powerBase: 80000 },
  { name: 'Master',       minStage: 91,  maxStage: 120, energyCost: 8,  powerBase: 200000},
  { name: 'Grandmaster',  minStage: 121, maxStage: 130, energyCost: 10, powerBase: 600000},
];

// ── Soul Weapon milestones ────────────────────────────────────────────────────
const SOUL_WEAPON_MILESTONES = {
  30:  { id: 'fire_blade',      element: 'Fire'  },
  35:  { id: 'water_trident',   element: 'Water' },
  40:  { id: 'earth_hammer',    element: 'Earth' },
  45:  { id: 'wind_daggers',    element: 'Wind'  },
  70:  { id: 'fire_greatsword', element: 'Fire'  },
  75:  { id: 'water_bow',       element: 'Water' },
  80:  { id: 'earth_axe',       element: 'Earth' },
  85:  { id: 'wind_scythe',     element: 'Wind'  },
  90:  { id: 'light_sword',     element: 'Light' },
  95:  { id: 'dark_staff',      element: 'Dark'  },
  120: { id: 'light_spear',     element: 'Light' },
  130: { id: 'dark_scythe',     element: 'Dark'  },
};

// ── Stage name templates by tier ─────────────────────────────────────────────
const TIER_STAGE_NAMES = {
  Novice:       'Shadow Lair',
  Apprentice:   'Cursed Depths',
  Intermediate: 'Phantom Halls',
  Advanced:     'Void Chambers',
  Expert:       'Abyss Gate',
  Master:       'Soul Throne',
  Grandmaster:  'Eternal Darkness',
};

// Roman numeral helper (1–30 is more than enough)
function toRoman(n) {
  const vals = [10,'X',9,'IX',5,'V',4,'IV',1,'I'];
  let result = '';
  for (let i = 0; i < vals.length; i += 2) {
    while (n >= vals[i]) { result += vals[i + 1]; n -= vals[i]; }
  }
  return result;
}

// ── Element assignment ────────────────────────────────────────────────────────
// Milestone stages inherit their soul weapon's element.
// Non-milestone stages cycle through elements in 5-stage blocks.
const ELEMENT_CYCLE = ['Fire', 'Water', 'Earth', 'Wind', 'Light', 'Dark'];

function elementForStage(stage) {
  if (SOUL_WEAPON_MILESTONES[stage]) return SOUL_WEAPON_MILESTONES[stage].element;
  // Cycle elements every 5 stages (0-indexed block)
  const block = Math.floor((stage - 1) / 5);
  return ELEMENT_CYCLE[block % ELEMENT_CYCLE.length];
}

// ── Boss definitions per element ─────────────────────────────────────────────
const BOSSES_BY_ELEMENT = {
  Fire:  ['Inferno Wraith', 'Flame Reaper', 'Cinder Spectre', 'Blaze Phantom', 'Pyre Shade'],
  Water: ['Frost Specter',  'Glacial Wraith','Tide Phantom',   'Cryo Reaper',   'Abyssal Shade'],
  Earth: ['Stone Specter',  'Granite Phantom','Boulder Wraith','Tectonic Reaper','Earthen Shade'],
  Wind:  ['Gale Specter',   'Storm Phantom', 'Cyclone Wraith', 'Thunder Reaper', 'Sky Shade'],
  Light: ['Radiant Specter','Holy Phantom',  'Divine Wraith',  'Sacred Reaper',  'Celestial Shade'],
  Dark:  ['Shadow Specter', 'Void Phantom',  'Nightmare Wraith','Chaos Reaper',  'Soul Shade'],
};

function bossNameForStage(stage, element) {
  const pool = BOSSES_BY_ELEMENT[element];
  return pool[(stage - 1) % pool.length];
}

// ── Scaling helpers ───────────────────────────────────────────────────────────
function r(n) { return Math.round(n); }

/** Exponential scale: base × rate^(stage - 1) */
function expScale(base, stage, rate) {
  return r(base * Math.pow(rate, stage - 1));
}

function getTier(stage) {
  return TIERS.find(t => stage >= t.minStage && stage <= t.maxStage);
}

// ── Main generation ───────────────────────────────────────────────────────────
const TOTAL_STAGES = 130;

// Reward base values (scale exponentially with stage)
const SOULS_MIN_BASE  = 10;
const SOULS_MAX_BASE  = 20;
const GOLD_MIN_BASE   = 500;
const GOLD_MAX_BASE   = 1000;
const EXP_BASE        = 100;
const BOSS_HP_BASE    = 10000;
const BOSS_ATK_BASE   = 500;
const BOSS_DEF_BASE   = 200;
const REWARD_RATE     = 1.055;  // ~5.5% growth per stage
const STAT_RATE       = 1.060;  // ~6% growth per stage for boss stats
const POWER_RATE      = 1.065;  // ~6.5% growth for recommended power

const stages = [];

for (let stage = 1; stage <= TOTAL_STAGES; stage++) {
  const tier      = getTier(stage);
  const element   = elementForStage(stage);
  const milestone = SOUL_WEAPON_MILESTONES[stage] ?? null;

  // Stage display name: "<Tier Name> <Roman numeral within tier>"
  const stageWithinTier = stage - tier.minStage + 1;
  const name = `${TIER_STAGE_NAMES[tier.name]} ${toRoman(stageWithinTier)}`;

  // Recommended power scales from tier base, exponentially within the tier
  const tierOffset = stage - tier.minStage;
  const recommendedPower = r(tier.powerBase * Math.pow(POWER_RATE, tierOffset));

  // Reward scaling
  const soulsMin  = expScale(SOULS_MIN_BASE,  stage, REWARD_RATE);
  const soulsMax  = expScale(SOULS_MAX_BASE,  stage, REWARD_RATE);
  const goldMin   = expScale(GOLD_MIN_BASE,   stage, REWARD_RATE);
  const goldMax   = expScale(GOLD_MAX_BASE,   stage, REWARD_RATE);
  const expReward = expScale(EXP_BASE,        stage, REWARD_RATE);

  // Boss stats
  const bossHp  = expScale(BOSS_HP_BASE,  stage, STAT_RATE);
  const bossAtk = expScale(BOSS_ATK_BASE, stage, STAT_RATE);
  const bossDef = expScale(BOSS_DEF_BASE, stage, STAT_RATE);
  const bossName = bossNameForStage(stage, element);

  stages.push({
    stage,
    name,
    tier: tier.name,
    element,
    recommendedPower,
    energyCost: tier.energyCost,
    soulsReward: { min: soulsMin, max: soulsMax },
    goldReward:  { min: goldMin,  max: goldMax  },
    expReward,
    soulWeaponId: milestone ? milestone.id : null,
    boss: {
      name:    bossName,
      element,
      hp:      bossHp,
      atk:     bossAtk,
      def:     bossDef,
    },
  });
}

const output = { SOUL_DUNGEON: stages };

mkdirSync(join(__dirname, '../src/data'), { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));

console.log(`Generated ${stages.length} Soul Dungeon stages`);
console.log(
  `Soul weapon milestones: ${Object.keys(SOUL_WEAPON_MILESTONES).join(', ')}`
);
console.log(`Output: ${OUT_PATH}`);
