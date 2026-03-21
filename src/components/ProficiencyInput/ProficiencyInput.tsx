'use client';

import { NumberInput } from '@/components/NumberInput';
import { useSkillsStore, type SkillsStore } from '@/store/useSkillsStore';

export function ProficiencyInput() {
  const proficiency = useSkillsStore((s: SkillsStore) => s.proficiency);
  const setProficiency = useSkillsStore((s: SkillsStore) => s.setProficiency);

  function handleLevelChange(level: number) {
    setProficiency({ ...proficiency, level });
  }

  function handleBonusChange(bonus: number) {
    setProficiency({ ...proficiency, bonus });
  }

  return (
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
      {proficiency.bonus > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Multiplier</span>
          <span className="font-mono tabular-nums text-gray-700 dark:text-gray-300">
            ×{(1 + proficiency.bonus).toFixed(3)}
          </span>
        </div>
      )}
    </div>
  );
}
