/**
 * Base damage calculation.
 *
 * Computes the per-hit base damage for a skill before elemental amplification
 * and critical hit modifiers are applied.
 *
 * Formula:
 *   baseDamage = finalATK × skillModifiedValue × (1 + proficiencyBonus)
 *
 * Components:
 *   - finalATK: Aggregated player ATK from all sources (see atk-aggregation.ts)
 *   - skillModifiedValue: Skill damage multiplier after companion/partner bonuses
 *     applied (SkillSlot.modifiedValue)
 *   - proficiencyBonus: Additive bonus from player proficiency level, expressed
 *     as a decimal fraction (e.g. 0.15 = +15%)
 *
 * All three components are combined multiplicatively. The finalATK establishes
 * the absolute damage floor; skillModifiedValue scales it by the skill's power;
 * the proficiency multiplier applies a final percentage boost.
 */

import type { Proficiency } from '../types/skills';

// ---------------------------------------------------------------------------
// Source functions
// ---------------------------------------------------------------------------

/**
 * Returns the ATK component of base damage.
 *
 * This is the fully-aggregated player ATK value — passed through directly so
 * callers can see its role in the formula and the breakdown remains complete.
 *
 * @param finalAtk - Aggregated ATK from all sources (output of aggregateAtk)
 * @returns The ATK component of base damage
 */
export function calcBaseDamageAtk(finalAtk: number): number {
  return finalAtk;
}

/**
 * Returns the proficiency multiplier applied to base damage.
 *
 * Proficiency adds an additive bonus on top of 1.0, so a proficiency bonus
 * of 0.15 yields a ×1.15 multiplier. With no proficiency (bonus = 0) the
 * multiplier is 1.0, leaving base damage unchanged.
 *
 * @param proficiency - Player's current proficiency with pre-computed bonus
 * @returns Multiplier ≥ 1.0 derived from proficiency bonus
 */
export function calcProficiencyMultiplier(proficiency: Proficiency): number {
  return 1 + proficiency.bonus;
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

/**
 * All inputs required to compute base damage for a single skill hit.
 */
export interface BaseDamageInputs {
  /** Aggregated player ATK from all sources (output of aggregateAtk). */
  finalAtk: number;
  /**
   * Skill damage multiplier after companion/partner bonuses are applied.
   * Corresponds to SkillSlot.modifiedValue.
   */
  skillModifiedValue: number;
  /** Player's current proficiency with pre-computed bonus (decimal fraction). */
  proficiency: Proficiency;
}

/**
 * Computes the base damage for a single skill hit.
 *
 * Formula:
 *   baseDamage = finalATK × skillModifiedValue × (1 + proficiencyBonus)
 *
 * @param inputs - All inputs required to compute base damage
 * @returns Base damage value (same unit as ATK)
 */
export function calculateBaseDamage(inputs: BaseDamageInputs): number {
  const proficiencyMultiplier = calcProficiencyMultiplier(inputs.proficiency);
  return inputs.finalAtk * inputs.skillModifiedValue * proficiencyMultiplier;
}

/**
 * Breaks down base damage into its three multiplicative components for
 * display or debugging.
 *
 * Returns the same result as `calculateBaseDamage` alongside the three
 * intermediate quantities so callers can show contributors without
 * re-implementing the formula.
 *
 * @param inputs - All inputs required to compute base damage
 * @returns Object with `atk`, `skillModifiedValue`, `proficiencyMultiplier`,
 *   and `baseDamage`
 */
export function calculateBaseDamageDetailed(inputs: BaseDamageInputs): {
  atk: number;
  skillModifiedValue: number;
  proficiencyMultiplier: number;
  baseDamage: number;
} {
  const proficiencyMultiplier = calcProficiencyMultiplier(inputs.proficiency);
  const baseDamage =
    inputs.finalAtk * inputs.skillModifiedValue * proficiencyMultiplier;
  return {
    atk: inputs.finalAtk,
    skillModifiedValue: inputs.skillModifiedValue,
    proficiencyMultiplier,
    baseDamage,
  };
}
