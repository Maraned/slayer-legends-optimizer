/**
 * Type definitions for per-stage resource rate calculations.
 * Used by src/lib/stage-calculator.ts.
 */

// ---------------------------------------------------------------------------
// Calculator inputs
// ---------------------------------------------------------------------------

/**
 * Aggregated player farming bonuses from all sources:
 * - Appearance clothing items (Extra EXP, Monster Gold)
 * - Companion advancement steps (Extra EXP, Monster Gold)
 * - Character promotion tier (Monster Gold)
 *
 * All values are fractional bonuses added on top of the base (0.1 = +10%).
 */
export interface FarmingBonuses {
  /**
   * Total extra EXP bonus fraction from all sources.
   * Applied multiplicatively: baseExp * (1 + extraExpBonus).
   * Example: 0.35 = +35% extra EXP.
   */
  extraExpBonus: number;

  /**
   * Total extra Monster Gold bonus fraction from all sources.
   * Applied multiplicatively: baseGold * (1 + monsterGoldBonus).
   * Example: 0.20 = +20% extra gold.
   */
  monsterGoldBonus: number;

  /**
   * Additional drop rate bonus fraction applied to all item drops.
   * Stacks additively with the stage's own Drop Rate Boost modifier.
   * Example: 0.10 = +10% to all drop rates.
   */
  dropRateBonus: number;

  /**
   * Additional rare drop rate bonus fraction applied to drops classified as rare.
   * Stacks additively with the stage's own Rare Drop Boost modifier.
   * Example: 0.05 = +5% to rare drop rates.
   */
  rareDropRateBonus: number;
}

// ---------------------------------------------------------------------------
// Calculator outputs
// ---------------------------------------------------------------------------

/**
 * Expected drop quantity for a single item from a stage run.
 */
export interface ItemDropRate {
  /** Canonical item identifier (matches MobDrop.itemId) */
  itemId: string;
  /** Display name of the item */
  itemName: string;
  /**
   * Expected average quantity of this item per full stage run.
   * Accounts for drop probability, min/max quantity, mob count, and drop rate bonuses.
   * Formula: sum over all mobs of (dropRate * avgQty * count * dropRateMultiplier)
   */
  expectedQtyPerRun: number;
  /**
   * Expected average quantity per energy spent.
   * = expectedQtyPerRun / stage.energyCost
   */
  expectedQtyPerEnergy: number;
}

/**
 * Per-stage resource yield for a single stage run and normalised per energy.
 */
export interface StageResourceRates {
  /** The stage these rates apply to */
  stageId: number;
  /** Human-readable stage label (e.g. "3-2-7") */
  stageLabel: string;
  /** Stamina cost per run */
  energyCost: number;

  // --- Base values (before player bonuses, after stage modifiers) ----------

  /**
   * Base EXP per run from all mobs, after stage EXP Boost multiplier only.
   * Does not include the player's extraExpBonus.
   */
  baseExpPerRun: number;

  /**
   * Base Gold per run from all mobs, after stage Gold Boost multiplier only.
   * Does not include the player's monsterGoldBonus.
   */
  baseGoldPerRun: number;

  // --- Final values (base × player bonus multipliers) ----------------------

  /**
   * Total expected EXP per run after all bonuses.
   * = baseExpPerRun * (1 + extraExpBonus)
   */
  expPerRun: number;

  /**
   * Total expected EXP per energy spent.
   * = expPerRun / energyCost
   */
  expPerEnergy: number;

  /**
   * Total expected Gold per run after all bonuses.
   * = baseGoldPerRun * (1 + monsterGoldBonus)
   */
  goldPerRun: number;

  /**
   * Total expected Gold per energy spent.
   * = goldPerRun / energyCost
   */
  goldPerEnergy: number;

  /**
   * Expected item drop quantities per run and per energy for every distinct
   * item that can drop in this stage.
   */
  itemDrops: ItemDropRate[];
}

// ---------------------------------------------------------------------------
// Bonus aggregation helpers (input shape from save state)
// ---------------------------------------------------------------------------

/**
 * Minimal slice of companion advancement data needed for bonus aggregation.
 * Mirrors the shape of CompanionsState without importing the full type.
 */
export interface CompanionAdvancementSlice {
  advancementSteps: Array<{
    buffType: string;
    buffValue: number;
  }>;
}
