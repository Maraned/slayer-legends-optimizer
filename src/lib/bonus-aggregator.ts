/**
 * Farming bonus multiplier aggregator.
 *
 * Collects EXP, Monster Gold, and drop-rate bonus fractions from every
 * player-controlled source and merges them into a single FarmingBonuses
 * object ready for the per-stage resource rate calculator.
 *
 * Sources covered
 * ───────────────
 *   1. Appearance    — clothing items whose bonusType is 'Extra EXP' or 'Monster Gold'
 *   2. Companions    — advancement steps with buffType 'Extra EXP' or 'Monster Gold'
 *   3. Character     — promotion tier cumulative Monster Gold bonus (monsterGoldBonusPct)
 *   4. Constellation — star-node buff totals for 'Extra EXP' and 'Monster Gold'
 *   5. Memory Tree   — TOM nodes whose effectType is 'Extra EXP' or 'Monster Gold',
 *                      summed up to each node's currentLevel
 *
 * Typical usage
 * ─────────────
 *   const breakdown = aggregateFarmingBonuses({
 *     appearanceBonusTotals: state.appearance.bonusTotals,
 *     companions:            state.companions,
 *     promotion:             state.character.promotion,
 *     constellationBuffTotals: state.constellation.buffTotals,
 *     tomNodes:              state.tom.nodes,
 *   });
 *   const rates = calculateStageResourceRates(stage, breakdown.totals);
 */

import type { AppearanceBonusTotals } from '../types/appearance';
import type { CompanionsState } from '../types/companions';
import type { Promotion } from '../types/character';
import type { ConstellationBuffTotals } from '../types/constellation';
import type { TOMNode } from '../types/tom';
import type {
  FarmingBonuses,
  FarmingBonusBreakdown,
  ExtraExpBreakdown,
  MonsterGoldBreakdown,
} from '../types/farming-bonuses';

// ---------------------------------------------------------------------------
// Source 1 — Appearance
// ---------------------------------------------------------------------------

/**
 * Extracts Extra EXP and Monster Gold bonus fractions from the pre-aggregated
 * appearance clothing bonus totals.
 *
 * @param bonusTotals - AppearanceBonusTotals from AppearanceState.bonusTotals.
 *                      Keys that are absent contribute 0.
 */
export function expBonusFromAppearance(
  bonusTotals: AppearanceBonusTotals,
): number {
  return bonusTotals['Extra EXP'] ?? 0;
}

export function goldBonusFromAppearance(
  bonusTotals: AppearanceBonusTotals,
): number {
  return bonusTotals['Monster Gold'] ?? 0;
}

// ---------------------------------------------------------------------------
// Source 2 — Companions
// ---------------------------------------------------------------------------

/**
 * Sums Extra EXP buff values across all four companions' advancement steps.
 *
 * @param companions - CompanionsState tuple (all four companions).
 */
export function expBonusFromCompanions(companions: CompanionsState): number {
  let total = 0;
  for (const companion of companions) {
    for (const step of companion.advancementSteps) {
      if (step.buffType === 'Extra EXP') {
        total += step.buffValue;
      }
    }
  }
  return total;
}

/**
 * Sums Monster Gold buff values across all four companions' advancement steps.
 *
 * @param companions - CompanionsState tuple (all four companions).
 */
export function goldBonusFromCompanions(companions: CompanionsState): number {
  let total = 0;
  for (const companion of companions) {
    for (const step of companion.advancementSteps) {
      if (step.buffType === 'Monster Gold') {
        total += step.buffValue;
      }
    }
  }
  return total;
}

// ---------------------------------------------------------------------------
// Source 3 — Character Promotion
// ---------------------------------------------------------------------------

/**
 * Returns the Monster Gold bonus fraction from the character's current
 * promotion tier.
 *
 * The `monsterGoldBonusPct` field stores a cumulative percentage value
 * (e.g. 15 = +15%). This function converts it to a fraction (÷ 100).
 *
 * @param promotion - Promotion state from CharacterState.promotion.
 */
export function goldBonusFromPromotion(promotion: Promotion): number {
  return promotion.monsterGoldBonusPct / 100;
}

// ---------------------------------------------------------------------------
// Source 4 — Constellation
// ---------------------------------------------------------------------------

/**
 * Returns the Extra EXP bonus fraction from the pre-aggregated constellation
 * buff totals.
 *
 * @param buffTotals - ConstellationBuffTotals from ConstellationSheetState.buffTotals.
 */
export function expBonusFromConstellation(
  buffTotals: ConstellationBuffTotals,
): number {
  return buffTotals['Extra EXP'] ?? 0;
}

/**
 * Returns the Monster Gold bonus fraction from the pre-aggregated
 * constellation buff totals.
 *
 * @param buffTotals - ConstellationBuffTotals from ConstellationSheetState.buffTotals.
 */
export function goldBonusFromConstellation(
  buffTotals: ConstellationBuffTotals,
): number {
  return buffTotals['Monster Gold'] ?? 0;
}

// ---------------------------------------------------------------------------
// Source 5 — Memory Tree (TOM)
// ---------------------------------------------------------------------------

/**
 * Sums the Extra EXP bonus fraction from all TOM nodes up to each node's
 * currentLevel.
 *
 * For each node whose levels contain 'Extra EXP' effectType entries, the
 * function accumulates effectValue for every level index ≤ node.currentLevel.
 *
 * @param tomNodes - Array of TOMNode objects with currentLevel populated.
 *                   Nodes with currentLevel === 0 contribute nothing.
 */
export function expBonusFromMemoryTree(tomNodes: TOMNode[]): number {
  let total = 0;
  for (const node of tomNodes) {
    if (node.currentLevel === 0) continue;
    for (const levelEntry of node.levels) {
      if (
        levelEntry.effectType === 'Extra EXP' &&
        levelEntry.level <= node.currentLevel
      ) {
        total += levelEntry.effectValue;
      }
    }
  }
  return total;
}

/**
 * Sums the Monster Gold bonus fraction from all TOM nodes up to each node's
 * currentLevel.
 *
 * @param tomNodes - Array of TOMNode objects with currentLevel populated.
 *                   Nodes with currentLevel === 0 contribute nothing.
 */
export function goldBonusFromMemoryTree(tomNodes: TOMNode[]): number {
  let total = 0;
  for (const node of tomNodes) {
    if (node.currentLevel === 0) continue;
    for (const levelEntry of node.levels) {
      if (
        levelEntry.effectType === 'Monster Gold' &&
        levelEntry.level <= node.currentLevel
      ) {
        total += levelEntry.effectValue;
      }
    }
  }
  return total;
}

// ---------------------------------------------------------------------------
// Merge utility
// ---------------------------------------------------------------------------

/**
 * Merges partial FarmingBonuses from multiple sources by summing each field.
 * Missing fields default to 0.
 *
 * @param sources - One or more Partial<FarmingBonuses> to combine.
 */
export function mergeFarmingBonuses(
  ...sources: Partial<FarmingBonuses>[]
): FarmingBonuses {
  const result: FarmingBonuses = {
    extraExpBonus: 0,
    monsterGoldBonus: 0,
    dropRateBonus: 0,
    rareDropRateBonus: 0,
  };
  for (const src of sources) {
    result.extraExpBonus += src.extraExpBonus ?? 0;
    result.monsterGoldBonus += src.monsterGoldBonus ?? 0;
    result.dropRateBonus += src.dropRateBonus ?? 0;
    result.rareDropRateBonus += src.rareDropRateBonus ?? 0;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Main aggregator
// ---------------------------------------------------------------------------

/**
 * Input bag for aggregateFarmingBonuses.
 * All fields are optional so callers can omit sources that are not yet loaded.
 */
export interface AggregateFarmingBonusesInput {
  /** Pre-aggregated appearance clothing bonus totals */
  appearanceBonusTotals?: AppearanceBonusTotals;
  /** All four companion states */
  companions?: CompanionsState;
  /** Character promotion state */
  promotion?: Promotion;
  /** Pre-aggregated constellation buff totals */
  constellationBuffTotals?: ConstellationBuffTotals;
  /** TOM node array with currentLevel populated */
  tomNodes?: TOMNode[];
}

/**
 * Aggregates farming bonus multipliers from all available player sources
 * into a single FarmingBonusBreakdown.
 *
 * Returns both the per-source breakdown (for UI display) and the merged
 * FarmingBonuses totals (for the stage-rate calculator).
 *
 * @param input - Player state slices for each bonus source.
 * @returns FarmingBonusBreakdown containing per-source details and totals.
 *
 * @example
 * ```ts
 * const breakdown = aggregateFarmingBonuses({
 *   appearanceBonusTotals: save.appearance.bonusTotals,
 *   companions:            save.companions,
 *   promotion:             save.character.promotion,
 *   constellationBuffTotals: constellationSheet.buffTotals,
 *   tomNodes:              tomState.nodes,
 * });
 *
 * // Use totals in the stage calculator
 * const rates = calculateStageResourceRates(stage, breakdown.totals);
 *
 * // Use breakdown for UI
 * console.log(breakdown.extraExp.appearance);   // from clothing
 * console.log(breakdown.monsterGold.character); // from promotion
 * ```
 */
export function aggregateFarmingBonuses(
  input: AggregateFarmingBonusesInput,
): FarmingBonusBreakdown {
  const {
    appearanceBonusTotals = {},
    companions,
    promotion,
    constellationBuffTotals = {},
    tomNodes = [],
  } = input;

  // --- Extra EXP breakdown -------------------------------------------------
  const extraExp: ExtraExpBreakdown = {
    appearance: expBonusFromAppearance(appearanceBonusTotals),
    companions: companions ? expBonusFromCompanions(companions) : 0,
    constellation: expBonusFromConstellation(constellationBuffTotals),
    memoryTree: expBonusFromMemoryTree(tomNodes),
  };

  // --- Monster Gold breakdown -----------------------------------------------
  const monsterGold: MonsterGoldBreakdown = {
    appearance: goldBonusFromAppearance(appearanceBonusTotals),
    companions: companions ? goldBonusFromCompanions(companions) : 0,
    character: promotion ? goldBonusFromPromotion(promotion) : 0,
    constellation: goldBonusFromConstellation(constellationBuffTotals),
    memoryTree: goldBonusFromMemoryTree(tomNodes),
  };

  // --- Totals ---------------------------------------------------------------
  const totals: FarmingBonuses = {
    extraExpBonus:
      extraExp.appearance +
      extraExp.companions +
      extraExp.constellation +
      extraExp.memoryTree,
    monsterGoldBonus:
      monsterGold.appearance +
      monsterGold.companions +
      monsterGold.character +
      monsterGold.constellation +
      monsterGold.memoryTree,
    dropRateBonus: 0,
    rareDropRateBonus: 0,
  };

  return { extraExp, monsterGold, totals };
}
