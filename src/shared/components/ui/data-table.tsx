"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";

/** Definición de una columna del DataTable */
export interface ColumnDef<T> {
  id: string;
  header: string;
  accessorFn: (row: T) => React.ReactNode;
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
  className?: string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  pageSize?: number;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

type SortDirection = "asc" | "desc" | null;

/**
 * Componente genérico de tabla con paginación (10/page por defecto),
 * sorting por columna, y soporte para click en fila.
 * Todos los elementos interactivos tienen min 44x44px touch target.
 */
export function DataTable<T>({
  columns,
  data,
  pageSize = 10,
  emptyMessage = "No se encontraron resultados",
  onRowClick,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Sorting
  const sortedData = (() => {
    if (!sortColumn || !sortDirection) return data;

    const column = columns.find((c) => c.id === sortColumn);
    if (!column?.sortFn) return data;

    return [...data].sort((a, b) => {
      const result = column.sortFn!(a, b);
      return sortDirection === "desc" ? -result : result;
    });
  })();

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  const handleSort = (columnId: string) => {
    const column = columns.find((c) => c.id === columnId);
    if (!column?.sortable) return;

    if (sortColumn === columnId) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(columnId);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const getSortIcon = (columnId: string) => {
    if (sortColumn !== columnId) return <ChevronsUpDown className="h-3 w-3" />;
    if (sortDirection === "asc") return <ChevronUp className="h-3 w-3" />;
    return <ChevronDown className="h-3 w-3" />;
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id} className={cn(column.className)}>
                {column.sortable ? (
                  <button
                    onClick={() => handleSort(column.id)}
                    className="flex items-center gap-1 min-h-[44px] min-w-[44px] hover:text-foreground transition-colors"
                  >
                    {column.header}
                    {getSortIcon(column.id)}
                  </button>
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              className={onRowClick ? "cursor-pointer" : ""}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <TableCell key={column.id} className={cn(column.className)}>
                  {column.accessorFn(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1}-
            {Math.min(startIndex + pageSize, sortedData.length)} de{" "}
            {sortedData.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="min-w-[44px] min-h-[44px]"
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="min-w-[44px] min-h-[44px]"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
