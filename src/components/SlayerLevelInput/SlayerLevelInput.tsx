'use client';

import { useEffect, useState } from 'react';

import { NumberInput } from '@/components/NumberInput';
import { loadCharacterMathsData } from '@/lib/data-loader';
import { buildSlayerLevelIndex } from '@/lib/character-data-lookups';
import { useUserSaveStore } from '@/store/useUserSaveStore';
import type { SlayerLevelEntry } from '@/types/character-data';

const SLAYER_LEVEL_MIN = 1;
const SLAYER_LEVEL_MAX = 4002;

export function SlayerLevelInput() {
  const slayerLevel = useUserSaveStore((s) => s.character.slayerLevel);
  const setSlayerLevel = useUserSaveStore((s) => s.setSlayerLevel);

  const [levelIndex, setLevelIndex] = useState<Record<number, SlayerLevelEntry>>({});

  useEffect(() => {
    loadCharacterMathsData().then((data) => {
      setLevelIndex(buildSlayerLevelIndex(data.SLAYER_LEVEL));
    });
  }, []);

  function handleChange(level: number) {
    const entry = levelIndex[level];
    setSlayerLevel({
      level,
      expRequiredForNext: entry?.expRequired ?? 0,
    });
  }

  const isMaxLevel = slayerLevel.level >= SLAYER_LEVEL_MAX;

  return (
    <div className="flex flex-col gap-4">
      <NumberInput
        label="Level"
        value={slayerLevel.level}
        onChange={handleChange}
        min={SLAYER_LEVEL_MIN}
        max={SLAYER_LEVEL_MAX}
      />
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">EXP to next level</span>
        <span className="font-mono font-medium tabular-nums text-gray-900 dark:text-gray-100">
          {isMaxLevel ? '—' : slayerLevel.expRequiredForNext.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
