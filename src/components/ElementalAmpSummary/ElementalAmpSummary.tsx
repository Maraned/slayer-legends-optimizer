'use client';

import { useMemo } from 'react';

import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import type { Element } from '@/types/companions';

const ELEMENT_MULTIPLIER = 2;

const ELEMENTS: Element[] = ['Fire', 'Water', 'Wind', 'Earth', 'Lightning'];

const ELEMENT_ICONS: Record<Element, string> = {
  Fire: '🔥',
  Water: '💧',
  Wind: '🌪️',
  Earth: '🪨',
  Lightning: '⚡',
};

const ELEMENT_COLORS: Record<Element, { text: string; bg: string }> = {
  Fire: { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/10' },
  Water: { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/10' },
  Wind: { text: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/10' },
  Earth: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/10' },
  Lightning: {
    text: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/10',
  },
};

function formatPercent(value: number): string {
  return `+${(value * 100).toFixed(0)}%`;
}

export function ElementalAmpSummary() {
  const damageSources = useUserSaveStore((s: UserSaveStore) => s.blackOrb.damageSources);
  const elementAccessories = useUserSaveStore(
    (s: UserSaveStore) => s.blackOrb.elementAccessories,
  );
  const companions = useUserSaveStore((s: UserSaveStore) => s.companions);

  const companionElements = useMemo(
    () => new Set(companions.map((c) => c.element)),
    [companions],
  );

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
        result[src.element] += src.damagePercent;
      }
    }

    for (const acc of elementAccessories) {
      if (acc.owned) {
        result[acc.element] += acc.bonusValue;
      }
    }

    for (const element of ELEMENTS) {
      if (companionElements.has(element) && result[element] > 0) {
        result[element] *= ELEMENT_MULTIPLIER;
      }
    }

    return result;
  }, [damageSources, elementAccessories, companionElements]);

  const activeElements = ELEMENTS.filter((e) => elementalAmp[e] > 0);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Elemental AMP</h2>
      </div>

      <div className="p-4">
        {activeElements.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            No elemental AMP active. Configure your Black Orb to see totals here.
          </p>
        ) : (
          <div className="space-y-1">
            {activeElements.map((element) => {
              const amp = elementalAmp[element];
              const colors = ELEMENT_COLORS[element];
              const isMatching = companionElements.has(element);
              return (
                <div
                  key={element}
                  className={`flex items-center justify-between rounded px-2 py-1 text-xs ${colors.bg}`}
                >
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden="true">{ELEMENT_ICONS[element]}</span>
                    <span className={`font-medium ${colors.text}`}>{element}</span>
                    {isMatching && (
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        2×
                      </span>
                    )}
                  </span>
                  <span className={`tabular-nums font-semibold ${colors.text}`}>
                    {formatPercent(amp)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
