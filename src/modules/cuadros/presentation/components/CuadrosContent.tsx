"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { Cuadro } from "../../domain/entities";
import { CuadroGrid } from "./CuadroGrid";
import { CuadroFormDialog } from "./CuadroFormDialog";

interface CuadrosContentProps {
  cuadros: Cuadro[];
}

export function CuadrosContent({ cuadros }: CuadrosContentProps) {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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
            Cuadros
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {cuadros.length} {cuadros.length === 1 ? "cuadro" : "cuadros"}{" "}
            registrados
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-primary text-white font-bold text-[13px] px-[18px] py-3 h-auto rounded-[14px] gap-1.5"
        >
          <Plus className="h-[19px] w-[19px]" />
          Nuevo cuadro
        </Button>
      </div>

      {/* Grid */}
      <CuadroGrid cuadros={cuadros} />

      {/* Create Dialog */}
      <CuadroFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
