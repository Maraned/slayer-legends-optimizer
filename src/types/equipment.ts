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
}

/**
 * The Soul Weapon section of the EQUIPMENT sheet.
 */
export interface SoulWeapon {
  /** Soul Weapon name */
  name: string;
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
  /** Stat bonus or description granted by this accessory */
  effect: string;
}

/**
 * Full equipment state corresponding to the EQUIPMENT sheet.
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
