'use client';

import type { TOMNode, TOMNodeCategory, TOMNodeCost } from '@/types/tom';

export type TreeNodeState = 'locked' | 'available' | 'maxed';

export interface TreeNodeProps {
  /** The TOM node to display */
  node: TOMNode;
  /**
   * Whether all prerequisite nodes are unlocked.
   * When false, the node is shown as locked regardless of currentLevel.
   */
  isUnlockable?: boolean;
  /** Called when the user clicks the upgrade button */
  onUpgrade?: (nodeId: string) => void;
  className?: string;
}

const CATEGORY_COLORS: Record<TOMNodeCategory, string> = {
  Combat: 'bg-red-500/20 text-red-400 dark:text-red-300',
  Defense: 'bg-blue-500/20 text-blue-400 dark:text-blue-300',
  Support: 'bg-green-500/20 text-green-400 dark:text-green-300',
  Utility: 'bg-yellow-500/20 text-yellow-400 dark:text-yellow-300',
  Passive: 'bg-purple-500/20 text-purple-400 dark:text-purple-300',
};

function formatCost(cost: TOMNodeCost): string {
  const amount = cost.amount;
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B ${cost.resource}`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M ${cost.resource}`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K ${cost.resource}`;
  return `${amount} ${cost.resource}`;
}

function getNodeState(node: TOMNode, isUnlockable: boolean): TreeNodeState {
  if (node.currentLevel >= node.maxLevel) return 'maxed';
  if (!isUnlockable && node.currentLevel === 0) return 'locked';
  return 'available';
}

/**
 * Displays a single Tree of Memory node with its name, category, level
 * progress, next-upgrade cost, and an upgrade action.
 */
export function TreeNode({ node, isUnlockable = true, onUpgrade, className = '' }: TreeNodeProps) {
  const state = getNodeState(node, isUnlockable);
  const isLocked = state === 'locked';
  const isMaxed = state === 'maxed';

  const nextLevelIndex = node.currentLevel; // 0-based index into costs/levels arrays
  const nextCost = !isMaxed ? node.costs[nextLevelIndex] : null;
  const nextLevel = !isMaxed ? node.levels[nextLevelIndex] : null;

  const containerBase =
    'rounded-lg border p-3 flex flex-col gap-2 transition-colors duration-150';
  const containerState = isLocked
    ? 'border-gray-700 bg-gray-900/60 opacity-60'
    : isMaxed
      ? 'border-yellow-600/50 bg-yellow-900/10'
      : 'border-gray-600 bg-gray-800/80 hover:border-gray-500';

  return (
    <div className={`${containerBase} ${containerState} ${className}`}>
      {/* Header row: name + category badge */}
      <div className="flex items-start justify-between gap-2">
        <span className={`text-sm font-semibold leading-tight ${isLocked ? 'text-foreground/40' : 'text-foreground'}`}>
          {node.name}
        </span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[node.category]}`}
        >
          {node.category}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-foreground/50 leading-snug">{node.description}</p>

      {/* Level progress */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-foreground/50">Level</span>
        <div className="flex gap-0.5">
          {Array.from({ length: node.maxLevel }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-4 rounded-full ${
                i < node.currentLevel
                  ? isMaxed
                    ? 'bg-yellow-400'
                    : 'bg-blue-400'
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
        <span className="text-xs tabular-nums text-foreground/60">
          {node.currentLevel}/{node.maxLevel}
        </span>
      </div>

      {/* Next level effect + cost */}
      {nextLevel && nextCost && (
        <div className="flex items-center justify-between gap-2 rounded-md bg-white/5 px-2 py-1.5 text-xs">
          <span className="text-foreground/60">
            +{nextLevel.effectValue % 1 !== 0
              ? `${(nextLevel.effectValue * 100).toFixed(1)}%`
              : nextLevel.effectValue}{' '}
            {nextLevel.effectType}
          </span>
          <span className="tabular-nums text-foreground/50">{formatCost(nextCost)}</span>
        </div>
      )}

      {/* Maxed badge */}
      {isMaxed && (
        <div className="text-center text-xs font-medium text-yellow-400">Max Level</div>
      )}

      {/* Upgrade button */}
      {!isMaxed && (
        <button
          disabled={isLocked || !onUpgrade}
          onClick={() => onUpgrade?.(node.id)}
          className={`mt-0.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            isLocked
              ? 'cursor-not-allowed bg-gray-700 text-gray-500'
              : 'cursor-pointer bg-blue-600 text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50'
          }`}
        >
          {node.currentLevel === 0 ? 'Unlock' : 'Upgrade'}
        </button>
      )}
    </div>
  );
}
