'use client';

import { Toggle } from '@/components/Toggle/Toggle';
import type { SkillMasteryNodeState } from '@/types/skills';

export interface SkillNodeProps {
  /** Node data with unlock state */
  node: SkillMasteryNodeState;
  /** Callback fired when the node is toggled */
  onToggle?: (nodeId: string, unlocked: boolean) => void;
  /** Whether interaction is disabled */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

export function SkillNode({ node, onToggle, disabled = false, className = '' }: SkillNodeProps) {
  const { nodeData, unlocked } = node;

  function handleClick() {
    if (!disabled) {
      onToggle?.(nodeData.id, !unlocked);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }

  return (
    <div
      role="checkbox"
      aria-checked={unlocked}
      aria-label={`${nodeData.name}: ${nodeData.effectDescription}`}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={[
        'flex flex-col gap-1 rounded-md border px-3 py-2 text-sm transition-colors',
        'cursor-pointer select-none',
        unlocked
          ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/40'
          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
        disabled
          ? 'cursor-not-allowed opacity-50'
          : 'hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:hover:border-blue-500',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={[
            'font-medium leading-tight',
            unlocked
              ? 'text-blue-700 dark:text-blue-300'
              : 'text-gray-900 dark:text-gray-100',
          ].join(' ')}
        >
          {nodeData.name}
        </span>
        <div onClick={(e) => e.stopPropagation()}>
          <Toggle
            size="sm"
            checked={unlocked}
            onCheckedChange={(checked) => onToggle?.(nodeData.id, checked)}
            disabled={disabled}
            aria-label={`Unlock ${nodeData.name}`}
          />
        </div>
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {nodeData.effectDescription}
        {nodeData.effectValue !== 0 && (
          <span
            className={[
              'ml-1 font-semibold',
              unlocked
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300',
            ].join(' ')}
          >
            +{nodeData.effectValue}
          </span>
        )}
      </span>
      <span className="text-xs text-amber-600 dark:text-amber-400">
        Cost: {nodeData.cost} {nodeData.cost === 1 ? 'pt' : 'pts'}
      </span>
      {nodeData.requirements.length > 0 && (
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Requires: {nodeData.requirements.length} {nodeData.requirements.length === 1 ? 'node' : 'nodes'}
        </span>
      )}
    </div>
  );
}
