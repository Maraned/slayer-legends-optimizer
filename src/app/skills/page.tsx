'use client';

import { NumberInput } from '@/components/NumberInput';
import { Toggle } from '@/components/Toggle/Toggle';
import { useSkillsStore, type SkillsStore } from '@/store/useSkillsStore';
import type { Element } from '@/types/companions';

const ELEMENTS: Element[] = ['Fire', 'Water', 'Wind', 'Earth', 'Lightning'];

const ELEMENT_COLORS: Record<Element, string> = {
  Fire: 'text-red-500',
  Water: 'text-blue-500',
  Wind: 'text-green-500',
  Earth: 'text-yellow-600',
  Lightning: 'text-purple-500',
};

const DEFAULT_MULTIPLIERS: Record<Element, number> = {
  Fire: 1,
  Water: 1,
  Wind: 1,
  Earth: 1,
  Lightning: 1,
};

export default function SkillsPage() {
  const elementalMultipliers = useSkillsStore((s: SkillsStore) => s.elementalMultipliers);
  const elementalMultipliersMode = useSkillsStore((s: SkillsStore) => s.elementalMultipliersMode);
  const setElementalMultipliers = useSkillsStore((s: SkillsStore) => s.setElementalMultipliers);
  const setElementalMultipliersMode = useSkillsStore((s: SkillsStore) => s.setElementalMultipliersMode);

  const isAuto = elementalMultipliersMode === 'auto';

  function handleModeToggle(manual: boolean) {
    const nextMode = manual ? 'manual' : 'auto';
    setElementalMultipliersMode(nextMode);
    if (!manual) {
      setElementalMultipliers({ ...DEFAULT_MULTIPLIERS });
    }
  }

  function handleElementChange(element: Element, value: number) {
    setElementalMultipliers({ ...elementalMultipliers, [element]: value });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white border-b border-gray-200 px-6 py-8 dark:bg-gray-900 dark:border-gray-700">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Skills</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your skill levels and elemental damage multipliers</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Elemental Inputs</h2>
            <Toggle
              id="elemental-mode-toggle"
              checked={!isAuto}
              onCheckedChange={handleModeToggle}
              label={isAuto ? 'Auto' : 'Manual'}
              size="sm"
              aria-label="Toggle elemental multipliers input mode"
            />
          </div>
          <div className="px-6 py-5">
            {isAuto && (
              <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                Values are set to default (×1.0). Enable manual mode to enter custom multipliers.
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {ELEMENTS.map((element) => (
                <div key={element} className="flex flex-col gap-2">
                  <span className={`text-sm font-medium ${ELEMENT_COLORS[element]}`}>{element}</span>
                  <NumberInput
                    value={elementalMultipliers[element]}
                    onChange={(value) => handleElementChange(element, value)}
                    min={0}
                    step={0.01}
                    disabled={isAuto}
                    ariaLabel={`${element} damage multiplier`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
