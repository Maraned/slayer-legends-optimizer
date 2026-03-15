import { ReactNode } from 'react';

/** Defines a single column in the DataTable */
export interface ColumnDef<T> {
  /** Unique key for this column */
  key: string;
  /** Column header label */
  header: string;
  /** Property key to read from row data, or a function returning a rendered value */
  accessor: keyof T | ((row: T) => ReactNode);
  /** Whether this column is sortable. Defaults to false. */
  sortable?: boolean;
  /** Optional CSS class applied to header and data cells in this column */
  className?: string;
}

/** Sort direction */
export type SortDirection = 'asc' | 'desc';

/** Current sort state */
export interface SortState {
  key: string;
  direction: SortDirection;
}

/** Props for the DataTable component */
export interface DataTableProps<T> {
  /** Row data array */
  data: T[];
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Number of rows per page. Omit or set to 0 to disable pagination. */
  pageSize?: number;
  /** Enable row selection via checkboxes */
  selectable?: boolean;
  /** Callback fired when the selected rows change */
  onSelectionChange?: (selectedRows: T[]) => void;
  /** Message shown when data is empty */
  emptyMessage?: string;
  /** Shows a loading skeleton when true */
  isLoading?: boolean;
  /** Optional accessible label for the table */
  'aria-label'?: string;
  /** Additional CSS class on the wrapper element */
  className?: string;
}
