'use client';

import { useMemo } from 'react';

import { NumberInput } from '@/components/NumberInput';
import { Select } from '@/components/Select/Select';
import type { SelectOption } from '@/components/Select/Select';
import { useCalculatorInputsStore } from '@/store/useCalculatorInputsStore';
import type { CalculatorInputsStore } from '@/store/useCalculatorInputsStore';
import cubeData from '@/data/cube-optimizer-data.json';
import type { CubeClass } from '@/types/cube-optimizer';

const CLASSES = cubeData.CLASSES as CubeClass[];

function formatPct(value: number): string {
  return `+${value.toFixed(2)}%`;
}

export function ClassSelector() {
  const classId = useCalculatorInputsStore((s: CalculatorInputsStore) => s.classId);
  const classLevel = useCalculatorInputsStore((s: CalculatorInputsStore) => s.classLevel);
  const setClassId = useCalculatorInputsStore((s: CalculatorInputsStore) => s.setClassId);
  const setClassLevel = useCalculatorInputsStore((s: CalculatorInputsStore) => s.setClassLevel);

  const selectedClass = useMemo(
    () => CLASSES.find((c) => c.id === classId) ?? CLASSES[0],
    [classId],
  );

  const options: SelectOption[] = CLASSES.map((c) => ({
    value: c.id,
    label: `${c.name} (${c.element})`,
  }));

  const atkBonus = classLevel * selectedClass.atkBonusPctPerLevel;
  const critDmgBonus = classLevel * selectedClass.critDmgBonusPctPerLevel;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Class</h2>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
            Class
          </span>
          <Select
            value={classId}
            onValueChange={setClassId}
            options={options}
            placeholder="Select class"
            aria-label="Character class"
          />
        </label>

        <NumberInput
          label="Class Level"
          value={classLevel}
          onChange={setClassLevel}
          min={1}
          max={selectedClass.maxLevel}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-blue-50 px-4 py-3 dark:bg-blue-900/20">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-blue-700 dark:text-blue-400">
              ATK Bonus
            </p>
            <p className="text-xl font-bold text-blue-900 dark:text-blue-200">
              {formatPct(atkBonus)}
            </p>
            <p className="mt-0.5 text-xs text-blue-600 dark:text-blue-400">
              {formatPct(selectedClass.atkBonusPctPerLevel)} / level
            </p>
          </div>

          <div className="rounded-lg bg-purple-50 px-4 py-3 dark:bg-purple-900/20">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-purple-700 dark:text-purple-400">
              CRIT DMG Bonus
            </p>
            <p className="text-xl font-bold text-purple-900 dark:text-purple-200">
              {formatPct(critDmgBonus)}
            </p>
            <p className="mt-0.5 text-xs text-purple-600 dark:text-purple-400">
              {formatPct(selectedClass.critDmgBonusPctPerLevel)} / level
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
