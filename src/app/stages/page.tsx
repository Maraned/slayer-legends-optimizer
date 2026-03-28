'use client';

import { useMemo, useState } from 'react';

import { Select } from '@/components/Select/Select';
import { NumberInput } from '@/components/NumberInput';
import { FarmingBonusSummary } from '@/components/FarmingBonusSummary/FarmingBonusSummary';
import { SoulWeaponSection } from '@/components/SoulWeaponSection/SoulWeaponSection';
import { SWCraftingRequirements } from '@/components/SWCraftingRequirements/SWCraftingRequirements';
import { OfflineHuntRates } from '@/components/OfflineHuntRates/OfflineHuntRates';
import { SpiritBuffToggles } from '@/components/SpiritBuffToggles/SpiritBuffToggles';
import { ScrollBlessingToggles } from '@/components/ScrollBlessingToggles/ScrollBlessingToggles';
import { useUserSaveStore } from '@/store/useUserSaveStore';
import type { Stage, Area } from '@/types/stage';
import stageDataRaw from '@/data/stage-data.json';

const AREAS = stageDataRaw.AREAS as unknown as Area[];
const STAGES = stageDataRaw.STAGES as unknown as Stage[];

export default function StagesPage() {
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [selectedStageId, setSelectedStageId] = useState('');

  const currentFarmStageId = useUserSaveStore((s) => s.stageSelection.currentFarmStageId);
  const offlineHuntIdleHours = useUserSaveStore((s) => s.stageSelection.offlineHuntIdleHours);
  const setStageSelection = useUserSaveStore((s) => s.setStageSelection);
  const stageSelection = useUserSaveStore((s) => s.stageSelection);

  const areaOptions = useMemo(
    () => AREAS.map((area) => ({ value: area.id, label: area.name })),
    [],
  );

  const zoneOptions = useMemo(() => {
    if (!selectedAreaId) return [];
    const area = AREAS.find((a) => a.id === selectedAreaId);
    return area?.zones.map((zone) => ({ value: zone.id, label: zone.name })) ?? [];
  }, [selectedAreaId]);

  const stageOptions = useMemo(() => {
    if (!selectedZoneId) return [];
    return STAGES.filter((s) => s.zoneId === selectedZoneId).map((s) => ({
      value: String(s.id),
      label: s.label,
    }));
  }, [selectedZoneId]);

  const selectedStage: Stage | null = useMemo(() => {
    if (!selectedStageId) return null;
    return STAGES.find((s) => s.id === Number(selectedStageId)) ?? null;
  }, [selectedStageId]);

  function handleAreaChange(value: string) {
    setSelectedAreaId(value);
    setSelectedZoneId('');
    setSelectedStageId('');
  }

  function handleZoneChange(value: string) {
    setSelectedZoneId(value);
    setSelectedStageId('');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white border-b border-gray-200 px-6 py-8 dark:bg-gray-900 dark:border-gray-700">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Stage Farming</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Calculate farming yields for stages
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Basic Details */}
        <section
          aria-labelledby="basic-details-heading"
          className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-700"
        >
          <h2
            id="basic-details-heading"
            className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4"
          >
            Basic Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="area-select"
                className="text-sm font-medium text-[var(--color-foreground)]"
              >
                Area
              </label>
              <Select
                id="area-select"
                value={selectedAreaId}
                onValueChange={handleAreaChange}
                options={areaOptions}
                placeholder="Select area"
                aria-label="Select farming area"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="zone-select"
                className="text-sm font-medium text-[var(--color-foreground)]"
              >
                Zone
              </label>
              <Select
                id="zone-select"
                value={selectedZoneId}
                onValueChange={handleZoneChange}
                options={zoneOptions}
                placeholder="Select zone"
                disabled={!selectedAreaId}
                aria-label="Select farming zone"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="stage-select"
                className="text-sm font-medium text-[var(--color-foreground)]"
              >
                Stage
              </label>
              <Select
                id="stage-select"
                value={selectedStageId}
                onValueChange={setSelectedStageId}
                options={stageOptions}
                placeholder="Select stage"
                disabled={!selectedZoneId}
                aria-label="Select stage"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <NumberInput
              id="current-farm-stage"
              label="Current Farm Stage"
              value={currentFarmStageId}
              onChange={(value) => setStageSelection({ ...stageSelection, currentFarmStageId: value })}
              min={1}
              max={2000}
            />
            <NumberInput
              id="offline-hunt-idle-hours"
              label="Offline Hunt Idle Time (hours)"
              value={offlineHuntIdleHours}
              onChange={(value) => setStageSelection({ ...stageSelection, offlineHuntIdleHours: value })}
              min={0}
              max={72}
            />
          </div>

          {selectedStage && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Stage {selectedStage.label}
              </h3>

              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">Energy Cost</dt>
                  <dd className="text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                    {selectedStage.energyCost}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">Recommended Level</dt>
                  <dd className="text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                    {selectedStage.recommendedLevel}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">Has Boss</dt>
                  <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {selectedStage.hasBoss ? 'Yes' : 'No'}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">Mob Types</dt>
                  <dd className="text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                    {selectedStage.mobs.length}
                  </dd>
                </div>
              </dl>

              {selectedStage.bonuses.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Stage Bonuses</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedStage.bonuses.map((bonus) => (
                      <span
                        key={bonus.type}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        {bonus.type}
                        <span className="font-mono">
                          {bonus.multiplier >= 1
                            ? `+${((bonus.multiplier - 1) * 100).toFixed(0)}%`
                            : `-${((1 - bonus.multiplier) * 100).toFixed(0)}%`}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Spirit Buffs */}
        <SpiritBuffToggles />

        {/* Scroll Blessings */}
        <ScrollBlessingToggles />

        {/* Offline Hunt Rates */}
        <OfflineHuntRates />

        {/* Soul Weapon */}
        <SoulWeaponSection />

        {/* Farming Bonuses */}
        <FarmingBonusSummary />

        {/* Soul Weapon Crafting Requirements */}
        <SWCraftingRequirements />
      </div>
    </div>
  );
}
