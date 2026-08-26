import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable
} from "@tanstack/react-table";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "./EmptyState";

interface ReportTableProps<TData extends object> {
  title: string;
  description: string;
  columns: ColumnDef<TData>[];
  data: TData[];
  rowLabel: string;
  initialPageSize?: number;
  summary?: Array<{ label: string; value: string; tone?: string }>;
}

export function ReportTable<TData extends object>({
  columns,
  data,
  description,
  initialPageSize = 8,
  rowLabel,
  summary = [],
  title
}: ReportTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    initialState: {
      pagination: {
        pageSize: initialPageSize
      }
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  if (data.length === 0) {
    return (
      <EmptyState
        message={`No ${rowLabel.toLowerCase()} match the current shared prompts.`}
        title={`No ${rowLabel.toLowerCase()}`}
      />
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-panel">
      <div className="border-b border-slate-200 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-workday-ink">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {summary.map((item) => (
              <div className={`rounded-md border border-slate-200 px-3 py-2 ${item.tone ?? "bg-slate-50"}`} key={item.label}>
                <p className="text-xs font-semibold uppercase text-slate-500">{item.label}</p>
                <p className="mt-1 text-sm font-semibold text-workday-ink">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead className="bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sortDirection = header.column.getIsSorted();
                  const SortIcon = sortDirection === "asc" ? ChevronUp : sortDirection === "desc" ? ChevronDown : ChevronsUpDown;

                  return (
                    <th
                      className="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500"
                      key={header.id}
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          className="inline-flex items-center gap-1 text-left hover:text-workday-blue disabled:hover:text-slate-500"
                          disabled={!header.column.getCanSort()}
                          onClick={header.column.getToggleSortingHandler()}
                          type="button"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() ? <SortIcon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                        </button>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr className="hover:bg-blue-50/40" key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td className="border-b border-slate-100 px-4 py-3 text-slate-700" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <p>
          Showing {table.getRowModel().rows.length} of {data.length} {rowLabel.toLowerCase()}
        </p>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex h-9 items-center gap-1 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Previous
          </button>
          <span className="text-xs font-semibold uppercase text-slate-500">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <button
            className="inline-flex h-9 items-center gap-1 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            type="button"
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
