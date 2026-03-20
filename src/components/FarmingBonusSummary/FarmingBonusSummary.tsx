'use client';

import { useMemo } from 'react';

import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import { aggregateFarmingBonuses } from '@/lib/bonus-aggregator';
import type { TOMState } from '@/types/tom';
import tomDataRaw from '@/data/tom-data.json';

const tomData = tomDataRaw as unknown as TOMState;

function formatBonus(value: number): string {
  const pct = value * 100;
  const rounded = Math.round(pct * 10) / 10;
  return `+${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}%`;
}

interface SourceRowProps {
  label: string;
  value: number;
}

function SourceRow({ label, value }: SourceRowProps) {
  if (value === 0) return null;
  return (
    <div className="flex items-center justify-between rounded px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800/60">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="tabular-nums font-medium text-gray-700 dark:text-gray-300">
        {formatBonus(value)}
      </span>
    </div>
  );
}

interface BonusTypeCardProps {
  title: string;
  total: number;
  sources: { label: string; value: number }[];
}

function BonusTypeCard({ title, total, sources }: BonusTypeCardProps) {
  const activeSources = sources.filter((s) => s.value > 0);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</span>
        <span className="text-sm font-bold tabular-nums text-gray-900 dark:text-gray-100">
          {formatBonus(total)}
        </span>
      </div>
      {activeSources.length > 0 ? (
        <div className="space-y-1">
          {activeSources.map((source) => (
            <SourceRow key={source.label} label={source.label} value={source.value} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 dark:text-gray-500 px-2">No active sources</p>
      )}
    </div>
  );
}

export function FarmingBonusSummary() {
  const appearanceBonusTotals = useUserSaveStore((s: UserSaveStore) => s.appearance.bonusTotals);
  const promotion = useUserSaveStore((s: UserSaveStore) => s.character.promotion);
  const companions = useUserSaveStore((s: UserSaveStore) => s.companions);
  const constellationBuffTotals = useUserSaveStore(
    (s: UserSaveStore) => s.constellation.buffTotals,
  );
  const nodeLevels = useUserSaveStore((s: UserSaveStore) => s.memoryTree.nodeLevels);

  const tomNodes = useMemo(
    () => tomData.nodes.map((node) => ({ ...node, currentLevel: nodeLevels[node.id] ?? 0 })),
    [nodeLevels],
  );

  const breakdown = useMemo(
    () =>
      aggregateFarmingBonuses({
        appearanceBonusTotals,
        companions,
        promotion,
        constellationBuffTotals,
        tomNodes,
      }),
    [appearanceBonusTotals, companions, promotion, constellationBuffTotals, tomNodes],
  );

  return (
    <section
      aria-labelledby="farming-bonuses-heading"
      className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-700"
    >
      <h2
        id="farming-bonuses-heading"
        className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4"
      >
        Farming Bonuses
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <BonusTypeCard
          title="Extra EXP"
          total={breakdown.totals.extraExpBonus}
          sources={[
            { label: 'Appearance', value: breakdown.extraExp.appearance },
            { label: 'Companions', value: breakdown.extraExp.companions },
            { label: 'Constellation', value: breakdown.extraExp.constellation },
            { label: 'Memory Tree', value: breakdown.extraExp.memoryTree },
          ]}
        />

        <BonusTypeCard
          title="Monster Gold"
          total={breakdown.totals.monsterGoldBonus}
          sources={[
            { label: 'Appearance', value: breakdown.monsterGold.appearance },
            { label: 'Companions', value: breakdown.monsterGold.companions },
            { label: 'Character', value: breakdown.monsterGold.character },
            { label: 'Constellation', value: breakdown.monsterGold.constellation },
            { label: 'Memory Tree', value: breakdown.monsterGold.memoryTree },
          ]}
        />
      </div>
    </section>
  );
}
