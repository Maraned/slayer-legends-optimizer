/**
 * Multiplicative ATK aggregation.
 *
 * Combines the outputs of individual ATK source functions (see atk-sources.ts)
 * into a single final ATK value using the game's two-tier formula:
 *
 *   finalATK = absoluteBase × (1 + additivePctTotal) × multiplicativeFactor
 *
 * Tier 1 – Absolute base: flat ATK values summed additively.
 *   - Weapon ATK (baseAtk × atkMultiplier at enhancement level)
 *   - Growth STR bonus (level × growth_factor)
 *
 * Tier 2 – Additive percentage pool: all %-based bonuses pooled before
 * multiplying. Pooling means each source adds to a shared bucket; a +9% and a
 * +4% bonus together yield ×1.13, not ×1.09 × 1.04.
 *   - Promotion ATK% (PROMOTION table)
 *   - Promotion Bonus ATK% (PROMOTION_BONUS table)
 *   - Companion Extra ATK% (unlocked advancement steps)
 *   - Tree of Memory ATK% (unlocked node levels)
 *   - Appearance Extra ATK% (owned clothing)
 *   - Constellation ATK% (ATK and All Stats star nodes)
 *   - Demon Sanctuary ATK% (sanctuary level)
 *
 * Tier 3 – Multiplicative factor: applied after the additive pool.
 *   - Growing Knowledge ATK multiplier (1.0–~1.91 across 91 grades)
 *
 * All inputs come from the corresponding calc* functions in atk-sources.ts.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Pre-computed output of all individual ATK source functions.
 *
 * Absolute values are raw ATK points; percentage values are decimal fractions
 * (e.g. 0.09 = +9%); the multiplier is a factor ≥ 1.0.
 */
export interface AtkSources {
  /** Absolute weapon ATK after enhancement scaling. */
  weaponAtk: number;
  /** Flat ATK bonus from STR growth stat. */
  growthStrAtk: number;
  /** Additive ATK% from PROMOTION table (e.g. 0.09 = +9%). */
  promotionAtkPct: number;
  /** Additive extra ATK% from PROMOTION_BONUS table. */
  promotionBonusAtkPct: number;
  /** Combined additive ATK% from all four companions' Extra ATK steps. */
  companionsAtkPct: number;
  /** Additive ATK% from Tree of Memory ATK-type nodes. */
  tomAtkPct: number;
  /** Additive ATK% from owned clothing (Appearance sheet). */
  appearanceAtkPct: number;
  /** Additive ATK% from constellation ATK and All Stats star nodes. */
  constellationAtkPct: number;
  /** Additive ATK% from Demon Sanctuary level. */
  sanctuaryAtkPct: number;
  /** Multiplicative Growing Knowledge factor (≥ 1.0; 1.0 = no bonus). */
  growingKnowledgeMultiplier: number;
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

/**
 * Combines all ATK sources into a single final ATK value.
 *
 * Formula:
 *   absoluteBase      = weaponAtk + growthStrAtk
 *   additivePctTotal  = promotionAtkPct + promotionBonusAtkPct
 *                     + companionsAtkPct + tomAtkPct
 *                     + appearanceAtkPct + constellationAtkPct
 *                     + sanctuaryAtkPct
 *   finalATK = absoluteBase × (1 + additivePctTotal) × growingKnowledgeMultiplier
 *
 * @param sources - Pre-computed values from all individual ATK source functions
 * @returns Final aggregated ATK value (same unit as weapon ATK)
 */
export function aggregateAtk(sources: AtkSources): number {
  const absoluteBase = sources.weaponAtk + sources.growthStrAtk;

  const additivePctTotal =
    sources.promotionAtkPct +
    sources.promotionBonusAtkPct +
    sources.companionsAtkPct +
    sources.tomAtkPct +
    sources.appearanceAtkPct +
    sources.constellationAtkPct +
    sources.sanctuaryAtkPct;

  return absoluteBase * (1 + additivePctTotal) * sources.growingKnowledgeMultiplier;
}

/**
 * Breaks down final ATK into intermediate values for display or debugging.
 *
 * Returns the same result as `aggregateAtk` alongside the two intermediate
 * quantities so callers can show contributors without re-implementing the
 * formula.
 *
 * @param sources - Pre-computed values from all individual ATK source functions
 * @returns Object with `absoluteBase`, `additivePctTotal`, `multiplicativeFactor`,
 *   and `finalAtk`
 */
export function aggregateAtkDetailed(sources: AtkSources): {
  absoluteBase: number;
  additivePctTotal: number;
  multiplicativeFactor: number;
  finalAtk: number;
} {
  const absoluteBase = sources.weaponAtk + sources.growthStrAtk;

  const additivePctTotal =
    sources.promotionAtkPct +
    sources.promotionBonusAtkPct +
    sources.companionsAtkPct +
    sources.tomAtkPct +
    sources.appearanceAtkPct +
    sources.constellationAtkPct +
    sources.sanctuaryAtkPct;

  const multiplicativeFactor = sources.growingKnowledgeMultiplier;
  const finalAtk = absoluteBase * (1 + additivePctTotal) * multiplicativeFactor;

  return { absoluteBase, additivePctTotal, multiplicativeFactor, finalAtk };
}
