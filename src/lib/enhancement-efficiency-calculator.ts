/**
 * Enhancement efficiency calculator (3.5.1).
 *
 * Computes how much damage gain each enhanceable stat provides per gold spent,
 * allowing the game's CHARACTER sheet to rank which stat to enhance next.
 *
 * Formula:
 *   efficiency = (new_damage / old_damage − 1) / enhance_gold_cost
 *
 * A higher efficiency means more damage return per gold invested.
 *
 * The stats covered (ATK, CRIT_DMG, CRIT_PCT, DEATH_STRIKE, DEATH_STRIKE_PCT)
 * each affect expected damage through the 4-component formula:
 *
 *   ATK_DMG = BASE_ATK × damageFactor(critDmg, critChance, dsDmg, dsChance)
 *
 * Damage ratio per stat:
 *   - ATK:              newAtk / oldAtk  (linear — damageFactor unchanged)
 *   - CRIT_DMG:         damageFactor(critDmg + Δ) / damageFactor(critDmg)
 *   - CRIT_PCT:         damageFactor with critChance + Δ
 *   - DEATH_STRIKE:     damageFactor with dsDmg + Δ
 *   - DEATH_STRIKE_PCT: damageFactor with dsChance + Δ
 *
 * ATK efficiency uses the additive ATK% pool model. The ATK enhancement stat
 * contributes to the additive percentage pool alongside other ATK% sources
 * (promotion, companions, TOM, etc.). To isolate the effect of one enhancement
 * step, callers must supply the current `totalAdditiveAtkPct` (which includes
 * the ATK enhancement contribution).
 *
 *   newAtk / oldAtk = (1 + totalAdditiveAtkPct + atkDeltaPct)
 *                   / (1 + totalAdditiveAtkPct)
 *
 * All `bonusPerLevel` values use percentage points matching the conventions of
 * the existing source calculators (e.g. critDmgFromEnhancement):
 *   - ATK:              additive ATK% points (e.g. 0.001 = +0.001% per level)
 *   - CRIT_DMG:         CRIT DMG percentage points (e.g. 0.005 = +0.005% per level)
 *   - CRIT_PCT:         crit chance percentage points (e.g. 0.001 = +0.001% per level)
 *   - DEATH_STRIKE:     DS damage percentage points
 *   - DEATH_STRIKE_PCT: DS chance percentage points
 *
 * Divide by 100 to convert from percentage points to the decimal fractions
 * used in the ExpectedDamageInputs (critDmg, critChance, dsDmg, dsChance).
 */

import { calcDamageFactor } from './expected-damage-calculator';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Per-level stat bonus for each enhanceable damage stat.
 *
 * All values are in percentage points matching the conventions of the existing
 * source calculators (e.g. `critDmgFromEnhancement`).
 */
export interface EnhancementStatBonuses {
  /**
   * Additive ATK% added to the ATK pool per enhancement level.
   * E.g. 0.001 means each level adds +0.001% to the additive ATK% total.
   */
  atkBonusPerLevel: number;
  /**
   * CRIT DMG percentage points added per enhancement level.
   * E.g. 0.005 means each level adds +0.005% CRIT DMG.
   * Divide by 100 to get the change in the critDmg multiplier.
   */
  critDmgBonusPerLevel: number;
  /**
   * Crit chance percentage points added per enhancement level.
   * E.g. 0.001 means each level adds +0.001% crit chance.
   * Divide by 100 to get the change in the critChance probability.
   */
  critChanceBonusPerLevel: number;
  /**
   * Death Strike damage percentage points added per enhancement level.
   * E.g. 0.005 means each level adds +0.005% DS damage.
   * Divide by 100 to get the change in the dsDmg multiplier.
   */
  dsDmgBonusPerLevel: number;
  /**
   * Death Strike chance percentage points added per enhancement level.
   * E.g. 0.001 means each level adds +0.001% DS chance.
   * Divide by 100 to get the change in the dsChance probability.
   */
  dsChanceBonusPerLevel: number;
}

/**
 * Gold cost for the next enhancement step of each damage-affecting stat.
 *
 * Zero indicates the stat is at max level or the cost is not applicable.
 * An efficiency of 0 is returned for any stat with a zero gold cost.
 */
export interface EnhancementGoldCosts {
  ATK: number;
  CRIT_DMG: number;
  CRIT_PCT: number;
  DEATH_STRIKE: number;
  DEATH_STRIKE_PCT: number;
}

/**
 * All inputs required to compute enhancement efficiency for each stat.
 */
export interface EnhancementEfficiencyInputs {
  /**
   * Total additive ATK% pool including the ATK enhancement contribution.
   * This is the sum of promotion ATK%, companion ATK%, TOM ATK%, ATK
   * enhancement ATK%, and other additive sources (as a decimal fraction,
   * e.g. 0.13 = 13% total additive ATK bonus).
   */
  totalAdditiveAtkPct: number;
  /**
   * Current crit damage multiplier (e.g. 1.5 = crits deal 1.5× base damage).
   * Convert from percentage points: critDmg = totalCritDmgPct / 100.
   */
  critDmg: number;
  /**
   * Current crit hit probability in [0, 1].
   * Convert from percentage points: critChance = totalCritChancePct / 100.
   */
  critChance: number;
  /**
   * Current Death Strike damage multiplier (e.g. 2.0 = DS deals 2× base).
   * Convert from percentage points: dsDmg = totalDsDmgPct / 100.
   */
  dsDmg: number;
  /**
   * Current Death Strike probability in [0, 1].
   * Convert from percentage points: dsChance = totalDsChancePct / 100.
   */
  dsChance: number;
  /**
   * Number of enhancement levels applied in a single step.
   * Matches the CHARACTER sheet "Enhance Multiplier" (D5), default 1.
   */
  enhanceSteps: number;
  /** Per-level stat bonuses for each enhanceable damage stat. */
  statBonuses: EnhancementStatBonuses;
  /** Gold cost for the next enhancement step of each stat. */
  goldCosts: EnhancementGoldCosts;
}

/**
 * Efficiency score for each enhanceable damage stat.
 *
 * Each value represents damage gain per gold spent:
 *   efficiency = (new_damage / old_damage − 1) / gold_cost
 *
 * A higher value means more damage return per gold.
 * Zero indicates the stat is maxed out, has no gold cost, or has no effect
 * on damage (e.g. HP and HP_RECOVERY are excluded).
 */
export interface EnhancementEfficiencyResult {
  ATK: number;
  CRIT_DMG: number;
  CRIT_PCT: number;
  DEATH_STRIKE: number;
  DEATH_STRIKE_PCT: number;
}

// ---------------------------------------------------------------------------
// Source function
// ---------------------------------------------------------------------------

/**
 * Computes the enhancement efficiency for a single stat.
 *
 * @param damageRatio - Ratio of new expected damage to old (new / old)
 * @param goldCost    - Gold cost for the enhancement step (must be > 0)
 * @returns Efficiency = (damageRatio − 1) / goldCost; 0 if goldCost is 0
 */
export function calcEfficiency(
  damageRatio: number,
  goldCost: number,
): number {
  if (goldCost <= 0) return 0;
  return (damageRatio - 1) / goldCost;
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

/**
 * Computes enhancement efficiency for all five damage-affecting stats.
 *
 * For each stat, the function:
 *   1. Derives the new expected damage after `enhanceSteps` enhancement levels
 *   2. Computes the damage ratio (new / old)
 *   3. Returns efficiency = (ratio − 1) / goldCost
 *
 * ATK efficiency uses the additive pool ratio and does not require a `baseAtk`
 * value because damage is linear in ATK (the ratio cancels the absolute value).
 *
 * Non-ATK efficiencies are computed via the damageFactor ratio, which also
 * cancels baseAtk, making the result independent of the absolute ATK level.
 *
 * @param inputs - All current stats, per-level bonuses, and gold costs
 * @returns Efficiency score for each of the five damage stats
 */
export function calculateEnhancementEfficiencies(
  inputs: EnhancementEfficiencyInputs,
): EnhancementEfficiencyResult {
  const {
    totalAdditiveAtkPct,
    critDmg,
    critChance,
    dsDmg,
    dsChance,
    enhanceSteps,
    statBonuses,
    goldCosts,
  } = inputs;

  const currentFactor = calcDamageFactor(critDmg, critChance, dsDmg, dsChance);

  // ATK: damage scales linearly with ATK, which is linear in the additive pool.
  // Ratio = (1 + totalAdditiveAtkPct + Δ) / (1 + totalAdditiveAtkPct)
  const atkDelta = (enhanceSteps * statBonuses.atkBonusPerLevel) / 100;
  const atkRatio =
    (1 + totalAdditiveAtkPct + atkDelta) / (1 + totalAdditiveAtkPct);

  // CRIT_DMG: affects critDmg multiplier in the damage factor.
  const newCritDmg = critDmg + (enhanceSteps * statBonuses.critDmgBonusPerLevel) / 100;
  const critDmgFactor = calcDamageFactor(newCritDmg, critChance, dsDmg, dsChance);
  const critDmgRatio = currentFactor > 0 ? critDmgFactor / currentFactor : 1;

  // CRIT_PCT: affects critChance probability in the damage factor.
  const newCritChance = critChance + (enhanceSteps * statBonuses.critChanceBonusPerLevel) / 100;
  const critPctFactor = calcDamageFactor(critDmg, newCritChance, dsDmg, dsChance);
  const critPctRatio = currentFactor > 0 ? critPctFactor / currentFactor : 1;

  // DEATH_STRIKE: affects dsDmg multiplier in the damage factor.
  const newDsDmg = dsDmg + (enhanceSteps * statBonuses.dsDmgBonusPerLevel) / 100;
  const dsDmgFactor = calcDamageFactor(critDmg, critChance, newDsDmg, dsChance);
  const dsDmgRatio = currentFactor > 0 ? dsDmgFactor / currentFactor : 1;

  // DEATH_STRIKE_PCT: affects dsChance probability in the damage factor.
  const newDsChance = dsChance + (enhanceSteps * statBonuses.dsChanceBonusPerLevel) / 100;
  const dsPctFactor = calcDamageFactor(critDmg, critChance, dsDmg, newDsChance);
  const dsPctRatio = currentFactor > 0 ? dsPctFactor / currentFactor : 1;

  return {
    ATK: calcEfficiency(atkRatio, goldCosts.ATK),
    CRIT_DMG: calcEfficiency(critDmgRatio, goldCosts.CRIT_DMG),
    CRIT_PCT: calcEfficiency(critPctRatio, goldCosts.CRIT_PCT),
    DEATH_STRIKE: calcEfficiency(dsDmgRatio, goldCosts.DEATH_STRIKE),
    DEATH_STRIKE_PCT: calcEfficiency(dsPctRatio, goldCosts.DEATH_STRIKE_PCT),
  };
}

/**
 * Returns the stat key with the highest enhancement efficiency score.
 *
 * Ties are broken by the order of the keys in `EnhancementEfficiencyResult`.
 * Returns `null` if all efficiency scores are zero or negative.
 *
 * @param result - Efficiency scores from `calculateEnhancementEfficiencies`
 * @returns The stat key with the highest efficiency, or null if none are positive
 */
export function highestEfficiencyStat(
  result: EnhancementEfficiencyResult,
): keyof EnhancementEfficiencyResult | null {
  let best: keyof EnhancementEfficiencyResult | null = null;
  let bestScore = 0;

  for (const key of Object.keys(result) as Array<keyof EnhancementEfficiencyResult>) {
    if (result[key] > bestScore) {
      bestScore = result[key];
      best = key;
    }
  }

  return best;
}
