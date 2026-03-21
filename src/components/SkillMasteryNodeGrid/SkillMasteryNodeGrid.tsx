'use client';

import type { SkillMasteryNodeState } from '@/types/skills';
import { SkillNode } from '@/components/SkillNode';

export interface SkillMasteryNodeGridProps {
  /** All mastery nodes for this page with their unlock states */
  nodes: SkillMasteryNodeState[];
  /** Callback fired when a node is toggled */
  onToggle: (nodeId: string, unlocked: boolean) => void;
}

const NUM_COLS = 3;

/**
 * Renders a grid of skill mastery nodes for a single mastery page.
 * Nodes are positioned by their row/col coordinates from the node data.
 */
export function SkillMasteryNodeGrid({ nodes, onToggle }: SkillMasteryNodeGridProps) {
  if (nodes.length === 0) return null;

  const numRows = Math.max(...nodes.map((n) => n.nodeData.row)) + 1;

  const cells: React.ReactNode[] = [];
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < NUM_COLS; col++) {
      const node = nodes.find((n) => n.nodeData.row === row && n.nodeData.col === col);
      if (node) {
        cells.push(<SkillNode key={node.nodeData.id} node={node} onToggle={onToggle} />);
      } else {
        cells.push(<div key={`empty-${row}-${col}`} aria-hidden="true" />);
      }
    }
  }

  return (
    <div className={`grid grid-cols-3 gap-2`}>
      {cells}
    </div>
  );
}
