'use client';

import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import { NumberInput } from '@/components/NumberInput';

export function EnhanceDsInput() {
  const enhanceableStats = useUserSaveStore((s: UserSaveStore) => s.character.enhanceableStats);
  const setEnhanceableStats = useUserSaveStore((s: UserSaveStore) => s.setEnhanceableStats);

  function handleChange(currentLevel: number) {
    setEnhanceableStats({
      ...enhanceableStats,
      DEATH_STRIKE: { ...enhanceableStats.DEATH_STRIKE, currentLevel },
    });
  }

  return (
    <NumberInput
      label="DS Level"
      value={enhanceableStats.DEATH_STRIKE.currentLevel}
      onChange={handleChange}
      min={0}
    />
  );
}
