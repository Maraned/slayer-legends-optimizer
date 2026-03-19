'use client';

import { useMemo } from 'react';

import { NumberInput } from '@/components/NumberInput';
import { Select } from '@/components/Select/Select';
import { LatentPowerGrid } from '@/components/LatentPowerGrid/LatentPowerGrid';
import { GrowthStrInput } from '@/components/GrowthStrInput';
import { GrowthHpInput } from '@/components/GrowthHpInput';
import { PromotionTierSelector } from '@/components/PromotionTierSelector/PromotionTierSelector';
import { EnhancementRanking } from '@/components/EnhancementRanking';
import { segmentCost } from '@/lib/gold-calculator';
import {
  buildGrowthKnowledgeIndex,
  buildSlayerLevelIndex,
} from '@/lib/character-data-lookups';
import { useCalculatorInputsStore } from '@/store/useCalculatorInputsStore';
import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import type { EnhanceableStatKey } from '@/types/character';
import type { CalculatorInputsStore } from '@/store/useCalculatorInputsStore';
import characterData from '@/data/character-maths-data.json';

const ENHANCE_STAT_LABELS: Record<EnhanceableStatKey, string> = {
  ATK: 'ATK',
  CRIT_DMG: 'CRIT DMG',
  CRIT_PCT: 'CRIT %',
  DEATH_STRIKE: 'Death Strike',
  DEATH_STRIKE_PCT: 'Death Strike %',
  HP: 'HP',
  HP_RECOVERY: 'HP Recovery',
};

const ENHANCE_STAT_ORDER: EnhanceableStatKey[] = [
  'ATK',
  'CRIT_DMG',
  'CRIT_PCT',
  'DEATH_STRIKE',
  'DEATH_STRIKE_PCT',
  'HP',
  'HP_RECOVERY',
];

function formatGold(gold: number): string {
  if (gold <= 0) return '—';
  if (gold >= 1e12) return `${(gold / 1e12).toFixed(2)}T`;
  if (gold >= 1e9) return `${(gold / 1e9).toFixed(2)}B`;
  if (gold >= 1e6) return `${(gold / 1e6).toFixed(2)}M`;
  if (gold >= 1e3) return `${(gold / 1e3).toFixed(2)}K`;
  return gold.toFixed(0);
}

export default function CharacterPage() {
  const character = useUserSaveStore((s: UserSaveStore) => s.character);
  const setEnhanceableStats = useUserSaveStore((s: UserSaveStore) => s.setEnhanceableStats);
  const setGrowthStats = useUserSaveStore((s: UserSaveStore) => s.setGrowthStats);
  const setSlayerLevel = useUserSaveStore((s: UserSaveStore) => s.setSlayerLevel);
  const setGrowingKnowledge = useUserSaveStore((s: UserSaveStore) => s.setGrowingKnowledge);

  const goldEnhancementTargets = useCalculatorInputsStore(
    (s: CalculatorInputsStore) => s.goldEnhancementTargets,
  );
  const setGoldEnhancementTarget = useCalculatorInputsStore(
    (s: CalculatorInputsStore) => s.setGoldEnhancementTarget,
  );

  const slayerLevelIndex = useMemo(() => buildSlayerLevelIndex(characterData.SLAYER_LEVEL), []);
  const growthKnowledgeIndex = useMemo(
    () => buildGrowthKnowledgeIndex(characterData.GROWTH_KNOWLEDGE),
    [],
  );

  const growingKnowledgeOptions = useMemo(
    () =>
      characterData.GROWTH_KNOWLEDGE.map((gk) => ({
        value: String(gk.grade),
        label: `Grade ${gk.grade}`,
      })),
    [],
  );

  function handleSlayerLevelChange(level: number) {
    const entry = slayerLevelIndex[level];
    setSlayerLevel({ level, expRequiredForNext: entry?.expRequired ?? 0 });
  }

  function handleGrowingKnowledgeChange(value: string) {
    const grade = parseInt(value, 10);
    const entry = growthKnowledgeIndex[grade];
    setGrowingKnowledge({ grade, atkEffectPct: entry?.atkEffectMultiplier ?? 1 });
  }

  const totalGoldCost = ENHANCE_STAT_ORDER.reduce((total, stat) => {
    const entry = character.enhanceableStats[stat];
    const target = goldEnhancementTargets[stat];
    return total + (target > entry.currentLevel ? segmentCost(entry.currentLevel, target) : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white border-b border-gray-200 px-6 py-8 dark:bg-gray-900 dark:border-gray-700">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Character</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manual stat calculator</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Top row: Slayer Level + Growing Knowledge */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Slayer Level */}
          <section
            aria-labelledby="slayer-level-heading"
            className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-700"
          >
            <h2
              id="slayer-level-heading"
              className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4"
            >
              Slayer Level
            </h2>
            <div className="flex flex-col gap-4">
              <NumberInput
                label="Level"
                value={character.slayerLevel.level}
                onChange={handleSlayerLevelChange}
                min={1}
                max={4002}
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">EXP to next level</span>
                <span className="font-mono font-medium tabular-nums text-gray-900 dark:text-gray-100">
                  {character.slayerLevel.expRequiredForNext.toLocaleString()}
                </span>
              </div>
            </div>
          </section>

          {/* Growing Knowledge */}
          <section
            aria-labelledby="growing-knowledge-heading"
            className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-700"
          >
            <h2
              id="growing-knowledge-heading"
              className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4"
            >
              Growing Knowledge
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[var(--color-foreground)]">Grade</label>
                <Select
                  value={String(character.growingKnowledge.grade)}
                  onValueChange={handleGrowingKnowledgeChange}
                  options={growingKnowledgeOptions}
                  aria-label="Growing Knowledge grade"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">ATK effect multiplier</span>
                <span className="font-mono font-medium tabular-nums text-gray-900 dark:text-gray-100">
                  ×{character.growingKnowledge.atkEffectPct.toFixed(2)}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Second row: Growth + Promotion Tier Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Growth */}
          <section
            aria-labelledby="growth-heading"
            className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-700"
          >
            <h2
              id="growth-heading"
              className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4"
            >
              Growth
            </h2>
            <div className="flex flex-col gap-4">
              <GrowthStrInput />
              <GrowthHpInput />
              <NumberInput
                label="VIT Level"
                value={character.growthStats.VIT.level}
                onChange={(level) =>
                  setGrowthStats({
                    ...character.growthStats,
                    VIT: { ...character.growthStats.VIT, level },
                  })
                }
                min={0}
              />
            </div>
          </section>

          {/* Promotion Tier Selector */}
          <PromotionTierSelector />
        </div>

        {/* Enhancement Manual Calculator */}
        <section
          aria-labelledby="enhance-heading"
          className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-700"
        >
          <h2
            id="enhance-heading"
            className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4"
          >
            Enhancement — Manual Calculator
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 text-left font-semibold text-gray-700 dark:text-gray-300 pr-4">
                    Stat
                  </th>
                  <th className="pb-3 text-center font-semibold text-gray-700 dark:text-gray-300 px-2">
                    Current Level
                  </th>
                  <th className="pb-3 text-center font-semibold text-gray-700 dark:text-gray-300 px-2">
                    Max Level
                  </th>
                  <th className="pb-3 text-center font-semibold text-gray-700 dark:text-gray-300 px-2">
                    Target Level
                  </th>
                  <th className="pb-3 text-right font-semibold text-gray-700 dark:text-gray-300 pl-4">
                    Gold Cost
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {ENHANCE_STAT_ORDER.map((stat) => {
                  const entry = character.enhanceableStats[stat];
                  const target = goldEnhancementTargets[stat];
                  const goldCost =
                    target > entry.currentLevel ? segmentCost(entry.currentLevel, target) : 0;
                  const isMaxed = entry.maxLevel > 0 && entry.currentLevel >= entry.maxLevel;

                  return (
                    <tr key={stat}>
                      <td className="py-3 pr-4 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        {ENHANCE_STAT_LABELS[stat]}
                        {isMaxed && (
                          <span className="ml-2 text-xs font-normal text-green-600 dark:text-green-400">
                            MAX
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <NumberInput
                          value={entry.currentLevel}
                          onChange={(val) =>
                            setEnhanceableStats({
                              ...character.enhanceableStats,
                              [stat]: { ...entry, currentLevel: val },
                            })
                          }
                          min={0}
                        />
                      </td>
                      <td className="py-3 px-2 text-center">
                        <NumberInput
                          value={entry.maxLevel}
                          onChange={(val) =>
                            setEnhanceableStats({
                              ...character.enhanceableStats,
                              [stat]: { ...entry, maxLevel: val },
                            })
                          }
                          min={0}
                        />
                      </td>
                      <td className="py-3 px-2 text-center">
                        <NumberInput
                          value={target}
                          onChange={(val) => setGoldEnhancementTarget(stat, val)}
                          min={0}
                        />
                      </td>
                      <td className="py-3 pl-4 text-right font-mono tabular-nums whitespace-nowrap text-gray-900 dark:text-gray-100">
                        {formatGold(goldCost)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 dark:border-gray-700">
                  <td
                    colSpan={4}
                    className="pt-3 font-semibold text-gray-900 dark:text-gray-100"
                  >
                    Total
                  </td>
                  <td className="pt-3 text-right font-mono font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                    {formatGold(totalGoldCost)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Enhancement Priority */}
        <section
          aria-labelledby="enhancement-priority-heading"
          className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-700"
        >
          <h2
            id="enhancement-priority-heading"
            className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4"
          >
            Enhancement Priority — Efficiency Ranking
          </h2>
          <EnhancementRanking />
        </section>

        {/* Latent Power */}
        <LatentPowerGrid />
      </div>
    </div>
  );
}
