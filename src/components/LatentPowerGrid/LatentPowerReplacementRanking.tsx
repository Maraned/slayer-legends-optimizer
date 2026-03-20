'use client';

import { useMemo } from 'react';

import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import type { LatentPowerStatKey } from '@/types/character';

const STAT_KEYS: LatentPowerStatKey[] = ['STR', 'HP', 'CRI', 'LUK', 'VIT'];
const PAGE_LABELS = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ'];

interface RankedCell {
  rank: number;
  pageIndex: number;
  stat: LatentPowerStatKey;
  level: number;
}

function getRankBadgeClasses(rank: number): string {
  if (rank === 1) return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
  if (rank === 2) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
  if (rank === 3) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
  return 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400';
}

/**
 * Displays all 25 latent power cells (5 pages × 5 stats) ranked by replacement
 * priority. Cells with the lowest level are ranked first — those are the cells
 * that most need to be replaced / levelled up next.
 *
 * Tie-breaking: page order (Ⅰ → Ⅴ), then stat order (STR, HP, CRI, LUK, VIT).
 */
export function LatentPowerReplacementRanking() {
  const latentPower = useUserSaveStore((s: UserSaveStore) => s.character.latentPower);

  const ranked = useMemo<RankedCell[]>(() => {
    const cells: Omit<RankedCell, 'rank'>[] = [];

    latentPower.pages.forEach((page, pageIndex) => {
      STAT_KEYS.forEach((stat) => {
        cells.push({ pageIndex, stat, level: page[stat].level });
      });
    });

    cells.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      if (a.pageIndex !== b.pageIndex) return a.pageIndex - b.pageIndex;
      return STAT_KEYS.indexOf(a.stat) - STAT_KEYS.indexOf(b.stat);
    });

    return cells.map((cell, index) => ({ ...cell, rank: index + 1 }));
  }, [latentPower]);

  return (
    <div className="space-y-1">
      {ranked.map((cell) => (
        <div
          key={`${cell.pageIndex}-${cell.stat}`}
          className="flex items-center gap-3 rounded-md bg-gray-50 px-3 py-2 dark:bg-gray-800/50"
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${getRankBadgeClasses(cell.rank)}`}
            aria-label={`Rank ${cell.rank}`}
          >
            {cell.rank}
          </span>

          <span className="w-8 text-sm text-gray-500 dark:text-gray-400">
            {PAGE_LABELS[cell.pageIndex]}
          </span>

          <span className="w-10 text-sm font-medium text-gray-900 dark:text-gray-100">
            {cell.stat}
          </span>

          <span className="ml-auto text-xs tabular-nums text-gray-500 dark:text-gray-400">
            Lv {cell.level}
          </span>
        </div>
      ))}
    </div>
  );
}
