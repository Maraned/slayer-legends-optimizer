import type { AdvancementStep, BuffType, Companion, Element, SpecialBuffs } from '@/types/companions';
import type { CompanionSkin } from '@/types/sprites';
import { Select } from '@/components/Select/Select';
import { NumberInput } from '@/components/NumberInput';
import companionsData from '@/data/companions-data.json';

const MAX_PROMOTION_STAGE = companionsData.CUBE_COSTS_PER_STAGE.length - 1;
const CUBE_COSTS_PER_STAGE = companionsData.CUBE_COSTS_PER_STAGE;

const MAX_LEVEL = 14;
const ELEMENTS: Element[] = ['Fire', 'Water', 'Wind', 'Earth', 'Lightning'];

const elementOptions = ELEMENTS.map((e) => ({ value: e, label: e }));

export interface CompanionCardProps {
  companion: Companion;
  skins: CompanionSkin[];
  onSkinChange: (skin: string) => void;
  onElementChange?: (element: Element) => void;
  onLevelChange: (level: number) => void;
  onPromotionStageChange: (stage: number) => void;
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

function stepIndex(step: AdvancementStep): number {
  const ordinals = ['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th','13th','14th'];
  return ordinals.indexOf(step.step) + 1;
}

function AdvancementStepRow({ step, unlocked }: { step: AdvancementStep; unlocked: boolean }) {
  return (
    <div
      className={`flex items-center justify-between rounded px-2 py-1 text-xs transition-opacity ${
        unlocked
          ? 'bg-gray-50 dark:bg-gray-800/60'
          : 'bg-gray-50/50 dark:bg-gray-800/30 opacity-40'
      }`}
    >
      <span className="w-4 shrink-0 mr-1 flex items-center justify-center">
        {unlocked ? (
          <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        )}
      </span>
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

function LevelProgress({ level }: { level: number }) {
  const pct = Math.round((level / MAX_LEVEL) * 100);
  const isMax = level >= MAX_LEVEL;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500 dark:text-gray-400">Progress</span>
        <span className={`font-semibold tabular-nums ${isMax ? 'text-yellow-500 dark:text-yellow-400' : 'text-gray-700 dark:text-gray-300'}`}>
          {isMax ? 'MAX' : `${level} / ${MAX_LEVEL}`}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={level}
        aria-valuemin={1}
        aria-valuemax={MAX_LEVEL}
        aria-label={`Level ${level} of ${MAX_LEVEL}`}
        className="w-full h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700"
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${isMax ? 'bg-yellow-400' : 'bg-blue-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: MAX_LEVEL }, (_, i) => (
          <span
            key={i}
            className={`flex-1 h-1 rounded-sm transition-colors ${
              i < level ? (isMax ? 'bg-yellow-400' : 'bg-blue-500') : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function CompanionCard({ companion, skins, onSkinChange, onElementChange, onLevelChange, onPromotionStageChange, className = '' }: CompanionCardProps) {
  const { name, skin, element, level, promotionStage, advancementSteps, specialBuffs } = companion;
  const cubeCost = promotionStage > 0 ? CUBE_COSTS_PER_STAGE[promotionStage] * level : 0;
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

      {/* Level & Progress */}
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Level
          </label>
          <NumberInput
            value={level}
            onChange={onLevelChange}
            min={1}
            max={MAX_LEVEL}
          />
        </div>
        <LevelProgress level={level} />
      </div>

      {/* Promotion stage input + cube cost display */}
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <NumberInput
          label="Promotion Stage"
          value={promotionStage}
          onChange={onPromotionStageChange}
          min={0}
          max={MAX_PROMOTION_STAGE}
        />
        <div className="mt-2 flex items-center justify-between rounded px-2 py-1.5 text-xs bg-amber-50 dark:bg-amber-900/20">
          <span className="text-amber-700 dark:text-amber-400 font-medium">Cube Cost</span>
          <span className="tabular-nums font-semibold text-amber-900 dark:text-amber-200">
            {cubeCost.toLocaleString()}
          </span>
        </div>
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
                <AdvancementStepRow key={step.step} step={step} unlocked={stepIndex(step) <= level} />
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
