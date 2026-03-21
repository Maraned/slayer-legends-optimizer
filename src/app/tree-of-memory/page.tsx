'use client';

import { useMemo, useState } from 'react';

import { MemoryNodeTree } from '@/components/MemoryNodeTree';
import { NumberInput } from '@/components/NumberInput';
import { useMemoryTreeSlice } from '@/store/useMemoryTreeSlice';
import type { TOMNode, TOMNodeCategory, TOMResourceType } from '@/types/tom';
import tomData from '@/data/tom-data.json';

const CATEGORY_COLORS: Record<TOMNodeCategory, string> = {
  Combat: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Defense: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Support: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Utility: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Passive: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const RESOURCE_ICONS: Record<TOMResourceType, string> = {
  Gold: '🪙',
  Gems: '💎',
  Essence: '✨',
  Shards: '🔷',
};

/** Farm modes correspond to the farming-focused TOM effect types */
type FarmMode = 'Extra EXP' | 'Monster Gold';

const FARM_MODE_LABELS: Record<FarmMode, string> = {
  'Extra EXP': 'Extra EXP',
  'Monster Gold': 'Monster Gold',
};

const FARM_MODE_COLORS: Record<FarmMode, string> = {
  'Extra EXP': 'text-blue-600 dark:text-blue-400',
  'Monster Gold': 'text-yellow-600 dark:text-yellow-400',
};

const FARM_MODES: FarmMode[] = ['Extra EXP', 'Monster Gold'];
const ALL_RESOURCES: TOMResourceType[] = ['Gold', 'Gems', 'Essence', 'Shards'];

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function isPercentEffect(effectType: string): boolean {
  return ['Crit %', 'Crit DMG', 'Dodge', 'Accuracy', 'Extra EXP', 'Monster Gold', 'HP Recovery', 'Death Strike %', 'Cooldown Reduction'].includes(effectType);
}

type PageTab = 'summary' | 'tree';
type TreeCategory = TOMNodeCategory;

const TREE_CATEGORIES: TOMNodeCategory[] = ['Combat', 'Defense', 'Support', 'Utility', 'Passive'];

const CATEGORY_TAB_ACTIVE: Record<TOMNodeCategory, string> = {
  Combat: 'border-red-500 text-red-400 bg-gray-900 dark:bg-gray-900',
  Defense: 'border-blue-500 text-blue-400 bg-gray-900 dark:bg-gray-900',
  Support: 'border-green-500 text-green-400 bg-gray-900 dark:bg-gray-900',
  Utility: 'border-yellow-500 text-yellow-400 bg-gray-900 dark:bg-gray-900',
  Passive: 'border-purple-500 text-purple-400 bg-gray-900 dark:bg-gray-900',
};

export default function TreeOfMemoryPage() {
  const { nodeLevels, setNodeLevel, setAllNodeLevels } = useMemoryTreeSlice();
  const nodes = tomData.nodes as TOMNode[];
  const [pageTab, setPageTab] = useState<PageTab>('summary');
  const [treeCategory, setTreeCategory] = useState<TreeCategory>('Combat');
  const [autoSetLevel, setAutoSetLevel] = useState(0);

  const summary = useMemo(() => {
    const totalNodes = nodes.length;
    let upgradedNodes = 0;
    let maxedNodes = 0;
    const resourcesSpent: Partial<Record<TOMResourceType, number>> = {};
    const statBonuses: Record<string, number> = {};
    const categoryProgress: Record<TOMNodeCategory, { upgraded: number; total: number }> = {
      Combat: { upgraded: 0, total: 0 },
      Defense: { upgraded: 0, total: 0 },
      Support: { upgraded: 0, total: 0 },
      Utility: { upgraded: 0, total: 0 },
      Passive: { upgraded: 0, total: 0 },
    };

    for (const node of nodes) {
      const cat = node.category as TOMNodeCategory;
      categoryProgress[cat].total += 1;

      const currentLevel = nodeLevels[node.id] ?? 0;
      if (currentLevel > 0) {
        upgradedNodes += 1;
        categoryProgress[cat].upgraded += 1;

        if (currentLevel >= node.maxLevel) {
          maxedNodes += 1;
        }

        // Sum costs for all levels up to currentLevel
        for (const cost of node.costs) {
          if (cost.level <= currentLevel) {
            const res = cost.resource as TOMResourceType;
            resourcesSpent[res] = (resourcesSpent[res] ?? 0) + cost.amount;
          }
        }

        // Sum stat bonuses for all levels up to currentLevel
        for (const lvl of node.levels) {
          if (lvl.level <= currentLevel) {
            const key = lvl.effectType;
            statBonuses[key] = (statBonuses[key] ?? 0) + lvl.effectValue;
          }
        }
      }
    }

    return {
      totalNodes,
      upgradedNodes,
      maxedNodes,
      resourcesSpent,
      statBonuses,
      categoryProgress,
    };
  }, [nodes, nodeLevels]);

  const hasProgress = summary.upgradedNodes > 0;

  /**
   * For each farm mode, compute:
   *  - totalCost: total resources to max all nodes for that mode
   *  - spentCost: resources already spent on those nodes (up to current level)
   *  - nodeCount: number of nodes that grant this farming effect
   */
  const farmCostTable = useMemo(() => {
    return FARM_MODES.map((mode) => {
      const modeNodes = nodes.filter((node) =>
        node.levels.some((lvl) => lvl.effectType === mode),
      );

      const totalCost: Partial<Record<TOMResourceType, number>> = {};
      const spentCost: Partial<Record<TOMResourceType, number>> = {};

      for (const node of modeNodes) {
        const currentLevel = nodeLevels[node.id] ?? 0;
        for (const cost of node.costs) {
          const res = cost.resource as TOMResourceType;
          totalCost[res] = (totalCost[res] ?? 0) + cost.amount;
          if (cost.level <= currentLevel) {
            spentCost[res] = (spentCost[res] ?? 0) + cost.amount;
          }
        }
      }

      return { mode, nodeCount: modeNodes.length, totalCost, spentCost };
    });
  }, [nodes, nodeLevels]);

  const categoryNodes = useMemo(
    () => nodes.filter((n) => n.category === treeCategory),
    [nodes, treeCategory],
  );

  const categoryMaxLevel = useMemo(
    () => Math.max(...categoryNodes.map((n) => n.maxLevel), 0),
    [categoryNodes],
  );

  function handleUpgrade(nodeId: string) {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const current = nodeLevels[nodeId] ?? 0;
    if (current < node.maxLevel) {
      setNodeLevel(nodeId, current + 1);
    }
  }

  function handleAutoSetCategory() {
    const newLevels = { ...nodeLevels };
    for (const node of categoryNodes) {
      newLevels[node.id] = Math.min(autoSetLevel, node.maxLevel);
    }
    setAllNodeLevels(newLevels);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white border-b border-gray-200 px-6 py-8 dark:bg-gray-900 dark:border-gray-700">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tree of Memory</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track your memory tree node progression across all {summary.totalNodes} nodes
          </p>
        </div>
      </header>

      {/* Page tab bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6">
        <div className="max-w-5xl mx-auto flex gap-0">
          {(['summary', 'tree'] as PageTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setPageTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer capitalize ${
                pageTab === tab
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {tab === 'summary' ? 'Summary' : 'Node Tree'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Node Tree tab */}
        {pageTab === 'tree' && (
          <section aria-labelledby="node-tree-heading">
            <div className="flex items-center justify-between mb-3">
              <h2 id="node-tree-heading" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Node Tree
              </h2>
              {/* Category tabs */}
              <div className="flex gap-1">
                {TREE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTreeCategory(cat)}
                    className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors cursor-pointer ${
                      treeCategory === cat
                        ? CATEGORY_TAB_ACTIVE[cat]
                        : 'border-gray-700 text-gray-400 hover:text-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            {/* Auto-set level control */}
            <div className="flex items-center gap-3 mb-3 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5">
              <span className="text-xs font-medium text-gray-400 whitespace-nowrap">Auto-set level</span>
              <NumberInput
                value={autoSetLevel}
                onChange={setAutoSetLevel}
                min={0}
                max={categoryMaxLevel}
                ariaLabel="Auto-set level for all nodes in category"
              />
              <button
                onClick={handleAutoSetCategory}
                className="ml-auto px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-500 transition-colors cursor-pointer"
              >
                Apply to {treeCategory}
              </button>
            </div>
            <MemoryNodeTree
              nodes={categoryNodes}
              nodeLevels={nodeLevels}
              onUpgrade={handleUpgrade}
              onLevelChange={setNodeLevel}
            />
          </section>
        )}

        {/* Summary tab */}
        {pageTab === 'summary' && <>

        {/* Overall Progress */}
        <section aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Summary
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 px-6 py-5 dark:bg-gray-900 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Nodes Upgraded</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {summary.upgradedNodes}
                <span className="text-sm font-normal text-gray-400 dark:text-gray-500"> / {summary.totalNodes}</span>
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${(summary.upgradedNodes / summary.totalNodes) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 px-6 py-5 dark:bg-gray-900 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Nodes Maxed</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {summary.maxedNodes}
                <span className="text-sm font-normal text-gray-400 dark:text-gray-500"> / {summary.totalNodes}</span>
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${(summary.maxedNodes / summary.totalNodes) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 px-6 py-5 dark:bg-gray-900 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Completion</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {((summary.upgradedNodes / summary.totalNodes) * 100).toFixed(1)}%
              </p>
              <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                {summary.totalNodes - summary.upgradedNodes} nodes remaining
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 px-6 py-5 dark:bg-gray-900 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Bonus ATK</p>
              <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                +{formatNumber(summary.statBonuses['ATK'] ?? 0)}
              </p>
              <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                from memory tree
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 px-6 py-5 dark:bg-gray-900 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Bonus HP</p>
              <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                +{formatNumber(summary.statBonuses['HP'] ?? 0)}
              </p>
              <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                from memory tree
              </p>
            </div>
          </div>
        </section>

        {/* Category Breakdown */}
        <section aria-labelledby="categories-heading">
          <h2 id="categories-heading" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Progress by Category
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
            {(Object.entries(summary.categoryProgress) as [TOMNodeCategory, { upgraded: number; total: number }][]).map(
              ([category, { upgraded, total }]) => (
                <div key={category} className="flex items-center gap-4 px-6 py-4">
                  <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLORS[category]}`}>
                    {category}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {upgraded} / {total} nodes
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {total > 0 ? ((upgraded / total) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{ width: `${total > 0 ? (upgraded / total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resources Spent */}
          <section aria-labelledby="resources-heading">
            <h2 id="resources-heading" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Resources Spent
            </h2>
            <div className="bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
              {(['Gold', 'Gems', 'Essence', 'Shards'] as TOMResourceType[]).map((resource) => {
                const amount = summary.resourcesSpent[resource] ?? 0;
                return (
                  <div key={resource} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span aria-hidden="true">{RESOURCE_ICONS[resource]}</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{resource}</span>
                    </div>
                    <span className={`text-sm font-semibold ${amount > 0 ? 'text-gray-900 dark:text-gray-100' : 'text-gray-300 dark:text-gray-600'}`}>
                      {formatNumber(amount)}
                    </span>
                  </div>
                );
              })}
              {!hasProgress && (
                <p className="px-6 py-4 text-sm text-gray-400 dark:text-gray-500 text-center">
                  No resources spent yet
                </p>
              )}
            </div>
          </section>

          {/* Stat Bonuses */}
          <section aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Stat Bonuses
            </h2>
            <div className="bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
              {hasProgress ? (
                Object.entries(summary.statBonuses)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([stat, value]) => (
                    <div key={stat} className="flex items-center justify-between px-6 py-4">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stat}</span>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        +{isPercentEffect(stat) ? formatPercent(value) : formatNumber(value)}
                      </span>
                    </div>
                  ))
              ) : (
                <p className="px-6 py-4 text-sm text-gray-400 dark:text-gray-500 text-center">
                  No stat bonuses yet
                </p>
              )}
            </div>
          </section>
        </div>
        {/* Resource Cost by Farm Mode */}
        <section aria-labelledby="farm-cost-heading">
          <h2 id="farm-cost-heading" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Resource Cost by Farm Mode
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    Farm Mode
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    Nodes
                  </th>
                  {ALL_RESOURCES.map((res) => (
                    <th key={res} className="px-4 py-3 text-right font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      <span aria-hidden="true">{RESOURCE_ICONS[res]}</span> {res}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {farmCostTable.map(({ mode, nodeCount, totalCost, spentCost }) => (
                  <tr key={mode}>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${FARM_MODE_COLORS[mode]}`}>
                        {FARM_MODE_LABELS[mode]}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-gray-600 dark:text-gray-400">
                      {nodeCount}
                    </td>
                    {ALL_RESOURCES.map((res) => {
                      const total = totalCost[res] ?? 0;
                      const spent = spentCost[res] ?? 0;
                      const remaining = total - spent;
                      return (
                        <td key={res} className="px-4 py-4 text-right">
                          {total === 0 ? (
                            <span className="text-gray-300 dark:text-gray-600">—</span>
                          ) : (
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                                {formatNumber(total)}
                              </span>
                              {remaining > 0 && remaining < total && (
                                <span className="text-xs tabular-nums text-orange-500 dark:text-orange-400">
                                  {formatNumber(remaining)} left
                                </span>
                              )}
                              {remaining === 0 && total > 0 && (
                                <span className="text-xs text-green-600 dark:text-green-400">
                                  done
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        </>}
      </div>
    </div>
  );
}
