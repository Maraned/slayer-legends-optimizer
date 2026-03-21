'use client';

import { useMemo } from 'react';

import { NumberInput } from '@/components/NumberInput';
import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import type { Element } from '@/types/companions';

const ELEMENT_MULTIPLIER = 2;

const ELEMENTS: Element[] = ['Fire', 'Water', 'Wind', 'Earth', 'Lightning'];

const ELEMENT_COLORS: Record<Element, { text: string; bg: string; border: string; badge: string }> = {
  Fire: {
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/10',
    border: 'border-red-200 dark:border-red-800',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  Water: {
    text: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/10',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  Wind: {
    text: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/10',
    border: 'border-green-200 dark:border-green-800',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  Earth: {
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/10',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  Lightning: {
    text: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/10',
    border: 'border-yellow-200 dark:border-yellow-800',
    badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
};

const ELEMENT_ICONS: Record<Element, string> = {
  Fire: '🔥',
  Water: '💧',
  Wind: '🌪️',
  Earth: '🪨',
  Lightning: '⚡',
};

function formatPercent(value: number): string {
  return `+${(value * 100).toFixed(0)}%`;
}

export default function BlackOrbPage() {
  const blackOrb = useUserSaveStore((s: UserSaveStore) => s.blackOrb);
  const companions = useUserSaveStore((s: UserSaveStore) => s.companions);
  const toggleDamageSource = useUserSaveStore((s: UserSaveStore) => s.toggleDamageSource);
  const setAccessoryOwned = useUserSaveStore((s: UserSaveStore) => s.setAccessoryOwned);
  const setAccessoryLevel = useUserSaveStore((s: UserSaveStore) => s.setAccessoryLevel);

  const { damageSources, elementAccessories } = blackOrb;

  /** Set of elements that have a matching companion — these receive a 2× AMP multiplier */
  const companionElements = useMemo(
    () => new Set(companions.map((c) => c.element)),
    [companions],
  );

  /** Per-element AMP totals computed from active sources + owned accessories.
   *  Elements with a matching companion receive a 2× multiplier. */
  const elementalAmp = useMemo(() => {
    const result: Record<Element, number> = {
      Fire: 0,
      Water: 0,
      Wind: 0,
      Earth: 0,
      Lightning: 0,
    };

    for (const src of damageSources) {
      if (src.active) {
        result[src.element] = (result[src.element] ?? 0) + src.damagePercent;
      }
    }

    for (const acc of elementAccessories) {
      if (acc.owned) {
        result[acc.element] = (result[acc.element] ?? 0) + acc.bonusValue;
      }
    }

    for (const element of ELEMENTS) {
      if (companionElements.has(element) && result[element] > 0) {
        result[element] *= ELEMENT_MULTIPLIER;
      }
    }

    return result;
  }, [damageSources, elementAccessories, companionElements]);

  const totalAmp = useMemo(
    () => Object.values(elementalAmp).reduce((sum, v) => sum + v, 0),
    [elementalAmp],
  );

  const activeSourceCount = damageSources.filter((s) => s.active).length;
  const ownedAccessoryCount = elementAccessories.filter((a) => a.owned).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-8 dark:bg-gray-900 dark:border-gray-700">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Black Orb</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Elemental damage sources and amplification aggregation
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* AMP Summary */}
        <section aria-labelledby="amp-summary-heading">
          <h2 id="amp-summary-heading" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            AMP Summary
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Total AMP */}
            <div className="bg-white rounded-lg border border-gray-200 px-6 py-5 dark:bg-gray-900 dark:border-gray-700 col-span-2 sm:col-span-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total AMP</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                {totalAmp > 0 ? formatPercent(totalAmp) : '—'}
              </p>
              <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                combined across all elements
              </p>
            </div>

            {/* Active Sources */}
            <div className="bg-white rounded-lg border border-gray-200 px-6 py-5 dark:bg-gray-900 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Sources</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {activeSourceCount}
                <span className="text-sm font-normal text-gray-400 dark:text-gray-500"> / {damageSources.length}</span>
              </p>
              <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">damage sources enabled</p>
            </div>

            {/* Owned Accessories */}
            <div className="bg-white rounded-lg border border-gray-200 px-6 py-5 dark:bg-gray-900 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Owned Accessories</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {ownedAccessoryCount}
                <span className="text-sm font-normal text-gray-400 dark:text-gray-500"> / {elementAccessories.length}</span>
              </p>
              <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">accessories acquired</p>
            </div>
          </div>
        </section>

        {/* Per-element AMP breakdown */}
        <section aria-labelledby="elemental-amp-heading">
          <h2 id="elemental-amp-heading" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Elemental AMP
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {ELEMENTS.map((element) => {
              const amp = elementalAmp[element];
              const colors = ELEMENT_COLORS[element];
              const isMatching = companionElements.has(element);
              return (
                <div
                  key={element}
                  className={`rounded-lg border px-4 py-4 text-center ${amp > 0 ? `${colors.bg} ${colors.border}` : 'bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700'}`}
                >
                  <span className="text-xl" aria-hidden="true">{ELEMENT_ICONS[element]}</span>
                  <p className={`mt-1 text-xs font-medium ${amp > 0 ? colors.text : 'text-gray-400 dark:text-gray-500'}`}>
                    {element}
                  </p>
                  <p className={`mt-1 text-lg font-bold tabular-nums ${amp > 0 ? colors.text : 'text-gray-300 dark:text-gray-600'}`}>
                    {amp > 0 ? formatPercent(amp) : '—'}
                  </p>
                  {isMatching && (
                    <p className="mt-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                      2× match
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Per-element sections: damage sources + accessories */}
        {ELEMENTS.map((element) => {
          const sources = damageSources.filter((s) => s.element === element);
          const accessories = elementAccessories.filter((a) => a.element === element);
          const colors = ELEMENT_COLORS[element];
          const activeCount = sources.filter((s) => s.active).length;
          const ownedCount = accessories.filter((a) => a.owned).length;
          const isMatching = companionElements.has(element);

          return (
            <section key={element} aria-labelledby={`${element}-heading`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg" aria-hidden="true">{ELEMENT_ICONS[element]}</span>
                <h2
                  id={`${element}-heading`}
                  className={`text-xs font-semibold uppercase tracking-wider ${colors.text}`}
                >
                  {element}
                </h2>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.badge}`}>
                  {formatPercent(elementalAmp[element])} AMP
                </span>
                {isMatching && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    2× companion match
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Damage Sources */}
                <div className="bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Damage Sources
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                      {activeCount}/{sources.length} active
                    </span>
                  </div>
                  <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                    {sources.map((src) => (
                      <li key={src.name}>
                        <button
                          onClick={() => toggleDamageSource(src.name)}
                          className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors cursor-pointer ${
                            src.active
                              ? `${colors.bg}`
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          }`}
                          aria-pressed={src.active}
                          aria-label={`${src.name}: ${formatPercent(src.damagePercent)}, ${src.active ? 'active' : 'inactive'}`}
                        >
                          <span className={`text-sm font-medium ${src.active ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                            {src.name}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-sm font-semibold tabular-nums ${src.active ? colors.text : 'text-gray-300 dark:text-gray-600'}`}>
                              {formatPercent(src.damagePercent)}
                            </span>
                            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              src.active
                                ? `${colors.border} ${colors.bg}`
                                : 'border-gray-300 dark:border-gray-600'
                            }`} aria-hidden="true">
                              {src.active && (
                                <span className={`w-2 h-2 rounded-full ${colors.text.replace('text-', 'bg-')}`} />
                              )}
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Accessories */}
                <div className="bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Accessories
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                      {ownedCount}/{accessories.length} owned
                    </span>
                  </div>
                  <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                    {accessories.map((acc) => (
                      <li
                        key={acc.name}
                        className={`flex items-center justify-between px-4 py-3 gap-4 ${
                          acc.owned ? colors.bg : ''
                        }`}
                      >
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className={`text-sm font-medium truncate ${acc.owned ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                            {acc.name}
                          </span>
                          <span className={`text-xs tabular-nums ${acc.owned ? colors.text : 'text-gray-300 dark:text-gray-600'}`}>
                            {formatPercent(acc.bonusValue)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <NumberInput
                            label="Level"
                            value={acc.level}
                            onChange={(level) => setAccessoryLevel(acc.name, level, acc.bonusValue)}
                            min={1}
                          />
                          <button
                            onClick={() => setAccessoryOwned(acc.name, !acc.owned)}
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                              acc.owned
                                ? `${colors.border} ${colors.bg}`
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                            aria-pressed={acc.owned}
                            aria-label={`${acc.name}: ${acc.owned ? 'owned' : 'not owned'}`}
                          >
                            {acc.owned && (
                              <span className={`w-2 h-2 rounded-full ${colors.text.replace('text-', 'bg-')}`} aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          );
        })}

      </div>
    </div>
  );
}
