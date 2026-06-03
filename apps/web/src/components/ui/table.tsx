import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Reusable dashboard table primitives. Centralizes table markup in the
 * app's existing sky/slate language. Each accepts a className for per-page
 * overrides.
 *
 * Wrap <Table> in a horizontally scrollable container at the call site, e.g.
 *   <div className="overflow-x-auto"><Table>…</Table></div>
 */
export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn('min-w-full text-sm', className)} {...props} />
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-sky-50/60', className)} {...props} />
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-sky-100 bg-white', className)} {...props} />
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('transition-colors hover:bg-sky-50/40', className)} {...props} />
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        'border-b border-sky-100 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Sortable header button. Renders an aria-sorted column header with an asc/desc
 * affordance. `direction` is null when this column is not the active sort.
 */
export function TableSortHead({
  label,
  direction,
  onSort,
  className,
}: {
  label: string
  direction: 'asc' | 'desc' | null
  onSort: () => void
  className?: string
}) {
  return (
    <TableHead
      aria-sort={direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'}
      className={cn('p-0', className)}
    >
      <button
        type="button"
        onClick={onSort}
        className="flex w-full items-center gap-1 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 transition-colors hover:text-sky-700"
      >
        {label}
        <span className={cn('text-[10px] leading-none', direction ? 'text-sky-600' : 'text-slate-300')} aria-hidden>
          {direction === 'asc' ? '▲' : direction === 'desc' ? '▼' : '↕'}
        </span>
      </button>
    </TableHead>
  )
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3 align-middle text-slate-700', className)} {...props} />
}
