'use client';

import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import { NumberInput } from '@/components/NumberInput';

export function EnhanceDsPctInput() {
  const enhanceableStats = useUserSaveStore((s: UserSaveStore) => s.character.enhanceableStats);
  const setEnhanceableStats = useUserSaveStore((s: UserSaveStore) => s.setEnhanceableStats);

  function handleChange(currentLevel: number) {
    setEnhanceableStats({
      ...enhanceableStats,
      DEATH_STRIKE_PCT: { ...enhanceableStats.DEATH_STRIKE_PCT, currentLevel },
    });
  }

  return (
    <NumberInput
      label="DS % Level"
      value={enhanceableStats.DEATH_STRIKE_PCT.currentLevel}
      onChange={handleChange}
      min={0}
    />
  );
}
