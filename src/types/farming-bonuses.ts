/**
 * Types for farming bonus multiplier aggregation.
 *
 * FarmingBonuses is the unified input to the per-stage resource rate
 * calculator. All values are fractional additive bonuses (0.10 = +10%).
 *
 * FarmingBonusBreakdown exposes the per-source contribution to each
 * bonus field, enabling UI transparency and debugging.
 *
 * Bonus sources covered:
 *   1. Appearance    — owned clothing items with 'Extra EXP' / 'Monster Gold' bonus type
 *   2. Companions    — advancement step buffs (Extra EXP, Monster Gold)
 *   3. Character     — promotion tier cumulative Monster Gold bonus
 *   4. Constellation — star node buff totals for Extra EXP / Monster Gold
 *   5. Memory Tree   — TOM nodes whose effectType is Extra EXP / Monster Gold
 */

// ---------------------------------------------------------------------------
// Aggregated farming bonuses (calculator input)
// ---------------------------------------------------------------------------

/**
 * Aggregated player farming bonuses from all sources.
 * All values are fractional additive bonuses (0.10 = +10%).
 *
 * Applied by the stage-rate calculator as:
 *   expPerRun  = baseExp  × (1 + extraExpBonus)
 *   goldPerRun = baseGold × (1 + monsterGoldBonus)
 *   dropQty    = baseQty  × dropRateMultiplier × (1 + dropRateBonus)
 */
export interface FarmingBonuses {
  /**
   * Total extra EXP bonus fraction from all sources.
   * Example: 0.35 = +35% extra EXP.
   */
  extraExpBonus: number;

  /**
   * Total extra Monster Gold bonus fraction from all sources.
   * Example: 0.20 = +20% extra gold.
   */
  monsterGoldBonus: number;

  /**
   * Additional item drop rate bonus fraction (all items).
   * Stacks additively with the stage's own Drop Rate Boost modifier.
   * Example: 0.10 = +10% to all drop rates.
   */
  dropRateBonus: number;

  /**
   * Additional rare item drop rate bonus fraction.
   * Stacks additively with the stage's own Rare Drop Boost modifier.
   * Example: 0.05 = +5% to rare drop rates.
   */
  rareDropRateBonus: number;
}

// ---------------------------------------------------------------------------
// Per-source breakdown (for UI and debugging)
// ---------------------------------------------------------------------------

/**
 * Per-source breakdown of extraExpBonus contributions.
 * All values are fractional additive bonuses (0.10 = +10%).
 */
export interface ExtraExpBreakdown {
  /** From owned clothing items with 'Extra EXP' bonus type */
  appearance: number;
  /** From companion advancement steps with buffType 'Extra EXP' */
  companions: number;
  /** From constellation star nodes with buffType 'Extra EXP' */
  constellation: number;
  /** From TOM nodes with effectType 'Extra EXP' */
  memoryTree: number;
}

/**
 * Per-source breakdown of monsterGoldBonus contributions.
 * All values are fractional additive bonuses (0.10 = +10%).
 */
export interface MonsterGoldBreakdown {
  /** From owned clothing items with 'Monster Gold' bonus type */
  appearance: number;
  /** From companion advancement steps with buffType 'Monster Gold' */
  companions: number;
  /** From character promotion tier cumulative Monster Gold % */
  character: number;
  /** From constellation star nodes with buffType 'Monster Gold' */
  constellation: number;
  /** From TOM nodes with effectType 'Monster Gold' */
  memoryTree: number;
}

/**
 * Full per-source breakdown of all farming bonus fields.
 * Use this for UI display of bonus contributions or debugging.
 */
export interface FarmingBonusBreakdown {
  /** Per-source contributions to extraExpBonus */
  extraExp: ExtraExpBreakdown;
  /** Per-source contributions to monsterGoldBonus */
  monsterGold: MonsterGoldBreakdown;
  /** Aggregated totals ready for the stage-rate calculator */
  totals: FarmingBonuses;
}
