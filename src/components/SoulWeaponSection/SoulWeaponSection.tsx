'use client';

import { useEffect, useMemo, useState } from 'react';

import { Select } from '@/components/Select/Select';
import { NumberInput } from '@/components/NumberInput';
import { loadSoulWeapons } from '@/lib/data-loader';
import { getStageForSoulWeapon, getTimeToReachSoulWeapon } from '@/lib/souls';
import { useStagesStore } from '@/store/useStagesStore';
import type { SoulWeaponData } from '@/types/equipment';

function formatTimeToCraft(timeToCraft: ReturnType<typeof getTimeToReachSoulWeapon>): string {
  if (!timeToCraft) return '—';
  if (timeToCraft.days === 0 && timeToCraft.hours === 0 && timeToCraft.minutes === 0) {
    return 'Already reached';
  }
  if (timeToCraft.days > 0) {
    return `${timeToCraft.days}d ${timeToCraft.hours}h ${timeToCraft.minutes}m`;
  }
  if (timeToCraft.hours > 0) {
    return `${timeToCraft.hours}h ${timeToCraft.minutes}m`;
  }
  return `${timeToCraft.minutes}m`;
}

export function SoulWeaponSection() {
  const [availableWeapons, setAvailableWeapons] = useState<SoulWeaponData[]>([]);

  const currentSoulWeaponId = useStagesStore((s) => s.currentSoulWeaponId);
  const targetSoulWeaponId = useStagesStore((s) => s.targetSoulWeaponId);
  const soulDungeonRunsPerDay = useStagesStore((s) => s.soulDungeonRunsPerDay);
  const setCurrentSoulWeaponId = useStagesStore((s) => s.setCurrentSoulWeaponId);
  const setTargetSoulWeaponId = useStagesStore((s) => s.setTargetSoulWeaponId);
  const setSoulDungeonRunsPerDay = useStagesStore((s) => s.setSoulDungeonRunsPerDay);

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

  const currentStage = useMemo(
    () => (currentSoulWeaponId ? getStageForSoulWeapon(currentSoulWeaponId) : null),
    [currentSoulWeaponId],
  );

  const targetStage = useMemo(
    () => (targetSoulWeaponId ? getStageForSoulWeapon(targetSoulWeaponId) : null),
    [targetSoulWeaponId],
  );

  const timeToCraft = useMemo(() => {
    if (!currentSoulWeaponId || !targetSoulWeaponId) return null;
    return getTimeToReachSoulWeapon(currentSoulWeaponId, targetSoulWeaponId, soulDungeonRunsPerDay);
  }, [currentSoulWeaponId, targetSoulWeaponId, soulDungeonRunsPerDay]);

  const showTimeSection = currentSoulWeaponId && targetSoulWeaponId;

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
          {currentStage && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Soul Dungeon Stage {currentStage.stage}
            </p>
          )}
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
          {targetStage && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Soul Dungeon Stage {targetStage.stage}
            </p>
          )}
        </div>
      </div>

      {showTimeSection && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
          <NumberInput
            id="soul-dungeon-runs-per-day"
            label="Soul Dungeon Runs / Day"
            value={soulDungeonRunsPerDay}
            onChange={setSoulDungeonRunsPerDay}
            min={1}
            max={999}
          />

          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 px-4 py-3">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">
              Time Remaining
            </p>
            <p className="text-xl font-bold text-amber-900 dark:text-amber-200">
              {formatTimeToCraft(timeToCraft)}
            </p>
            {timeToCraft && timeToCraft.totalHours > 0 && currentStage && targetStage && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                Stage {currentStage.stage} → {targetStage.stage} (
                {targetStage.stage - currentStage.stage} stages at {soulDungeonRunsPerDay}{' '}
                runs/day)
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
