/**
 * The 7 stats that can be enhanced in the CHARACTER sheet ENHANCE section.
 * Source: CHARACTER sheet rows 8–15, ENHANCE Auto Priority Table.
 */
export type EnhanceableStatKey =
  | 'ATK'
  | 'CRIT_DMG'
  | 'CRIT_PCT'
  | 'DEATH_STRIKE'
  | 'DEATH_STRIKE_PCT'
  | 'HP'
  | 'HP_RECOVERY';

/**
 * Current and max enhancement level for a single enhanceable stat.
 * maxLevel caps the ENHANCED LVL formula: =IF(D8>=Q8, "MAX", ...).
 */
export interface EnhanceLevelEntry {
  /** Player's current enhancement level for this stat */
  currentLevel: number;
  /** Maximum level cap for this stat (from game data) */
  maxLevel: number;
}

/**
 * Enhancement levels for all 7 enhanceable stats.
 * Source: CHARACTER sheet ENHANCE section (rows 8–15) and MANUAL target calculator (rows 8–15).
 */
export type EnhanceableStats = Record<EnhanceableStatKey, EnhanceLevelEntry>;

/**
 * The 3 base growth stats tracked in the CHARACTER sheet GROWTH section.
 * Source: CHARACTER sheet rows covering STR, HP, VIT growth inputs.
 */
export interface GrowthStatEntry {
  /** Player-input growth level for this stat */
  level: number;
  /**
   * Computed bonus from CHARACTER MATHSDATA growth factor table.
   * Derived as: level × growth_factor (column AF of CHARACTER MATHSDATA).
   */
  bonus: number;
}

/**
 * All base growth stats from the CHARACTER sheet GROWTH section.
 * Source: CHARACTER sheet sections 5 (STR = ATK Damage, HP = Health, VIT = Health Regen).
 */
export interface GrowthStats {
  /** STR — contributes to ATK Damage */
  STR: GrowthStatEntry;
  /** HP — base health pool */
  HP: GrowthStatEntry;
  /** VIT — health regeneration */
  VIT: GrowthStatEntry;
}

/**
 * The 5 stat keys tracked per latent power page.
 * Source: CHARACTER sheet LATENT POWER section (pages Ⅰ–Ⅴ).
 */
export type LatentPowerStatKey = 'STR' | 'HP' | 'CRI' | 'LUK' | 'VIT';

/**
 * A single latent power cell entry tracking the player-input level.
 * Source: CHARACTER sheet LATENT POWER section, one cell per stat per page.
 */
export interface LatentPowerCellEntry {
  /** Player's current level for this latent power cell */
  level: number;
}

/**
 * One latent power page containing a level entry for each of the 5 stats.
 * Source: CHARACTER sheet LATENT POWER section, one entry per page column.
 */
export type LatentPowerPageEntry = Record<LatentPowerStatKey, LatentPowerCellEntry>;

/**
 * All 5 latent power pages (Ⅰ–Ⅴ), each with a 5-stat grid.
 * Source: CHARACTER sheet LATENT POWER section.
 * Index 0 = Page Ⅰ, index 4 = Page Ⅴ.
 */
export interface LatentPower {
  pages: [
    LatentPowerPageEntry,
    LatentPowerPageEntry,
    LatentPowerPageEntry,
    LatentPowerPageEntry,
    LatentPowerPageEntry,
  ];
}

/**
 * A single promotion ability choice (from ABILITY OPTIONS in CHARACTER MATHSDATA).
 * Source: CHARACTER sheet PROMOTIONS section, ability option columns.
 */
export interface PromotionAbility {
  /** Internal ability ID (matches ABILITY OPTIONS lookup key) */
  id: string;
  /** Display name of the ability */
  name: string;
}

/**
 * Character promotion state.
 * Source: CHARACTER sheet PROMOTIONS section (section 7) and CHARACTER MATHSDATA PROMOTION tables.
 */
export interface Promotion {
  /** Current promotion tier (integer, e.g. 1–10) */
  tier: number;
  /** Cumulative ATK% bonus from this promotion tier (from PROMOTION BONUS table) */
  atkBonusPct: number;
  /** Cumulative Monster Gold% bonus from this promotion tier (from PROMOTION BONUS table) */
  monsterGoldBonusPct: number;
  /** Selected promotion abilities for this tier (from ABILITY OPTIONS) */
  abilities: PromotionAbility[];
}

/**
 * Character slayer level state.
 * Source: CHARACTER sheet section 3 (Slayer Level).
 */
export interface SlayerLevel {
  /** Current slayer level (e.g. 667) */
  level: number;
  /**
   * EXP required to reach the next slayer level.
   * Looked up via: =VLOOKUP(F14, CHARACTER_MATHSDATA!A2:B4002, 2, 0)
   */
  expRequiredForNext: number;
}

/**
 * Growing Knowledge item state.
 * Source: CHARACTER sheet section 4 (Growing Knowledge & Superhuman).
 */
export interface GrowingKnowledge {
  /** Selected grade (integer, e.g. 2 for "Grade 2") */
  grade: number;
  /**
   * ATK effect percentage for this grade.
   * Looked up via: =VLOOKUP(F17, CHARACTER_MATHSDATA!M3:N93, 2, 0)
   */
  atkEffectPct: number;
}

/**
 * Complete character state combining all CHARACTER sheet sections.
 * This is the top-level type representing all player-input character data.
 */
export interface CharacterState {
  /** Enhancement levels for the 7 enhanceable stats (ENHANCE section) */
  enhanceableStats: EnhanceableStats;
  /** Base growth stat levels and bonuses (GROWTH section) */
  growthStats: GrowthStats;
  /** 5-page × 5-stat latent power grid (LATENT POWER section) */
  latentPower: LatentPower;
  /** Current promotion tier and associated bonuses (PROMOTIONS section) */
  promotion: Promotion;
  /** Current slayer level and EXP to next level (Slayer Level section) */
  slayerLevel: SlayerLevel;
  /** Growing Knowledge grade and ATK effect (Growing Knowledge section) */
  growingKnowledge: GrowingKnowledge;
}
