'use client';

import * as Checkbox from '@radix-ui/react-checkbox';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { useCallback, useMemo, useState } from 'react';

import { ColumnDef, DataTableProps, SortDirection, SortState } from './types';

function SortIcon({ direction }: { direction: SortDirection | null }) {
  if (direction === 'asc') {
    return (
      <svg
        aria-hidden="true"
        className="ml-1 inline-block h-3 w-3 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        viewBox="0 0 24 24"
      >
        <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (direction === 'desc') {
    return (
      <svg
        aria-hidden="true"
        className="ml-1 inline-block h-3 w-3 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        viewBox="0 0 24 24"
      >
        <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden="true"
      className="ml-1 inline-block h-3 w-3 shrink-0 opacity-30"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <path d="M8 9l4-4 4 4M8 15l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getCellValue<T>(row: T, col: ColumnDef<T>): React.ReactNode {
  if (typeof col.accessor === 'function') {
    return col.accessor(row);
  }
  const value = row[col.accessor];
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return value as React.ReactNode;
}

function getSortValue<T>(row: T, col: ColumnDef<T>): string | number {
  if (typeof col.accessor === 'function') {
    const rendered = col.accessor(row);
    return typeof rendered === 'string' || typeof rendered === 'number' ? rendered : '';
  }
  const value = row[col.accessor];
  if (typeof value === 'string' || typeof value === 'number') return value;
  return '';
}

export function DataTable<T>({
  data,
  columns,
  pageSize = 0,
  selectable = false,
  onSelectionChange,
  emptyMessage = 'No data available.',
  isLoading = false,
  'aria-label': ariaLabel,
  className = '',
}: DataTableProps<T>) {
  const [sortState, setSortState] = useState<SortState | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedKeys, setSelectedKeys] = useState<Set<number>>(new Set());

  const handleSort = useCallback(
    (key: string) => {
      setSortState((prev) => {
        if (prev?.key === key) {
          return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
        }
        return { key, direction: 'asc' };
      });
      setCurrentPage(1);
    },
    [],
  );

  const sortedData = useMemo(() => {
    if (!sortState) return data;
    const col = columns.find((c) => c.key === sortState.key);
    if (!col) return data;
    return [...data].sort((a, b) => {
      const av = getSortValue(a, col);
      const bv = getSortValue(b, col);
      if (av < bv) return sortState.direction === 'asc' ? -1 : 1;
      if (av > bv) return sortState.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortState, columns]);

  const paginationEnabled = pageSize > 0;
  const totalPages = paginationEnabled ? Math.max(1, Math.ceil(sortedData.length / pageSize)) : 1;

  const visibleData = useMemo(() => {
    if (!paginationEnabled) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, paginationEnabled, currentPage, pageSize]);

  const toggleRow = useCallback(
    (index: number, checked: boolean) => {
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        if (checked) next.add(index);
        else next.delete(index);
        if (onSelectionChange) {
          onSelectionChange(sortedData.filter((_, i) => next.has(i)));
        }
        return next;
      });
    },
    [sortedData, onSelectionChange],
  );

  const allVisibleSelected =
    visibleData.length > 0 &&
    visibleData.every((_, i) => {
      const globalIndex = paginationEnabled ? (currentPage - 1) * pageSize + i : i;
      return selectedKeys.has(globalIndex);
    });

  const someVisibleSelected =
    !allVisibleSelected &&
    visibleData.some((_, i) => {
      const globalIndex = paginationEnabled ? (currentPage - 1) * pageSize + i : i;
      return selectedKeys.has(globalIndex);
    });

  const toggleAll = useCallback(
    (checked: boolean) => {
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        visibleData.forEach((_, i) => {
          const globalIndex = paginationEnabled ? (currentPage - 1) * pageSize + i : i;
          if (checked) next.add(globalIndex);
          else next.delete(globalIndex);
        });
        if (onSelectionChange) {
          onSelectionChange(sortedData.filter((_, i) => next.has(i)));
        }
        return next;
      });
    },
    [visibleData, paginationEnabled, currentPage, pageSize, sortedData, onSelectionChange],
  );

  const skeletonRows = pageSize > 0 ? pageSize : 5;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <ScrollArea.Root className="w-full overflow-hidden rounded-md border border-[var(--color-foreground)]/15">
        <ScrollArea.Viewport className="w-full">
          <table
            aria-label={ariaLabel}
            className="w-full min-w-full border-collapse text-sm"
          >
            <thead>
              <tr className="border-b border-[var(--color-foreground)]/15 bg-[var(--color-foreground)]/5">
                {selectable && (
                  <th className="w-10 px-3 py-2.5 text-left">
                    <Checkbox.Root
                      aria-label="Select all rows"
                      checked={allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false}
                      className="flex h-4 w-4 items-center justify-center rounded border border-[var(--color-foreground)]/40 bg-[var(--color-background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-foreground)]/50 data-[state=checked]:border-[var(--color-foreground)] data-[state=checked]:bg-[var(--color-foreground)] data-[state=indeterminate]:border-[var(--color-foreground)] data-[state=indeterminate]:bg-[var(--color-foreground)]/30"
                      onCheckedChange={(val) => toggleAll(val === true)}
                    >
                      <Checkbox.Indicator className="text-[var(--color-background)]">
                        {someVisibleSelected ? (
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 12 12">
                            <rect height="2" rx="1" width="8" x="2" y="5" />
                          </svg>
                        ) : (
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 12 12">
                            <path d="M2.5 6l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-3 py-2.5 text-left font-semibold text-[var(--color-foreground)]/70 ${col.sortable ? 'cursor-pointer select-none hover:text-[var(--color-foreground)]' : ''} ${col.className ?? ''}`}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    aria-sort={
                      sortState?.key === col.key
                        ? sortState.direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                  >
                    <span className="inline-flex items-center">
                      {col.header}
                      {col.sortable && (
                        <SortIcon
                          direction={sortState?.key === col.key ? sortState.direction : null}
                        />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: skeletonRows }).map((_, i) => (
                  <tr key={i} className="border-b border-[var(--color-foreground)]/10">
                    {selectable && (
                      <td className="px-3 py-2.5">
                        <div className="h-4 w-4 animate-pulse rounded bg-[var(--color-foreground)]/10" />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={`px-3 py-2.5 ${col.className ?? ''}`}>
                        <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--color-foreground)]/10" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : visibleData.length === 0 ? (
                <tr>
                  <td
                    className="px-3 py-8 text-center text-[var(--color-foreground)]/50"
                    colSpan={selectable ? columns.length + 1 : columns.length}
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                visibleData.map((row, rowIndex) => {
                  const globalIndex = paginationEnabled
                    ? (currentPage - 1) * pageSize + rowIndex
                    : rowIndex;
                  const isSelected = selectedKeys.has(globalIndex);
                  return (
                    <tr
                      key={globalIndex}
                      className={`border-b border-[var(--color-foreground)]/10 transition-colors last:border-0 hover:bg-[var(--color-foreground)]/5 ${isSelected ? 'bg-[var(--color-foreground)]/8' : ''}`}
                    >
                      {selectable && (
                        <td className="px-3 py-2.5">
                          <Checkbox.Root
                            aria-label={`Select row ${globalIndex + 1}`}
                            checked={isSelected}
                            className="flex h-4 w-4 items-center justify-center rounded border border-[var(--color-foreground)]/40 bg-[var(--color-background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-foreground)]/50 data-[state=checked]:border-[var(--color-foreground)] data-[state=checked]:bg-[var(--color-foreground)]"
                            onCheckedChange={(val) => toggleRow(globalIndex, val === true)}
                          >
                            <Checkbox.Indicator className="text-[var(--color-background)]">
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 12 12">
                                <path d="M2.5 6l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </Checkbox.Indicator>
                          </Checkbox.Root>
                        </td>
                      )}
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`px-3 py-2.5 text-[var(--color-foreground)] ${col.className ?? ''}`}
                        >
                          {getCellValue(row, col)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="flex touch-none select-none bg-[var(--color-foreground)]/5 p-0.5 transition-colors hover:bg-[var(--color-foreground)]/10 data-[orientation=horizontal]:h-2 data-[orientation=vertical]:w-2 data-[orientation=horizontal]:flex-col"
          orientation="horizontal"
        >
          <ScrollArea.Thumb className="relative flex-1 rounded-full bg-[var(--color-foreground)]/30 before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2" />
        </ScrollArea.Scrollbar>
        <ScrollArea.Scrollbar
          className="flex touch-none select-none bg-[var(--color-foreground)]/5 p-0.5 transition-colors hover:bg-[var(--color-foreground)]/10 data-[orientation=horizontal]:h-2 data-[orientation=vertical]:w-2 data-[orientation=horizontal]:flex-col"
          orientation="vertical"
        >
          <ScrollArea.Thumb className="relative flex-1 rounded-full bg-[var(--color-foreground)]/30 before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2" />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner />
      </ScrollArea.Root>

      {paginationEnabled && !isLoading && (
        <div className="flex items-center justify-between px-1 text-sm text-[var(--color-foreground)]/60">
          <span>
            {data.length === 0
              ? 'No results'
              : `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, sortedData.length)} of ${sortedData.length}`}
          </span>
          <div className="flex items-center gap-1">
            <button
              aria-label="Previous page"
              className="rounded px-2 py-1 hover:bg-[var(--color-foreground)]/10 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | '…')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('…');
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === '…' ? (
                  <span key={`ellipsis-${idx}`} className="px-1">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    aria-current={currentPage === item ? 'page' : undefined}
                    className={`min-w-[2rem] rounded px-2 py-1 ${currentPage === item ? 'bg-[var(--color-foreground)] font-semibold text-[var(--color-background)]' : 'hover:bg-[var(--color-foreground)]/10'}`}
                    onClick={() => setCurrentPage(item as number)}
                  >
                    {item}
                  </button>
                ),
              )}
            <button
              aria-label="Next page"
              className="rounded px-2 py-1 hover:bg-[var(--color-foreground)]/10 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
