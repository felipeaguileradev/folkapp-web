"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, BarChart3 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { Prenda } from "../../domain/entities";
import type { PrendaFilters, InventarioSummaryItem } from "../../domain/ports";
import type { Cuadro } from "@/modules/cuadros/domain/entities";
import { PrendaTable } from "./PrendaTable";
import { PrendaFiltersBar } from "./PrendaFiltersBar";
import { PrendaSearchInput } from "./PrendaSearchInput";
import { PrendaPagination } from "./PrendaPagination";
import { PrendaFormDialog } from "./PrendaFormDialog";
import { InventarioSummaryDialog } from "./InventarioSummaryDialog";

interface InventarioContentProps {
  prendas: Prenda[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  filters: PrendaFilters;
  searchQuery: string;
  cuadros: Cuadro[];
  summary: InventarioSummaryItem[];
}

export function InventarioContent({
  prendas,
  total,
  page,
  totalPages,
  pageSize,
  filters,
  searchQuery,
  cuadros,
  summary,
}: InventarioContentProps) {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    router.refresh();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[30px] font-bold tracking-tight font-display">
            Inventario
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {total} {total === 1 ? "prenda" : "prendas"} en total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsSummaryOpen(true)}
            className="font-bold text-[13px] px-[18px] py-3 h-auto rounded-[14px] gap-1.5"
          >
            <BarChart3 className="h-[19px] w-[19px]" />
            Resumen
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-primary text-white font-bold text-[13px] px-[18px] py-3 h-auto rounded-[14px] gap-1.5"
          >
            <Plus className="h-[19px] w-[19px]" />
            Nueva prenda
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <PrendaSearchInput defaultValue={searchQuery} />
        <PrendaFiltersBar currentFilters={filters} cuadros={cuadros} />
      </div>

      {/* Table */}
      <PrendaTable prendas={prendas} cuadros={cuadros} />

      {/* Pagination */}
      {totalPages > 1 && (
        <PrendaPagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
        />
      )}

      {/* Create Dialog */}
      <PrendaFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
        cuadros={cuadros}
      />

      {/* Summary Dialog */}
      <InventarioSummaryDialog
        open={isSummaryOpen}
        onOpenChange={setIsSummaryOpen}
        summary={summary}
        cuadros={cuadros}
      />
    </div>
  );
}
