'use client';

import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import { NumberInput } from '@/components/NumberInput';

export function EnhanceCritPctInput() {
  const enhanceableStats = useUserSaveStore((s: UserSaveStore) => s.character.enhanceableStats);
  const setEnhanceableStats = useUserSaveStore((s: UserSaveStore) => s.setEnhanceableStats);

  function handleChange(currentLevel: number) {
    setEnhanceableStats({
      ...enhanceableStats,
      CRIT_PCT: { ...enhanceableStats.CRIT_PCT, currentLevel },
    });
  }

  return (
    <NumberInput
      label="CRIT % Level"
      value={enhanceableStats.CRIT_PCT.currentLevel}
      onChange={handleChange}
      min={0}
    />
  );
}
