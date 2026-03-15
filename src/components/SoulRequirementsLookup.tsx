'use client';

import { useState } from 'react';
import {
  getDemonAltarSoulCost,
  getDemonSanctuarySoulCost,
  getRunsNeeded,
  getAllDungeonStages,
  DEMON_ALTAR_MAX_LEVEL,
  DEMON_SANCTUARY_MAX_LEVEL,
  SOUL_DUNGEON_MAX_STAGE,
} from '@/lib/souls';

type UpgradeTarget = 'altar' | 'sanctuary';

function formatNumber(n: number): string {
  return n.toLocaleString();
}

export default function SoulRequirementsLookup() {
  const [target, setTarget] = useState<UpgradeTarget>('altar');
  const [fromLevel, setFromLevel] = useState(0);
  const [toLevel, setToLevel] = useState(10);
  const [farmStage, setFarmStage] = useState(1);

  const maxLevel = target === 'altar' ? DEMON_ALTAR_MAX_LEVEL : DEMON_SANCTUARY_MAX_LEVEL;

  const totalSouls =
    target === 'altar'
      ? getDemonAltarSoulCost(fromLevel, toLevel)
      : getDemonSanctuarySoulCost(fromLevel, toLevel);

  const runsNeeded = getRunsNeeded(farmStage, totalSouls);
  const stages = getAllDungeonStages();

  function handleTargetChange(newTarget: UpgradeTarget) {
    setTarget(newTarget);
    setFromLevel(0);
    setToLevel(newTarget === 'altar' ? 10 : 5);
  }

  function handleFromChange(value: number) {
    const clamped = Math.max(0, Math.min(value, maxLevel - 1));
    setFromLevel(clamped);
    if (toLevel <= clamped) setToLevel(clamped + 1);
  }

  function handleToChange(value: number) {
    const clamped = Math.max(1, Math.min(value, maxLevel));
    setToLevel(clamped);
    if (fromLevel >= clamped) setFromLevel(clamped - 1);
  }

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">Soul Requirements Lookup</h2>

      {/* Upgrade target selector */}
      <div className="mb-5 flex gap-2">
        <button
          onClick={() => handleTargetChange('altar')}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            target === 'altar'
              ? 'bg-violet-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Demon Altar
        </button>
        <button
          onClick={() => handleTargetChange('sanctuary')}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            target === 'sanctuary'
              ? 'bg-violet-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Demon Sanctuary
        </button>
      </div>

      {/* Level range inputs */}
      <div className="mb-5 grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Current Level
          </span>
          <input
            type="number"
            min={0}
            max={maxLevel - 1}
            value={fromLevel}
            onChange={(e) => handleFromChange(Number(e.target.value))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <span className="text-xs text-gray-400">0 = not started</span>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Target Level
          </span>
          <input
            type="number"
            min={1}
            max={maxLevel}
            value={toLevel}
            onChange={(e) => handleToChange(Number(e.target.value))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <span className="text-xs text-gray-400">Max: {maxLevel}</span>
        </label>
      </div>

      {/* Soul cost result */}
      <div className="mb-5 rounded-lg bg-violet-50 px-4 py-3">
        <p className="text-xs font-medium text-violet-700 uppercase tracking-wide mb-1">
          Souls Required
        </p>
        <p className="text-2xl font-bold text-violet-900">
          {totalSouls > 0 ? formatNumber(totalSouls) : '—'}
        </p>
        {totalSouls > 0 && (
          <p className="text-xs text-violet-600 mt-0.5">
            Level {fromLevel} → {toLevel}
          </p>
        )}
      </div>

      {/* Farming stage selector */}
      <label className="mb-4 flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
          Farming Stage (Soul Dungeon)
        </span>
        <select
          value={farmStage}
          onChange={(e) => setFarmStage(Number(e.target.value))}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        >
          {stages.map((s) => (
            <option key={s.stage} value={s.stage}>
              Stage {s.stage} – {s.name} ({s.soulsReward.min}–{s.soulsReward.max} souls/run)
            </option>
          ))}
        </select>
      </label>

      {/* Runs needed result */}
      <div className="rounded-lg bg-gray-50 px-4 py-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          Runs Needed
        </p>
        {totalSouls > 0 ? (
          <p className="text-2xl font-bold text-gray-900">
            {runsNeeded === Infinity ? 'N/A' : formatNumber(runsNeeded)}
          </p>
        ) : (
          <p className="text-2xl font-bold text-gray-400">—</p>
        )}
        {totalSouls > 0 && runsNeeded !== Infinity && farmStage <= SOUL_DUNGEON_MAX_STAGE && (
          <p className="text-xs text-gray-400 mt-0.5">
            at Stage {farmStage} (avg{' '}
            {formatNumber(
              Math.round(
                (stages.find((s) => s.stage === farmStage)?.soulsReward.min ?? 0 +
                  (stages.find((s) => s.stage === farmStage)?.soulsReward.max ?? 0)) /
                  2,
              ),
            )}{' '}
            souls/run)
          </p>
        )}
      </div>
    </div>
  );
}
