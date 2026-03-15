/**
 * generate-cube-optimizer-data.mjs
 *
 * Generates src/data/cube-optimizer-data.json
 *
 * Source: CUBE OPTIMIZER sheet / Cube_Optimizer_Data
 *
 * The Cube Optimizer helps players determine the optimal weapon and class
 * enhancement targets to maximise CRIT DMG efficiency per cube spent.
 *
 * Data sections:
 *   WEAPONS  – 17 weapon tier entries (Common 4 → Immortal) with per-level
 *              cube costs and CRIT DMG bonuses.
 *   CLASSES  – 8 character classes available for cube enhancement, each with
 *              per-level ATK and CRIT DMG bonuses and cube costs.
 *   CUBE_COST_FACTORS – global scaling parameters used by the optimizer
 *                       calculation engine (3.8.x).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, '../src/data/cube-optimizer-data.json');

// ─── Weapon tiers (matches WeaponTier enum in src/types/equipment.ts) ──────

// Each tier: { id, name, tier (1-17), maxLevel, baseAtk,
//              critDmgBonusPct (total when fully owned),
//              cubeCostBase (cubes for level 1), cubeCostGrowthRate }
const WEAPON_TIERS = [
  { id: 'Common4',   name: 'Common 4',   tier: 1,  maxLevel: 10,  baseAtk: 100,       critDmgBonusPct: 0.5,  cubeCostBase: 1,    cubeCostGrowthRate: 1.05 },
  { id: 'Common3',   name: 'Common 3',   tier: 2,  maxLevel: 10,  baseAtk: 250,       critDmgBonusPct: 0.5,  cubeCostBase: 2,    cubeCostGrowthRate: 1.05 },
  { id: 'Common2',   name: 'Common 2',   tier: 3,  maxLevel: 10,  baseAtk: 600,       critDmgBonusPct: 1.0,  cubeCostBase: 4,    cubeCostGrowthRate: 1.05 },
  { id: 'Common1',   name: 'Common 1',   tier: 4,  maxLevel: 20,  baseAtk: 1400,      critDmgBonusPct: 1.0,  cubeCostBase: 8,    cubeCostGrowthRate: 1.06 },
  { id: 'Uncommon3', name: 'Uncommon 3', tier: 5,  maxLevel: 20,  baseAtk: 3200,      critDmgBonusPct: 1.5,  cubeCostBase: 15,   cubeCostGrowthRate: 1.06 },
  { id: 'Uncommon2', name: 'Uncommon 2', tier: 6,  maxLevel: 20,  baseAtk: 7500,      critDmgBonusPct: 1.5,  cubeCostBase: 28,   cubeCostGrowthRate: 1.07 },
  { id: 'Uncommon1', name: 'Uncommon 1', tier: 7,  maxLevel: 20,  baseAtk: 17000,     critDmgBonusPct: 2.0,  cubeCostBase: 50,   cubeCostGrowthRate: 1.07 },
  { id: 'Rare2',     name: 'Rare 2',     tier: 8,  maxLevel: 30,  baseAtk: 40000,     critDmgBonusPct: 2.0,  cubeCostBase: 90,   cubeCostGrowthRate: 1.08 },
  { id: 'Rare1',     name: 'Rare 1',     tier: 9,  maxLevel: 30,  baseAtk: 95000,     critDmgBonusPct: 3.0,  cubeCostBase: 160,  cubeCostGrowthRate: 1.08 },
  { id: 'Epic2',     name: 'Epic 2',     tier: 10, maxLevel: 40,  baseAtk: 220000,    critDmgBonusPct: 3.0,  cubeCostBase: 280,  cubeCostGrowthRate: 1.09 },
  { id: 'Epic1',     name: 'Epic 1',     tier: 11, maxLevel: 40,  baseAtk: 520000,    critDmgBonusPct: 4.0,  cubeCostBase: 500,  cubeCostGrowthRate: 1.09 },
  { id: 'Unique',    name: 'Unique',     tier: 12, maxLevel: 50,  baseAtk: 1200000,   critDmgBonusPct: 5.0,  cubeCostBase: 900,  cubeCostGrowthRate: 1.10 },
  { id: 'Legend',    name: 'Legend',     tier: 13, maxLevel: 60,  baseAtk: 2800000,   critDmgBonusPct: 6.0,  cubeCostBase: 1600, cubeCostGrowthRate: 1.10 },
  { id: 'Mythic',    name: 'Mythic',     tier: 14, maxLevel: 70,  baseAtk: 6500000,   critDmgBonusPct: 8.0,  cubeCostBase: 2800, cubeCostGrowthRate: 1.11 },
  { id: 'Ancient',   name: 'Ancient',    tier: 15, maxLevel: 80,  baseAtk: 15000000,  critDmgBonusPct: 10.0, cubeCostBase: 5000, cubeCostGrowthRate: 1.12 },
  { id: 'Celestial', name: 'Celestial',  tier: 16, maxLevel: 90,  baseAtk: 35000000,  critDmgBonusPct: 12.0, cubeCostBase: 9000, cubeCostGrowthRate: 1.13 },
  { id: 'Immortal',  name: 'Immortal',   tier: 17, maxLevel: 100, baseAtk: 80000000,  critDmgBonusPct: 15.0, cubeCostBase: 16000, cubeCostGrowthRate: 1.15 },
];

// ─── Character classes available in the Cube Optimizer ─────────────────────

// Each class contributes ATK and CRIT DMG bonuses when owned and enhanced.
// cubeCostBase: cubes for level 1; cubeCostGrowthRate: multiplicative per level.
const CLASSES = [
  {
    id: 'warrior',
    name: 'Warrior',
    element: 'Physical',
    description: 'A stalwart melee fighter who excels at delivering powerful blows.',
    maxLevel: 100,
    atkBonusPctPerLevel: 0.10,
    critDmgBonusPctPerLevel: 0.05,
    cubeCostBase: 10,
    cubeCostGrowthRate: 1.08,
  },
  {
    id: 'archer',
    name: 'Archer',
    element: 'Wind',
    description: 'A precise ranged attacker with high critical hit potential.',
    maxLevel: 100,
    atkBonusPctPerLevel: 0.08,
    critDmgBonusPctPerLevel: 0.10,
    cubeCostBase: 10,
    cubeCostGrowthRate: 1.08,
  },
  {
    id: 'mage',
    name: 'Mage',
    element: 'Fire',
    description: 'A powerful spellcaster who channels elemental forces for massive damage.',
    maxLevel: 100,
    atkBonusPctPerLevel: 0.12,
    critDmgBonusPctPerLevel: 0.04,
    cubeCostBase: 10,
    cubeCostGrowthRate: 1.08,
  },
  {
    id: 'assassin',
    name: 'Assassin',
    element: 'Dark',
    description: 'A swift shadow operative who strikes from the darkness for lethal crits.',
    maxLevel: 100,
    atkBonusPctPerLevel: 0.07,
    critDmgBonusPctPerLevel: 0.12,
    cubeCostBase: 12,
    cubeCostGrowthRate: 1.09,
  },
  {
    id: 'knight',
    name: 'Knight',
    element: 'Physical',
    description: 'An armoured vanguard who balances defence with sustained ATK output.',
    maxLevel: 100,
    atkBonusPctPerLevel: 0.09,
    critDmgBonusPctPerLevel: 0.06,
    cubeCostBase: 10,
    cubeCostGrowthRate: 1.08,
  },
  {
    id: 'shaman',
    name: 'Shaman',
    element: 'Earth',
    description: 'A nature-attuned combatant who empowers allies and curses enemies.',
    maxLevel: 100,
    atkBonusPctPerLevel: 0.06,
    critDmgBonusPctPerLevel: 0.08,
    cubeCostBase: 10,
    cubeCostGrowthRate: 1.08,
  },
  {
    id: 'berserker',
    name: 'Berserker',
    element: 'Fire',
    description: 'A rage-fuelled brawler who sacrifices defence for explosive damage.',
    maxLevel: 100,
    atkBonusPctPerLevel: 0.14,
    critDmgBonusPctPerLevel: 0.03,
    cubeCostBase: 15,
    cubeCostGrowthRate: 1.10,
  },
  {
    id: 'phantom',
    name: 'Phantom',
    element: 'Light',
    description: 'A spectral striker whose ethereal attacks pierce enemy defences.',
    maxLevel: 100,
    atkBonusPctPerLevel: 0.08,
    critDmgBonusPctPerLevel: 0.09,
    cubeCostBase: 12,
    cubeCostGrowthRate: 1.09,
  },
];

// ─── Global cube cost scaling parameters ───────────────────────────────────

const CUBE_COST_FACTORS = {
  /**
   * Weapon enhancement cost formula:
   *   cubeCost(level) = round(cubeCostBase * cubeCostGrowthRate ^ (level - 1))
   * where cubeCostBase and cubeCostGrowthRate are defined per weapon tier.
   */
  weaponCostFormula: 'round(cubeCostBase * pow(cubeCostGrowthRate, level - 1))',

  /**
   * Class enhancement cost formula:
   *   cubeCost(level) = round(cubeCostBase * cubeCostGrowthRate ^ (level - 1))
   * where cubeCostBase and cubeCostGrowthRate are defined per class.
   */
  classCostFormula: 'round(cubeCostBase * pow(cubeCostGrowthRate, level - 1))',

  /**
   * CRIT DMG efficiency score formula used by the optimizer (issue 3.8.1):
   *   efficiency = critDmgGain / totalCubeCost
   * where critDmgGain is the CRIT DMG % increase from the next enhancement
   * and totalCubeCost is the sum of cubes required to reach that level.
   */
  efficiencyFormula: 'critDmgGain / totalCubeCost',

  /**
   * Milestone levels at which weapon enhancement grants additional bonus
   * CRIT DMG beyond the linear per-level gain.
   */
  weaponMilestoneLevels: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],

  /** Extra CRIT DMG % bonus granted at each milestone level per weapon tier. */
  weaponMilestoneCritDmgBonus: 0.5,
};

// ─── Build per-level cube cost tables ──────────────────────────────────────

/**
 * Generates an array of cube costs for levels 1..maxLevel.
 * cost[i] = cubes required to enhance FROM level i TO level i+1
 * (i.e., the cost of reaching level i+1).
 */
function buildCubeCostTable(cubeCostBase, cubeCostGrowthRate, maxLevel) {
  const costs = [];
  for (let level = 1; level <= maxLevel; level++) {
    costs.push(Math.round(cubeCostBase * Math.pow(cubeCostGrowthRate, level - 1)));
  }
  return costs;
}

// ─── Assemble output ────────────────────────────────────────────────────────

const WEAPONS = WEAPON_TIERS.map((wt) => ({
  id: wt.id,
  name: wt.name,
  tier: wt.tier,
  maxLevel: wt.maxLevel,
  baseAtk: wt.baseAtk,
  critDmgBonusPct: wt.critDmgBonusPct,
  cubeCostBase: wt.cubeCostBase,
  cubeCostGrowthRate: wt.cubeCostGrowthRate,
  cubeCostPerLevel: buildCubeCostTable(wt.cubeCostBase, wt.cubeCostGrowthRate, wt.maxLevel),
}));

const CLASSES_OUTPUT = CLASSES.map((cls) => ({
  id: cls.id,
  name: cls.name,
  element: cls.element,
  description: cls.description,
  maxLevel: cls.maxLevel,
  atkBonusPctPerLevel: cls.atkBonusPctPerLevel,
  critDmgBonusPctPerLevel: cls.critDmgBonusPctPerLevel,
  cubeCostBase: cls.cubeCostBase,
  cubeCostGrowthRate: cls.cubeCostGrowthRate,
  cubeCostPerLevel: buildCubeCostTable(cls.cubeCostBase, cls.cubeCostGrowthRate, cls.maxLevel),
}));

const output = {
  WEAPONS,
  CLASSES: CLASSES_OUTPUT,
  CUBE_COST_FACTORS,
};

fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2));
console.log(`Written ${OUTPUT}`);
console.log(`  WEAPONS: ${WEAPONS.length} entries`);
console.log(`  CLASSES: ${CLASSES_OUTPUT.length} entries`);
console.log(`  CUBE_COST_FACTORS: included`);
