'use client';

import characterMathsData from '@/data/character-maths-data.json';
import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import { NumberInput } from '@/components/NumberInput';

const HP_GROWTH_FACTOR =
  (characterMathsData.GROWTH_STATS as Array<{ stat: string; growthFactor: number }>).find(
    (e) => e.stat === 'HP',
  )?.growthFactor ?? 1;

export function GrowthHpInput() {
  const growthStats = useUserSaveStore((s: UserSaveStore) => s.character.growthStats);
  const setGrowthStats = useUserSaveStore((s: UserSaveStore) => s.setGrowthStats);

  function handleChange(level: number) {
    setGrowthStats({
      ...growthStats,
      HP: { level, bonus: level * HP_GROWTH_FACTOR },
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <NumberInput
        label="HP Level"
        value={growthStats.HP.level}
        onChange={handleChange}
        min={0}
      />
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">HP bonus</span>
        <span className="font-mono font-medium tabular-nums text-gray-900 dark:text-gray-100">
          +{growthStats.HP.bonus.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
