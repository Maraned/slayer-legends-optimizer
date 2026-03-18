/**
 * 4-component damage formula.
 *
 * Extends the 3-component base damage formula (see base-damage-calculator.ts)
 * with elemental amplification (AMP) as the fourth multiplicative component.
 *
 * Formula:
 *   damage = finalATK × skillModifiedValue × proficiencyMultiplier × ampMultiplier
 *
 * Components:
 *   1. finalATK            — Aggregated player ATK from all sources
 *   2. skillModifiedValue  — Skill damage multiplier after companion/partner bonuses
 *   3. proficiencyMultiplier — (1 + proficiencyBonus), derived from player proficiency
 *   4. ampMultiplier       — (1 + totalAmp), derived from Black Orb elemental AMP
 *
 * This formula produces the per-hit damage for a skill before critical-hit
 * weighting is applied. Critical hit handling is covered by the total expected
 * damage calculation (3.4.3).
 */

import type { Proficiency } from '../types/skills';
import { calcProficiencyMultiplier } from './base-damage-calculator';

// ---------------------------------------------------------------------------
// Source function
// ---------------------------------------------------------------------------

/**
 * Returns the elemental amplification multiplier applied to damage.
 *
 * AMP is stored as a decimal fraction (e.g. 0.25 = +25%). Adding 1.0
 * converts it to a multiplicative factor, so no AMP (totalAmp = 0) yields
 * a neutral ×1.0.
 *
 * @param totalAmp - Total elemental AMP across all active sources (decimal)
 * @returns AMP multiplier ≥ 1.0
 */
export function calcAmpMultiplier(totalAmp: number): number {
  return 1 + totalAmp;
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

/**
 * All inputs required to compute the 4-component damage for a single skill hit.
 */
export interface DamageFormulaInputs {
  /** Aggregated player ATK from all sources (output of aggregateAtk). */
  finalAtk: number;
  /**
   * Skill damage multiplier after companion/partner bonuses are applied.
   * Corresponds to SkillSlot.modifiedValue.
   */
  skillModifiedValue: number;
  /** Player's current proficiency with pre-computed bonus (decimal fraction). */
  proficiency: Proficiency;
  /**
   * Total elemental AMP from all active Black Orb sources and accessories.
   * Corresponds to AmpCalculation.totalAmp (decimal fraction, e.g. 0.25 = +25%).
   */
  totalAmp: number;
}

/**
 * Computes the per-hit damage for a single skill using the 4-component formula.
 *
 * Formula:
 *   damage = finalATK × skillModifiedValue × (1 + proficiencyBonus) × (1 + totalAmp)
 *
 * @param inputs - All inputs required to compute the 4-component damage
 * @returns Per-hit damage value (same unit as ATK)
 */
export function calculateDamage(inputs: DamageFormulaInputs): number {
  const proficiencyMultiplier = calcProficiencyMultiplier(inputs.proficiency);
  const ampMultiplier = calcAmpMultiplier(inputs.totalAmp);
  return (
    inputs.finalAtk *
    inputs.skillModifiedValue *
    proficiencyMultiplier *
    ampMultiplier
  );
}

/**
 * Breaks down the 4-component damage into all intermediate values for
 * display or debugging.
 *
 * Returns the same result as `calculateDamage` alongside each of the four
 * components so callers can show contributors without re-implementing the
 * formula.
 *
 * @param inputs - All inputs required to compute the 4-component damage
 * @returns Object with all four components and the final `damage` value
 */
export function calculateDamageDetailed(inputs: DamageFormulaInputs): {
  atk: number;
  skillModifiedValue: number;
  proficiencyMultiplier: number;
  ampMultiplier: number;
  damage: number;
} {
  const proficiencyMultiplier = calcProficiencyMultiplier(inputs.proficiency);
  const ampMultiplier = calcAmpMultiplier(inputs.totalAmp);
  const damage =
    inputs.finalAtk *
    inputs.skillModifiedValue *
    proficiencyMultiplier *
    ampMultiplier;
  return {
    atk: inputs.finalAtk,
    skillModifiedValue: inputs.skillModifiedValue,
    proficiencyMultiplier,
    ampMultiplier,
    damage,
  };
}
