'use client';

import type { EnhanceableStatKey, EnhanceLevelEntry } from '@/types/character';
import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import { NumberInput } from '@/components/NumberInput';
import {
  ENHANCEABLE_STAT_LABELS,
  ENHANCEABLE_STAT_UNITS,
} from '@/components/StatDisplay/StatDisplay';

/**
 * Stat bonus granted per enhancement level (percentage points).
 * Each level adds this many percentage points to the stat.
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

function formatBonus(stat: EnhanceableStatKey, level: number): string {
  if (level <= 0) return '—';
  const bonus = level * BONUS_PER_LEVEL[stat];
  const formatted =
    bonus >= 100 ? bonus.toFixed(1) : bonus >= 10 ? bonus.toFixed(2) : bonus.toFixed(3);
  return `+${formatted}%`;
}

const STAT_ORDER: EnhanceableStatKey[] = [
  'ATK',
  'CRIT_PCT',
  'CRIT_DMG',
  'DEATH_STRIKE',
  'DEATH_STRIKE_PCT',
  'HP',
  'HP_RECOVERY',
];

export function EnhanceSection() {
  const enhanceableStats = useUserSaveStore((s: UserSaveStore) => s.character.enhanceableStats);
  const setEnhanceableStats = useUserSaveStore((s: UserSaveStore) => s.setEnhanceableStats);

  function handleChange(
    stat: EnhanceableStatKey,
    field: keyof EnhanceLevelEntry,
    value: number,
  ) {
    setEnhanceableStats({
      ...enhanceableStats,
      [stat]: { ...enhanceableStats[stat], [field]: value },
    });
  }

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-x-4 px-3 pb-2">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Stat
        </span>
        <span className="w-28 text-center text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Current Lvl
        </span>
        <span className="w-24 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Bonus
        </span>
        <span className="w-28 text-center text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Max Lvl
        </span>
        <span className="w-14 text-center text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Status
        </span>
      </div>

      {STAT_ORDER.map((stat) => {
        const entry = enhanceableStats[stat];
        const unit = ENHANCEABLE_STAT_UNITS[stat];
        const label = ENHANCEABLE_STAT_LABELS[stat];
        const isMax = entry.maxLevel > 0 && entry.currentLevel >= entry.maxLevel;

        return (
          <div
            key={stat}
            className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-x-4 rounded-md bg-gray-50 px-3 py-2 dark:bg-gray-800/50"
          >
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {label}
              {unit && (
                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">{unit}</span>
              )}
            </span>

            <NumberInput
              value={entry.currentLevel}
              onChange={(val) => handleChange(stat, 'currentLevel', val)}
              min={0}
              max={entry.maxLevel > 0 ? entry.maxLevel : undefined}
              className="w-28"
            />

            <span className="w-24 text-right font-mono text-sm tabular-nums text-gray-600 dark:text-gray-400">
              {formatBonus(stat, entry.currentLevel)}
            </span>

            <NumberInput
              value={entry.maxLevel}
              onChange={(val) => handleChange(stat, 'maxLevel', val)}
              min={0}
              className="w-28"
            />

            <div className="flex w-14 items-center justify-center">
              {isMax ? (
                <span className="rounded px-1.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  MAX
                </span>
              ) : (
                <span className="text-xs tabular-nums text-gray-400 dark:text-gray-500">
                  {entry.maxLevel > 0 ? `${entry.currentLevel}/${entry.maxLevel}` : '—'}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
