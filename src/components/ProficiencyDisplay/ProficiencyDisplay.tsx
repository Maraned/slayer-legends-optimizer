'use client';

import { NumberInput } from '@/components/NumberInput';
import { useSkillsStore, type SkillsStore } from '@/store/useSkillsStore';
import { calcProficiencyMultiplier } from '@/lib/base-damage-calculator';

export function ProficiencyDisplay() {
  const proficiency = useSkillsStore((s: SkillsStore) => s.proficiency);
  const setProficiency = useSkillsStore((s: SkillsStore) => s.setProficiency);

  const multiplier = calcProficiencyMultiplier(proficiency);

  function handleLevelChange(level: number) {
    setProficiency({ ...proficiency, level });
  }

  function handleBonusChange(bonus: number) {
    setProficiency({ ...proficiency, bonus });
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Proficiency</h2>
      </div>
      <div className="px-6 py-5">
        <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
          <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            Proficiency Bonus
          </p>
          <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-200">
            +{(proficiency.bonus * 100).toFixed(2)}%
          </p>
          {proficiency.bonus > 0 && (
            <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
              ×{multiplier.toFixed(3)}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <NumberInput
            label="Proficiency Level"
            value={proficiency.level}
            onChange={handleLevelChange}
            min={0}
            ariaLabel="Proficiency level"
          />
          <NumberInput
            label="Proficiency Bonus"
            value={proficiency.bonus}
            onChange={handleBonusChange}
            min={0}
            step={0.001}
            ariaLabel="Proficiency bonus"
          />
        </div>
      </div>
    </div>
  );
}
