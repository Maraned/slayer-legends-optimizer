/**
 * The four companion characters available in Slayer Legends.
 * Source: COMPANIONS sheet.
 */
export type CompanionName = 'Ellie' | 'Zeke' | 'Miho' | 'Luna';

/**
 * Elemental affinities that companions and skills can have.
 * Source: COMPANIONS sheet, ELEMENT column.
 */
export type Element = 'Fire' | 'Water' | 'Wind' | 'Earth' | 'Lightning';

/**
 * Stat buffs granted by companion advancement steps.
 * Source: COMPANIONS sheet, BUFF TYPE column in the advancement table.
 */
export type BuffType = 'Extra ATK' | 'Extra EXP' | 'Monster Gold' | 'Extra HP';

/**
 * Ordinal labels for the 14 advancement steps (1st through 14th).
 * Source: COMPANIONS sheet, STEP column.
 */
export type AdvancementStepOrdinal =
  | '1st'
  | '2nd'
  | '3rd'
  | '4th'
  | '5th'
  | '6th'
  | '7th'
  | '8th'
  | '9th'
  | '10th'
  | '11th'
  | '12th'
  | '13th'
  | '14th';

/**
 * A single row in the companion advancement table.
 * Each step unlocks a buff of a given type and magnitude.
 * Source: COMPANIONS sheet advancement table (14 rows per companion).
 */
export interface AdvancementStep {
  /** Ordinal position of this step (1st–14th) */
  step: AdvancementStepOrdinal;
  /** The stat category this step boosts */
  buffType: BuffType;
  /** The numeric bonus granted by this step (e.g. 5, 10, 0.02) */
  buffValue: number;
}

// ---------------------------------------------------------------------------
// Companion-specific special buffs
// ---------------------------------------------------------------------------

/**
 * Ellie's unique passive: Wind's Song.
 * Source: COMPANIONS sheet, Ellie special buff section.
 */
export interface EllieSpecialBuffs {
  /** Wind's Song bonus value */
  windsSong: number;
}

/**
 * Zeke's unique passives: Blade Dance, Wisdom, and Soul Catch.
 * Source: COMPANIONS sheet, Zeke special buff section.
 */
export interface ZekeSpecialBuffs {
  /** Blade Dance bonus value */
  bladeDance: number;
  /** Wisdom bonus value */
  wisdom: number;
  /** Soul Catch bonus value */
  soulCatch: number;
}

/**
 * Miho's unique passive: Red Greed.
 * Source: COMPANIONS sheet, Miho special buff section.
 */
export interface MihoSpecialBuffs {
  /** Red Greed bonus value */
  redGreed: number;
}

/**
 * Luna's unique passive: Deep Sea Song.
 * Source: COMPANIONS sheet, Luna special buff section.
 */
export interface LunaSpecialBuffs {
  /** Deep Sea Song bonus value */
  deepSeaSong: number;
}

/**
 * Discriminated union of per-companion special buffs.
 * Use `companion` to narrow to the correct shape.
 */
export type SpecialBuffs =
  | ({ companion: 'Ellie' } & EllieSpecialBuffs)
  | ({ companion: 'Zeke' } & ZekeSpecialBuffs)
  | ({ companion: 'Miho' } & MihoSpecialBuffs)
  | ({ companion: 'Luna' } & LunaSpecialBuffs);

// ---------------------------------------------------------------------------
// Companion
// ---------------------------------------------------------------------------

/**
 * Full state for a single companion.
 * Source: COMPANIONS sheet, one block per companion.
 */
export interface Companion {
  /** Which companion this is */
  name: CompanionName;
  /** Active skin / costume name */
  skin: string;
  /** Elemental affinity */
  element: Element;
  /** Current companion level */
  level: number;
  /** All 14 advancement steps and their buff data */
  advancementSteps: AdvancementStep[];
  /** Companion-specific special passive buffs */
  specialBuffs: SpecialBuffs;
}

// ---------------------------------------------------------------------------
// Top-level state
// ---------------------------------------------------------------------------

/**
 * The full companions state: exactly one entry per companion (Ellie, Zeke, Miho, Luna).
 * Represented as a fixed-length tuple to enforce all four are always present.
 * Source: COMPANIONS sheet (four companion blocks).
 */
export type CompanionsState = [Companion, Companion, Companion, Companion];

/**
 * Root shape of companions-data.json.
 */
export interface CompanionsData {
  /** Semantic version of this data file (e.g. "1.0.0"). */
  dataVersion: string;
  /** All four companion definitions (Ellie, Zeke, Miho, Luna) */
  COMPANIONS: Companion[];
}
