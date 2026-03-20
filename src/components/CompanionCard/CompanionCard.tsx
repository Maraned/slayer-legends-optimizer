import type { AdvancementStep, BuffType, Companion, Element, SpecialBuffs } from '@/types/companions';
import type { CompanionSkin } from '@/types/sprites';
import { Select } from '@/components/Select/Select';
import { NumberInput } from '@/components/NumberInput';

const ELEMENTS: Element[] = ['Fire', 'Water', 'Wind', 'Earth', 'Lightning'];

const elementOptions = ELEMENTS.map((e) => ({ value: e, label: e }));

export interface CompanionCardProps {
  companion: Companion;
  skins: CompanionSkin[];
  onSkinChange: (skin: string) => void;
  onElementChange?: (element: Element) => void;
  onLevelChange: (level: number) => void;
  className?: string;
}


const buffTypeClasses: Record<BuffType, string> = {
  'Extra ATK': 'text-red-600 dark:text-red-400',
  'Extra EXP': 'text-blue-600 dark:text-blue-400',
  'Monster Gold': 'text-amber-600 dark:text-amber-400',
  'Extra HP': 'text-green-600 dark:text-green-400',
};

function formatPercent(value: number): string {
  const pct = value * 100;
  return `${pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(1)}%`;
}

function getSpecialBuffEntries(specialBuffs: SpecialBuffs): { label: string; value: number }[] {
  switch (specialBuffs.companion) {
    case 'Ellie':
      return [{ label: "Wind's Song", value: specialBuffs.windsSong }];
    case 'Zeke':
      return [
        { label: 'Blade Dance', value: specialBuffs.bladeDance },
        { label: 'Wisdom', value: specialBuffs.wisdom },
        { label: 'Soul Catch', value: specialBuffs.soulCatch },
      ];
    case 'Miho':
      return [{ label: 'Red Greed', value: specialBuffs.redGreed }];
    case 'Luna':
      return [{ label: 'Deep Sea Song', value: specialBuffs.deepSeaSong }];
  }
}

function AdvancementStepRow({ step }: { step: AdvancementStep }) {
  return (
    <div className="flex items-center justify-between rounded px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800/60">
      <span className="w-8 shrink-0 text-gray-400 dark:text-gray-500">{step.step}</span>
      <span className={`flex-1 mx-2 font-medium ${buffTypeClasses[step.buffType]}`}>
        {step.buffType}
      </span>
      <span className="tabular-nums font-semibold text-gray-900 dark:text-gray-100">
        +{formatPercent(step.buffValue)}
      </span>
    </div>
  );
}

export function CompanionCard({ companion, skins, onSkinChange, onElementChange, onLevelChange, className = '' }: CompanionCardProps) {
  const { name, skin, element, level, advancementSteps, specialBuffs } = companion;
  const specialBuffEntries = getSpecialBuffEntries(specialBuffs);
  const skinOptions = skins.map((s) => ({ value: s.name, label: s.name }));

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{name}</h2>
        <div className="flex items-center gap-2">
          <Select
            value={element}
            onValueChange={(v) => onElementChange?.(v as Element)}
            options={elementOptions}
            aria-label="Element"
          />
        </div>
      </div>

      {/* Skin selector */}
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Skin
        </label>
        <Select
          value={skin}
          onValueChange={onSkinChange}
          options={skinOptions}
          aria-label={`${name} skin`}
        />
      </div>

      {/* Level input */}
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <NumberInput
          label="Level"
          value={level}
          onChange={onLevelChange}
          min={1}
        />
      </div>

      <div className="space-y-4 p-4">
        {/* Advancement Steps */}
        {advancementSteps.length > 0 && (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Advancement Steps
            </h3>
            <div className="space-y-1">
              {advancementSteps.map((step) => (
                <AdvancementStepRow key={step.step} step={step} />
              ))}
            </div>
          </section>
        )}

        {/* Special Buffs */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Special Buffs
          </h3>
          <div className="space-y-1">
            {specialBuffEntries.map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800/60"
              >
                <span className="text-gray-700 dark:text-gray-300">{label}</span>
                <span className="tabular-nums font-semibold text-gray-900 dark:text-gray-100">
                  +{formatPercent(value)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
