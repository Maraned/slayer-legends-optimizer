'use client';

import { useMemo, useState } from 'react';

import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import { useStagesStore, type StagesStore } from '@/store/useStagesStore';
import {
  calculateStageResourceRates,
  normalizeStageRankings,
} from '@/lib/stage-calculator';
import { aggregateFarmingBonuses } from '@/lib/bonus-aggregator';
import { calcSpiritAtkBonus } from '@/components/SpiritBuffToggles/SpiritBuffToggles';
import { calcScrollBlessingBonuses } from '@/components/ScrollBlessingToggles/ScrollBlessingToggles';
import type { Stage } from '@/types/stage';
import type { RankedStage } from '@/types/stage-rates';
import type { TOMState } from '@/types/tom';
import stageDataRaw from '@/data/stage-data.json';
import tomDataRaw from '@/data/tom-data.json';

const STAGES = stageDataRaw.STAGES as unknown as Stage[];
const tomData = tomDataRaw as unknown as TOMState;

const TABLE_SIZE = 10;

type RankMode = 'composite' | 'gold' | 'exp';

function formatAmount(value: number): string {
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  if (value < 1 && value > 0) return value.toFixed(3);
  return value.toFixed(0);
}

function sortByMode(ranked: RankedStage[], mode: RankMode): RankedStage[] {
  if (mode === 'gold') {
    return [...ranked].sort((a, b) => b.goldPerEnergy - a.goldPerEnergy);
  }
  if (mode === 'exp') {
    return [...ranked].sort((a, b) => b.expPerEnergy - a.expPerEnergy);
  }
  // composite: already sorted by normalizeStageRankings
  return ranked;
}

export function StageComparisonTable() {
  const [rankMode, setRankMode] = useState<RankMode>('composite');

  const currentFarmStageId = useUserSaveStore(
    (s: UserSaveStore) => s.stageSelection.currentFarmStageId,
  );
  const spiritBuffs = useUserSaveStore(
    (s: UserSaveStore) => s.stageSelection.spiritBuffs,
  );
  const scrollBlessings = useUserSaveStore(
    (s: UserSaveStore) => s.stageSelection.scrollBlessings,
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
  const manualMonsterGoldBonus = useStagesStore(
    (s: StagesStore) => s.manualMonsterGoldBonus,
  );

  const tomNodes = useMemo(
    () =>
      tomData.nodes.map((node) => ({
        ...node,
        currentLevel: nodeLevels[node.id] ?? 0,
      })),
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
    const scrollBlessingBonuses = calcScrollBlessingBonuses(scrollBlessings);
    return {
      ...breakdown.totals,
      extraExpBonus:
        extraExpMode === 'manual'
          ? manualExtraExpBonus / 100
          : breakdown.totals.extraExpBonus + scrollBlessingBonuses.extraExpBonus,
      monsterGoldBonus:
        monsterGoldMode === 'manual'
          ? manualMonsterGoldBonus / 100
          : breakdown.totals.monsterGoldBonus + scrollBlessingBonuses.monsterGoldBonus,
      extraAtkBonus:
        breakdown.totals.extraAtkBonus + calcSpiritAtkBonus(spiritBuffs),
      dropRateBonus:
        breakdown.totals.dropRateBonus + scrollBlessingBonuses.dropRateBonus,
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
    spiritBuffs,
    scrollBlessings,
  ]);

  // Compute global normalized rankings once; re-sort per mode for top-10 display.
  const allRanked = useMemo(() => {
    const rates = STAGES.map((s) => calculateStageResourceRates(s, bonuses));
    return normalizeStageRankings(rates);
  }, [bonuses]);

  const topStages = useMemo(
    () => sortByMode(allRanked, rankMode).slice(0, TABLE_SIZE),
    [allRanked, rankMode],
  );

  const modes: { value: RankMode; label: string }[] = [
    { value: 'composite', label: 'Overall' },
    { value: 'gold', label: 'Gold' },
    { value: 'exp', label: 'EXP' },
  ];

  return (
    <section
      aria-labelledby="stage-comparison-heading"
      className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2
          id="stage-comparison-heading"
          className="text-xs font-semibold text-gray-400 uppercase tracking-wider"
        >
          Top 10 Stages
        </h2>
        <div className="flex gap-1" role="group" aria-label="Rank by">
          {modes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => setRankMode(mode.value)}
              aria-pressed={rankMode === mode.value}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                rankMode === mode.value
                  ? 'bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500'
                  : 'bg-transparent border-gray-200 text-gray-500 hover:border-gray-400 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-500'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label="Top 10 stages comparison">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="pb-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-8">
                #
              </th>
              <th className="pb-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Stage
              </th>
              <th className="pb-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Gold/Energy
              </th>
              <th className="pb-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                EXP/Energy
              </th>
              <th className="pb-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider w-28">
                Score
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
            {topStages.map((stage, index) => {
              const isCurrentFarm = stage.stageId === currentFarmStageId;
              const scorePercent = (stage.compositeScore * 100).toFixed(1);

              return (
                <tr
                  key={stage.stageId}
                  className={`transition-colors ${
                    isCurrentFarm
                      ? 'bg-blue-50/60 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
                  }`}
                >
                  <td className="py-2.5 pr-3 text-xs font-medium text-gray-400 tabular-nums">
                    {index + 1}
                  </td>
                  <td className="py-2.5 pr-4">
                    <span
                      className={`font-medium tabular-nums ${
                        isCurrentFarm
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {stage.stageLabel}
                    </span>
                    {isCurrentFarm && (
                      <span className="ml-1.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                        current
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-gray-700 dark:text-gray-300">
                    {formatAmount(stage.goldPerEnergy)}
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-gray-700 dark:text-gray-300">
                    {formatAmount(stage.expPerEnergy)}
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-14 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            stage.compositeScore >= 0.9
                              ? 'bg-green-500'
                              : stage.compositeScore >= 0.7
                                ? 'bg-amber-500'
                                : 'bg-gray-400'
                          }`}
                          style={{ width: `${stage.compositeScore * 100}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400 w-10 text-right">
                        {scorePercent}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
