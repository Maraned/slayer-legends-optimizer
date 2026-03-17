'use client';

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
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {nodeData.effectDescription}
        {nodeData.effectValue !== 0 && (
          <span className="ml-1 font-semibold text-gray-700 dark:text-gray-300">
            +{nodeData.effectValue}
          </span>
        )}
      </span>
    </div>
  );
}
