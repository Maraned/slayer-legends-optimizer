import type { EnhanceableStatKey } from '@/types/character';

export type StatUnit = '%' | 'K' | 'M' | 'B';

export type StatVariant = 'default' | 'compact' | 'prominent';

export interface StatDisplayProps {
  /** Label describing the stat (e.g. "ATK", "Crit %", "HP Recovery") */
  label: string;
  /** Numeric or pre-formatted string value */
  value: number | string;
  /** Optional unit suffix appended to the value */
  unit?: StatUnit | string;
  /**
   * Optional change relative to a baseline.
   * Positive → green, negative → red, zero → neutral.
   */
  delta?: number;
  /**
   * Display variant:
   * - default   – label left, value right, full-width row
   * - compact   – smaller text, tighter padding (for dense grids)
   * - prominent – larger text, accent background (for key stats)
   */
  variant?: StatVariant;
  /** Optional icon rendered before the label */
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Formats a numeric value with optional unit, capping large numbers.
 */
function formatValue(value: number | string, unit?: string): string {
  if (typeof value === 'string') {
    return unit ? `${value}${unit}` : value;
  }

  let formatted: string;
  if (unit === '%') {
    formatted = value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  } else if (value >= 1_000_000_000) {
    formatted = `${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (value >= 1_000_000) {
    formatted = `${(value / 1_000_000).toFixed(2)}M`;
  } else if (value >= 1_000) {
    formatted = `${(value / 1_000).toFixed(1)}K`;
  } else {
    formatted = value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  return unit ? `${formatted}${unit}` : formatted;
}

/**
 * Formats a delta value with a leading sign and optional unit.
 */
function formatDelta(delta: number, unit?: string): string {
  const sign = delta >= 0 ? '+' : '';
  const abs = formatValue(Math.abs(delta), unit);
  return `${sign}${delta < 0 ? '-' : ''}${abs}`;
}

export function StatDisplay({
  label,
  value,
  unit,
  delta,
  variant = 'default',
  icon,
  className = '',
}: StatDisplayProps) {
  const hasDelta = delta !== undefined;
  const deltaPositive = hasDelta && delta > 0;
  const deltaNegative = hasDelta && delta < 0;

  const containerClasses: Record<StatVariant, string> = {
    default:
      'flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm bg-white/5 dark:bg-black/10',
    compact:
      'flex items-center justify-between gap-1 rounded px-2 py-1 text-xs bg-white/5 dark:bg-black/10',
    prominent:
      'flex items-center justify-between gap-2 rounded-lg px-4 py-3 text-base font-semibold bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10',
  };

  const labelClasses: Record<StatVariant, string> = {
    default: 'text-foreground/60 font-medium',
    compact: 'text-foreground/50 font-medium',
    prominent: 'text-foreground/70 font-semibold tracking-wide uppercase text-sm',
  };

  const valueClasses: Record<StatVariant, string> = {
    default: 'text-foreground font-semibold tabular-nums',
    compact: 'text-foreground font-medium tabular-nums',
    prominent: 'text-foreground font-bold tabular-nums text-lg',
  };

  return (
    <div className={`${containerClasses[variant]} ${className}`}>
      {/* Label side */}
      <div className="flex items-center gap-1.5 min-w-0">
        {icon && <span className="shrink-0 text-foreground/50">{icon}</span>}
        <span className={`${labelClasses[variant]} truncate`}>{label}</span>
      </div>

      {/* Value side */}
      <div className="flex items-baseline gap-1.5 shrink-0">
        <span className={valueClasses[variant]}>{formatValue(value, unit)}</span>

        {hasDelta && (
          <span
            className={`text-xs font-medium tabular-nums ${
              deltaPositive
                ? 'text-green-500 dark:text-green-400'
                : deltaNegative
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-foreground/40'
            }`}
          >
            {formatDelta(delta, unit)}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Convenience map from EnhanceableStatKey to a human-readable label.
 */
export const ENHANCEABLE_STAT_LABELS: Record<EnhanceableStatKey, string> = {
  ATK: 'ATK',
  CRIT_DMG: 'Crit DMG',
  CRIT_PCT: 'Crit %',
  DEATH_STRIKE: 'Death Strike',
  DEATH_STRIKE_PCT: 'Death Strike %',
  HP: 'HP',
  HP_RECOVERY: 'HP Recovery',
};

/**
 * Convenience map from EnhanceableStatKey to its display unit.
 */
export const ENHANCEABLE_STAT_UNITS: Partial<Record<EnhanceableStatKey, string>> = {
  CRIT_PCT: '%',
  DEATH_STRIKE_PCT: '%',
};
