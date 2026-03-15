import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Card({ title, children, footer, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 ${className}`}
    >
      {title && (
        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">{footer}</div>
      )}
    </div>
  );
}
