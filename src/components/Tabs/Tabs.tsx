'use client';

import * as RadixTabs from '@radix-ui/react-tabs';
import { ReactNode } from 'react';

export interface TabItem {
  value: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  /** The tab items to render */
  tabs: TabItem[];
  /** The controlled active tab value */
  value?: string;
  /** The default active tab value (uncontrolled) */
  defaultValue?: string;
  /** Callback fired when the active tab changes */
  onValueChange?: (value: string) => void;
  /** Tab orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Additional class names for the root wrapper */
  className?: string;
}

export function Tabs({
  tabs,
  value,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  className = '',
}: TabsProps) {
  const resolvedDefault = defaultValue ?? (tabs[0]?.value as string | undefined);

  return (
    <RadixTabs.Root
      value={value}
      defaultValue={resolvedDefault}
      onValueChange={onValueChange}
      orientation={orientation}
      className={[
        orientation === 'vertical' ? 'flex flex-row gap-4' : 'flex flex-col',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Tab list */}
      <RadixTabs.List
        aria-label="Tabs"
        className={[
          'flex shrink-0',
          orientation === 'vertical'
            ? 'flex-col border-r border-[var(--color-foreground)]/15 dark:border-[var(--color-foreground)]/10'
            : 'flex-row border-b border-[var(--color-foreground)]/15 dark:border-[var(--color-foreground)]/10',
        ].join(' ')}
      >
        {tabs.map((tab) => (
          <RadixTabs.Trigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={[
              'select-none px-4 py-2 text-sm font-medium transition-colors duration-150',
              'text-[var(--color-foreground)]/60 hover:text-[var(--color-foreground)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-40',
              orientation === 'vertical'
                ? [
                    'relative -mr-px text-left',
                    'data-[state=active]:border-r-2 data-[state=active]:border-blue-600',
                    'data-[state=active]:text-[var(--color-foreground)]',
                    'dark:data-[state=active]:border-blue-500',
                  ].join(' ')
                : [
                    'relative -mb-px',
                    'data-[state=active]:border-b-2 data-[state=active]:border-blue-600',
                    'data-[state=active]:text-[var(--color-foreground)]',
                    'dark:data-[state=active]:border-blue-500',
                  ].join(' '),
            ].join(' ')}
          >
            {tab.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>

      {/* Tab panels */}
      {tabs.map((tab) => (
        <RadixTabs.Content
          key={tab.value}
          value={tab.value}
          className="flex-1 pt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          {tab.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
}
