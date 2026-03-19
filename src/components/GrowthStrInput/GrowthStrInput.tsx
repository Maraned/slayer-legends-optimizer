'use client';

import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import { NumberInput } from '@/components/NumberInput';

export function GrowthStrInput() {
  const growthStats = useUserSaveStore((s: UserSaveStore) => s.character.growthStats);
  const setGrowthStats = useUserSaveStore((s: UserSaveStore) => s.setGrowthStats);

  function handleChange(level: number) {
    setGrowthStats({
      ...growthStats,
      STR: { ...growthStats.STR, level },
    });
  }

  return (
    <NumberInput
      label="STR Level"
      value={growthStats.STR.level}
      onChange={handleChange}
      min={0}
    />
  );
}
