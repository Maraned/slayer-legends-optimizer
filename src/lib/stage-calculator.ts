/**
 * Per-stage resource rate calculator.
 *
 * Given a Stage and the player's aggregated FarmingBonuses, computes expected
 * EXP, Gold, and item-drop yields both per run and per energy spent.
 *
 * Calculation overview
 * ────────────────────
 * 1. Sum raw EXP and Gold from all mobs (expReward × count, goldReward × count).
 * 2. Apply stage-level bonus modifiers (EXP Boost, Gold Boost multipliers).
 * 3. Apply player bonus fractions (extraExpBonus, monsterGoldBonus).
 * 4. For each distinct item drop across all mobs, compute the expected average
 *    quantity per run:
 *      expectedQty = dropRate × ((minQty + maxQty) / 2) × mobCount × dropMultiplier
 *    where dropMultiplier incorporates the stage Drop Rate Boost and player
 *    dropRateBonus.
 * 5. Normalise all per-run values by energyCost to produce per-energy rates.
 */

import type { Stage, Mob, MobDrop, StageBonus } from '../types/stage';
import type {
  FarmingBonuses,
  ItemDropRate,
  StageResourceRates,
  CompanionAdvancementSlice,
} from '../types/stage-rates';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Returns the stage bonus multiplier for a given bonus type, defaulting to 1
 * if the bonus is not present on the stage.
 */
function getStageBonusMultiplier(
  bonuses: StageBonus[],
  type: StageBonus['type'],
): number {
  const bonus = bonuses.find((b) => b.type === type);
  return bonus ? bonus.multiplier : 1;
}

/**
 * Aggregates raw EXP across all mobs in a stage (before any multipliers).
 * Raw EXP = sum of (mob.expReward × mob.count).
 */
function sumRawExp(mobs: Mob[]): number {
  return mobs.reduce((total, mob) => total + mob.expReward * mob.count, 0);
}

/**
 * Aggregates raw Gold across all mobs in a stage (before any multipliers).
 * Raw Gold = sum of (mob.goldReward × mob.count).
 */
function sumRawGold(mobs: Mob[]): number {
  return mobs.reduce((total, mob) => total + mob.goldReward * mob.count, 0);
}

/**
 * Builds a consolidated map of item drop expectations from all mobs.
 *
 * For each (itemId, itemName) pair, accumulates:
 *   expectedQty += dropRate × avgQty × mobCount
 *
 * The drop rate multiplier (stage boost + player bonus) is applied afterwards
 * so all sources for the same item are combined before scaling.
 */
function buildItemDropMap(
  mobs: Mob[],
): Map<string, { itemName: string; baseExpectedQty: number }> {
  const map = new Map<string, { itemName: string; baseExpectedQty: number }>();

  for (const mob of mobs) {
    for (const drop of mob.drops) {
      const avgQty = (drop.minQty + drop.maxQty) / 2;
      // Expected quantity contribution from this mob for this item
      const contribution = drop.dropRate * avgQty * mob.count;

      const existing = map.get(drop.itemId);
      if (existing) {
        existing.baseExpectedQty += contribution;
      } else {
        map.set(drop.itemId, {
          itemName: drop.itemName,
          baseExpectedQty: contribution,
        });
      }
    }
  }

  return map;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Calculates per-run and per-energy resource rates for a single stage,
 * incorporating all stage-level and player-level bonus multipliers.
 *
 * @param stage   - Full stage data (mobs, drops, bonuses, energyCost).
 * @param bonuses - Aggregated player farming bonuses (see FarmingBonuses).
 * @returns       StageResourceRates with per-run and per-energy yields.
 */
export function calculateStageResourceRates(
  stage: Stage,
  bonuses: FarmingBonuses,
): StageResourceRates {
  const { mobs, bonuses: stageBonuses, energyCost } = stage;

  // ------------------------------------------------------------------
  // 1. Stage-level multipliers
  // ------------------------------------------------------------------
  const stageExpMultiplier = getStageBonusMultiplier(stageBonuses, 'EXP Boost');
  const stageGoldMultiplier = getStageBonusMultiplier(stageBonuses, 'Gold Boost');
  const stageDropMultiplier = getStageBonusMultiplier(
    stageBonuses,
    'Drop Rate Boost',
  );

  // ------------------------------------------------------------------
  // 2. EXP calculation
  // ------------------------------------------------------------------
  const rawExp = sumRawExp(mobs);
  const baseExpPerRun = rawExp * stageExpMultiplier;
  const expPerRun = baseExpPerRun * (1 + bonuses.extraExpBonus);
  const expPerEnergy = energyCost > 0 ? expPerRun / energyCost : 0;

  // ------------------------------------------------------------------
  // 3. Gold calculation
  // ------------------------------------------------------------------
  const rawGold = sumRawGold(mobs);
  const baseGoldPerRun = rawGold * stageGoldMultiplier;
  const goldPerRun = baseGoldPerRun * (1 + bonuses.monsterGoldBonus);
  const goldPerEnergy = energyCost > 0 ? goldPerRun / energyCost : 0;

  // ------------------------------------------------------------------
  // 4. Item drop calculations
  // ------------------------------------------------------------------
  // Combined drop rate multiplier: stage boost × (1 + player bonus)
  // The stage multiplier is a raw factor (e.g. 1.05 = +5%), while the
  // player bonus is an additive fraction (e.g. 0.10 = +10%).
  const dropMultiplier =
    stageDropMultiplier * (1 + bonuses.dropRateBonus);

  const itemDropMap = buildItemDropMap(mobs);

  const itemDrops: ItemDropRate[] = [];
  for (const [itemId, { itemName, baseExpectedQty }] of itemDropMap) {
    const expectedQtyPerRun = baseExpectedQty * dropMultiplier;
    const expectedQtyPerEnergy =
      energyCost > 0 ? expectedQtyPerRun / energyCost : 0;

    itemDrops.push({
      itemId,
      itemName,
      expectedQtyPerRun,
      expectedQtyPerEnergy,
    });
  }

  // Sort item drops by expected quantity descending for convenience
  itemDrops.sort((a, b) => b.expectedQtyPerRun - a.expectedQtyPerRun);

  return {
    stageId: stage.id,
    stageLabel: stage.label,
    energyCost,
    baseExpPerRun,
    baseGoldPerRun,
    expPerRun,
    expPerEnergy,
    goldPerRun,
    goldPerEnergy,
    itemDrops,
  };
}

/**
 * Calculates resource rates for multiple stages and sorts by the given
 * resource metric descending, enabling stage comparison and ranking.
 *
 * @param stages  - Array of Stage objects to evaluate.
 * @param bonuses - Aggregated player farming bonuses.
 * @param rankBy  - The per-energy metric to sort by:
 *                  'exp'  → expPerEnergy
 *                  'gold' → goldPerEnergy
 *                  any other string is treated as an itemId and sorts by the
 *                  matching item's expectedQtyPerEnergy.
 * @returns Array of StageResourceRates sorted by rankBy metric, descending.
 */
export function rankStagesByResource(
  stages: Stage[],
  bonuses: FarmingBonuses,
  rankBy: 'exp' | 'gold' | string,
): StageResourceRates[] {
  const rates = stages.map((stage) =>
    calculateStageResourceRates(stage, bonuses),
  );

  rates.sort((a, b) => {
    let aVal: number;
    let bVal: number;

    if (rankBy === 'exp') {
      aVal = a.expPerEnergy;
      bVal = b.expPerEnergy;
    } else if (rankBy === 'gold') {
      aVal = a.goldPerEnergy;
      bVal = b.goldPerEnergy;
    } else {
      // Rank by item drop rate for the given itemId
      const aItem = a.itemDrops.find((d) => d.itemId === rankBy);
      const bItem = b.itemDrops.find((d) => d.itemId === rankBy);
      aVal = aItem ? aItem.expectedQtyPerEnergy : 0;
      bVal = bItem ? bItem.expectedQtyPerEnergy : 0;
    }

    return bVal - aVal;
  });

  return rates;
}

// ---------------------------------------------------------------------------
// Bonus aggregation helpers
// ---------------------------------------------------------------------------

/**
 * Aggregates FarmingBonuses from appearance clothing bonus totals.
 *
 * @param bonusTotals - AppearanceBonusTotals (Partial<Record<BonusType, number>>)
 *                      where BonusType includes 'Extra EXP' and 'Monster Gold'.
 */
export function bonusesFromAppearance(bonusTotals: {
  'Extra EXP'?: number;
  'Monster Gold'?: number;
}): Pick<FarmingBonuses, 'extraExpBonus' | 'monsterGoldBonus'> {
  return {
    extraExpBonus: bonusTotals['Extra EXP'] ?? 0,
    monsterGoldBonus: bonusTotals['Monster Gold'] ?? 0,
  };
}

/**
 * Aggregates EXP and Gold farming bonuses from all companions' advancement steps.
 *
 * Sums buffValue for all steps where buffType is 'Extra EXP' or 'Monster Gold'
 * across every companion in the provided array.
 *
 * @param companions - Array of companion slices (name + advancementSteps).
 */
export function bonusesFromCompanions(
  companions: CompanionAdvancementSlice[],
): Pick<FarmingBonuses, 'extraExpBonus' | 'monsterGoldBonus'> {
  let extraExpBonus = 0;
  let monsterGoldBonus = 0;

  for (const companion of companions) {
    for (const step of companion.advancementSteps) {
      if (step.buffType === 'Extra EXP') {
        extraExpBonus += step.buffValue;
      } else if (step.buffType === 'Monster Gold') {
        monsterGoldBonus += step.buffValue;
      }
    }
  }

  return { extraExpBonus, monsterGoldBonus };
}

/**
 * Merges partial FarmingBonuses from multiple sources into a single
 * FarmingBonuses object. Numeric fields are summed.
 *
 * Usage:
 *   const bonuses = mergeFarmingBonuses(
 *     bonusesFromAppearance(appearance.bonusTotals),
 *     bonusesFromCompanions(companions),
 *     { monsterGoldBonus: character.promotion.monsterGoldBonusPct / 100 },
 *   );
 *
 * @param sources - One or more partial FarmingBonuses to merge.
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

  for (const source of sources) {
    result.extraExpBonus += source.extraExpBonus ?? 0;
    result.monsterGoldBonus += source.monsterGoldBonus ?? 0;
    result.dropRateBonus += source.dropRateBonus ?? 0;
    result.rareDropRateBonus += source.rareDropRateBonus ?? 0;
  }

  return result;
}
