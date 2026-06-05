import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUp, ArrowDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Spinner from '../Spinner';

/**
 * A reusable table powered by TanStack Table (@tanstack/react-table).
 *
 * KEY IDEA — "headless" library:
 * TanStack Table does NOT render any HTML for you. It only computes the table
 * state (which rows, which sort order, header groups, etc.). YOU render the
 * <table> markup. That's why we get full control over styling.
 *
 * KEY IDEA — "manual" / server-side mode:
 * Normally TanStack can sort & paginate the array you give it (client-side).
 * Here we set `manualPagination` and `manualSorting` to TRUE, which tells it:
 * "don't slice or sort the data yourself — the SERVER already did it. Just
 * display exactly the rows I handed you and tell me when the user wants a
 * different page/sort." We react to those events by re-fetching from the API.
 *
 * Props:
 *  - columns: column definitions (what each column shows)
 *  - data: the ONE page of rows returned by the server
 *  - pageCount: total number of pages (from the server)
 *  - total: total number of rows (for the "N results" label)
 *  - pagination / setPagination: { pageIndex, pageSize } state (lives in the page)
 *  - sorting / setSorting: [{ id, desc }] state (lives in the page)
 *  - isLoading: show a spinner while fetching
 *  - emptyMessage: shown when there are no rows
 */
export default function DataTable({
  columns,
  data,
  pageCount,
  total,
  pagination,
  setPagination,
  sorting,
  setSorting,
  isLoading,
  emptyMessage = 'No records found.',
}) {
  // useReactTable is the core hook. We pass it our data + columns + state, and
  // it returns a `table` object full of helper methods we use while rendering.
  const table = useReactTable({
    data,
    columns,
    pageCount, // server tells us how many pages exist
    state: { pagination, sorting }, // CONTROLLED: state lives outside the table
    manualPagination: true, // server paginates
    manualSorting: true, // server sorts
    // When the user clicks "next page" or a sortable header, TanStack calls
    // these with an updater. Because our state shape matches what it expects,
    // we can pass React's setState functions straight through.
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(), // the minimum row model we need
  });

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          {/* HEADER: built from table.getHeaderGroups(). Each header can be
              clickable to toggle sorting (if the column allows it). */}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted(); // 'asc' | 'desc' | false
                  return (
                    <th key={header.id}>
                      {/* A header can be sortable or plain. */}
                      <button
                        type="button"
                        disabled={!canSort}
                        onClick={header.column.getToggleSortingHandler()}
                        className={`flex items-center gap-1.5 ${canSort ? 'cursor-pointer select-none hover:text-light-200' : 'cursor-default'}`}
                      >
                        {/* flexRender draws whatever the column's `header` is
                            (a string or JSX). */}
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort &&
                          (sorted === 'asc' ? (
                            <ArrowUp size={13} className="text-green-500" />
                          ) : sorted === 'desc' ? (
                            <ArrowDown size={13} className="text-green-500" />
                          ) : (
                            <ChevronsUpDown size={13} className="text-dark-600" />
                          ))}
                      </button>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          {/* BODY: table.getRowModel().rows is the rows TanStack will show.
              In manual mode that's exactly the page the server returned. */}
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="flex justify-center py-16">
                    <Spinner size={28} />
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <p className="py-12 text-center text-sm text-dark-600">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {/* flexRender draws the column's `cell` function/JSX. */}
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER: pagination controls. The buttons call table helpers which
          update our pagination state, which re-runs the API query. */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-dark-500 px-5 py-4 sm:flex-row">
        <p className="text-12-regular text-dark-600">
          {total != null && (
            <>
              Showing page <span className="text-light-200">{pagination.pageIndex + 1}</span> of{' '}
              <span className="text-light-200">{Math.max(pageCount, 1)}</span> · {total} total
            </>
          )}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="btn-outline px-3 py-2 disabled:opacity-40"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="btn-outline px-3 py-2 disabled:opacity-40"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
