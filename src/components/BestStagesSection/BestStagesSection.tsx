'use client';

import { useMemo } from 'react';

import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import { useStagesStore, type StagesStore } from '@/store/useStagesStore';
import { aggregateFarmingBonuses } from '@/lib/bonus-aggregator';
import { calcSpiritAtkBonus } from '@/components/SpiritBuffToggles/SpiritBuffToggles';
import { calcScrollBlessingBonuses } from '@/components/ScrollBlessingToggles/ScrollBlessingToggles';
import { calculateStageResourceRates, normalizeStageRankings } from '@/lib/stage-calculator';
import { rankStagesBySoulsPerEnergy } from '@/lib/souls';
import type { Stage } from '@/types/stage';
import type { StageResourceRates } from '@/types/stage-rates';
import type { TOMState } from '@/types/tom';
import stageDataRaw from '@/data/stage-data.json';
import tomDataRaw from '@/data/tom-data.json';

const STAGES = stageDataRaw.STAGES as unknown as Stage[];
const tomData = tomDataRaw as unknown as TOMState;

// Item category patterns
// Cubes  → shard-type items (cube-like enhancement materials)
// Stones → fragment/stone-type items (upgrade stones)
// Diamonds → crystal-type items (rare crystalline materials)
const CUBES_PATTERN = /_shard$/;
const STONES_PATTERN = /_(fragment|stone)$/;
const DIAMONDS_PATTERN = /_crystal$/;

function getSummedDropRate(rate: StageResourceRates, pattern: RegExp): number {
  return rate.itemDrops
    .filter((drop) => pattern.test(drop.itemId))
    .reduce((sum, drop) => sum + drop.expectedQtyPerEnergy, 0);
}

function findBestStage(
  rates: StageResourceRates[],
  getValue: (r: StageResourceRates) => number,
): StageResourceRates | null {
  if (rates.length === 0) return null;
  return rates.reduce((best, curr) => (getValue(curr) > getValue(best) ? curr : best));
}

function formatRate(value: number): string {
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  if (value < 1 && value > 0) return value.toFixed(3);
  return value.toFixed(1);
}

interface ResourceScore {
  label: string;
  score: number;
}

interface BestStageCardProps {
  title: string;
  stageLabel: string;
  areaName?: string;
  zoneName?: string;
  metricLabel: string;
  metricValue: string;
  scores: ResourceScore[];
}

function BestStageCard({ title, stageLabel, areaName, zoneName, metricLabel, metricValue, scores }: BestStageCardProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 px-3 py-3">
      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        {title}
      </span>
      <span className="text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums">
        {stageLabel}
      </span>
      {areaName && zoneName && (
        <span className="text-[10px] text-gray-400 dark:text-gray-500 -mt-1">
          {areaName} · {zoneName}
        </span>
      )}
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {metricLabel}:{' '}
        <span className="tabular-nums font-medium text-gray-700 dark:text-gray-300">
          {metricValue}
        </span>
      </span>
      {scores.length > 0 && (
        <div className="mt-1 space-y-1 pt-1.5 border-t border-gray-100 dark:border-gray-700/60">
          {scores.map(({ label, score }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 w-12 shrink-0">
                {label}
              </span>
              <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400 dark:bg-blue-500 rounded-full"
                  style={{ width: `${score * 100}%` }}
                />
              </div>
              <span className="text-[10px] tabular-nums text-gray-400 dark:text-gray-500 w-7 text-right">
                {(score * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Best soul dungeon stage is independent of player farming bonuses
const BEST_SOULS_STAGE = rankStagesBySoulsPerEnergy()[0] ?? null;

export function BestStagesSection() {
  const appearanceBonusTotals = useUserSaveStore((s: UserSaveStore) => s.appearance.bonusTotals);
  const promotion = useUserSaveStore((s: UserSaveStore) => s.character.promotion);
  const companions = useUserSaveStore((s: UserSaveStore) => s.companions);
  const constellationBuffTotals = useUserSaveStore(
    (s: UserSaveStore) => s.constellation.buffTotals,
  );
  const nodeLevels = useUserSaveStore((s: UserSaveStore) => s.memoryTree.nodeLevels);
  const spiritBuffs = useUserSaveStore((s: UserSaveStore) => s.stageSelection.spiritBuffs);
  const scrollBlessings = useUserSaveStore(
    (s: UserSaveStore) => s.stageSelection.scrollBlessings,
  );

  const extraExpMode = useStagesStore((s: StagesStore) => s.extraExpMode);
  const manualExtraExpBonus = useStagesStore((s: StagesStore) => s.manualExtraExpBonus);
  const monsterGoldMode = useStagesStore((s: StagesStore) => s.monsterGoldMode);
  const manualMonsterGoldBonus = useStagesStore((s: StagesStore) => s.manualMonsterGoldBonus);

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
      dropRateBonus: breakdown.totals.dropRateBonus + scrollBlessingBonuses.dropRateBonus,
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
    scrollBlessings,
  ]);

  const rates = useMemo(
    () => STAGES.map((stage) => calculateStageResourceRates(stage, bonuses)),
    [bonuses],
  );

  const bestOverallStage = useMemo(
    () => normalizeStageRankings(rates)[0] ?? null,
    [rates],
  );

  const bestExpStage = useMemo(
    () => findBestStage(rates, (r) => r.expPerEnergy),
    [rates],
  );

  const bestGoldStage = useMemo(
    () => findBestStage(rates, (r) => r.goldPerEnergy),
    [rates],
  );

  const bestCubesStage = useMemo(
    () => findBestStage(rates, (r) => getSummedDropRate(r, CUBES_PATTERN)),
    [rates],
  );

  const bestStonesStage = useMemo(
    () => findBestStage(rates, (r) => getSummedDropRate(r, STONES_PATTERN)),
    [rates],
  );

  const bestDiamondsStage = useMemo(
    () => findBestStage(rates, (r) => getSummedDropRate(r, DIAMONDS_PATTERN)),
    [rates],
  );

  // Maxima for normalization (each best stage defines the 1.0 reference)
  const maxExp = bestExpStage?.expPerEnergy ?? 0;
  const maxGold = bestGoldStage?.goldPerEnergy ?? 0;
  const maxCubes = bestCubesStage ? getSummedDropRate(bestCubesStage, CUBES_PATTERN) : 0;
  const maxStones = bestStonesStage ? getSummedDropRate(bestStonesStage, STONES_PATTERN) : 0;
  const maxDiamonds = bestDiamondsStage
    ? getSummedDropRate(bestDiamondsStage, DIAMONDS_PATTERN)
    : 0;

  function getResourceScores(rate: StageResourceRates): ResourceScore[] {
    return [
      { label: 'EXP', score: maxExp > 0 ? rate.expPerEnergy / maxExp : 0 },
      { label: 'Gold', score: maxGold > 0 ? rate.goldPerEnergy / maxGold : 0 },
      {
        label: 'Cubes',
        score: maxCubes > 0 ? getSummedDropRate(rate, CUBES_PATTERN) / maxCubes : 0,
      },
      {
        label: 'Stones',
        score: maxStones > 0 ? getSummedDropRate(rate, STONES_PATTERN) / maxStones : 0,
      },
      {
        label: 'Diamonds',
        score: maxDiamonds > 0 ? getSummedDropRate(rate, DIAMONDS_PATTERN) / maxDiamonds : 0,
      },
    ];
  }

  return (
    <section
      aria-labelledby="best-stages-heading"
      className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-700"
    >
      <h2
        id="best-stages-heading"
        className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4"
      >
        Best Stages
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {bestOverallStage && (
          <BestStageCard
            title="Overall"
            stageLabel={bestOverallStage.stageLabel}
            areaName={bestOverallStage.areaName}
            zoneName={bestOverallStage.zoneName}
            metricLabel="Score"
            metricValue={`${(bestOverallStage.compositeScore * 100).toFixed(1)}%`}
            scores={getResourceScores(bestOverallStage)}
          />
        )}

        {bestExpStage && (
          <BestStageCard
            title="EXP"
            stageLabel={bestExpStage.stageLabel}
            areaName={bestExpStage.areaName}
            zoneName={bestExpStage.zoneName}
            metricLabel="EXP / energy"
            metricValue={formatRate(bestExpStage.expPerEnergy)}
            scores={getResourceScores(bestExpStage)}
          />
        )}

        {bestGoldStage && (
          <BestStageCard
            title="Gold"
            stageLabel={bestGoldStage.stageLabel}
            areaName={bestGoldStage.areaName}
            zoneName={bestGoldStage.zoneName}
            metricLabel="Gold / energy"
            metricValue={formatRate(bestGoldStage.goldPerEnergy)}
            scores={getResourceScores(bestGoldStage)}
          />
        )}

        {bestCubesStage && (
          <BestStageCard
            title="Cubes"
            stageLabel={bestCubesStage.stageLabel}
            areaName={bestCubesStage.areaName}
            zoneName={bestCubesStage.zoneName}
            metricLabel="Shards / energy"
            metricValue={formatRate(getSummedDropRate(bestCubesStage, CUBES_PATTERN))}
            scores={getResourceScores(bestCubesStage)}
          />
        )}

        {bestStonesStage && (
          <BestStageCard
            title="Stones"
            stageLabel={bestStonesStage.stageLabel}
            areaName={bestStonesStage.areaName}
            zoneName={bestStonesStage.zoneName}
            metricLabel="Stones / energy"
            metricValue={formatRate(getSummedDropRate(bestStonesStage, STONES_PATTERN))}
            scores={getResourceScores(bestStonesStage)}
          />
        )}

        {bestDiamondsStage && (
          <BestStageCard
            title="Diamonds"
            stageLabel={bestDiamondsStage.stageLabel}
            areaName={bestDiamondsStage.areaName}
            zoneName={bestDiamondsStage.zoneName}
            metricLabel="Crystals / energy"
            metricValue={formatRate(getSummedDropRate(bestDiamondsStage, DIAMONDS_PATTERN))}
            scores={getResourceScores(bestDiamondsStage)}
          />
        )}

        {BEST_SOULS_STAGE && (
          <BestStageCard
            title="Souls"
            stageLabel={`Soul Stage ${BEST_SOULS_STAGE.stageNumber}`}
            metricLabel="Souls / energy"
            metricValue={BEST_SOULS_STAGE.avgSoulsPerEnergy.toFixed(2)}
            scores={[]}
          />
        )}
      </div>
    </section>
  );
}
