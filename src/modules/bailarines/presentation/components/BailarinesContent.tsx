"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { Bailarin, BailarinFilters } from "../../domain";
import { BailarinList } from "./BailarinList";
import { BailarinFiltersBar } from "./BailarinFiltersBar";
import { BailarinFormDialog } from "./BailarinFormDialog";
import { BailarinPagination } from "./BailarinPagination";

interface BailarinesContentProps {
  bailarines: Bailarin[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  filters: BailarinFilters;
  cuadrosMap: Record<string, string>;
}

export function BailarinesContent({
  bailarines,
  total,
  page,
  totalPages,
  pageSize,
  filters,
  cuadrosMap,
}: BailarinesContentProps) {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const cuadrosDisponibles = Object.entries(cuadrosMap ?? {}).map(
    ([id, name]) => ({
      id,
      name,
    }),
  );

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
            Bailarines
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {total} {total === 1 ? "bailarín" : "bailarines"} registrados
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-primary text-white font-bold text-[13px] px-[18px] py-3 h-auto rounded-[14px] gap-1.5"
        >
          <Plus className="h-[19px] w-[19px]" />
          Nuevo bailarín
        </Button>
      </div>

      {/* Filters */}
      <BailarinFiltersBar currentFilters={filters} />

      {/* List */}
      <BailarinList bailarines={bailarines} cuadrosMap={cuadrosMap} />

      {/* Pagination */}
      {totalPages > 1 && (
        <BailarinPagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
        />
      )}

      {/* Create Dialog */}
      <BailarinFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
        cuadrosDisponibles={cuadrosDisponibles}
      />
    </div>
  );
}
