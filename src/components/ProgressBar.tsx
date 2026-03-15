type ProgressBarVariant = "default" | "success" | "warning" | "danger";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  variant?: ProgressBarVariant;
  className?: string;
}

const variantClasses: Record<ProgressBarVariant, string> = {
  default: "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  danger: "bg-red-500",
};

export default function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  variant = "default",
  className = "",
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between mb-1 text-sm">
          {label && <span>{label}</span>}
          {showValue && (
            <span className="ml-auto">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="w-full h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700"
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${variantClasses[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
