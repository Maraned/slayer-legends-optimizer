import type { TOMResourceType } from '@/types/tom';

/** Currency types supported by CostDisplay */
export type CostCurrency = TOMResourceType | 'Stars' | 'Energy';

export type CostVariant = 'default' | 'compact' | 'prominent';

export interface CostDisplayProps {
  /** Amount of the currency to display */
  amount: number;
  /** The currency/resource type */
  currency: CostCurrency;
  /**
   * Optional label describing what this cost is for.
   * If omitted, only the currency name and amount are shown.
   */
  label?: string;
  /**
   * Display variant:
   * - default   – label left, amount+currency right, full-width row
   * - compact   – smaller text, tighter padding (for dense grids)
   * - prominent – larger text, accent background (for key costs)
   */
  variant?: CostVariant;
  /** Optional icon rendered before the label */
  icon?: React.ReactNode;
  className?: string;
}

/** Colour classes for each currency type */
export const CURRENCY_COLORS: Record<CostCurrency, string> = {
  Gold: 'text-yellow-500 dark:text-yellow-400',
  Gems: 'text-cyan-500 dark:text-cyan-400',
  Essence: 'text-purple-500 dark:text-purple-400',
  Shards: 'text-blue-400 dark:text-blue-300',
  Stars: 'text-amber-400 dark:text-amber-300',
  Energy: 'text-green-500 dark:text-green-400',
};

/** Short display symbol / abbreviation for each currency */
export const CURRENCY_SYMBOLS: Record<CostCurrency, string> = {
  Gold: 'G',
  Gems: 'Gems',
  Essence: 'Ess',
  Shards: 'Shards',
  Stars: '★',
  Energy: 'NRG',
};

/**
 * Formats a cost amount, abbreviating large numbers.
 */
function formatAmount(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(2)}B`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K`;
  }
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function CostDisplay({
  amount,
  currency,
  label,
  variant = 'default',
  icon,
  className = '',
}: CostDisplayProps) {
  const containerClasses: Record<CostVariant, string> = {
    default:
      'flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm bg-white/5 dark:bg-black/10',
    compact:
      'flex items-center justify-between gap-1 rounded px-2 py-1 text-xs bg-white/5 dark:bg-black/10',
    prominent:
      'flex items-center justify-between gap-2 rounded-lg px-4 py-3 text-base font-semibold bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10',
  };

  const labelClasses: Record<CostVariant, string> = {
    default: 'text-foreground/60 font-medium',
    compact: 'text-foreground/50 font-medium',
    prominent: 'text-foreground/70 font-semibold tracking-wide uppercase text-sm',
  };

  const amountClasses: Record<CostVariant, string> = {
    default: 'font-semibold tabular-nums',
    compact: 'font-medium tabular-nums',
    prominent: 'font-bold tabular-nums text-lg',
  };

  const symbolClasses: Record<CostVariant, string> = {
    default: 'text-xs font-medium',
    compact: 'text-xs font-medium',
    prominent: 'text-sm font-semibold',
  };

  const currencyColor = CURRENCY_COLORS[currency];
  const symbol = CURRENCY_SYMBOLS[currency];
  const displayLabel = label ?? currency;

  return (
    <div className={`${containerClasses[variant]} ${className}`}>
      {/* Label side */}
      <div className="flex items-center gap-1.5 min-w-0">
        {icon && <span className="shrink-0 text-foreground/50">{icon}</span>}
        <span className={`${labelClasses[variant]} truncate`}>{displayLabel}</span>
      </div>

      {/* Amount + currency side */}
      <div className="flex items-baseline gap-1 shrink-0">
        <span className={`${amountClasses[variant]} ${currencyColor}`}>
          {formatAmount(amount)}
        </span>
        <span className={`${symbolClasses[variant]} ${currencyColor}`}>{symbol}</span>
      </div>
    </div>
  );
}
