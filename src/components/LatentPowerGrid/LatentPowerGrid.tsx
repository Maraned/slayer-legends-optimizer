'use client';

import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import type { LatentPower, LatentPowerPageEntry, LatentPowerStatKey } from '@/types/character';
import { NumberInput } from '@/components/NumberInput';
import { Tabs } from '@/components/Tabs/Tabs';

const STAT_KEYS: LatentPowerStatKey[] = ['STR', 'HP', 'CRI', 'LUK', 'VIT'];

const PAGE_LABELS = ['Page Ⅰ', 'Page Ⅱ', 'Page Ⅲ', 'Page Ⅳ', 'Page Ⅴ'];

export function LatentPowerGrid() {
  const latentPower = useUserSaveStore((s: UserSaveStore) => s.character.latentPower);
  const setLatentPower = useUserSaveStore((s: UserSaveStore) => s.setLatentPower);

  function handleChange(pageIndex: number, stat: LatentPowerStatKey, level: number) {
    const updatedPages = latentPower.pages.map((page: LatentPowerPageEntry, i: number) =>
      i === pageIndex ? { ...page, [stat]: { ...page[stat], level } } : page,
    ) as LatentPower['pages'];

    setLatentPower({ pages: updatedPages });
  }

  const tabs = latentPower.pages.map((page: LatentPowerPageEntry, pageIndex: number) => ({
    value: String(pageIndex),
    label: PAGE_LABELS[pageIndex],
    content: (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {STAT_KEYS.map((stat) => (
          <NumberInput
            key={stat}
            label={stat}
            value={page[stat].level}
            min={0}
            onChange={(level) => handleChange(pageIndex, stat, level)}
          />
        ))}
      </div>
    ),
  }));

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Latent Power</h2>
      </div>
      <div className="p-4">
        <Tabs tabs={tabs} defaultValue="0" />
      </div>
    </div>
  );
}
