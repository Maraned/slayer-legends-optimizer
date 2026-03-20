/**
 * Weapon tier progression from lowest (Common 4) to highest (Immortal).
 * ~17 tiers as represented in the EQUIPMENT sheet tier column.
 */
export enum WeaponTier {
  Common4 = 'Common 4',
  Common3 = 'Common 3',
  Common2 = 'Common 2',
  Common1 = 'Common 1',
  Uncommon3 = 'Uncommon 3',
  Uncommon2 = 'Uncommon 2',
  Uncommon1 = 'Uncommon 1',
  Rare2 = 'Rare 2',
  Rare1 = 'Rare 1',
  Epic2 = 'Epic 2',
  Epic1 = 'Epic 1',
  Unique = 'Unique',
  Legend = 'Legend',
  Mythic = 'Mythic',
  Ancient = 'Ancient',
  Celestial = 'Celestial',
  Immortal = 'Immortal',
}

/**
 * A single weapon row from the EQUIPMENT sheet.
 */
export interface Weapon {
  /** Weapon name / identifier */
  name: string;
  /** Rarity tier of the weapon */
  tier: WeaponTier;
  /** Whether the player owns this weapon */
  owned: boolean;
  /** Whether this weapon is currently equipped */
  equipped: boolean;
  /** Current enhancement level */
  enhanceLevel: number;
  /** Maximum enhancement level for this tier */
  maxLevel: number;
  /** Effect active while weapon is equipped */
  equipEffect: string;
  /** Effect granted from owning the weapon (collection bonus) */
  ownedEffect: string;
  /** Whether this weapon has a crit hit bonus */
  critHit: boolean;
}

/**
 * An individual effect entry on a Soul Weapon.
 */
export interface SoulWeaponEffect {
  /** Description of the effect */
  description: string;
  /** Numeric value of the effect (percentage or flat), if applicable */
  value?: number;
  /** Engraving progress toward unlocking this effect (0–100) */
  engravingProgress: number;
}

/**
 * Elemental affinity of a soul weapon.
 */
export type SoulElement = 'Fire' | 'Water' | 'Earth' | 'Wind' | 'Light' | 'Dark';

/**
 * The Soul Weapon section of the EQUIPMENT sheet.
 */
export interface SoulWeapon {
  /** Soul Weapon name */
  name: string;
  /** Elemental affinity */
  element?: SoulElement;
  /** Engraving progress toward the next effect unlock (0–100 or raw count) */
  engravingProgress: number;
  /** Unlocked effects from engraving */
  effects: SoulWeaponEffect[];
}

/**
 * The three top-level groupings of accessories in the EQUIPMENT sheet.
 */
export type AccessoryCategory = 'class' | 'relic' | 'accessory';

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
 * A single accessory row from the EQUIPMENT sheet.
 */
export interface Accessory {
  /** Accessory name / identifier */
  name: string;
  /** Which grouping this accessory belongs to */
  category: AccessoryCategory;
  /** Whether the player owns this accessory */
  owned: boolean;
  /** Current upgrade/enhancement level */
  level: number;
  /** Stat this accessory boosts */
  bonusType?: AccessoryBonusType;
  /** Stat bonus or description granted by this accessory */
  effect: string;
}

/**
 * One row of the level multiplier table (1,400 rows, levels 1–1400).
 * Multipliers are applied to base stats at each enhancement level.
 */
export interface LevelMultiplier {
  /** Enhancement level (1–1400) */
  level: number;
  /** Attack multiplier at this level (e.g. 2.5 = 2.5× base ATK) */
  atkMultiplier: number;
  /** HP multiplier at this level */
  hpMultiplier: number;
  /** Gold required to enhance from (level − 1) to this level */
  goldCost: number;
}

/**
 * Threshold band inside the cost-factor table.
 */
export interface CostThreshold {
  /** First enhancement level in this band (inclusive) */
  fromLevel: number;
  /** Last enhancement level in this band (inclusive) */
  toLevel: number;
  /** Extra gold multiplier applied within this band */
  goldMultiplier: number;
}

/**
 * Global scaling parameters from EQUIPMENT DATA cost factor table.
 */
export interface CostFactors {
  /** Gold cost at enhancement level 1 */
  baseGoldCost: number;
  /** Per-level multiplicative growth rate for gold (e.g. 1.05 = +5% / level) */
  goldGrowthRate: number;
  /** Level bands where cost scaling steps up */
  thresholds: CostThreshold[];
}

/**
 * Full equipment state corresponding to the EQUIPMENT sheet (user data).
 */
export interface EquipmentState {
  /** All weapons (owned and unowned) */
  weapons: Weapon[];
  /** The player's Soul Weapon */
  soulWeapon: SoulWeapon;
  /** All accessories across all categories */
  accessories: Accessory[];
  /** Current Awakened Orr enhancement level */
  awakenedOrrLevel: number;
}

/**
 * A soul weapon entry from the game data (equipment.json).
 */
export interface SoulWeaponData {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Elemental affinity */
  element: SoulElement;
  /** Rarity tier label (e.g. "Epic", "Legendary", "Mythic") */
  tier: string;
  /** Base damage stat */
  baseDamage: number;
  /** Crit rate bonus % */
  critRateBonus: number;
  /** Crit damage bonus % */
  critDmgBonus: number;
  /** Element damage bonus % */
  elementBonus: number;
  /** Special effect description */
  specialEffect: string;
  /** How to obtain this soul weapon */
  acquisitionMethod: string;
}

/**
 * Root shape of the EQUIPMENT_DATA JSON file (game data).
 */
export interface EquipmentData {
  /** Semantic version of this data file (e.g. "1.0.0"). */
  dataVersion: string;
  /** All available soul weapons from Soul Dungeon */
  soulWeapons: SoulWeaponData[];
  /** Sorted ascending by level; contains entries for levels 1–1400 */
  levelMultipliers: LevelMultiplier[];
  costFactors: CostFactors;
}
