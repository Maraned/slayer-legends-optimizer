'use client';

import { useMemo } from 'react';

import { SkillNode } from '@/components/SkillNode';
import { Tabs } from '@/components/Tabs/Tabs';
import { useSkillMasterySlice } from '@/store/useSkillMasterySlice';
import type { SkillMasteryNodeData, SkillMasteryPageIndex } from '@/types/skills';
import masteryData from '@/data/skill-mastery-data.json';

const PAGE_LABELS = [
  'Attack',
  'Defense',
  'Critical',
  'Elemental',
  'Skills',
  'Speed',
  'Fortune',
  'Ultimate',
];

const NUM_COLS = 3;

export default function SkillMasteryPage() {
  const { masteryPages, toggleMasteryNode } = useSkillMasterySlice();

  const nodesByPage = useMemo(() => {
    const nodes = masteryData.nodes as SkillMasteryNodeData[];
    const pages: SkillMasteryNodeData[][] = Array.from({ length: 8 }, () => []);
    for (const node of nodes) {
      pages[node.page].push(node);
    }
    return pages;
  }, []);

  const tabs = PAGE_LABELS.map((label, pageIndex) => {
    const unlockedIds = masteryPages[pageIndex as SkillMasteryPageIndex] ?? [];
    const nodes = nodesByPage[pageIndex] ?? [];

    const maxRow = nodes.reduce((max, n) => Math.max(max, n.row), 0);
    const rows = Array.from({ length: maxRow + 1 }, (_, r) =>
      nodes.filter((n) => n.row === r).sort((a, b) => a.col - b.col),
    );

    return {
      value: String(pageIndex),
      label: (
        <span>
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{pageIndex + 1}</span>
        </span>
      ),
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {unlockedIds.length} / {nodes.length} nodes unlocked
            </p>
          </div>
          <div className="space-y-2">
            {rows.map((rowNodes, rowIndex) => (
              <div
                key={rowIndex}
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${NUM_COLS}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: NUM_COLS }, (_, col) => {
                  const node = rowNodes.find((n) => n.col === col);
                  if (!node) return <div key={col} />;
                  return (
                    <SkillNode
                      key={node.id}
                      node={{ nodeData: node, unlocked: unlockedIds.includes(node.id) }}
                      onToggle={(nodeId) =>
                        toggleMasteryNode(pageIndex as SkillMasteryPageIndex, nodeId)
                      }
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ),
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white border-b border-gray-200 px-6 py-8 dark:bg-gray-900 dark:border-gray-700">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Skill Mastery</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track your mastery node progression across all 8 pages
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
          <div className="px-6 py-4">
            <Tabs tabs={tabs} defaultValue="0" />
          </div>
        </div>
      </div>
    </div>
  );
}
