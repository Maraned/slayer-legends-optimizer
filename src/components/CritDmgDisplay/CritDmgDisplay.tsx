'use client';

import { useMemo } from 'react';

import {
  aggregateCritDmg,
  calculateTotalCritDmg,
  type CritDmgBreakdown,
} from '@/lib/critDmgCalculator';
import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import { useCalculatorInputsStore, type CalculatorInputsStore } from '@/store/useCalculatorInputsStore';
import type { CubeClass, CubeWeapon } from '@/types/cube-optimizer';
import type { TOMNode } from '@/types/tom';
import cubeData from '@/data/cube-optimizer-data.json';
import tomData from '@/data/tom-data.json';

const CUBE_CLASSES = cubeData.CLASSES as CubeClass[];
const CUBE_WEAPONS = cubeData.WEAPONS as unknown as CubeWeapon[];
const TOM_NODES = tomData.nodes as TOMNode[];

const CRIT_DMG_ENHANCEMENT_BONUS_PER_LEVEL = 0.005;

const SOURCE_LABELS: Record<keyof CritDmgBreakdown, string> = {
  enhancement: 'Enhancement',
  classGrowth: 'Class Growth',
  weaponTier: 'Weapon Tier',
  soulWeapon: 'Soul Weapon',
  skillMastery: 'Skill Mastery',
  constellation: 'Constellation',
  accessories: 'Accessories',
  appearance: 'Appearance',
  treeOfMemory: 'Tree of Memory',
};

function formatPct(value: number): string {
  return `+${value.toFixed(3)}%`;
}

export function CritDmgDisplay() {
  const character = useUserSaveStore((s: UserSaveStore) => s.character);
  const equipment = useUserSaveStore((s: UserSaveStore) => s.equipment);
  const appearance = useUserSaveStore((s: UserSaveStore) => s.appearance);
  const constellation = useUserSaveStore((s: UserSaveStore) => s.constellation);
  const memoryTree = useUserSaveStore((s: UserSaveStore) => s.memoryTree);

  const classId = useCalculatorInputsStore((s: CalculatorInputsStore) => s.classId);
  const classLevel = useCalculatorInputsStore((s: CalculatorInputsStore) => s.classLevel);

  const breakdown = useMemo<CritDmgBreakdown>(() => {
    const selectedClass = CUBE_CLASSES.find((c) => c.id === classId) ?? CUBE_CLASSES[0];

    const equippedWeapon = equipment.weapons.find((w) => w.equipped);
    const cubeWeapon = equippedWeapon
      ? CUBE_WEAPONS.find((cw) => cw.name === equippedWeapon.tier)
      : null;
    const weaponTierCritDmgBonusPct = cubeWeapon?.critDmgBonusPct ?? 0;

    const tomNodesWithLevels: TOMNode[] = TOM_NODES.map((node) => ({
      ...node,
      currentLevel: memoryTree.nodeLevels[node.id] ?? 0,
    }));

    return aggregateCritDmg({
      enhancementLevel: character.enhanceableStats.CRIT_DMG.currentLevel,
      enhancementBonusPerLevel: CRIT_DMG_ENHANCEMENT_BONUS_PER_LEVEL,
      classLevel,
      classGrowthBonusPerLevel: selectedClass.critDmgBonusPctPerLevel,
      weaponTierCritDmgBonusPct,
      soulWeaponEffects: equipment.soulWeapon.effects,
      skillMasteryPages: [],
      constellationBuffTotals: constellation.buffTotals,
      accessories: equipment.accessories,
      appearanceBonusTotals: appearance.bonusTotals,
      tomNodes: tomNodesWithLevels,
    });
  }, [
    character.enhanceableStats.CRIT_DMG.currentLevel,
    classId,
    classLevel,
    equipment.weapons,
    equipment.soulWeapon.effects,
    equipment.accessories,
    appearance.bonusTotals,
    constellation.buffTotals,
    memoryTree.nodeLevels,
  ]);

  const total = useMemo(() => calculateTotalCritDmg(breakdown), [breakdown]);

  const sourceEntries = (Object.entries(breakdown) as [keyof CritDmgBreakdown, number][]).filter(
    ([, value]) => value !== 0,
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">CRIT DMG</h2>
      </div>
      <div className="px-6 py-5">
        <div className="mb-4 rounded-lg bg-purple-50 px-4 py-3 dark:bg-purple-900/20">
          <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-purple-700 dark:text-purple-400">
            Total CRIT DMG
          </p>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">
            {formatPct(total)}
          </p>
        </div>

        {sourceEntries.length > 0 && (
          <div className="space-y-1">
            {sourceEntries.map(([source, value]) => (
              <div
                key={source}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-500 dark:text-gray-400">
                  {SOURCE_LABELS[source]}
                </span>
                <span className="font-mono tabular-nums text-gray-700 dark:text-gray-300">
                  {formatPct(value)}
                </span>
              </div>
            ))}
          </div>
        )}

        {sourceEntries.length === 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            No CRIT DMG sources active. Configure your character, equipment, and progression to see contributions.
          </p>
        )}
      </div>
    </div>
  );
}
