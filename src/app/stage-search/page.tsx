'use client';

import { useMemo, useState } from 'react';

import { NumberInput } from '@/components/NumberInput';
import type { Stage } from '@/types/stage';
import stageDataRaw from '@/data/stage-data.json';

const STAGES = stageDataRaw.STAGES as unknown as Stage[];
const MAX_STAGE_ID = STAGES[STAGES.length - 1]?.id ?? 2000;

export default function StageSearchPage() {
  const [stageId, setStageId] = useState(1);

  const stage: Stage | null = useMemo(
    () => STAGES.find((s) => s.id === stageId) ?? null,
    [stageId],
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white border-b border-gray-200 px-6 py-8 dark:bg-gray-900 dark:border-gray-700">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Stage Search</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Look up details for any stage by its number
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <section
          aria-labelledby="stage-search-heading"
          className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-700"
        >
          <h2
            id="stage-search-heading"
            className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4"
          >
            Stage Input
          </h2>

          <NumberInput
            id="stage-search-input"
            label="Stage Number"
            value={stageId}
            onChange={setStageId}
            min={1}
            max={MAX_STAGE_ID}
          />

          {stage && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Stage {stage.label}
              </h3>

              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">Area</dt>
                  <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {stage.areaName}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">Zone</dt>
                  <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {stage.zoneName}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">Energy Cost</dt>
                  <dd className="text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                    {stage.energyCost}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">Recommended Level</dt>
                  <dd className="text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                    {stage.recommendedLevel}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">Has Boss</dt>
                  <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {stage.hasBoss ? 'Yes' : 'No'}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">Mob Types</dt>
                  <dd className="text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                    {stage.mobs.length}
                  </dd>
                </div>
              </dl>

              {stage.bonuses.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Stage Bonuses</p>
                  <div className="flex flex-wrap gap-2">
                    {stage.bonuses.map((bonus) => (
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
      </div>
    </div>
  );
}
