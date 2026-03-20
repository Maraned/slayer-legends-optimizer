'use client';

import { useId } from 'react';
import * as Label from '@radix-ui/react-label';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  ariaLabel?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  ariaLabel,
  id: idProp,
  disabled = false,
  className = '',
}: NumberInputProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;

  function clamp(num: number): number {
    let result = num;
    if (min !== undefined) result = Math.max(min, result);
    if (max !== undefined) result = Math.min(max, result);
    return result;
  }

  function handleDecrement() {
    onChange(clamp(value - step));
  }

  function handleIncrement() {
    onChange(clamp(value + step));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed)) {
      onChange(clamp(parsed));
    }
  }

  const atMin = min !== undefined && value <= min;
  const atMax = max !== undefined && value >= max;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <Label.Root
          htmlFor={id}
          className="text-sm font-medium text-[var(--color-foreground)] select-none"
        >
          {label}
        </Label.Root>
      )}
      <div className="flex items-center">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || atMin}
          aria-label={`Decrease ${ariaLabel ?? label ?? 'value'}`}
          className="flex h-8 w-8 items-center justify-center rounded-l border border-r-0 border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          −
        </button>
        <input
          id={id}
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="h-8 w-16 border border-gray-300 bg-white px-2 text-center text-sm tabular-nums text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:bg-gray-900 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || atMax}
          aria-label={`Increase ${ariaLabel ?? label ?? 'value'}`}
          className="flex h-8 w-8 items-center justify-center rounded-r border border-l-0 border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          +
        </button>
      </div>
    </div>
  );
}
