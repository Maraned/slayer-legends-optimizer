'use client';

import { NumberInput } from '@/components/NumberInput';
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

export default function SkillsPage() {
  const elementalMultipliers = useSkillsStore((s: SkillsStore) => s.elementalMultipliers);
  const setElementalMultipliers = useSkillsStore((s: SkillsStore) => s.setElementalMultipliers);

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
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Elemental Inputs</h2>
          </div>
          <div className="px-6 py-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {ELEMENTS.map((element) => (
                <div key={element} className="flex flex-col gap-2">
                  <span className={`text-sm font-medium ${ELEMENT_COLORS[element]}`}>{element}</span>
                  <NumberInput
                    value={elementalMultipliers[element]}
                    onChange={(value) => handleElementChange(element, value)}
                    min={0}
                    step={0.01}
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
