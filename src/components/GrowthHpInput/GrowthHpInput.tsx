'use client';

import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import { NumberInput } from '@/components/NumberInput';

export function GrowthHpInput() {
  const growthStats = useUserSaveStore((s: UserSaveStore) => s.character.growthStats);
  const setGrowthStats = useUserSaveStore((s: UserSaveStore) => s.setGrowthStats);

  function handleChange(level: number) {
    setGrowthStats({
      ...growthStats,
      HP: { ...growthStats.HP, level },
    });
  }

  return (
    <NumberInput
      label="HP Level"
      value={growthStats.HP.level}
      onChange={handleChange}
      min={0}
    />
  );
}
