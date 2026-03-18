'use client';

import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import type { ConstellationBuffType } from '@/types/constellation';

const BUFF_ORDER: ConstellationBuffType[] = [
  'ATK',
  'HP',
  'DEF',
  'Crit %',
  'Crit DMG',
  'Death Strike',
  'Death Strike %',
  'All Stats',
  'Extra EXP',
  'Monster Gold',
  'Dodge',
  'Accuracy',
  'HP Recovery',
];

function formatValue(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `+${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}%`;
}

export function ConstellationBuffSummary() {
  const buffTotals = useUserSaveStore((s: UserSaveStore) => s.constellation.buffTotals);

  const activeBuffs = BUFF_ORDER.filter(
    (type) => buffTotals[type] !== undefined && buffTotals[type]! > 0,
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Constellation Buffs
        </h2>
      </div>

      <div className="p-4">
        {activeBuffs.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            No constellation buffs active. Configure your constellations to see totals here.
          </p>
        ) : (
          <div className="space-y-1">
            {activeBuffs.map((buffType) => (
              <div
                key={buffType}
                className="flex items-center justify-between rounded px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800/60"
              >
                <span className="text-gray-700 dark:text-gray-300">{buffType}</span>
                <span className="tabular-nums font-semibold text-gray-900 dark:text-gray-100">
                  {formatValue(buffTotals[buffType]!)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
