'use client';

import * as Switch from '@radix-ui/react-switch';

export type ToggleSize = 'sm' | 'md' | 'lg';

export interface ToggleProps {
  /** Whether the toggle is checked */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Callback fired when the checked state changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Label text displayed next to the toggle */
  label?: string;
  /** Size variant */
  size?: ToggleSize;
  /** Accessible name when no visible label is provided */
  'aria-label'?: string;
  /** HTML id for the switch element */
  id?: string;
  /** Additional class names for the root wrapper */
  className?: string;
}

const rootSizeClasses: Record<ToggleSize, string> = {
  sm: 'w-8 h-4',
  md: 'w-11 h-6',
  lg: 'w-14 h-7',
};

const thumbSizeClasses: Record<ToggleSize, string> = {
  sm: 'w-3 h-3 data-[state=checked]:translate-x-4',
  md: 'w-5 h-5 data-[state=checked]:translate-x-5',
  lg: 'w-6 h-6 data-[state=checked]:translate-x-7',
};

const labelSizeClasses: Record<ToggleSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function Toggle({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  label,
  size = 'md',
  'aria-label': ariaLabel,
  id,
  className = '',
}: ToggleProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Switch.Root
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-label={ariaLabel}
        className={[
          'relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
          'bg-gray-300 transition-colors duration-200',
          'data-[state=checked]:bg-blue-600',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:bg-gray-600 dark:data-[state=checked]:bg-blue-500',
          rootSizeClasses[size],
        ].join(' ')}
      >
        <Switch.Thumb
          className={[
            'pointer-events-none block rounded-full bg-white shadow-lg',
            'transform transition-transform duration-200',
            'translate-x-0',
            thumbSizeClasses[size],
          ].join(' ')}
        />
      </Switch.Root>
      {label && (
        <label
          htmlFor={id}
          className={[
            'select-none',
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            'text-foreground',
            labelSizeClasses[size],
          ].join(' ')}
        >
          {label}
        </label>
      )}
    </div>
  );
}
