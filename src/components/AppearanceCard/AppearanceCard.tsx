'use client';

import type { AppearanceBonusTotals, BonusType, ClothingItem } from '@/types/appearance';
import { Card } from '@/components/Card';
import { Toggle } from '@/components/Toggle';

interface AppearanceCardProps {
  items: ClothingItem[];
  bonusTotals: AppearanceBonusTotals;
  onToggleOwned: (id: string) => void;
  className?: string;
}

const BONUS_TYPE_LABELS: Record<BonusType, string> = {
  'Dodge': 'Dodge',
  'Extra EXP': 'Extra EXP',
  'Monster Gold': 'Monster Gold',
  'Accuracy': 'Accuracy',
  'Extra ATK': 'Extra ATK',
  'Extra HP': 'Extra HP',
  'HP Recovery': 'HP Recovery',
  'Crit DMG': 'Crit DMG',
  'Crit %': 'Crit %',
  'Death Strike': 'Death Strike',
  'Death Strike %': 'Death Strike %',
};

function formatEffectValue(bonusType: BonusType, value: number): string {
  const percentTypes: BonusType[] = ['Dodge', 'Extra EXP', 'Monster Gold', 'Accuracy', 'Crit %', 'Death Strike %'];
  if (percentTypes.includes(bonusType)) {
    return `+${value}%`;
  }
  return `+${value}`;
}

function BonusTotalsSection({ bonusTotals }: { bonusTotals: AppearanceBonusTotals }) {
  const entries = Object.entries(bonusTotals) as [BonusType, number][];

  if (entries.length === 0) {
    return (
      <p className="text-sm text-[var(--color-foreground)]/50 italic">
        No items owned — mark items as owned to see bonus totals.
      </p>
    );
  }

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
      {entries.map(([bonusType, total]) => (
        <div key={bonusType} className="flex items-center justify-between gap-2 py-0.5">
          <dt className="text-xs text-[var(--color-foreground)]/60">{BONUS_TYPE_LABELS[bonusType]}</dt>
          <dd className="text-xs font-semibold tabular-nums text-[var(--color-foreground)]">
            {formatEffectValue(bonusType, total)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function AppearanceCard({ items, bonusTotals, onToggleOwned, className = '' }: AppearanceCardProps) {
  const ownedCount = items.filter((item) => item.owned).length;

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <Card
        title={`Clothing Items${items.length > 0 ? ` (${ownedCount} / ${items.length} owned)` : ''}`}
      >
        {items.length === 0 ? (
          <p className="text-sm text-[var(--color-foreground)]/50 italic">No clothing items available.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium text-[var(--color-foreground)] truncate">
                    {item.name}
                  </span>
                  <span className="text-xs text-[var(--color-foreground)]/50">
                    {BONUS_TYPE_LABELS[item.bonusType]}
                    {' · '}
                    {formatEffectValue(item.bonusType, item.effectValue)}
                  </span>
                </div>
                <Toggle
                  checked={item.owned}
                  onCheckedChange={() => onToggleOwned(item.id)}
                  label="Owned"
                  size="sm"
                  id={`appearance-owned-${item.id}`}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Bonus Totals">
        <BonusTotalsSection bonusTotals={bonusTotals} />
      </Card>
    </div>
  );
}
