'use client';

import { useEffect, useState } from 'react';

import { Select } from '@/components/Select/Select';
import { loadSoulWeapons } from '@/lib/data-loader';
import { useStagesStore } from '@/store/useStagesStore';
import type { SoulWeaponData } from '@/types/equipment';

export function SoulWeaponSection() {
  const [availableWeapons, setAvailableWeapons] = useState<SoulWeaponData[]>([]);

  const currentSoulWeaponId = useStagesStore((s) => s.currentSoulWeaponId);
  const targetSoulWeaponId = useStagesStore((s) => s.targetSoulWeaponId);
  const setCurrentSoulWeaponId = useStagesStore((s) => s.setCurrentSoulWeaponId);
  const setTargetSoulWeaponId = useStagesStore((s) => s.setTargetSoulWeaponId);

  useEffect(() => {
    loadSoulWeapons().then(setAvailableWeapons).catch(() => {});
  }, []);

  const selectorGroups = Object.entries(
    availableWeapons.reduce<Record<string, SoulWeaponData[]>>((acc, w) => {
      (acc[w.element] ??= []).push(w);
      return acc;
    }, {}),
  ).map(([element, weapons]) => ({
    label: element,
    options: weapons.map((w) => ({ value: w.id, label: `${w.name} (${w.tier})` })),
  }));

  return (
    <section
      aria-labelledby="soul-weapon-heading"
      className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-700"
    >
      <h2
        id="soul-weapon-heading"
        className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4"
      >
        Soul Weapon
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="current-soul-weapon-select"
            className="text-sm font-medium text-[var(--color-foreground)]"
          >
            Current
          </label>
          <Select
            id="current-soul-weapon-select"
            value={currentSoulWeaponId}
            onValueChange={setCurrentSoulWeaponId}
            groups={selectorGroups}
            placeholder="Select current soul weapon"
            aria-label="Current soul weapon"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="target-soul-weapon-select"
            className="text-sm font-medium text-[var(--color-foreground)]"
          >
            Target
          </label>
          <Select
            id="target-soul-weapon-select"
            value={targetSoulWeaponId}
            onValueChange={setTargetSoulWeaponId}
            groups={selectorGroups}
            placeholder="Select target soul weapon"
            aria-label="Target soul weapon"
          />
        </div>
      </div>
    </section>
  );
}
