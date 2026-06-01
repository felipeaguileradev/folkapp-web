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
}

export function BailarinesContent({
  bailarines,
  total,
  page,
  totalPages,
  pageSize,
  filters,
}: BailarinesContentProps) {
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
          <h1 className="text-2xl font-bold tracking-tight">Bailarines</h1>
          <p className="text-muted-foreground">
            {total} {total === 1 ? "bailarín" : "bailarines"} registrados
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo bailarín
        </Button>
      </div>

      {/* Filters */}
      <BailarinFiltersBar currentFilters={filters} />

      {/* List */}
      <BailarinList bailarines={bailarines} />

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
      />
    </div>
  );
}
