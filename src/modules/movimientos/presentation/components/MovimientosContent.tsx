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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[30px] font-bold tracking-tight font-display">
            Movimientos
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Asignaciones, préstamos y traspasos
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
