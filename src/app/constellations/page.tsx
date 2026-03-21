'use client';

import { useMemo, useState } from 'react';

import { ConstellationNode } from '@/components/ConstellationNode';
import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import type { ConstellationBuffType, ZodiacConstellation } from '@/types/constellation';

const BUFF_ORDER: ConstellationBuffType[] = [
  'ATK',
  'HP',
  'DEF',
  'Crit %',
  'Crit DMG',
  'Death Strike',
  'Death Strike %',
  'All Stats',
  'Extra EXP',
  'Monster Gold',
  'Dodge',
  'Accuracy',
  'HP Recovery',
];

const ZODIAC_SYMBOLS: Record<ZodiacConstellation, string> = {
  Aries: '♈',
  Taurus: '♉',
  Gemini: '♊',
  Cancer: '♋',
  Leo: '♌',
  Virgo: '♍',
  Libra: '♎',
  Scorpio: '♏',
  Sagittarius: '♐',
  Capricorn: '♑',
  Aquarius: '♒',
  Pisces: '♓',
};

type PageTab = 'grid' | 'summary';

function formatValue(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `+${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}%`;
}

export default function ConstellationsPage() {
  const constellation = useUserSaveStore((s: UserSaveStore) => s.constellation);
  const setNodeLevel = useUserSaveStore((s: UserSaveStore) => s.setNodeLevel);

  const [pageTab, setPageTab] = useState<PageTab>('grid');
  const [selectedZodiac, setSelectedZodiac] = useState<ZodiacConstellation | null>(null);

  const { constellations, buffTotals } = constellation;

  const totalStarsSpent = useMemo(
    () => constellations.reduce((sum, c) => sum + c.starsSpent, 0),
    [constellations],
  );

  const totalNodesUnlocked = useMemo(
    () =>
      constellations.reduce(
        (sum, c) => sum + c.nodes.filter((n) => n.level > 0).length,
        0,
      ),
    [constellations],
  );

  const totalNodes = useMemo(
    () => constellations.reduce((sum, c) => sum + c.nodes.length, 0),
    [constellations],
  );

  const totalStarsNeeded = useMemo(
    () =>
      constellations.reduce(
        (sum, c) => sum + c.nodes.reduce((s, n) => s + n.maxLevel * n.starCost, 0),
        0,
      ),
    [constellations],
  );

  const activeBuffs = BUFF_ORDER.filter(
    (type) => buffTotals[type] !== undefined && buffTotals[type]! > 0,
  );

  const selectedConstellationData = selectedZodiac
    ? constellations.find((c) => c.zodiac === selectedZodiac) ?? null
    : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-8 dark:bg-gray-900 dark:border-gray-700">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Constellations</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track your zodiac constellation star node progression across all 12 signs
          </p>
        </div>
      </header>

      {/* Page tab bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6">
        <div className="max-w-5xl mx-auto flex gap-0">
          {(['grid', 'summary'] as PageTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setPageTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer capitalize ${
                pageTab === tab
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {tab === 'grid' ? 'Zodiac Grid' : 'Summary'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Zodiac Grid tab */}
        {pageTab === 'grid' && (
          <>
            {/* 12-zodiac overview grid */}
            <section aria-labelledby="zodiac-grid-heading">
              <h2 id="zodiac-grid-heading" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Zodiac Grid
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {constellations.map((c) => {
                  const totalLevel = c.nodes.reduce((sum, n) => sum + n.level, 0);
                  const totalMaxLevel = c.nodes.reduce((sum, n) => sum + n.maxLevel, 0);
                  const nodesMaxed = c.nodes.filter((n) => n.level === n.maxLevel).length;
                  const starsNeeded = c.nodes.reduce((s, n) => s + n.maxLevel * n.starCost, 0);
                  const isSelected = selectedZodiac === c.zodiac;
                  const progressPct = totalMaxLevel > 0 ? (totalLevel / totalMaxLevel) * 100 : 0;

                  return (
                    <button
                      key={c.zodiac}
                      onClick={() =>
                        setSelectedZodiac(isSelected ? null : c.zodiac)
                      }
                      className={`flex flex-col gap-2 rounded-lg border p-4 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                          : c.starsSpent > 0
                            ? 'border-yellow-300/60 bg-yellow-50/50 dark:border-yellow-700/50 dark:bg-yellow-900/10 hover:border-yellow-400 dark:hover:border-yellow-600'
                            : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      aria-pressed={isSelected}
                      aria-label={`${c.zodiac} constellation, level ${totalLevel} of ${totalMaxLevel}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl" aria-hidden="true">
                          {ZODIAC_SYMBOLS[c.zodiac]}
                        </span>
                        <span
                          className={`flex items-center gap-0.5 text-xs font-medium ${
                            c.starsSpent > 0
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                          aria-label={`${c.starsSpent} of ${starsNeeded} stars crafted`}
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" aria-hidden="true">
                            <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                          </svg>
                          <span className="tabular-nums">{c.starsSpent}/{starsNeeded}</span>
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {c.zodiac}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Lv. {totalLevel}/{totalMaxLevel}
                          {nodesMaxed > 0 && ` · ${nodesMaxed} maxed`}
                        </p>
                      </div>
                      {/* Progress bar */}
                      <div className="h-1 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Expanded constellation nodes */}
            {selectedConstellationData && (
              <section aria-labelledby="constellation-nodes-heading">
                <div className="flex items-center justify-between mb-3">
                  <h2
                    id="constellation-nodes-heading"
                    className="text-xs font-semibold text-gray-400 uppercase tracking-wider"
                  >
                    {ZODIAC_SYMBOLS[selectedConstellationData.zodiac]}{' '}
                    {selectedConstellationData.zodiac} Nodes
                  </h2>
                  <button
                    onClick={() => setSelectedZodiac(null)}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                    aria-label="Close constellation nodes"
                  >
                    Close ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {selectedConstellationData.nodes.map((node) => (
                    <ConstellationNode
                      key={node.id}
                      node={node}
                      onLevelChange={setNodeLevel}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Summary tab */}
        {pageTab === 'summary' && (
          <>
            {/* Stats row */}
            <section aria-labelledby="summary-stats-heading">
              <h2 id="summary-stats-heading" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Overview
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 px-6 py-5 dark:bg-gray-900 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nodes Unlocked</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {totalNodesUnlocked}
                    <span className="text-sm font-normal text-gray-400 dark:text-gray-500"> / {totalNodes}</span>
                  </p>
                  <div className="mt-3 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${(totalNodesUnlocked / totalNodes) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 px-6 py-5 dark:bg-gray-900 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Stars Crafted</p>
                  <p className="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {totalStarsSpent}
                    <span className="ml-1 text-sm font-normal text-gray-400 dark:text-gray-500">/ {totalStarsNeeded}</span>
                    <span className="ml-1 text-base" aria-hidden="true">★</span>
                  </p>
                  <div className="mt-3 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-yellow-400 transition-all"
                      style={{ width: `${totalStarsNeeded > 0 ? (totalStarsSpent / totalStarsNeeded) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 px-6 py-5 dark:bg-gray-900 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Buffs</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {activeBuffs.length}
                  </p>
                  <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                    buff types active
                  </p>
                </div>
              </div>
            </section>

            {/* Buff totals */}
            <section aria-labelledby="buff-totals-heading">
              <h2 id="buff-totals-heading" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Buff Totals
              </h2>
              <div className="bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
                {activeBuffs.length === 0 ? (
                  <p className="px-6 py-4 text-sm text-gray-400 dark:text-gray-500 text-center">
                    No constellation buffs active. Unlock nodes in the Zodiac Grid to see totals here.
                  </p>
                ) : (
                  activeBuffs.map((buffType) => (
                    <div key={buffType} className="flex items-center justify-between px-6 py-3">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{buffType}</span>
                      <span className="text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                        {formatValue(buffTotals[buffType]!)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Per-constellation breakdown */}
            <section aria-labelledby="per-constellation-heading">
              <h2 id="per-constellation-heading" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Stars Crafted by Constellation
              </h2>
              <div className="bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
                {constellations.map((c) => {
                  const totalLevel = c.nodes.reduce((sum, n) => sum + n.level, 0);
                  const totalMaxLevel = c.nodes.reduce((sum, n) => sum + n.maxLevel, 0);
                  const starsNeeded = c.nodes.reduce((s, n) => s + n.maxLevel * n.starCost, 0);
                  const starsProgress = starsNeeded > 0 ? (c.starsSpent / starsNeeded) * 100 : 0;
                  return (
                    <div key={c.zodiac} className="flex items-center gap-4 px-6 py-3">
                      <span className="text-lg shrink-0" aria-hidden="true">
                        {ZODIAC_SYMBOLS[c.zodiac]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {c.zodiac}
                          </span>
                          <span className="text-xs tabular-nums font-medium text-gray-500 dark:text-gray-400">
                            Lv. {totalLevel}/{totalMaxLevel}
                          </span>
                        </div>
                        <div className="h-1 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-yellow-400 transition-all"
                            style={{ width: `${starsProgress}%` }}
                          />
                        </div>
                      </div>
                      <span
                        className={`shrink-0 text-sm font-semibold tabular-nums ${
                          c.starsSpent > 0
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                        aria-label={`${c.starsSpent} of ${starsNeeded} stars crafted`}
                      >
                        {c.starsSpent}/{starsNeeded} ★
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
