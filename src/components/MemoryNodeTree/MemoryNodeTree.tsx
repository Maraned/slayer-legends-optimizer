'use client';

import { useMemo, useState } from 'react';

import type { TOMEffectType, TOMNode, TOMNodeCategory } from '@/types/tom';
import { NumberInput } from '@/components/NumberInput';

// ── Layout constants ──────────────────────────────────────────────────────────
const NODE_W = 108;
const NODE_H = 48;
const H_GAP = 20;   // horizontal gap between siblings
const V_GAP = 52;   // vertical gap between depth levels
const UNIT = NODE_W + H_GAP;
const ROW_H = NODE_H + V_GAP;

// ── Colours ───────────────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<TOMNodeCategory, string> = {
  Combat: 'text-red-400',
  Defense: 'text-blue-400',
  Support: 'text-green-400',
  Utility: 'text-yellow-400',
  Passive: 'text-purple-400',
};

const CATEGORY_BORDER: Record<TOMNodeCategory, string> = {
  Combat: 'border-red-700/40',
  Defense: 'border-blue-700/40',
  Support: 'border-green-700/40',
  Utility: 'border-yellow-700/40',
  Passive: 'border-purple-700/40',
};

function isPercentEffect(effectType: TOMEffectType): boolean {
  return [
    'Crit %', 'Crit DMG', 'Dodge', 'Accuracy',
    'Extra EXP', 'Monster Gold', 'HP Recovery',
    'Death Strike %', 'Cooldown Reduction',
  ].includes(effectType);
}

function formatEffectValue(effectType: TOMEffectType, value: number): string {
  if (isPercentEffect(effectType)) return `${(value * 100).toFixed(1)}%`;
  if (value % 1 !== 0) return value.toFixed(1);
  return String(value);
}

function formatCostAmount(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
  return String(amount);
}

// ── Layout algorithm ──────────────────────────────────────────────────────────

interface NodePos {
  x: number; // pixel centre-x
  y: number; // pixel top-y
}

interface LayoutResult {
  positions: Map<string, NodePos>;
  canvasWidth: number;
  canvasHeight: number;
  edges: Array<{ from: string; to: string }>;
}

function computeLayout(nodes: TOMNode[]): LayoutResult {
  if (nodes.length === 0) {
    return { positions: new Map(), canvasWidth: 0, canvasHeight: 0, edges: [] };
  }

  const nodeIds = new Set(nodes.map((n) => n.id));

  // Build child lists (only within this category)
  const childrenOf = new Map<string, string[]>(nodes.map((n) => [n.id, []]));
  for (const node of nodes) {
    for (const dep of node.dependsOn) {
      if (nodeIds.has(dep)) {
        childrenOf.get(dep)!.push(node.id);
      }
    }
  }

  // Find root (no in-category parent)
  const root = nodes.find(
    (n) => n.dependsOn.length === 0 || !n.dependsOn.some((d) => nodeIds.has(d)),
  );
  if (!root) {
    return { positions: new Map(), canvasWidth: 0, canvasHeight: 0, edges: [] };
  }

  // Compute subtree widths (in "unit" columns)
  const subtreeWidth = new Map<string, number>();
  function computeWidth(id: string): number {
    const kids = childrenOf.get(id) ?? [];
    if (kids.length === 0) {
      subtreeWidth.set(id, 1);
      return 1;
    }
    const total = kids.reduce((s, kid) => s + computeWidth(kid), 0);
    subtreeWidth.set(id, total);
    return total;
  }
  computeWidth(root.id);

  // Assign pixel positions
  const positions = new Map<string, NodePos>();
  function assignPos(id: string, depth: number, leftUnit: number): void {
    const w = subtreeWidth.get(id) ?? 1;
    const centreUnit = leftUnit + w / 2;
    positions.set(id, { x: centreUnit * UNIT, y: depth * ROW_H });

    const kids = childrenOf.get(id) ?? [];
    let kidLeft = leftUnit;
    for (const kid of kids) {
      assignPos(kid, depth + 1, kidLeft);
      kidLeft += subtreeWidth.get(kid) ?? 1;
    }
  }
  assignPos(root.id, 0, 0);

  const allPos = Array.from(positions.values());
  const maxX = Math.max(...allPos.map((p) => p.x)) + NODE_W / 2 + H_GAP;
  const maxY = Math.max(...allPos.map((p) => p.y)) + NODE_H + V_GAP;

  // Collect edges
  const edges: Array<{ from: string; to: string }> = [];
  for (const node of nodes) {
    for (const dep of node.dependsOn) {
      if (nodeIds.has(dep)) {
        edges.push({ from: dep, to: node.id });
      }
    }
  }

  return {
    positions,
    canvasWidth: Math.max(maxX, NODE_W + H_GAP * 2),
    canvasHeight: maxY,
    edges,
  };
}

// ── Compact node card (in the tree) ──────────────────────────────────────────

interface NodeCardProps {
  node: TOMNode;
  level: number;
  isUnlockable: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

function NodeCard({ node, level, isUnlockable, isSelected, onSelect }: NodeCardProps) {
  const isMaxed = level >= node.maxLevel;
  const isLocked = !isUnlockable && level === 0;
  const isStarted = level > 0 && !isMaxed;

  let borderClass = 'border-gray-700';
  let bgClass = 'bg-gray-900/80';
  let opacity = '';

  if (isMaxed) {
    borderClass = 'border-yellow-500/60';
    bgClass = 'bg-yellow-900/20';
  } else if (isSelected) {
    borderClass = 'border-white/50';
    bgClass = 'bg-gray-800';
  } else if (isStarted) {
    borderClass = 'border-blue-500/50';
    bgClass = 'bg-blue-900/20';
  } else if (isLocked) {
    borderClass = CATEGORY_BORDER[node.category];
    opacity = 'opacity-40';
  } else {
    borderClass = CATEGORY_BORDER[node.category];
  }

  return (
    <button
      onClick={onSelect}
      title={node.name}
      className={`absolute rounded-md border px-2 py-1.5 text-left transition-all hover:brightness-110 cursor-pointer ${borderClass} ${bgClass} ${opacity}`}
      style={{ width: NODE_W, height: NODE_H }}
    >
      <div
        className={`text-[11px] font-semibold leading-tight truncate ${isLocked ? 'text-gray-500' : 'text-gray-100'}`}
      >
        {node.name}
      </div>
      <div className="mt-1.5 flex gap-[3px]">
        {Array.from({ length: node.maxLevel }).map((_, i) => (
          <div
            key={i}
            className={`h-[3px] flex-1 rounded-full ${
              i < level
                ? isMaxed
                  ? 'bg-yellow-400'
                  : 'bg-blue-400'
                : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
    </button>
  );
}

// ── Node detail panel ─────────────────────────────────────────────────────────

interface DetailPanelProps {
  node: TOMNode;
  level: number;
  isUnlockable: boolean;
  onUpgrade?: (nodeId: string) => void;
  onLevelChange?: (nodeId: string, level: number) => void;
  onClose: () => void;
}

function NodeDetailPanel({ node, level, isUnlockable, onUpgrade, onLevelChange, onClose }: DetailPanelProps) {
  const isMaxed = level >= node.maxLevel;
  const isLocked = !isUnlockable && level === 0;
  const nextLevelIndex = level; // 0-based into costs/levels
  const nextCost = !isMaxed ? (node.costs[nextLevelIndex] ?? null) : null;
  const nextEffect = !isMaxed ? (node.levels[nextLevelIndex] ?? null) : null;

  // Sum of all effects up to current level
  const currentEffects = node.levels
    .filter((l) => l.level <= level)
    .reduce<Record<string, number>>((acc, l) => {
      acc[l.effectType] = (acc[l.effectType] ?? 0) + l.effectValue;
      return acc;
    }, {});

  return (
    <div className="mt-3 rounded-lg border border-gray-700 bg-gray-900 p-4 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full bg-gray-800 ${CATEGORY_COLORS[node.category]}`}
          >
            {node.category}
          </span>
          <h3 className="mt-1.5 font-semibold text-gray-100">{node.name}</h3>
          <p className="mt-1 text-xs text-gray-400 leading-snug">{node.description}</p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
          aria-label="Close detail panel"
        >
          ✕
        </button>
      </div>

      {/* Level progress */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-gray-500">Level</span>
        <div className="flex gap-1">
          {Array.from({ length: node.maxLevel }).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-5 rounded-full ${
                i < level
                  ? isMaxed
                    ? 'bg-yellow-400'
                    : 'bg-blue-400'
                  : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
        <span className="text-xs tabular-nums text-gray-400">
          {level} / {node.maxLevel}
        </span>
        {isMaxed && (
          <span className="text-xs font-medium text-yellow-400 ml-1">Max</span>
        )}
      </div>

      {/* Current bonuses */}
      {Object.keys(currentEffects).length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-1.5">Current bonuses</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(currentEffects).map(([type, value]) => (
              <span
                key={type}
                className="rounded-md bg-green-900/30 border border-green-700/30 px-2 py-1 text-xs text-green-400"
              >
                +{formatEffectValue(type as TOMEffectType, value)} {type}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Next level preview */}
      {nextEffect && nextCost && (
        <div className="mt-3 rounded-md bg-gray-800 px-3 py-2 flex items-center justify-between gap-4">
          <div className="text-xs text-gray-300">
            <span className="text-gray-500 mr-1">Next:</span>
            +{formatEffectValue(nextEffect.effectType, nextEffect.effectValue)}{' '}
            {nextEffect.effectType}
          </div>
          <div className="text-xs tabular-nums text-gray-400 shrink-0">
            {formatCostAmount(nextCost.amount)} {nextCost.resource}
          </div>
        </div>
      )}

      {/* Level input */}
      <div className="mt-3">
        <NumberInput
          value={level}
          onChange={(newLevel) => onLevelChange?.(node.id, newLevel)}
          min={0}
          max={node.maxLevel}
          ariaLabel={`Level for ${node.name}`}
          disabled={isLocked || !onLevelChange}
        />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export interface MemoryNodeTreeProps {
  /** All nodes for the selected category */
  nodes: TOMNode[];
  /** Current level per node ID (0 = locked) */
  nodeLevels: Record<string, number>;
  /** Called when the user triggers an upgrade action */
  onUpgrade?: (nodeId: string) => void;
  /** Called when the user sets a level directly via the level input */
  onLevelChange?: (nodeId: string, level: number) => void;
}

export function MemoryNodeTree({ nodes, nodeLevels, onUpgrade, onLevelChange }: MemoryNodeTreeProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { positions, canvasWidth, canvasHeight, edges } = useMemo(
    () => computeLayout(nodes),
    [nodes],
  );

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  function isUnlockable(node: TOMNode): boolean {
    return node.dependsOn.every((dep) => (nodeLevels[dep] ?? 0) > 0);
  }

  const selectedNode = selectedId ? (nodeMap.get(selectedId) ?? null) : null;

  function handleSelect(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  if (nodes.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">No nodes in this category.</p>
    );
  }

  return (
    <div>
      {/* Scrollable tree canvas */}
      <div
        className="overflow-auto rounded-lg border border-gray-700 bg-gray-950"
        style={{ maxHeight: '60vh' }}
      >
        <div style={{ width: canvasWidth, height: canvasHeight, position: 'relative' }}>
          {/* SVG edges */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: canvasWidth,
              height: canvasHeight,
              overflow: 'visible',
            }}
            className="pointer-events-none"
          >
            {edges.map(({ from, to }) => {
              const fp = positions.get(from);
              const tp = positions.get(to);
              if (!fp || !tp) return null;
              // from: centre-bottom of parent node
              const x1 = fp.x;
              const y1 = fp.y + NODE_H;
              // to: centre-top of child node
              const x2 = tp.x;
              const y2 = tp.y;
              const midY = (y1 + y2) / 2;
              return (
                <path
                  key={`${from}-${to}`}
                  d={`M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`}
                  stroke="rgb(55,65,81)"
                  strokeWidth={1.5}
                  fill="none"
                />
              );
            })}
          </svg>

          {/* Node cards */}
          {nodes.map((node) => {
            const pos = positions.get(node.id);
            if (!pos) return null;
            const level = nodeLevels[node.id] ?? 0;
            return (
              <div
                key={node.id}
                style={{
                  position: 'absolute',
                  left: pos.x - NODE_W / 2,
                  top: pos.y,
                }}
              >
                <NodeCard
                  node={node}
                  level={level}
                  isUnlockable={isUnlockable(node)}
                  isSelected={selectedId === node.id}
                  onSelect={() => handleSelect(node.id)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel for selected node */}
      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          level={nodeLevels[selectedNode.id] ?? 0}
          isUnlockable={isUnlockable(selectedNode)}
          onUpgrade={onUpgrade}
          onLevelChange={onLevelChange}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
