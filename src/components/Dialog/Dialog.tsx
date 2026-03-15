'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import { ReactNode } from 'react';

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Additional class names for the content panel */
  className?: string;
}

export function Dialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  className = '',
}: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>}

      <RadixDialog.Portal>
        {/* Overlay */}
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Content */}
        <RadixDialog.Content
          className={[
            'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
            'rounded-lg bg-[var(--color-background)] p-6 shadow-xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            'focus:outline-none',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {/* Header */}
          {(title || description) && (
            <div className="mb-4">
              {title && (
                <RadixDialog.Title className="text-lg font-semibold text-[var(--color-foreground)]">
                  {title}
                </RadixDialog.Title>
              )}
              {description && (
                <RadixDialog.Description className="mt-1 text-sm text-[var(--color-foreground)]/60">
                  {description}
                </RadixDialog.Description>
              )}
            </div>
          )}

          {/* Body */}
          {children}

          {/* Close button */}
          <RadixDialog.Close
            aria-label="Close"
            className="absolute right-4 top-4 rounded p-1 text-[var(--color-foreground)]/50 transition-colors hover:bg-[var(--color-foreground)]/10 hover:text-[var(--color-foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-foreground)]/30"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </RadixDialog.Close>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

/** Re-export primitives for advanced composition */
export const DialogRoot = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;
