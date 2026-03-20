/**
 * CHARACTER_MATHSDATA type definitions.
 * Matches the structure of src/data/character-maths-data.json.
 */

/** One row of the SLAYER_LEVEL table. */
export interface SlayerLevelEntry {
  /** Slayer level (1–4002). */
  level: number;
  /** Total EXP required to reach this level. */
  expRequired: number;
}

/** One row of the PROMOTION table. */
export interface PromotionEntry {
  /** Promotion tier number (1–10). */
  tier: number;
  /** Display rank name (e.g. "Wood", "Bronze", "Legend"). */
  rank: string;
  /**
   * Additive ATK bonus granted at this promotion tier
   * (e.g. 0.05 = +5% ATK).
   */
  atkBonus: number;
  /**
   * Additive HP bonus granted at this promotion tier
   * (e.g. 0.04 = +4% HP).
   */
  hpBonus: number;
}

/** One row of the PROMOTION_BONUS table. */
export interface PromotionBonusEntry {
  /** Promotion tier number (1–10). */
  tier: number;
  /**
   * Cumulative Extra ATK % bonus at this tier
   * (e.g. 0.07 = +7% extra ATK).
   */
  extraAtkPercent: number;
  /**
   * Cumulative Monster Gold % bonus at this tier
   * (e.g. 0.05 = +5% monster gold).
   */
  monsterGoldPercent: number;
}

/** One row of the GROWTH_KNOWLEDGE table. */
export interface GrowthKnowledgeEntry {
  /** Growing Knowledge grade (1–91). */
  grade: number;
  /**
   * Multiplicative ATK effect from this grade of Growing Knowledge
   * (e.g. 1.10 = ×1.10 ATK multiplier).
   */
  atkEffectMultiplier: number;
}

/** One row of the GROWTH_STATS table. */
export interface GrowthStatConfigEntry {
  /** Growth stat key ('STR', 'HP', or 'VIT'). */
  stat: string;
  /**
   * Multiplier applied to the growth level to compute the stat bonus.
   * Source: CHARACTER MATHSDATA column AF.
   * bonus = level × growthFactor
   */
  growthFactor: number;
}

/** One row of the ABILITY_OPTIONS table. */
export interface PromotionAbilityOptionEntry {
  /** Internal ability ID (e.g. "extra-atk"). */
  id: string;
  /** Display name of the ability (e.g. "Extra ATK(%)"). */
  name: string;
}

/** Root shape of character-maths-data.json. */
export interface CharacterMathsData {
  /** Semantic version of this data file (e.g. "1.0.0"). */
  dataVersion: string;
  SLAYER_LEVEL: SlayerLevelEntry[];
  PROMOTION: PromotionEntry[];
  PROMOTION_BONUS: PromotionBonusEntry[];
  GROWTH_KNOWLEDGE: GrowthKnowledgeEntry[];
  GROWTH_STATS: GrowthStatConfigEntry[];
  ABILITY_OPTIONS: PromotionAbilityOptionEntry[];
}
