"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
import type { Movimiento } from "../../domain/entities";
import type { MovimientoFilters } from "../../domain/ports";
import { MovimientoList } from "./MovimientoList";
import { MovimientoFiltersBar } from "./MovimientoFiltersBar";

interface MovimientosContentProps {
  movimientos: Movimiento[];
  filters: MovimientoFilters;
}

export function MovimientosContent({
  movimientos,
  filters,
}: MovimientosContentProps) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Movimientos</h1>
          <p className="text-muted-foreground">
            {movimientos.length}{" "}
            {movimientos.length === 1 ? "movimiento" : "movimientos"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <MovimientoFiltersBar currentFilters={filters} />

      {/* List */}
      <MovimientoList movimientos={movimientos} />
    </div>
  );
}
