'use client';

import { Toggle } from '@/components/Toggle/Toggle';
import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import type { ScrollBlessingsState } from '@/types/save-state';

const BLESSINGS: {
  id: keyof ScrollBlessingsState;
  label: string;
  multiplierLabel: string;
  affectsLabel: string;
}[] = [
  { id: 'gold',      label: 'Gold',      multiplierLabel: '×3', affectsLabel: 'Monster Gold' },
  { id: 'exp',       label: 'EXP',       multiplierLabel: '×3', affectsLabel: 'Extra EXP' },
  { id: 'cubes',     label: 'Cubes',     multiplierLabel: '×3', affectsLabel: 'Drop Rate' },
  { id: 'equipment', label: 'Equipment', multiplierLabel: '×2', affectsLabel: 'Drop Rate' },
  { id: 'hotTime',   label: 'Hot Time',  multiplierLabel: '×2', affectsLabel: 'EXP & Gold' },
];

/** Returns partial FarmingBonuses fractions contributed by active scroll blessings. */
export function calcScrollBlessingBonuses(scrollBlessings: ScrollBlessingsState): {
  extraExpBonus: number;
  monsterGoldBonus: number;
  dropRateBonus: number;
} {
  let extraExpBonus = 0;
  let monsterGoldBonus = 0;
  let dropRateBonus = 0;

  if (scrollBlessings.gold) monsterGoldBonus += 2;
  if (scrollBlessings.exp) extraExpBonus += 2;
  if (scrollBlessings.cubes) dropRateBonus += 2;
  if (scrollBlessings.equipment) dropRateBonus += 1;
  if (scrollBlessings.hotTime) {
    extraExpBonus += 1;
    monsterGoldBonus += 1;
  }

  return { extraExpBonus, monsterGoldBonus, dropRateBonus };
}

export function ScrollBlessingToggles() {
  const scrollBlessings = useUserSaveStore(
    (s: UserSaveStore) => s.stageSelection.scrollBlessings,
  );
  const stageSelection = useUserSaveStore((s: UserSaveStore) => s.stageSelection);
  const setStageSelection = useUserSaveStore((s: UserSaveStore) => s.setStageSelection);

  function handleToggle(id: keyof ScrollBlessingsState, active: boolean) {
    setStageSelection({
      ...stageSelection,
      scrollBlessings: { ...scrollBlessings, [id]: active },
    });
  }

  return (
    <section
      aria-labelledby="scroll-blessing-heading"
      className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-700"
    >
      <h2
        id="scroll-blessing-heading"
        className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4"
      >
        Scroll Blessings
      </h2>

      <div className="flex flex-wrap gap-4">
        {BLESSINGS.map((blessing) => (
          <div key={blessing.id} className="flex flex-col gap-1 flex-1 min-w-[120px]">
            <Toggle
              id={`scroll-blessing-${blessing.id}`}
              checked={scrollBlessings[blessing.id]}
              onCheckedChange={(checked) => handleToggle(blessing.id, checked)}
              label={blessing.label}
              size="sm"
            />
            <span className="text-xs text-gray-400 dark:text-gray-500 pl-0.5">
              {blessing.multiplierLabel} {blessing.affectsLabel}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
