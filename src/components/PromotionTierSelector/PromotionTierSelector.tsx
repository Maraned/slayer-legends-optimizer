'use client';

import { useEffect, useState } from 'react';

import { Select } from '@/components/Select/Select';
import type { SelectOption } from '@/components/Select/Select';
import { loadCharacterMathsData } from '@/lib/data-loader';
import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import type { BonusType, ClothingItem } from '@/types/appearance';
import type { PromotionAbilityOptionEntry, PromotionBonusEntry, PromotionEntry } from '@/types/character-data';
import type { PromotionAbility } from '@/types/character';

const PROMOTION_RELEVANT_BONUS_TYPES: BonusType[] = ['Extra ATK', 'Extra HP', 'Monster Gold'];

function PromotionItemWarnings({ items }: { items: ClothingItem[] }) {
  const unownedRelevant = items.filter(
    (item) => PROMOTION_RELEVANT_BONUS_TYPES.includes(item.bonusType) && !item.owned,
  );

  if (unownedRelevant.length === 0) return null;

  return (
    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-700/50 dark:bg-amber-900/20">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-400">
        Unowned promotion-relevant items
      </p>
      <ul className="flex flex-col gap-1">
        {unownedRelevant.map((item) => (
          <li key={item.id} className="flex items-center justify-between text-xs text-amber-900 dark:text-amber-300">
            <span>{item.name}</span>
            <span className="font-medium text-amber-700 dark:text-amber-400">{item.bonusType}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-amber-700 dark:text-amber-500">
        Mark these as owned on the Appearance page to maximise your promotion bonuses.
      </p>
    </div>
  );
}

function formatPct(value: number): string {
  return `+${(value * 100).toFixed(0)}%`;
}

export function PromotionTierSelector() {
  const promotion = useUserSaveStore((s: UserSaveStore) => s.character.promotion);
  const setPromotion = useUserSaveStore((s: UserSaveStore) => s.setPromotion);
  const appearanceItems = useUserSaveStore((s: UserSaveStore) => s.appearance.items);

  const [promotionEntries, setPromotionEntries] = useState<PromotionEntry[]>([]);
  const [promotionBonusEntries, setPromotionBonusEntries] = useState<PromotionBonusEntry[]>([]);
  const [abilityOptions, setAbilityOptions] = useState<PromotionAbilityOptionEntry[]>([]);

  useEffect(() => {
    loadCharacterMathsData().then((data) => {
      setPromotionEntries(data.PROMOTION);
      setPromotionBonusEntries(data.PROMOTION_BONUS);
      setAbilityOptions(data.ABILITY_OPTIONS);
    });
  }, []);

  const options: SelectOption[] = [
    { value: '0', label: 'Not promoted' },
    ...promotionEntries.map((entry) => ({
      value: String(entry.tier),
      label: `Tier ${entry.tier} – ${entry.rank}`,
    })),
  ];

  function handleTierChange(value: string) {
    const tier = Number(value);
    const entry = promotionEntries.find((e) => e.tier === tier);
    const bonusEntry = promotionBonusEntries.find((b) => b.tier === tier);
    setPromotion({
      tier,
      atkBonus: entry?.atkBonus ?? 0,
      hpBonus: entry?.hpBonus ?? 0,
      atkBonusPct: bonusEntry?.extraAtkPercent ?? 0,
      monsterGoldBonusPct: bonusEntry?.monsterGoldPercent ?? 0,
      abilities: promotion.abilities,
    });
  }

  function handleAbilityToggle(option: PromotionAbilityOptionEntry, checked: boolean) {
    const next: PromotionAbility[] = checked
      ? [...promotion.abilities, { id: option.id, name: option.name }]
      : promotion.abilities.filter((a) => a.id !== option.id);
    setPromotion({ ...promotion, abilities: next });
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Promotion
      </h2>

      <label className="mb-5 flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
          Promotion Tier
        </span>
        <Select
          value={String(promotion.tier)}
          onValueChange={handleTierChange}
          options={options}
          placeholder="Select promotion tier"
          aria-label="Promotion tier"
        />
      </label>

      {promotion.tier > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-blue-50 px-4 py-3 dark:bg-blue-900/20">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-blue-700 dark:text-blue-400">
                ATK Bonus
              </p>
              <p className="text-xl font-bold text-blue-900 dark:text-blue-200">
                {formatPct(promotion.atkBonus)}
              </p>
            </div>

            <div className="rounded-lg bg-green-50 px-4 py-3 dark:bg-green-900/20">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-green-700 dark:text-green-400">
                HP Bonus
              </p>
              <p className="text-xl font-bold text-green-900 dark:text-green-200">
                {formatPct(promotion.hpBonus)}
              </p>
            </div>

            <div className="rounded-lg bg-purple-50 px-4 py-3 dark:bg-purple-900/20">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-purple-700 dark:text-purple-400">
                Extra ATK
              </p>
              <p className="text-xl font-bold text-purple-900 dark:text-purple-200">
                {formatPct(promotion.atkBonusPct)}
              </p>
            </div>

            <div className="rounded-lg bg-amber-50 px-4 py-3 dark:bg-amber-900/20">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
                Monster Gold
              </p>
              <p className="text-xl font-bold text-amber-900 dark:text-amber-200">
                {formatPct(promotion.monsterGoldBonusPct)}
              </p>
            </div>
          </div>

          {abilityOptions.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Promotion Abilities
              </p>
              <ul className="flex flex-col gap-2">
                {abilityOptions.map((option) => {
                  const checked = promotion.abilities.some((a) => a.id === option.id);
                  return (
                    <li key={option.id}>
                      <label className="flex cursor-pointer items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => handleAbilityToggle(option, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                          aria-label={option.name}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {option.name}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <PromotionItemWarnings items={appearanceItems} />
        </>
      )}
    </div>
  );
}
