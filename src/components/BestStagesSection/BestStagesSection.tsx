'use client';

import { useMemo } from 'react';

import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import { useStagesStore, type StagesStore } from '@/store/useStagesStore';
import { aggregateFarmingBonuses } from '@/lib/bonus-aggregator';
import { calcSpiritAtkBonus } from '@/components/SpiritBuffToggles/SpiritBuffToggles';
import { calcScrollBlessingBonuses } from '@/components/ScrollBlessingToggles/ScrollBlessingToggles';
import { calculateStageResourceRates } from '@/lib/stage-calculator';
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

interface BestStageCardProps {
  title: string;
  stageLabel: string;
  metricLabel: string;
  metricValue: string;
}

function BestStageCard({ title, stageLabel, metricLabel, metricValue }: BestStageCardProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 px-3 py-3">
      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        {title}
      </span>
      <span className="text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums">
        {stageLabel}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {metricLabel}:{' '}
        <span className="tabular-nums font-medium text-gray-700 dark:text-gray-300">
          {metricValue}
        </span>
      </span>
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

  const bestExpStage = useMemo(
    () => findBestStage(rates, (r) => r.expPerEnergy),
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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {bestExpStage && (
          <BestStageCard
            title="EXP"
            stageLabel={bestExpStage.stageLabel}
            metricLabel="EXP / energy"
            metricValue={formatRate(bestExpStage.expPerEnergy)}
          />
        )}

        {bestCubesStage && (
          <BestStageCard
            title="Cubes"
            stageLabel={bestCubesStage.stageLabel}
            metricLabel="Shards / energy"
            metricValue={formatRate(getSummedDropRate(bestCubesStage, CUBES_PATTERN))}
          />
        )}

        {bestStonesStage && (
          <BestStageCard
            title="Stones"
            stageLabel={bestStonesStage.stageLabel}
            metricLabel="Stones / energy"
            metricValue={formatRate(getSummedDropRate(bestStonesStage, STONES_PATTERN))}
          />
        )}

        {bestDiamondsStage && (
          <BestStageCard
            title="Diamonds"
            stageLabel={bestDiamondsStage.stageLabel}
            metricLabel="Crystals / energy"
            metricValue={formatRate(getSummedDropRate(bestDiamondsStage, DIAMONDS_PATTERN))}
          />
        )}

        {BEST_SOULS_STAGE && (
          <BestStageCard
            title="Souls"
            stageLabel={`Soul Stage ${BEST_SOULS_STAGE.stageNumber}`}
            metricLabel="Souls / energy"
            metricValue={BEST_SOULS_STAGE.avgSoulsPerEnergy.toFixed(2)}
          />
        )}
      </div>
    </section>
  );
}
