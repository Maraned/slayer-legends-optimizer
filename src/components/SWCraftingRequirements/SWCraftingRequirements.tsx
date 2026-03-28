'use client';

import { useMemo, useState } from 'react';

import { Select } from '@/components/Select/Select';
import type { SoulWeaponData } from '@/types/equipment';
import type { SoulDungeonStage } from '@/types/souls';
import equipmentDataRaw from '@/data/equipment.json';
import soulsDataRaw from '@/data/souls-data.json';

const SOUL_WEAPONS = equipmentDataRaw.soulWeapons as unknown as SoulWeaponData[];
const SOUL_DUNGEON = soulsDataRaw.SOUL_DUNGEON as unknown as SoulDungeonStage[];

const TIER_COLORS: Record<string, string> = {
  Epic: 'text-purple-600 dark:text-purple-400',
  Legendary: 'text-amber-600 dark:text-amber-400',
  Mythic: 'text-rose-600 dark:text-rose-400',
};

const ELEMENT_COLORS: Record<string, string> = {
  Fire: 'text-red-500 dark:text-red-400',
  Water: 'text-blue-500 dark:text-blue-400',
  Earth: 'text-green-600 dark:text-green-400',
  Wind: 'text-teal-500 dark:text-teal-400',
  Light: 'text-yellow-500 dark:text-yellow-400',
  Dark: 'text-violet-600 dark:text-violet-400',
};

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-100">
        {value}
      </dd>
    </div>
  );
}

export function SWCraftingRequirements() {
  const [targetSWId, setTargetSWId] = useState('');

  const targetWeaponOptions = useMemo(
    () =>
      SOUL_WEAPONS.map((sw) => ({
        value: sw.id,
        label: `${sw.name} (${sw.tier} · ${sw.element})`,
      })),
    [],
  );

  const targetWeapon = useMemo(
    () => SOUL_WEAPONS.find((sw) => sw.id === targetSWId) ?? null,
    [targetSWId],
  );

  const requiredStage = useMemo(
    () => SOUL_DUNGEON.find((s) => s.soulWeaponId === targetSWId) ?? null,
    [targetSWId],
  );

  return (
    <section
      aria-labelledby="sw-crafting-heading"
      className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-700"
    >
      <h2
        id="sw-crafting-heading"
        className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4"
      >
        Soul Weapon Crafting Requirements
      </h2>

      <div className="flex flex-col gap-1 mb-6">
        <label
          htmlFor="target-sw-select"
          className="text-sm font-medium text-[var(--color-foreground)]"
        >
          Target Soul Weapon
        </label>
        <Select
          id="target-sw-select"
          value={targetSWId}
          onValueChange={setTargetSWId}
          options={targetWeaponOptions}
          placeholder="Select target soul weapon"
          aria-label="Select target soul weapon"
        />
      </div>

      {targetWeapon && requiredStage && (
        <div className="space-y-5">
          {/* Soul Weapon stats */}
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span className={TIER_COLORS[targetWeapon.tier] ?? 'text-gray-700 dark:text-gray-300'}>
                {targetWeapon.tier}
              </span>
              {' · '}
              <span className={ELEMENT_COLORS[targetWeapon.element] ?? 'text-gray-700 dark:text-gray-300'}>
                {targetWeapon.element}
              </span>
            </p>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatRow label="Base Damage" value={targetWeapon.baseDamage.toLocaleString()} />
              <StatRow label="Crit Rate" value={`+${targetWeapon.critRateBonus}%`} />
              <StatRow label="Crit Damage" value={`+${targetWeapon.critDmgBonus}%`} />
              <StatRow label="Element Bonus" value={`+${targetWeapon.elementBonus}%`} />
            </dl>
            {targetWeapon.specialEffect && (
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-300">Special: </span>
                {targetWeapon.specialEffect}
              </p>
            )}
          </div>

          {/* Required Soul Dungeon stage */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-5">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Required Soul Dungeon Stage
            </p>
            <div className="rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 px-4 py-3 mb-4">
              <p className="text-lg font-bold text-violet-900 dark:text-violet-200">
                Stage {requiredStage.stage} — {requiredStage.name}
              </p>
              <p className="text-xs text-violet-600 dark:text-violet-400 mt-0.5">
                {requiredStage.tier} · {requiredStage.element}
              </p>
            </div>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatRow
                label="Energy / Run"
                value={requiredStage.energyCost}
              />
              <StatRow
                label="Souls / Run"
                value={`${requiredStage.soulsReward.min.toLocaleString()}–${requiredStage.soulsReward.max.toLocaleString()}`}
              />
              <StatRow
                label="Rec. Power"
                value={requiredStage.recommendedPower.toLocaleString()}
              />
              <StatRow
                label="EXP / Run"
                value={requiredStage.expReward.toLocaleString()}
              />
            </dl>
          </div>

          {/* Boss info */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-5">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Boss
            </p>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              {requiredStage.boss.name}
              {' '}
              <span className={`text-xs font-normal ${ELEMENT_COLORS[requiredStage.boss.element] ?? ''}`}>
                ({requiredStage.boss.element})
              </span>
            </p>
            <dl className="grid grid-cols-3 gap-4">
              <StatRow label="HP" value={requiredStage.boss.hp.toLocaleString()} />
              <StatRow label="ATK" value={requiredStage.boss.atk.toLocaleString()} />
              <StatRow label="DEF" value={requiredStage.boss.def.toLocaleString()} />
            </dl>
          </div>
        </div>
      )}

      {!targetSWId && (
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Select a target soul weapon to see its crafting requirements.
        </p>
      )}
    </section>
  );
}
