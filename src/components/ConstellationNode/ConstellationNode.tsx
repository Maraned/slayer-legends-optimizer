'use client';

import { StarNode } from '@/types/constellation';
import { Tooltip } from '@/components/Tooltip';

export interface ConstellationNodeProps {
  node: StarNode;
  onLevelChange: (nodeId: string, newLevel: number) => void;
  className?: string;
}

function StarIcon({ filled, className = '' }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
      />
    </svg>
  );
}

function LevelPips({ level, maxLevel }: { level: number; maxLevel: number }) {
  const pips = Array.from({ length: maxLevel }, (_, i) => i < level);
  const showCount = maxLevel > 10 ? maxLevel : Math.min(maxLevel, 10);
  const visible = pips.slice(0, showCount);

  return (
    <div className="flex flex-wrap gap-0.5" aria-label={`Level ${level} of ${maxLevel}`}>
      {visible.map((filled, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            filled
              ? 'bg-yellow-400 dark:bg-yellow-300'
              : 'bg-gray-300 dark:bg-gray-600'
          }`}
        />
      ))}
    </div>
  );
}

export function ConstellationNode({ node, onLevelChange, className = '' }: ConstellationNodeProps) {
  const { id, name, buffType, valuePerLevel, level, maxLevel, starCost } = node;

  const isLocked = level === 0;
  const isMaxed = level === maxLevel;
  const totalValue = valuePerLevel * level;
  const starsToMax = (maxLevel - level) * starCost;

  function handleIncrement() {
    if (!isMaxed) onLevelChange(id, level + 1);
  }

  function handleDecrement() {
    if (level > 0) onLevelChange(id, level - 1);
  }

  const tooltipContent = (
    <div className="space-y-1">
      <p className="font-semibold">{name}</p>
      <p className="text-xs opacity-80">
        {buffType}: +{valuePerLevel}% per level
      </p>
      {level > 0 && (
        <p className="text-xs text-yellow-300">
          Current bonus: +{totalValue.toFixed(1)}%
        </p>
      )}
      <p className="text-xs opacity-70">
        Level {level}/{maxLevel} &middot; {starCost} ★ per level
      </p>
      {!isMaxed && (
        <p className="text-xs text-amber-300">
          {starsToMax} ★ to max
        </p>
      )}
    </div>
  );

  return (
    <Tooltip content={tooltipContent} side="top">
      <div
        className={`relative flex flex-col gap-1.5 rounded-lg border p-3 transition-colors ${
          isMaxed
            ? 'border-yellow-400/60 bg-yellow-400/10 dark:border-yellow-300/50 dark:bg-yellow-300/10'
            : isLocked
              ? 'border-gray-300/40 bg-gray-100/50 dark:border-gray-700/60 dark:bg-gray-800/50'
              : 'border-blue-400/50 bg-blue-50/50 dark:border-blue-500/40 dark:bg-blue-900/20'
        } ${className}`}
      >
        {/* Header row: name + star cost */}
        <div className="flex items-start justify-between gap-1">
          <span
            className={`text-xs font-semibold leading-tight ${
              isLocked ? 'text-gray-400 dark:text-gray-500' : 'text-[var(--color-foreground)]'
            }`}
          >
            {name}
          </span>
          <span className="flex shrink-0 items-center gap-0.5 text-xs text-yellow-500 dark:text-yellow-400">
            <StarIcon
              filled={!isLocked}
              className="h-3 w-3"
            />
            {starCost}
          </span>
        </div>

        {/* Buff type badge */}
        <span
          className={`w-fit rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
            isLocked
              ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
          }`}
        >
          {buffType}
        </span>

        {/* Level pips */}
        <LevelPips level={level} maxLevel={maxLevel} />

        {/* Controls row */}
        <div className="flex items-center justify-between gap-1">
          <span
            className={`text-xs tabular-nums ${
              isLocked
                ? 'text-gray-400 dark:text-gray-500'
                : isMaxed
                  ? 'font-semibold text-yellow-600 dark:text-yellow-400'
                  : 'text-[var(--color-foreground)]'
            }`}
          >
            {isMaxed ? (
              'MAX'
            ) : (
              <span className="flex items-center gap-1">
                <span>{level}/{maxLevel}</span>
                <span className="text-amber-500 dark:text-amber-400">
                  ({starsToMax}★)
                </span>
              </span>
            )}
          </span>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={level === 0}
              aria-label={`Decrease ${name} level`}
              className="flex h-5 w-5 items-center justify-center rounded border border-gray-300 bg-gray-100 text-xs text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              −
            </button>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={isMaxed}
              aria-label={`Increase ${name} level`}
              className="flex h-5 w-5 items-center justify-center rounded border border-gray-300 bg-gray-100 text-xs text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </Tooltip>
  );
}
