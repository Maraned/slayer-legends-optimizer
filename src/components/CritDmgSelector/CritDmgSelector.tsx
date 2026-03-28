'use client';

import { NumberInput } from '@/components/NumberInput';
import { useCalculatorInputsStore } from '@/store/useCalculatorInputsStore';
import type { CalculatorInputsStore } from '@/store/useCalculatorInputsStore';

const CRIT_DMG_BONUS_PER_LEVEL = 0.005;

function formatPct(value: number): string {
  return `+${value.toFixed(3)}%`;
}

export function CritDmgSelector() {
  const critDmgCurrentLevel = useCalculatorInputsStore(
    (s: CalculatorInputsStore) => s.critDmgCurrentLevel,
  );
  const critDmgTargetLevel = useCalculatorInputsStore(
    (s: CalculatorInputsStore) => s.critDmgTargetLevel,
  );
  const setCritDmgCurrentLevel = useCalculatorInputsStore(
    (s: CalculatorInputsStore) => s.setCritDmgCurrentLevel,
  );
  const setCritDmgTargetLevel = useCalculatorInputsStore(
    (s: CalculatorInputsStore) => s.setCritDmgTargetLevel,
  );

  const currentBonus = critDmgCurrentLevel * CRIT_DMG_BONUS_PER_LEVEL;
  const targetBonus = critDmgTargetLevel * CRIT_DMG_BONUS_PER_LEVEL;
  const bonusGain = targetBonus - currentBonus;

  function handleCritDmgCurrentLevel(level: number) {
    setCritDmgCurrentLevel(level);
    if (critDmgTargetLevel < level) setCritDmgTargetLevel(level);
  }

  return (
    <div
      aria-labelledby="crit-dmg-config-heading"
      className="bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700"
    >
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2
          id="crit-dmg-config-heading"
          className="text-xs font-semibold text-gray-400 uppercase tracking-wider"
        >
          CRIT DMG Enhancement
        </h2>
      </div>

      <div className="p-6 space-y-4">
        {/* Current / Target levels */}
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Current Level"
            value={critDmgCurrentLevel}
            onChange={handleCritDmgCurrentLevel}
            min={0}
          />
          <NumberInput
            label="Target Level"
            value={critDmgTargetLevel}
            onChange={setCritDmgTargetLevel}
            min={critDmgCurrentLevel}
          />
        </div>

        {/* CRIT DMG stat summary */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="rounded-lg bg-purple-50 px-4 py-3 dark:bg-purple-900/20">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-purple-700 dark:text-purple-400">
              Current Bonus
            </p>
            <p className="text-xl font-bold tabular-nums text-purple-900 dark:text-purple-200">
              {currentBonus > 0 ? formatPct(currentBonus) : '—'}
            </p>
            <p className="mt-0.5 text-xs text-purple-600 dark:text-purple-400">
              {formatPct(CRIT_DMG_BONUS_PER_LEVEL)} / level
            </p>
          </div>

          <div className="rounded-lg bg-purple-50 px-4 py-3 dark:bg-purple-900/20">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-purple-700 dark:text-purple-400">
              Target Bonus
            </p>
            <p className="text-xl font-bold tabular-nums text-purple-900 dark:text-purple-200">
              {targetBonus > 0 ? formatPct(targetBonus) : '—'}
            </p>
            <p className="mt-0.5 text-xs text-purple-600 dark:text-purple-400">
              {bonusGain > 0 ? `gain ${formatPct(bonusGain)}` : 'no gain'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
