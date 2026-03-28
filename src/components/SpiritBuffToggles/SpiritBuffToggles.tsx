'use client';

import { Toggle } from '@/components/Toggle/Toggle';
import { Select } from '@/components/Select/Select';
import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import type { SpiritBuff } from '@/types/save-state';

/** ATK bonus fractions for spirit skill levels I–V (index 1–5). */
const SKILL_LEVEL_MULTIPLIERS: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 0.1,
  2: 0.22,
  3: 0.35,
  4: 0.5,
  5: 0.8,
};

const SKILL_LEVEL_OPTIONS = [
  { value: '1', label: 'Level I (+10%)' },
  { value: '2', label: 'Level II (+22%)' },
  { value: '3', label: 'Level III (+35%)' },
  { value: '4', label: 'Level IV (+50%)' },
  { value: '5', label: 'Level V (+80%)' },
];

const SPIRITS = [
  { id: 'todd' as const, name: 'TODD' },
  { id: 'luga' as const, name: 'LUGA' },
];

/** Returns total ATK bonus fraction from active spirit buffs. */
export function calcSpiritAtkBonus(spiritBuffs: {
  todd: SpiritBuff;
  luga: SpiritBuff;
}): number {
  let total = 0;
  for (const spirit of SPIRITS) {
    const buff = spiritBuffs[spirit.id];
    if (buff.active) {
      total += SKILL_LEVEL_MULTIPLIERS[buff.skillLevel];
    }
  }
  return total;
}

export function SpiritBuffToggles() {
  const spiritBuffs = useUserSaveStore(
    (s: UserSaveStore) => s.stageSelection.spiritBuffs,
  );
  const stageSelection = useUserSaveStore((s: UserSaveStore) => s.stageSelection);
  const setStageSelection = useUserSaveStore((s: UserSaveStore) => s.setStageSelection);

  function handleToggle(spiritId: 'todd' | 'luga', active: boolean) {
    setStageSelection({
      ...stageSelection,
      spiritBuffs: {
        ...spiritBuffs,
        [spiritId]: { ...spiritBuffs[spiritId], active },
      },
    });
  }

  function handleSkillLevel(spiritId: 'todd' | 'luga', value: string) {
    const skillLevel = Number(value) as 1 | 2 | 3 | 4 | 5;
    setStageSelection({
      ...stageSelection,
      spiritBuffs: {
        ...spiritBuffs,
        [spiritId]: { ...spiritBuffs[spiritId], skillLevel },
      },
    });
  }

  return (
    <section
      aria-labelledby="spirit-buffs-heading"
      className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-700"
    >
      <h2
        id="spirit-buffs-heading"
        className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4"
      >
        Spirit Buffs
      </h2>

      <div className="flex flex-col sm:flex-row gap-4">
        {SPIRITS.map((spirit) => {
          const buff = spiritBuffs[spirit.id];
          return (
            <div
              key={spirit.id}
              className="flex flex-col gap-3 flex-1"
            >
              <Toggle
                id={`spirit-${spirit.id}-toggle`}
                checked={buff.active}
                onCheckedChange={(checked) => handleToggle(spirit.id, checked)}
                label={spirit.name}
                size="sm"
              />
              {buff.active && (
                <Select
                  id={`spirit-${spirit.id}-level`}
                  value={String(buff.skillLevel)}
                  onValueChange={(value) => handleSkillLevel(spirit.id, value)}
                  options={SKILL_LEVEL_OPTIONS}
                  aria-label={`${spirit.name} skill level`}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
