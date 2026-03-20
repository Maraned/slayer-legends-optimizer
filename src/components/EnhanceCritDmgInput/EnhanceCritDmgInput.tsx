'use client';

import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import { NumberInput } from '@/components/NumberInput';

export function EnhanceCritDmgInput() {
  const enhanceableStats = useUserSaveStore((s: UserSaveStore) => s.character.enhanceableStats);
  const setEnhanceableStats = useUserSaveStore((s: UserSaveStore) => s.setEnhanceableStats);

  function handleChange(currentLevel: number) {
    setEnhanceableStats({
      ...enhanceableStats,
      CRIT_DMG: { ...enhanceableStats.CRIT_DMG, currentLevel },
    });
  }

  return (
    <NumberInput
      label="CRIT DMG Level"
      value={enhanceableStats.CRIT_DMG.currentLevel}
      onChange={handleChange}
      min={0}
    />
  );
}
