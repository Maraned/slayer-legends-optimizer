'use client';

import characterMathsData from '@/data/character-maths-data.json';
import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import { NumberInput } from '@/components/NumberInput';

const STR_GROWTH_FACTOR =
  (characterMathsData.GROWTH_STATS as Array<{ stat: string; growthFactor: number }>).find(
    (e) => e.stat === 'STR',
  )?.growthFactor ?? 1;

export function GrowthStrInput() {
  const growthStats = useUserSaveStore((s: UserSaveStore) => s.character.growthStats);
  const setGrowthStats = useUserSaveStore((s: UserSaveStore) => s.setGrowthStats);

  function handleChange(level: number) {
    setGrowthStats({
      ...growthStats,
      STR: { level, bonus: level * STR_GROWTH_FACTOR },
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <NumberInput
        label="STR Level"
        value={growthStats.STR.level}
        onChange={handleChange}
        min={0}
      />
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">ATK bonus</span>
        <span className="font-mono font-medium tabular-nums text-gray-900 dark:text-gray-100">
          +{growthStats.STR.bonus.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
