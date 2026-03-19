'use client';

import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import { NumberInput } from '@/components/NumberInput';

export function GrowthVitInput() {
  const growthStats = useUserSaveStore((s: UserSaveStore) => s.character.growthStats);
  const setGrowthStats = useUserSaveStore((s: UserSaveStore) => s.setGrowthStats);

  function handleChange(level: number) {
    setGrowthStats({
      ...growthStats,
      VIT: { ...growthStats.VIT, level },
    });
  }

  return (
    <NumberInput
      label="VIT Level"
      value={growthStats.VIT.level}
      onChange={handleChange}
      min={0}
    />
  );
}
