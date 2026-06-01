"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { Prenda } from "../../domain/entities";
import type { PrendaFilters } from "../../domain/ports";
import { PrendaTable } from "./PrendaTable";
import { PrendaFiltersBar } from "./PrendaFiltersBar";
import { PrendaSearchInput } from "./PrendaSearchInput";
import { PrendaPagination } from "./PrendaPagination";
import { PrendaFormDialog } from "./PrendaFormDialog";

interface InventarioContentProps {
  prendas: Prenda[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  filters: PrendaFilters;
  searchQuery: string;
}

export function InventarioContent({
  prendas,
  total,
  page,
  totalPages,
  pageSize,
  filters,
  searchQuery,
}: InventarioContentProps) {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    router.refresh();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventario</h1>
          <p className="text-muted-foreground">
            {total} {total === 1 ? "prenda" : "prendas"} en total
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva prenda
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <PrendaSearchInput defaultValue={searchQuery} />
        <PrendaFiltersBar currentFilters={filters} />
      </div>

      {/* Table */}
      <PrendaTable prendas={prendas} />

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
      />
    </div>
  );
}
