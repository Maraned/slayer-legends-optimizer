'use client';

import { useMemo } from 'react';

import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import { useCalculatorInputsStore, type CalculatorInputsStore } from '@/store/useCalculatorInputsStore';
import { rankEnhancementTargets } from '@/lib/enhancement-optimizer';
import type { RankedEnhancementTarget } from '@/lib/enhancement-optimizer';
import type { EnhanceableStatKey } from '@/types/character';
import { ENHANCEABLE_STAT_LABELS } from '@/components/StatDisplay/StatDisplay';
import { NumberInput } from '@/components/NumberInput';

/**
 * Stat bonus granted per enhancement level (percentage points).
 * Used to compute stat-gain-per-gold efficiency for ranking.
 * Values reflect each stat's per-level contribution in its natural unit.
 */
const BONUS_PER_LEVEL: Record<EnhanceableStatKey, number> = {
  ATK: 0.001,
  CRIT_DMG: 0.005,
  CRIT_PCT: 0.001,
  DEATH_STRIKE: 0.005,
  DEATH_STRIKE_PCT: 0.001,
  HP: 0.001,
  HP_RECOVERY: 0.001,
};

function formatGold(gold: number): string {
  if (gold <= 0) return '—';
  if (gold >= 1e12) return `${(gold / 1e12).toFixed(2)}T`;
  if (gold >= 1e9) return `${(gold / 1e9).toFixed(2)}B`;
  if (gold >= 1e6) return `${(gold / 1e6).toFixed(2)}M`;
  if (gold >= 1e3) return `${(gold / 1e3).toFixed(2)}K`;
  return gold.toFixed(0);
}

function getRankBadgeClasses(rank: number, isMaxed: boolean): string {
  if (isMaxed) return 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400';
  if (rank === 1) return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
  if (rank === 2) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
  if (rank === 3) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
  return 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400';
}

function getEfficiencyBarColor(relativeEfficiency: number): string {
  if (relativeEfficiency >= 67) return 'bg-green-500';
  if (relativeEfficiency >= 34) return 'bg-yellow-500';
  return 'bg-red-500';
}

/**
 * Displays all 7 enhanceable stats ranked by efficiency (stat gain per gold).
 *
 * Rank 1 = best return on investment for the next enhancement level.
 * Maxed stats are ranked last and shown with a MAX badge.
 */
export function EnhancementRanking() {
  const enhanceableStats = useUserSaveStore((s: UserSaveStore) => s.character.enhanceableStats);
  const setEnhanceableStats = useUserSaveStore((s: UserSaveStore) => s.setEnhanceableStats);
  const enhanceMultiplier = useCalculatorInputsStore((s: CalculatorInputsStore) => s.enhanceMultiplier);
  const goldEnhancementTargets = useCalculatorInputsStore((s: CalculatorInputsStore) => s.goldEnhancementTargets);
  const setGoldEnhancementTarget = useCalculatorInputsStore((s: CalculatorInputsStore) => s.setGoldEnhancementTarget);

  const ranked = useMemo(
    () =>
      rankEnhancementTargets(
        (
          Object.entries(enhanceableStats) as [
            EnhanceableStatKey,
            { currentLevel: number; maxLevel: number },
          ][]
        ).map(([key, entry]) => ({
          statKey: key,
          bonusPerLevel: BONUS_PER_LEVEL[key],
          currentLevel: entry.currentLevel,
          maxLevel: entry.maxLevel,
          enhanceSteps: enhanceMultiplier,
        })),
      ),
    [enhanceableStats, enhanceMultiplier],
  );

  const maxStatGainPerGold = useMemo(
    () =>
      ranked.reduce(
        (max, entry) => (!entry.isMaxed ? Math.max(max, entry.statGainPerGold) : max),
        0,
      ),
    [ranked],
  );

  return (
    <div className="space-y-1">
      {ranked.map((entry: RankedEnhancementTarget) => {
        const relativeEfficiency =
          !entry.isMaxed && maxStatGainPerGold > 0
            ? (entry.statGainPerGold / maxStatGainPerGold) * 100
            : 0;
        const statEntry = enhanceableStats[entry.statKey];
        const targetLevel = goldEnhancementTargets[entry.statKey];

        return (
          <div
            key={entry.statKey}
            className="flex flex-wrap items-center gap-3 rounded-md bg-gray-50 px-3 py-2 dark:bg-gray-800/50"
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${getRankBadgeClasses(entry.rank, entry.isMaxed)}`}
              aria-label={`Rank ${entry.rank}`}
            >
              {entry.rank}
            </span>

            <span className="w-28 text-sm font-medium text-gray-900 dark:text-gray-100">
              {ENHANCEABLE_STAT_LABELS[entry.statKey]}
            </span>

            <div className="flex items-center gap-2">
              <NumberInput
                label="Current"
                value={statEntry.currentLevel}
                onChange={(val) =>
                  setEnhanceableStats({
                    ...enhanceableStats,
                    [entry.statKey]: { ...statEntry, currentLevel: val },
                  })
                }
                min={0}
              />
              <NumberInput
                label="Target"
                value={targetLevel}
                onChange={(val) => setGoldEnhancementTarget(entry.statKey, val)}
                min={0}
              />
            </div>

            {entry.isMaxed ? (
              <span className="rounded px-1.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                MAX
              </span>
            ) : (
              <div className="flex items-center gap-2 ml-auto">
                <div
                  className="flex items-center gap-1.5"
                  aria-label={`Efficiency: ${Math.round(relativeEfficiency)}%`}
                  title={`Efficiency score: ${Math.round(relativeEfficiency)}% of best`}
                >
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                    <div
                      className={`h-full rounded-full ${getEfficiencyBarColor(relativeEfficiency)}`}
                      style={{ width: `${relativeEfficiency}%` }}
                    />
                  </div>
                  <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400 w-8 text-right">
                    {Math.round(relativeEfficiency)}%
                  </span>
                </div>
                <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400">
                  {formatGold(entry.goldCostForNextLevel)} / next lvl
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
