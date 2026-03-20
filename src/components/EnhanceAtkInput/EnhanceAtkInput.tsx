'use client';

import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import { NumberInput } from '@/components/NumberInput';

export function EnhanceAtkInput() {
  const enhanceableStats = useUserSaveStore((s: UserSaveStore) => s.character.enhanceableStats);
  const setEnhanceableStats = useUserSaveStore((s: UserSaveStore) => s.setEnhanceableStats);

  function handleChange(currentLevel: number) {
    setEnhanceableStats({
      ...enhanceableStats,
      ATK: { ...enhanceableStats.ATK, currentLevel },
    });
  }

  return (
    <NumberInput
      label="ATK Level"
      value={enhanceableStats.ATK.currentLevel}
      onChange={handleChange}
      min={0}
    />
  );
}
