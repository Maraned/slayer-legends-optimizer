'use client';

import { useMemo, useState, useCallback } from 'react';

import { Checkbox } from '@/components/Checkbox';
import { ClassSelector } from '@/components/ClassSelector/ClassSelector';
import { WeaponSelector } from '@/components/WeaponSelector/WeaponSelector';
import { useCalculatorInputsStore } from '@/store/useCalculatorInputsStore';
import type { CalculatorInputsStore } from '@/store/useCalculatorInputsStore';
import cubeData from '@/data/cube-optimizer-data.json';
import type { CubeWeapon, CubeClass } from '@/types/cube-optimizer';

const WEAPONS = cubeData.WEAPONS as unknown as CubeWeapon[];
const CLASSES = cubeData.CLASSES as CubeClass[];

interface CalculationResult {
  weaponName: string;
  weaponFromLevel: number;
  weaponToLevel: number;
  weaponCubeCost: number;
  className: string;
  classFromLevel: number;
  classToLevel: number;
  classCubeCost: number;
  totalCubeCost: number;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatPct(value: number): string {
  return `+${value.toFixed(2)}%`;
}

function calcRangeCost(costPerLevel: number[], fromLevel: number, toLevel: number): number {
  let total = 0;
  for (let i = fromLevel; i < toLevel; i++) {
    total += costPerLevel[i] ?? 0;
  }
  return total;
}

export default function CubeOptimizerPage() {
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [ownedWeaponIds, setOwnedWeaponIds] = useState<Set<string>>(new Set());
  const [ownedClassIds, setOwnedClassIds] = useState<Set<string>>(new Set());

  const classId = useCalculatorInputsStore((s: CalculatorInputsStore) => s.classId);
  const classCurrentLevel = useCalculatorInputsStore((s: CalculatorInputsStore) => s.classCurrentLevel);
  const classLevel = useCalculatorInputsStore((s: CalculatorInputsStore) => s.classLevel);
  const weaponId = useCalculatorInputsStore((s: CalculatorInputsStore) => s.weaponId);
  const weaponCurrentLevel = useCalculatorInputsStore(
    (s: CalculatorInputsStore) => s.weaponCurrentLevel,
  );
  const weaponTargetLevel = useCalculatorInputsStore(
    (s: CalculatorInputsStore) => s.weaponTargetLevel,
  );

  const selectedWeapon = useMemo(
    () => WEAPONS.find((w) => w.id === weaponId) ?? WEAPONS[0],
    [weaponId],
  );

  const weaponUpgradeCost = useMemo(
    () => calcRangeCost(selectedWeapon.cubeCostPerLevel, weaponCurrentLevel - 1, weaponTargetLevel - 1),
    [selectedWeapon, weaponCurrentLevel, weaponTargetLevel],
  );

  const handleCalculate = useCallback(() => {
    const selectedClass = CLASSES.find((c) => c.id === classId) ?? CLASSES[0];
    const classCubeCost = calcRangeCost(selectedClass.cubeCostPerLevel, classCurrentLevel - 1, classLevel - 1);
    setCalculationResult({
      weaponName: `${selectedWeapon.name} (Tier ${selectedWeapon.tier})`,
      weaponFromLevel: weaponCurrentLevel,
      weaponToLevel: weaponTargetLevel,
      weaponCubeCost: weaponUpgradeCost,
      className: selectedClass.name,
      classFromLevel: classCurrentLevel,
      classToLevel: classLevel,
      classCubeCost,
      totalCubeCost: weaponUpgradeCost + classCubeCost,
    });
  }, [classId, classCurrentLevel, classLevel, selectedWeapon, weaponCurrentLevel, weaponTargetLevel, weaponUpgradeCost]);

  function handleWeaponOwned(weaponId: string, owned: boolean) {
    setOwnedWeaponIds((prev) => {
      const next = new Set(prev);
      if (owned) {
        next.add(weaponId);
      } else {
        next.delete(weaponId);
      }
      return next;
    });
  }

  function handleClassOwned(classId: string, owned: boolean) {
    setOwnedClassIds((prev) => {
      const next = new Set(prev);
      if (owned) {
        next.add(classId);
      } else {
        next.delete(classId);
      }
      return next;
    });
  }

  const enhanceTargets = useMemo(() => {
    return WEAPONS.filter((w) => ownedWeaponIds.has(w.id))
      .map((w) => {
        const totalCost = w.cubeCostPerLevel.reduce((sum, c) => sum + c, 0);
        const efficiency = totalCost > 0 ? w.critDmgBonusPct / totalCost : 0;
        return { weapon: w, totalCubeCost: totalCost, efficiency };
      })
      .sort((a, b) => b.efficiency - a.efficiency);
  }, [ownedWeaponIds]);

  const classEnhanceTargets = useMemo(() => {
    return CLASSES.filter((c) => ownedClassIds.has(c.id))
      .map((c) => {
        const totalCost = c.cubeCostPerLevel.reduce((sum, v) => sum + v, 0);
        const totalCritDmg = c.critDmgBonusPctPerLevel * c.maxLevel;
        const efficiency = totalCost > 0 ? totalCritDmg / totalCost : 0;
        return { cls: c, totalCubeCost: totalCost, totalCritDmg, efficiency };
      })
      .sort((a, b) => b.efficiency - a.efficiency);
  }, [ownedClassIds]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-8 dark:bg-gray-900 dark:border-gray-700">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cube Optimizer</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Plan your weapon tier and class upgrades — see cube costs at a glance.
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Weapon & Class configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Weapon configuration */}
          <section aria-labelledby="weapon-config-heading">
            <WeaponSelector />
          </section>

          {/* Class configuration */}
          <section aria-labelledby="class-config-heading" className="flex flex-col gap-6">
            <ClassSelector />
          </section>
        </div>

        {/* Weapon ownership */}
        <section
          aria-labelledby="weapon-ownership-heading"
          className="bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700"
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2
              id="weapon-ownership-heading"
              className="text-xs font-semibold text-gray-400 uppercase tracking-wider"
            >
              Weapon Ownership
            </h2>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {ownedWeaponIds.size} / {WEAPONS.length} owned
            </span>
          </div>
          <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {WEAPONS.map((weapon) => (
              <Checkbox
                key={weapon.id}
                id={`weapon-owned-${weapon.id}`}
                label={weapon.name}
                checked={ownedWeaponIds.has(weapon.id)}
                onCheckedChange={(checked) => handleWeaponOwned(weapon.id, checked)}
              />
            ))}
          </div>
        </section>

        {/* Enhance To Targets */}
        {enhanceTargets.length > 0 && (
          <section
            aria-labelledby="enhance-targets-heading"
            className="bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2
                id="enhance-targets-heading"
                className="text-xs font-semibold text-gray-400 uppercase tracking-wider"
              >
                Enhance To Targets
              </h2>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Owned weapons ranked by CRIT DMG efficiency — enhance in this order for the best return.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">
                      #
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Weapon
                    </th>
                    <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Enhance To
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                      CRIT DMG
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      Total Cubes
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Efficiency
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {enhanceTargets.map(({ weapon, totalCubeCost, efficiency }, idx) => (
                    <tr
                      key={weapon.id}
                      className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                    >
                      <td className="px-4 py-2.5 text-gray-400 dark:text-gray-500 font-medium tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-2.5 text-gray-800 dark:text-gray-200 font-medium">
                        {weapon.name}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          Lv {weapon.maxLevel}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-purple-700 dark:text-purple-300 font-medium">
                        {weapon.critDmgBonusPct}%
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-amber-700 dark:text-amber-300">
                        {formatNumber(totalCubeCost)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-gray-500 dark:text-gray-400 text-xs">
                        {efficiency.toFixed(4)}%/cube
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Class ownership */}
        <section
          aria-labelledby="class-ownership-heading"
          className="bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700"
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2
              id="class-ownership-heading"
              className="text-xs font-semibold text-gray-400 uppercase tracking-wider"
            >
              Class Ownership
            </h2>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {ownedClassIds.size} / {CLASSES.length} owned
            </span>
          </div>
          <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {CLASSES.map((cls) => (
              <Checkbox
                key={cls.id}
                id={`class-owned-${cls.id}`}
                label={cls.name}
                checked={ownedClassIds.has(cls.id)}
                onCheckedChange={(checked) => handleClassOwned(cls.id, checked)}
              />
            ))}
          </div>
        </section>

        {/* Class Enhance To Targets */}
        {classEnhanceTargets.length > 0 && (
          <section
            aria-labelledby="class-enhance-targets-heading"
            className="bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2
                id="class-enhance-targets-heading"
                className="text-xs font-semibold text-gray-400 uppercase tracking-wider"
              >
                Class Enhance To Targets
              </h2>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Owned classes ranked by CRIT DMG efficiency — enhance in this order for the best return.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">
                      #
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Enhance To
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                      CRIT DMG
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      Total Cubes
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Efficiency
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {classEnhanceTargets.map(({ cls, totalCubeCost, totalCritDmg, efficiency }, idx) => (
                    <tr
                      key={cls.id}
                      className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                    >
                      <td className="px-4 py-2.5 text-gray-400 dark:text-gray-500 font-medium tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-2.5 text-gray-800 dark:text-gray-200 font-medium">
                        {cls.name}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          Lv {cls.maxLevel}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-purple-700 dark:text-purple-300 font-medium">
                        {totalCritDmg.toFixed(1)}%
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-amber-700 dark:text-amber-300">
                        {formatNumber(totalCubeCost)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-gray-500 dark:text-gray-400 text-xs">
                        {efficiency.toFixed(4)}%/cube
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Calculate button */}
        <div className="flex justify-end">
          <button
            onClick={handleCalculate}
            className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 transition-colors cursor-pointer"
          >
            Calculate
          </button>
        </div>

        {/* Calculation results */}
        {calculationResult !== null && (
          <section aria-labelledby="results-heading">
            <h2
              id="results-heading"
              className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3"
            >
              Results
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border border-gray-200 bg-white px-6 py-5 dark:bg-gray-900 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Weapon Cubes</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
                  {calculationResult.weaponCubeCost > 0
                    ? formatNumber(calculationResult.weaponCubeCost)
                    : '—'}
                </p>
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  {calculationResult.weaponName} · Lv {calculationResult.weaponFromLevel} →{' '}
                  {calculationResult.weaponToLevel}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white px-6 py-5 dark:bg-gray-900 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Class Cubes</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
                  {calculationResult.classCubeCost > 0
                    ? formatNumber(calculationResult.classCubeCost)
                    : '—'}
                </p>
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  {calculationResult.className} · Lv {calculationResult.classFromLevel} →{' '}
                  {calculationResult.classToLevel}
                </p>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 px-6 py-5 dark:bg-blue-900/20 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-400">Total Cubes</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-blue-900 dark:text-blue-100">
                  {calculationResult.totalCubeCost > 0
                    ? formatNumber(calculationResult.totalCubeCost)
                    : '—'}
                </p>
                <p className="mt-2 text-xs text-blue-600 dark:text-blue-500">
                  combined cost
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
