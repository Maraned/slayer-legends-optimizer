/**
 * Expected (average) damage formula — 4-component model.
 *
 * Models CRIT and Death Strike as independent random events and computes the
 * expected damage per hit by summing the four mutually exclusive outcomes:
 *
 *   E[damage] = BASE_ATK × damageFactor(critDmg, critChance, dsDmg, dsChance)
 *
 * Where damageFactor breaks down into:
 *   1. No crit, no DS  — probability (1 − C%) × (1 − DS%)
 *   2. Crit only       — probability C% × (1 − DS%),  hit = BASE × CRIT_DMG
 *   3. DS only         — probability (1 − C%) × DS%,  hit = BASE × DS_DMG
 *   4. Crit + DS       — probability C% × DS%,        hit = BASE × CRIT_DMG × DS_DMG
 *
 * Expanded formula:
 *   ATK_DMG = BASE_ATK × (1 − C%) × (1 − DS%)
 *           + BASE_ATK × CRIT_DMG × (C% − C% × DS%)
 *           + BASE_ATK × DS_DMG × (DS% − C% × DS%)
 *           + BASE_ATK × CRIT_DMG × DS_DMG × C% × DS%
 *
 * This formula feeds the enhancement efficiency calculator (3.5.1) which
 * measures how much damage gain each stat enhancement step provides per gold
 * spent.
 *
 * Units:
 *   - critDmg: multiplier (e.g. 1.5 = crits deal 1.5× base damage)
 *   - critChance: probability in [0, 1] (e.g. 0.5 = 50% crit chance)
 *   - dsDmg: multiplier (e.g. 2.0 = Death Strike deals 2× base damage)
 *   - dsChance: probability in [0, 1] (e.g. 0.3 = 30% Death Strike chance)
 *
 * Callers are responsible for unit conversion from percentage-point totals:
 *   critDmg      = totalCritDmgPct / 100
 *   critChance   = totalCritChancePct / 100
 *   dsDmg        = totalDsDmgPct / 100
 *   dsChance     = totalDsChancePct / 100
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * All inputs required to compute expected damage for a single hit.
 */
export interface ExpectedDamageInputs {
  /**
   * Total ATK from all sources (output of aggregateAtk or equivalent).
   * This is the absolute base damage before any multipliers.
   */
  baseAtk: number;
  /**
   * Crit damage multiplier: the factor applied to base damage on a critical
   * hit (e.g. 1.5 means a crit deals 1.5× base damage).
   * Convert from percentage points: critDmg = totalCritDmgPct / 100.
   */
  critDmg: number;
  /**
   * Crit hit probability in [0, 1] (e.g. 0.5 = 50% crit chance).
   * Convert from percentage points: critChance = totalCritChancePct / 100.
   */
  critChance: number;
  /**
   * Death Strike damage multiplier: the factor applied to base damage when a
   * Death Strike occurs (e.g. 2.0 means DS deals 2× base damage).
   * Convert from percentage points: dsDmg = totalDsDmgPct / 100.
   */
  dsDmg: number;
  /**
   * Death Strike probability in [0, 1] (e.g. 0.3 = 30% DS chance).
   * Convert from percentage points: dsChance = totalDsChancePct / 100.
   */
  dsChance: number;
}

// ---------------------------------------------------------------------------
// Source function
// ---------------------------------------------------------------------------

/**
 * Computes the stat-based multiplier on BASE_ATK for expected damage.
 *
 * This is the expected value of the hit multiplier across the four outcome
 * combinations of CRIT and Death Strike firing independently:
 *
 *   damageFactor =
 *       (1 − critChance) × (1 − dsChance)                   // no crit, no DS
 *     + critDmg × (critChance − critChance × dsChance)       // crit only
 *     + dsDmg  × (dsChance  − critChance × dsChance)         // DS only
 *     + critDmg × dsDmg × critChance × dsChance              // crit + DS
 *
 * The result multiplied by BASE_ATK gives the expected per-hit damage.
 *
 * @param critDmg    - Crit damage multiplier (≥ 0)
 * @param critChance - Crit hit probability in [0, 1]
 * @param dsDmg      - Death Strike damage multiplier (≥ 0)
 * @param dsChance   - Death Strike probability in [0, 1]
 * @returns Expected damage factor (≥ 0)
 */
export function calcDamageFactor(
  critDmg: number,
  critChance: number,
  dsDmg: number,
  dsChance: number,
): number {
  const critAndDs = critChance * dsChance;
  return (
    (1 - critChance) * (1 - dsChance) +
    critDmg * (critChance - critAndDs) +
    dsDmg * (dsChance - critAndDs) +
    critDmg * dsDmg * critAndDs
  );
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

/**
 * Computes the expected per-hit damage using the 4-component formula.
 *
 * Formula:
 *   expectedDamage = baseAtk × damageFactor(critDmg, critChance, dsDmg, dsChance)
 *
 * @param inputs - All inputs required to compute expected damage
 * @returns Expected per-hit damage value (same unit as baseAtk)
 */
export function calculateExpectedDamage(inputs: ExpectedDamageInputs): number {
  return (
    inputs.baseAtk *
    calcDamageFactor(
      inputs.critDmg,
      inputs.critChance,
      inputs.dsDmg,
      inputs.dsChance,
    )
  );
}

/**
 * Breaks down expected damage into the four outcome components for display or
 * debugging.
 *
 * Returns the same result as `calculateExpectedDamage` alongside the four
 * component values so callers can show the damage breakdown without
 * re-implementing the formula.
 *
 * @param inputs - All inputs required to compute expected damage
 * @returns Object with the four outcome components and the total `expectedDamage`
 */
export function calculateExpectedDamageDetailed(
  inputs: ExpectedDamageInputs,
): {
  /** Expected contribution from hits that are neither crits nor Death Strikes */
  normalComponent: number;
  /** Expected contribution from crit-only hits */
  critOnlyComponent: number;
  /** Expected contribution from Death Strike-only hits */
  dsOnlyComponent: number;
  /** Expected contribution from hits that trigger both crit and Death Strike */
  critAndDsComponent: number;
  /** Total expected per-hit damage */
  expectedDamage: number;
} {
  const { baseAtk, critDmg, critChance, dsDmg, dsChance } = inputs;
  const critAndDs = critChance * dsChance;

  const normalComponent = baseAtk * (1 - critChance) * (1 - dsChance);
  const critOnlyComponent = baseAtk * critDmg * (critChance - critAndDs);
  const dsOnlyComponent = baseAtk * dsDmg * (dsChance - critAndDs);
  const critAndDsComponent = baseAtk * critDmg * dsDmg * critAndDs;

  return {
    normalComponent,
    critOnlyComponent,
    dsOnlyComponent,
    critAndDsComponent,
    expectedDamage:
      normalComponent + critOnlyComponent + dsOnlyComponent + critAndDsComponent,
  };
}
