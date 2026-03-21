'use client';

import { useMemo } from 'react';

import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import { useCalculatorInputsStore, type CalculatorInputsStore } from '@/store/useCalculatorInputsStore';
import { useSkillsStore, type SkillsStore } from '@/store/useSkillsStore';
import { atkSourcesFromState } from '@/lib/atk-state';
import { aggregateAtkDetailed } from '@/lib/atk-aggregation';
import { NumberInput } from '@/components/NumberInput';
import { Toggle } from '@/components/Toggle/Toggle';
import characterData from '@/data/character-maths-data.json';
import equipmentData from '@/data/equipment.json';
import cubeData from '@/data/cube-optimizer-data.json';
import familiarsData from '@/data/familiars-maths-data.json';
import tomDataRaw from '@/data/tom-data.json';
import type { TOMState } from '@/types/tom';
import type { CubeClass, CubeWeapon } from '@/types/cube-optimizer';
import type { LevelMultiplier } from '@/types/equipment';
import type { DemonSanctuaryEntry } from '@/types/familiars';
import type { PromotionEntry, PromotionBonusEntry, GrowthKnowledgeEntry } from '@/types/character-data';

const tomData = tomDataRaw as unknown as TOMState;

function formatAtk(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return Math.round(value).toLocaleString();
}

function formatPct(value: number): string {
  const pct = value * 100;
  const rounded = Math.round(pct * 10) / 10;
  return `+${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}%`;
}

interface SourceRowProps {
  label: string;
  value: number;
  isPercent?: boolean;
}

function SourceRow({ label, value, isPercent = false }: SourceRowProps) {
  if (value === 0) return null;
  return (
    <div className="flex items-center justify-between rounded px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800/60">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="tabular-nums font-medium text-gray-700 dark:text-gray-300">
        {isPercent ? formatPct(value) : formatAtk(value)}
      </span>
    </div>
  );
}

/**
 * Displays the calculated Total ATK broken down by source, with an optional
 * manual override toggle so players can enter a custom ATK value.
 *
 * In auto mode, values are automatically derived from all ATK-contributing
 * state slices — the same inputs used in the DMG Efficiency calculation.
 * In manual mode, the player enters a custom Total ATK value directly.
 */
export function TotalAtkDisplay() {
  const character = useUserSaveStore((s: UserSaveStore) => s.character);
  const appearanceBonusTotals = useUserSaveStore((s: UserSaveStore) => s.appearance.bonusTotals);
  const companions = useUserSaveStore((s: UserSaveStore) => s.companions);
  const constellationBuffTotals = useUserSaveStore(
    (s: UserSaveStore) => s.constellation.buffTotals,
  );
  const weapons = useUserSaveStore((s: UserSaveStore) => s.equipment.weapons);
  const nodeLevels = useUserSaveStore((s: UserSaveStore) => s.memoryTree.nodeLevels);

  const classId = useCalculatorInputsStore((s: CalculatorInputsStore) => s.classId);
  const classLevel = useCalculatorInputsStore((s: CalculatorInputsStore) => s.classLevel);
  const sanctuaryLevel = useCalculatorInputsStore((s: CalculatorInputsStore) => s.sanctuaryLevel);

  const atkMode = useSkillsStore((s: SkillsStore) => s.atkMode);
  const manualAtkValue = useSkillsStore((s: SkillsStore) => s.manualAtkValue);
  const setAtkMode = useSkillsStore((s: SkillsStore) => s.setAtkMode);
  const setManualAtkValue = useSkillsStore((s: SkillsStore) => s.setManualAtkValue);

  const isAuto = atkMode === 'auto';

  const result = useMemo(() => {
    const sources = atkSourcesFromState(
      {
        classId,
        classLevel,
        growthStats: character.growthStats,
        promotionTier: character.promotion.tier,
        growingKnowledgeGrade: character.growingKnowledge.grade,
        weapons,
        appearanceBonusTotals,
        companions,
        tomNodeLevels: nodeLevels,
        constellationBuffTotals,
        sanctuaryLevel,
      },
      {
        promotionTable: characterData.PROMOTION as PromotionEntry[],
        promotionBonusTable: characterData.PROMOTION_BONUS as PromotionBonusEntry[],
        growthKnowledgeTable: characterData.GROWTH_KNOWLEDGE as GrowthKnowledgeEntry[],
        tomNodes: tomData.nodes,
        sanctuaryTable: familiarsData.DEMON_SANCTUARY as DemonSanctuaryEntry[],
        levelMultipliers: equipmentData.levelMultipliers as LevelMultiplier[],
        cubeWeapons: cubeData.WEAPONS as unknown as CubeWeapon[],
        cubeClasses: cubeData.CLASSES as CubeClass[],
      },
    );

    return { sources, detail: aggregateAtkDetailed(sources) };
  }, [
    classId,
    classLevel,
    character.growthStats,
    character.promotion.tier,
    character.growingKnowledge.grade,
    weapons,
    appearanceBonusTotals,
    companions,
    nodeLevels,
    constellationBuffTotals,
    sanctuaryLevel,
  ]);

  const { sources, detail } = result;

  function handleModeToggle(manual: boolean) {
    setAtkMode(manual ? 'manual' : 'auto');
    if (manual && manualAtkValue === 0) {
      setManualAtkValue(Math.round(detail.finalAtk));
    }
  }

  return (
    <section
      aria-labelledby="total-atk-heading"
      className="bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700"
    >
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2
          id="total-atk-heading"
          className="text-xs font-semibold text-gray-400 uppercase tracking-wider"
        >
          Total ATK
        </h2>
        <Toggle
          id="atk-mode-toggle"
          checked={!isAuto}
          onCheckedChange={handleModeToggle}
          label={isAuto ? 'Auto' : 'Manual'}
          size="sm"
          aria-label="Toggle ATK input mode"
        />
      </div>

      <div className="p-6">
        {/* Headline */}
        <div className="flex items-center justify-between rounded-lg bg-gray-100 px-4 py-3 dark:bg-gray-800 mb-4">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Total ATK
          </span>
          <span className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
            {isAuto ? formatAtk(detail.finalAtk) : formatAtk(manualAtkValue)}
          </span>
        </div>

        {!isAuto ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Enter a custom Total ATK value. Disable manual mode to restore auto-calculation.
            </p>
            <NumberInput
              label="Total ATK"
              value={manualAtkValue}
              onChange={setManualAtkValue}
              min={0}
              ariaLabel="Manual Total ATK override"
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Absolute base */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Base ATK</span>
                  <span className="text-sm font-bold tabular-nums text-gray-900 dark:text-gray-100">
                    {formatAtk(detail.absoluteBase)}
                  </span>
                </div>
                <div className="space-y-1">
                  <SourceRow label="Weapon" value={sources.weaponAtk} />
                  <SourceRow label="Growth (STR)" value={sources.growthStrAtk} />
                </div>
              </div>

              {/* Additive % pool */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ATK Bonus
                  </span>
                  <span className="text-sm font-bold tabular-nums text-gray-900 dark:text-gray-100">
                    {formatPct(detail.additivePctTotal)}
                  </span>
                </div>
                <div className="space-y-1">
                  <SourceRow label="Class" value={sources.classAtkPct} isPercent />
                  <SourceRow label="Promotion" value={sources.promotionAtkPct} isPercent />
                  <SourceRow label="Promotion Bonus" value={sources.promotionBonusAtkPct} isPercent />
                  <SourceRow label="Companions" value={sources.companionsAtkPct} isPercent />
                  <SourceRow label="Memory Tree" value={sources.tomAtkPct} isPercent />
                  <SourceRow label="Appearance" value={sources.appearanceAtkPct} isPercent />
                  <SourceRow label="Constellation" value={sources.constellationAtkPct} isPercent />
                  <SourceRow label="Sanctuary" value={sources.sanctuaryAtkPct} isPercent />
                </div>
              </div>
            </div>

            {/* Multiplicative factor */}
            {detail.multiplicativeFactor > 1 && (
              <div className="mt-4 flex items-center justify-between rounded px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800/60">
                <span className="text-gray-500 dark:text-gray-400">Growing Knowledge ×</span>
                <span className="tabular-nums font-medium text-gray-700 dark:text-gray-300">
                  ×{detail.multiplicativeFactor.toFixed(2)}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
