/**
 * Optimal enhancement target calculator.
 *
 * Determines which of the 7 enhanceable stats gives the best return on
 * investment (stat gain per gold) when enhanced to the next level.
 *
 * Efficiency formula per stat:
 *   goldCostForNextLevel = segmentCost(currentLevel, currentLevel + 1)
 *   statGainPerGold      = bonusPerLevel / goldCostForNextLevel
 *
 * Stats are ranked by statGainPerGold descending; maxed stats (currentLevel
 * >= maxLevel) are placed after all non-maxed stats regardless of efficiency.
 *
 * Note: bonusPerLevel uses each stat's natural unit — e.g. flat ATK for ATK,
 * percentage points for CRIT_DMG, CRIT_PCT, DEATH_STRIKE_PCT, and flat values
 * for DEATH_STRIKE, HP, HP_RECOVERY. Efficiency values are therefore
 * comparable only within the same stat type and are used for priority ranking
 * within the context of the full set.
 */

import type { EnhanceableStatKey } from '../types/character';
import { segmentCost } from './gold-calculator';

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

/**
 * Configuration for a single enhanceable stat.
 */
export interface EnhancementStatConfig {
  /** The stat identifier (one of the 7 enhanceable stat keys). */
  statKey: EnhanceableStatKey;
  /** Stat bonus granted per enhancement level (in the stat's natural unit). */
  bonusPerLevel: number;
  /** Player's current enhancement level for this stat. */
  currentLevel: number;
  /**
   * Maximum enhancement level allowed for this stat.
   * When currentLevel >= maxLevel the stat is considered maxed.
   * Use 0 to indicate no cap (treated as never maxed).
   */
  maxLevel: number;
  /**
   * Number of enhancement levels applied in a single step.
   * Matches the CHARACTER sheet "Enhance Multiplier" (D5). Default is 1.
   */
  enhanceSteps?: number;
}

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

/**
 * Efficiency metrics for a single enhanceable stat.
 */
export interface EnhancementEfficiency {
  /** The stat identifier. */
  statKey: EnhanceableStatKey;
  /** Player's current enhancement level. */
  currentLevel: number;
  /** Maximum enhancement level (0 = uncapped). */
  maxLevel: number;
  /** Stat bonus added per enhancement level. */
  bonusPerLevel: number;
  /**
   * Gold cost to enhance this stat from currentLevel to currentLevel + 1.
   * Zero when the stat is maxed (no next level exists).
   */
  goldCostForNextLevel: number;
  /**
   * Stat bonus gained per gold spent for the next enhancement level.
   * Zero when the stat is maxed or goldCostForNextLevel is zero.
   */
  statGainPerGold: number;
  /** True when currentLevel >= maxLevel and maxLevel > 0. */
  isMaxed: boolean;
}

/**
 * Enhancement efficiency entry augmented with a priority rank.
 */
export interface RankedEnhancementTarget extends EnhancementEfficiency {
  /**
   * 1-based rank position ordered by statGainPerGold descending.
   * Maxed stats are ranked after all non-maxed stats and sorted among
   * themselves by statKey alphabetically.
   */
  rank: number;
}

// ---------------------------------------------------------------------------
// Core calculation
// ---------------------------------------------------------------------------

/**
 * Computes efficiency metrics for a single enhanceable stat.
 *
 * @param config - Current state and bonus-per-level for one stat
 * @returns Efficiency metrics including gold cost and stat-gain-per-gold
 */
export function calculateEnhancementEfficiency(
  config: EnhancementStatConfig,
): EnhancementEfficiency {
  const isMaxed =
    config.maxLevel > 0 && config.currentLevel >= config.maxLevel;

  if (isMaxed) {
    return {
      statKey: config.statKey,
      currentLevel: config.currentLevel,
      maxLevel: config.maxLevel,
      bonusPerLevel: config.bonusPerLevel,
      goldCostForNextLevel: 0,
      statGainPerGold: 0,
      isMaxed: true,
    };
  }

  const steps = config.enhanceSteps ?? 1;
  const goldCostForNextLevel = segmentCost(
    config.currentLevel,
    config.currentLevel + steps,
  );

  const statGainPerGold =
    goldCostForNextLevel > 0 ? (config.bonusPerLevel * steps) / goldCostForNextLevel : 0;

  return {
    statKey: config.statKey,
    currentLevel: config.currentLevel,
    maxLevel: config.maxLevel,
    bonusPerLevel: config.bonusPerLevel,
    goldCostForNextLevel,
    statGainPerGold,
    isMaxed: false,
  };
}

/**
 * Computes efficiency metrics for every stat in the provided list.
 *
 * @param configs - One entry per enhanceable stat to evaluate
 * @returns One efficiency entry per stat in the same order as input
 */
export function calculateAllEnhancementEfficiencies(
  configs: EnhancementStatConfig[],
): EnhancementEfficiency[] {
  return configs.map(calculateEnhancementEfficiency);
}

// ---------------------------------------------------------------------------
// Ranking
// ---------------------------------------------------------------------------

/**
 * Ranks enhanceable stats by their return on investment (stat gain per gold).
 *
 * Sorting rules:
 *   1. Non-maxed stats before maxed stats.
 *   2. Among non-maxed stats: descending statGainPerGold.
 *   3. Among maxed stats: ascending statKey (alphabetical, for determinism).
 *
 * @param configs - One entry per enhanceable stat to evaluate
 * @returns Array of RankedEnhancementTarget sorted by rank ascending
 */
export function rankEnhancementTargets(
  configs: EnhancementStatConfig[],
): RankedEnhancementTarget[] {
  const efficiencies = calculateAllEnhancementEfficiencies(configs);

  const sorted = [...efficiencies].sort((a, b) => {
    // Maxed stats always trail non-maxed
    if (a.isMaxed !== b.isMaxed) return a.isMaxed ? 1 : -1;

    if (a.isMaxed && b.isMaxed) {
      // Both maxed — stable alphabetical order by statKey
      return a.statKey < b.statKey ? -1 : a.statKey > b.statKey ? 1 : 0;
    }

    // Both non-maxed — higher statGainPerGold is better
    return b.statGainPerGold - a.statGainPerGold;
  });

  return sorted.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}
