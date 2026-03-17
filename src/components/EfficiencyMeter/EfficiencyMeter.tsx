'use client';

export type EfficiencyVariant = 'default' | 'compact' | 'prominent';

export interface EfficiencyMeterProps {
  /** Efficiency score value */
  value: number;
  /** Maximum value for the score (default: 100) */
  max?: number;
  /** Optional label shown above or beside the meter */
  label?: string;
  /** Whether to display the numeric value */
  showValue?: boolean;
  /** Whether to display the percentage */
  showPercentage?: boolean;
  /**
   * Display variant:
   * - default   – standard label + bar layout
   * - compact   – smaller text and bar, tighter spacing
   * - prominent – larger bar, bold label, accented container
   */
  variant?: EfficiencyVariant;
  className?: string;
}

/** Returns a Tailwind color class based on efficiency percentage */
function getBarColor(percentage: number): string {
  if (percentage >= 67) return 'bg-green-500';
  if (percentage >= 34) return 'bg-yellow-500';
  return 'bg-red-500';
}

/** Returns a semantic label for the efficiency level */
function getEfficiencyLabel(percentage: number): string {
  if (percentage >= 67) return 'High';
  if (percentage >= 34) return 'Medium';
  return 'Low';
}

const barHeightClasses: Record<EfficiencyVariant, string> = {
  default: 'h-2',
  compact: 'h-1.5',
  prominent: 'h-3',
};

const containerClasses: Record<EfficiencyVariant, string> = {
  default: 'w-full rounded-md px-3 py-2 bg-white/5 dark:bg-black/10',
  compact: 'w-full rounded px-2 py-1',
  prominent:
    'w-full rounded-lg px-4 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10',
};

const labelTextClasses: Record<EfficiencyVariant, string> = {
  default: 'text-sm text-foreground/60 font-medium',
  compact: 'text-xs text-foreground/50 font-medium',
  prominent: 'text-sm font-semibold tracking-wide uppercase text-foreground/70',
};

const valueTextClasses: Record<EfficiencyVariant, string> = {
  default: 'text-sm font-semibold tabular-nums text-foreground',
  compact: 'text-xs font-medium tabular-nums text-foreground',
  prominent: 'text-base font-bold tabular-nums text-foreground',
};

export function EfficiencyMeter({
  value,
  max = 100,
  label,
  showValue = false,
  showPercentage = false,
  variant = 'default',
  className = '',
}: EfficiencyMeterProps) {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const barColor = getBarColor(percentage);
  const efficiencyLabel = getEfficiencyLabel(percentage);
  const hasHeader = label || showValue || showPercentage;

  return (
    <div className={`${containerClasses[variant]} ${className}`}>
      {hasHeader && (
        <div className="flex items-center justify-between mb-1.5 gap-2">
          {label && <span className={labelTextClasses[variant]}>{label}</span>}
          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            {showValue && (
              <span className={valueTextClasses[variant]}>
                {value}/{max}
              </span>
            )}
            {showPercentage && (
              <span className={valueTextClasses[variant]}>{Math.round(percentage)}%</span>
            )}
          </div>
        </div>
      )}

      <div
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ?? `Efficiency: ${efficiencyLabel}`}
        aria-valuetext={`${Math.round(percentage)}% efficiency — ${efficiencyLabel}`}
        className={`w-full ${barHeightClasses[variant]} bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
