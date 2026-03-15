'use client';

import * as RadixSelect from '@radix-ui/react-select';

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ChevronUp() {
  return (
    <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.13523 8.84197C3.3241 9.04343 3.64052 9.05363 3.84197 8.86477L7.5 5.43536L11.158 8.86477C11.3595 9.05363 11.6759 9.04343 11.8648 8.84197C12.0536 8.64051 12.0434 8.32409 11.842 8.13523L7.84197 4.38523C7.64964 4.20492 7.35036 4.20492 7.15803 4.38523L3.15803 8.13523C2.95657 8.32409 2.94637 8.64051 3.13523 8.84197Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  options?: SelectOption[];
  groups?: SelectOptionGroup[];
  disabled?: boolean;
  id?: string;
  name?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export function Select({
  value,
  onValueChange,
  placeholder = 'Select an option',
  options,
  groups,
  disabled,
  id,
  name,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
}: SelectProps) {
  const hasGroups = groups && groups.length > 0;
  const hasOptions = options && options.length > 0;

  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled} name={name}>
      <RadixSelect.Trigger
        id={id}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        className={[
          'inline-flex items-center justify-between gap-2',
          'min-w-32 w-full px-3 py-2 rounded-md',
          'text-sm leading-none',
          'border border-gray-300 bg-white text-gray-900',
          'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
          'hover:border-gray-400 dark:hover:border-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
          'dark:focus:ring-offset-gray-900',
          'data-[placeholder]:text-gray-400 dark:data-[placeholder]:text-gray-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors duration-150',
        ].join(' ')}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon className="text-gray-500 dark:text-gray-400 shrink-0">
          <ChevronDown />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          className={[
            'relative z-50 min-w-32 overflow-hidden',
            'rounded-md border border-gray-200 bg-white shadow-lg',
            'dark:border-gray-700 dark:bg-gray-800',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2',
            'data-[side=top]:slide-in-from-bottom-2',
          ].join(' ')}
          position="popper"
          sideOffset={4}
        >
          <RadixSelect.ScrollUpButton className="flex items-center justify-center py-1 text-gray-500 dark:text-gray-400 cursor-default">
            <ChevronUp />
          </RadixSelect.ScrollUpButton>

          <RadixSelect.Viewport className="p-1 max-h-60">
            {hasGroups &&
              groups!.map((group) => (
                <RadixSelect.Group key={group.label}>
                  <RadixSelect.Label className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {group.label}
                  </RadixSelect.Label>
                  {group.options.map((option) => (
                    <SelectItem key={option.value} option={option} />
                  ))}
                </RadixSelect.Group>
              ))}

            {hasOptions &&
              options!.map((option) => <SelectItem key={option.value} option={option} />)}
          </RadixSelect.Viewport>

          <RadixSelect.ScrollDownButton className="flex items-center justify-center py-1 text-gray-500 dark:text-gray-400 cursor-default">
            <ChevronDown />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

function SelectItem({ option }: { option: SelectOption }) {
  return (
    <RadixSelect.Item
      value={option.value}
      disabled={option.disabled}
      className={[
        'relative flex items-center gap-2 px-2 py-1.5 pl-7',
        'text-sm text-gray-900 dark:text-gray-100',
        'rounded cursor-pointer select-none outline-none',
        'data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900',
        'dark:data-[highlighted]:bg-blue-900/30 dark:data-[highlighted]:text-blue-100',
        'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40',
        'transition-colors duration-100',
      ].join(' ')}
    >
      <RadixSelect.ItemIndicator className="absolute left-2 flex items-center justify-center text-blue-600 dark:text-blue-400">
        <Check />
      </RadixSelect.ItemIndicator>
      <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
    </RadixSelect.Item>
  );
}
