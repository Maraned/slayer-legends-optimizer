/**
 * Total expected damage calculation.
 *
 * Extends the 4-component per-hit damage formula (see damage-formula.ts)
 * with critical-hit probability weighting to produce the statistically
 * expected damage value per hit.
 *
 * Formula:
 *   expectedDamage = perHitDamage × (1 + critRate × critDmgPctFraction)
 *
 * Derivation:
 *   A hit crits with probability `critRate` and deals `critDmgMultiplier`
 *   times the base hit damage; otherwise it deals 1× base damage.
 *   Expected value = perHitDamage × (critRate × critDmgMultiplier + (1 − critRate))
 *                  = perHitDamage × (1 + critRate × (critDmgMultiplier − 1))
 *                  = perHitDamage × (1 + critRate × critDmgPctFraction)
 *
 * Components:
 *   - perHitDamage      — Output of calculateDamage() (4-component formula)
 *   - critRate          — Probability of a critical hit (0.0–1.0 decimal)
 *   - totalCritDmgPct   — Total CRIT DMG from all sources as additive percentage
 *                         points (output of calculateTotalCritDmg). E.g. 150 = +150%
 *                         CRIT DMG, so crits deal 250% of the base hit damage.
 *   - critDmgMultiplier — (1 + totalCritDmgPct / 100); the multiplier applied on
 *                         a critical hit (e.g. 2.5 when totalCritDmgPct = 150).
 *   - critDmgPctFraction — (totalCritDmgPct / 100); the extra fraction above 1.0.
 */

// ---------------------------------------------------------------------------
// Source functions
// ---------------------------------------------------------------------------

/**
 * Returns the critical-hit damage multiplier applied when a hit crits.
 *
 * CRIT DMG is stored as additive percentage points (e.g. 150 = +150%).
 * Adding 1.0 gives the full multiplier: 0 CRIT DMG → neutral ×1.0;
 * 150 CRIT DMG → ×2.5.
 *
 * @param totalCritDmgPct - Total CRIT DMG from all sources (percentage points)
 * @returns Crit damage multiplier ≥ 1.0
 */
export function calcCritDmgMultiplier(totalCritDmgPct: number): number {
  return 1 + totalCritDmgPct / 100;
}

/**
 * Returns the expected-damage multiplier that blends normal and critical hits.
 *
 * Computed as `1 + critRate × (critDmgMultiplier − 1)`, which is the
 * probability-weighted average of a non-crit (×1.0) and a crit
 * (×critDmgMultiplier) outcome.
 *
 * @param critRate          - Probability of a critical hit (0.0–1.0)
 * @param critDmgMultiplier - Damage multiplier on a critical hit (≥ 1.0)
 * @returns Expected damage multiplier ≥ 1.0
 */
export function calcCritExpectedMultiplier(
  critRate: number,
  critDmgMultiplier: number,
): number {
  return 1 + critRate * (critDmgMultiplier - 1);
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

/**
 * All inputs required to compute the total expected damage for a single hit.
 */
export interface ExpectedDamageInputs {
  /**
   * Per-hit damage from the 4-component formula (output of calculateDamage).
   * Covers ATK × skillModifiedValue × proficiencyMultiplier × ampMultiplier.
   */
  perHitDamage: number;
  /**
   * Probability of landing a critical hit, expressed as a decimal fraction
   * (e.g. 0.25 = 25% crit rate).
   */
  critRate: number;
  /**
   * Total CRIT DMG from all sources, expressed as additive percentage points
   * (output of calculateTotalCritDmg). E.g. 150 = +150% CRIT DMG.
   * Crits therefore deal (1 + totalCritDmgPct / 100) × perHitDamage.
   */
  totalCritDmgPct: number;
}

/**
 * Computes the total expected damage for a single hit, weighting per-hit
 * damage by the probability and magnitude of critical hits.
 *
 * Formula:
 *   expectedDamage = perHitDamage × (1 + critRate × (critDmgMultiplier − 1))
 *
 * where critDmgMultiplier = 1 + totalCritDmgPct / 100.
 *
 * @param inputs - All inputs required to compute expected damage
 * @returns Expected damage value (same unit as perHitDamage)
 */
export function calculateExpectedDamage(inputs: ExpectedDamageInputs): number {
  const critDmgMultiplier = calcCritDmgMultiplier(inputs.totalCritDmgPct);
  const critExpectedMultiplier = calcCritExpectedMultiplier(
    inputs.critRate,
    critDmgMultiplier,
  );
  return inputs.perHitDamage * critExpectedMultiplier;
}

/**
 * Breaks down the total expected damage into all intermediate values for
 * display or debugging.
 *
 * Returns the same result as `calculateExpectedDamage` alongside each
 * intermediate quantity so callers can show contributors without
 * re-implementing the formula.
 *
 * @param inputs - All inputs required to compute expected damage
 * @returns Object with all intermediates and the final `expectedDamage` value
 */
export function calculateExpectedDamageDetailed(
  inputs: ExpectedDamageInputs,
): {
  perHitDamage: number;
  critRate: number;
  totalCritDmgPct: number;
  critDmgMultiplier: number;
  critExpectedMultiplier: number;
  expectedDamage: number;
} {
  const critDmgMultiplier = calcCritDmgMultiplier(inputs.totalCritDmgPct);
  const critExpectedMultiplier = calcCritExpectedMultiplier(
    inputs.critRate,
    critDmgMultiplier,
  );
  const expectedDamage = inputs.perHitDamage * critExpectedMultiplier;
  return {
    perHitDamage: inputs.perHitDamage,
    critRate: inputs.critRate,
    totalCritDmgPct: inputs.totalCritDmgPct,
    critDmgMultiplier,
    critExpectedMultiplier,
    expectedDamage,
  };
}
