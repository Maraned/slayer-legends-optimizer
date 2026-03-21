'use client';

import { useMemo, useState, useCallback } from 'react';

import { NumberInput } from '@/components/NumberInput';
import { Select } from '@/components/Select/Select';
import type { SelectOption } from '@/components/Select/Select';
import { ClassSelector } from '@/components/ClassSelector/ClassSelector';
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
  const [weaponId, setWeaponId] = useState<string>(WEAPONS[0].id);
  const [weaponCurrentLevel, setWeaponCurrentLevel] = useState(1);
  const [weaponTargetLevel, setWeaponTargetLevel] = useState(1);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);

  const classId = useCalculatorInputsStore((s: CalculatorInputsStore) => s.classId);
  const classLevel = useCalculatorInputsStore((s: CalculatorInputsStore) => s.classLevel);

  const selectedWeapon = useMemo(
    () => WEAPONS.find((w) => w.id === weaponId) ?? WEAPONS[0],
    [weaponId],
  );

  const weaponOptions: SelectOption[] = WEAPONS.map((w) => ({
    value: w.id,
    label: `${w.name} (Tier ${w.tier})`,
  }));

  const weaponUpgradeCost = useMemo(
    () => calcRangeCost(selectedWeapon.cubeCostPerLevel, weaponCurrentLevel - 1, weaponTargetLevel - 1),
    [selectedWeapon, weaponCurrentLevel, weaponTargetLevel],
  );

  function handleWeaponChange(id: string) {
    const weapon = WEAPONS.find((w) => w.id === id) ?? WEAPONS[0];
    setWeaponId(id);
    setWeaponCurrentLevel(1);
    setWeaponTargetLevel(Math.min(weapon.maxLevel, 1));
  }

  function handleWeaponCurrentLevel(level: number) {
    setWeaponCurrentLevel(level);
    if (weaponTargetLevel < level) setWeaponTargetLevel(level);
  }

  const handleCalculate = useCallback(() => {
    const selectedClass = CLASSES.find((c) => c.id === classId) ?? CLASSES[0];
    const classCubeCost = calcRangeCost(selectedClass.cubeCostPerLevel, 0, classLevel - 1);
    setCalculationResult({
      weaponName: `${selectedWeapon.name} (Tier ${selectedWeapon.tier})`,
      weaponFromLevel: weaponCurrentLevel,
      weaponToLevel: weaponTargetLevel,
      weaponCubeCost: weaponUpgradeCost,
      className: selectedClass.name,
      classFromLevel: 1,
      classToLevel: classLevel,
      classCubeCost,
      totalCubeCost: weaponUpgradeCost + classCubeCost,
    });
  }, [classId, classLevel, selectedWeapon, weaponCurrentLevel, weaponTargetLevel, weaponUpgradeCost]);

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
          <section
            aria-labelledby="weapon-config-heading"
            className="bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2
                id="weapon-config-heading"
                className="text-xs font-semibold text-gray-400 uppercase tracking-wider"
              >
                Weapon
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Weapon tier selector */}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Weapon Tier
                </span>
                <Select
                  value={weaponId}
                  onValueChange={handleWeaponChange}
                  options={weaponOptions}
                  placeholder="Select weapon"
                  aria-label="Weapon tier"
                />
              </label>

              {/* Current / Target levels */}
              <div className="grid grid-cols-2 gap-3">
                <NumberInput
                  label="Current Level"
                  value={weaponCurrentLevel}
                  onChange={handleWeaponCurrentLevel}
                  min={1}
                  max={selectedWeapon.maxLevel}
                />
                <NumberInput
                  label="Target Level"
                  value={weaponTargetLevel}
                  onChange={setWeaponTargetLevel}
                  min={weaponCurrentLevel}
                  max={selectedWeapon.maxLevel}
                />
              </div>

              {/* Weapon stat summary */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800/60">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Base ATK
                  </p>
                  <p className="text-xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
                    {formatNumber(selectedWeapon.baseAtk)}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                    at max upgrade
                  </p>
                </div>

                <div className="rounded-lg bg-purple-50 px-4 py-3 dark:bg-purple-900/20">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-purple-700 dark:text-purple-400">
                    CRIT DMG Bonus
                  </p>
                  <p className="text-xl font-bold tabular-nums text-purple-900 dark:text-purple-200">
                    {formatPct(selectedWeapon.critDmgBonusPct)}
                  </p>
                  <p className="mt-0.5 text-xs text-purple-600 dark:text-purple-400">
                    from this weapon
                  </p>
                </div>
              </div>

              {/* Upgrade cost */}
              <div className="rounded-lg bg-amber-50 px-4 py-3 dark:bg-amber-900/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
                      Upgrade Cost
                    </p>
                    <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-500">
                      Level {weaponCurrentLevel} → {weaponTargetLevel}
                    </p>
                  </div>
                  <p className="text-2xl font-bold tabular-nums text-amber-900 dark:text-amber-200">
                    {weaponUpgradeCost > 0 ? formatNumber(weaponUpgradeCost) : '—'}
                    {weaponUpgradeCost > 0 && (
                      <span className="ml-1 text-sm font-medium text-amber-700 dark:text-amber-400">
                        cubes
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Cost per level table */}
              {weaponCurrentLevel < weaponTargetLevel && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Cost per Level
                  </p>
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Level
                          </th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Cubes
                          </th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Cumulative
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {selectedWeapon.cubeCostPerLevel
                          .slice(weaponCurrentLevel - 1, weaponTargetLevel - 1)
                          .map((cost, idx) => {
                            const levelNum = weaponCurrentLevel + idx;
                            const cumulative = calcRangeCost(
                              selectedWeapon.cubeCostPerLevel,
                              weaponCurrentLevel - 1,
                              weaponCurrentLevel - 1 + idx + 1,
                            );
                            return (
                              <tr
                                key={levelNum}
                                className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                              >
                                <td className="px-3 py-1.5 text-gray-700 dark:text-gray-300">
                                  {levelNum} → {levelNum + 1}
                                </td>
                                <td className="px-3 py-1.5 text-right tabular-nums text-gray-700 dark:text-gray-300">
                                  {cost}
                                </td>
                                <td className="px-3 py-1.5 text-right tabular-nums text-gray-500 dark:text-gray-400">
                                  {cumulative}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Class configuration (uses existing ClassSelector component) */}
          <section aria-labelledby="class-config-heading" className="flex flex-col gap-6">
            <ClassSelector />
          </section>
        </div>

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
