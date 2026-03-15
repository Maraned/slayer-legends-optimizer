'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';

interface CheckboxProps {
  id?: string;
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Checkbox({
  id,
  label,
  checked,
  defaultChecked,
  disabled,
  onCheckedChange,
}: CheckboxProps) {
  const handleCheckedChange = (value: CheckboxPrimitive.CheckedState) => {
    if (onCheckedChange) {
      onCheckedChange(value === true);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <CheckboxPrimitive.Root
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onCheckedChange={handleCheckedChange}
        className="h-4 w-4 shrink-0 rounded border border-foreground/40 bg-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-background">
          <svg
            width="10"
            height="8"
            viewBox="0 0 10 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <label
          htmlFor={id}
          className="text-sm leading-none cursor-pointer select-none disabled:cursor-not-allowed"
        >
          {label}
        </label>
      )}
    </div>
  );
}
