/**
 * Equipment tier quality levels, ordered from lowest to highest.
 * Source: EQUIPMENT sheet, TIER column.
 */
export type WeaponTierName =
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Epic'
  | 'Legendary'
  | 'Mythic'
  | 'Transcendent';

/**
 * A weapon tier row from the EQUIPMENT sheet.
 * Defines base stats and per-level scaling for each quality tier.
 */
export interface WeaponTier {
  /** Sequential tier number (1 = Common … 7 = Transcendent) */
  tier: number;
  /** Human-readable tier name */
  name: WeaponTierName;
  /** Hex colour used to represent this tier in UI */
  color: string;
  /** Base attack power before any enhancement */
  baseDamage: number;
  /** Flat attack added per enhancement level */
  damagePerLevel: number;
  /** Base HP contribution before any enhancement */
  baseHp: number;
  /** Flat HP added per enhancement level */
  hpPerLevel: number;
  /** Gold cost to craft / obtain (before level multiplier) */
  craftCost: number;
  /** Bonus multiplier applied to all stats for this tier */
  tierMultiplier: number;
}

/**
 * Elemental affinity of a soul weapon.
 */
export type SoulElement = 'Fire' | 'Water' | 'Earth' | 'Wind' | 'Light' | 'Dark';

/**
 * A soul weapon row from the SOUL_WEAPONS sheet.
 */
export interface SoulWeapon {
  /** Unique identifier (snake_case) */
  id: string;
  /** Display name */
  name: string;
  /** Elemental affinity */
  element: SoulElement;
  /** Quality tier of this soul weapon */
  tier: WeaponTierName;
  /** Base attack damage */
  baseDamage: number;
  /** Critical hit rate bonus (percentage points, e.g. 5 = +5%) */
  critRateBonus: number;
  /** Critical hit damage bonus (percentage points, e.g. 20 = +20%) */
  critDmgBonus: number;
  /** Elemental damage bonus when attacker matches element (percentage) */
  elementBonus: number;
  /** Short description of the unique special effect */
  specialEffect: string;
  /** How to acquire this soul weapon */
  acquisitionMethod: string;
}

/**
 * Equipment slot an accessory occupies.
 */
export type AccessorySlot = 'Ring' | 'Necklace' | 'Belt' | 'Earring' | 'Bracelet';

/**
 * Stat type boosted by an accessory.
 */
export type AccessoryBonusType =
  | 'ATK'
  | 'HP'
  | 'DEF'
  | 'Crit%'
  | 'CritDMG'
  | 'Gold'
  | 'EXP'
  | 'Dodge'
  | 'Accuracy';

/**
 * A single accessory row from the ACCESSORIES sheet.
 */
export interface Accessory {
  /** Unique identifier (snake_case) */
  id: string;
  /** Display name */
  name: string;
  /** Equipment slot this accessory fills */
  slot: AccessorySlot;
  /** Quality tier */
  tier: WeaponTierName;
  /** Stat this accessory boosts */
  bonusType: AccessoryBonusType;
  /**
   * Bonus amount.
   * Flat value when isPercent is false; percentage points when true.
   */
  bonusValue: number;
  /** Whether bonusValue is a percentage (true) or a flat amount (false) */
  isPercent: boolean;
  /** Gold cost to craft this accessory */
  craftCost: number;
}

/**
 * One row of the LEVEL_MULTIPLIERS sheet (1 400 rows, levels 1–1400).
 * Multipliers are applied to base stats at each enhancement level.
 */
export interface LevelMultiplier {
  /** Enhancement level (1–1400) */
  level: number;
  /** Attack multiplier at this level (e.g. 2.5 = 2.5× base ATK) */
  atkMultiplier: number;
  /** HP multiplier at this level */
  hpMultiplier: number;
  /** Defense multiplier at this level */
  defMultiplier: number;
  /** Gold required to enhance from (level − 1) to this level */
  goldCost: number;
  /** Crystals required to enhance from (level − 1) to this level */
  crystalCost: number;
}

/**
 * Threshold band inside the cost-factor table.
 * Within a band, costs are scaled by a fixed multiplier on top of the
 * per-level gold / crystal growth rates.
 */
export interface CostThreshold {
  /** First enhancement level in this band (inclusive) */
  fromLevel: number;
  /** Last enhancement level in this band (inclusive) */
  toLevel: number;
  /** Extra gold multiplier applied within this band */
  goldMultiplier: number;
  /** Extra crystal multiplier applied within this band */
  crystalMultiplier: number;
}

/**
 * Global scaling parameters from the COST_FACTORS sheet.
 * Used together with LevelMultiplier.goldCost / crystalCost for exact costs.
 */
export interface CostFactors {
  /** Gold cost at enhancement level 1 */
  baseGoldCost: number;
  /** Per-level multiplicative growth rate for gold (e.g. 1.05 = +5% / level) */
  goldGrowthRate: number;
  /** Crystal cost at enhancement level 1 */
  baseCrystalCost: number;
  /** Per-level multiplicative growth rate for crystals */
  crystalGrowthRate: number;
  /** Level bands where cost scaling steps up */
  thresholds: CostThreshold[];
}

/**
 * Root shape of the EQUIPMENT_DATA JSON file.
 */
export interface EquipmentData {
  weaponTiers: WeaponTier[];
  soulWeapons: SoulWeapon[];
  accessories: Accessory[];
  /** Sorted ascending by level; contains entries for levels 1–1400 */
  levelMultipliers: LevelMultiplier[];
  costFactors: CostFactors;
}
