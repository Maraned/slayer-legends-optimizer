'use client';

import { useMemo } from 'react';

import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import { useStagesStore, type StagesStore } from '@/store/useStagesStore';
import { calculateStageResourceRates } from '@/lib/stage-calculator';
import { aggregateFarmingBonuses } from '@/lib/bonus-aggregator';
import type { Stage } from '@/types/stage';
import type { TOMState } from '@/types/tom';
import stageDataRaw from '@/data/stage-data.json';
import tomDataRaw from '@/data/tom-data.json';

const STAGES = stageDataRaw.STAGES as unknown as Stage[];
const tomData = tomDataRaw as unknown as TOMState;

/** Offline hunt processes 1 run per minute. */
const OFFLINE_HUNT_RUNS_PER_MINUTE = 1;

function formatAmount(value: number): string {
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  if (value < 1 && value > 0) return value.toFixed(2);
  return value.toFixed(0);
}

export function OfflineHuntRates() {
  const currentFarmStageId = useUserSaveStore(
    (s: UserSaveStore) => s.stageSelection.currentFarmStageId,
  );
  const offlineHuntIdleHours = useUserSaveStore(
    (s: UserSaveStore) => s.stageSelection.offlineHuntIdleHours,
  );

  const appearanceBonusTotals = useUserSaveStore(
    (s: UserSaveStore) => s.appearance.bonusTotals,
  );
  const promotion = useUserSaveStore((s: UserSaveStore) => s.character.promotion);
  const companions = useUserSaveStore((s: UserSaveStore) => s.companions);
  const constellationBuffTotals = useUserSaveStore(
    (s: UserSaveStore) => s.constellation.buffTotals,
  );
  const nodeLevels = useUserSaveStore((s: UserSaveStore) => s.memoryTree.nodeLevels);

  const extraExpMode = useStagesStore((s: StagesStore) => s.extraExpMode);
  const manualExtraExpBonus = useStagesStore((s: StagesStore) => s.manualExtraExpBonus);
  const monsterGoldMode = useStagesStore((s: StagesStore) => s.monsterGoldMode);
  const manualMonsterGoldBonus = useStagesStore((s: StagesStore) => s.manualMonsterGoldBonus);

  const stage = useMemo(
    () => STAGES.find((s) => s.id === currentFarmStageId) ?? null,
    [currentFarmStageId],
  );

  const tomNodes = useMemo(
    () => tomData.nodes.map((node) => ({ ...node, currentLevel: nodeLevels[node.id] ?? 0 })),
    [nodeLevels],
  );

  const bonuses = useMemo(() => {
    const breakdown = aggregateFarmingBonuses({
      appearanceBonusTotals,
      companions,
      promotion,
      constellationBuffTotals,
      tomNodes,
    });
    return {
      ...breakdown.totals,
      extraExpBonus:
        extraExpMode === 'manual'
          ? manualExtraExpBonus / 100
          : breakdown.totals.extraExpBonus,
      monsterGoldBonus:
        monsterGoldMode === 'manual'
          ? manualMonsterGoldBonus / 100
          : breakdown.totals.monsterGoldBonus,
    };
  }, [
    appearanceBonusTotals,
    companions,
    promotion,
    constellationBuffTotals,
    tomNodes,
    extraExpMode,
    manualExtraExpBonus,
    monsterGoldMode,
    manualMonsterGoldBonus,
  ]);

  const rates = useMemo(() => {
    if (!stage) return null;
    return calculateStageResourceRates(stage, bonuses);
  }, [stage, bonuses]);

  if (!rates) return null;

  const goldPerMinute = rates.goldPerRun * OFFLINE_HUNT_RUNS_PER_MINUTE;
  const expPerMinute = rates.expPerRun * OFFLINE_HUNT_RUNS_PER_MINUTE;
  const idleMinutes = offlineHuntIdleHours * 60;
  const totalGold = goldPerMinute * idleMinutes;
  const totalExp = expPerMinute * idleMinutes;
  const hasIdleTime = offlineHuntIdleHours > 0;

  return (
    <section
      aria-labelledby="offline-hunt-rates-heading"
      className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-700"
    >
      <h2
        id="offline-hunt-rates-heading"
        className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4"
      >
        Offline Hunt Rates
      </h2>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Stage {rates.stageLabel} &middot; {OFFLINE_HUNT_RUNS_PER_MINUTE} run/min
      </p>

      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1">
          <dt className="text-xs text-gray-500 dark:text-gray-400">Gold / min</dt>
          <dd className="text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-100">
            {formatAmount(goldPerMinute)}
          </dd>
        </div>

        <div className="flex flex-col gap-1">
          <dt className="text-xs text-gray-500 dark:text-gray-400">EXP / min</dt>
          <dd className="text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-100">
            {formatAmount(expPerMinute)}
          </dd>
        </div>

        {hasIdleTime && (
          <>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-gray-500 dark:text-gray-400">
                Total Gold ({offlineHuntIdleHours}h)
              </dt>
              <dd className="text-sm font-semibold tabular-nums text-yellow-600 dark:text-yellow-400">
                {formatAmount(totalGold)}
              </dd>
            </div>

            <div className="flex flex-col gap-1">
              <dt className="text-xs text-gray-500 dark:text-gray-400">
                Total EXP ({offlineHuntIdleHours}h)
              </dt>
              <dd className="text-sm font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                {formatAmount(totalExp)}
              </dd>
            </div>
          </>
        )}
      </dl>

      {rates.itemDrops.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Item Drops / min</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
            {rates.itemDrops.slice(0, 6).map((drop) => (
              <div key={drop.itemId} className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400 truncate mr-2">
                  {drop.itemName}
                </span>
                <span className="tabular-nums font-medium text-gray-900 dark:text-gray-100 shrink-0">
                  {formatAmount(drop.expectedQtyPerRun * OFFLINE_HUNT_RUNS_PER_MINUTE)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
