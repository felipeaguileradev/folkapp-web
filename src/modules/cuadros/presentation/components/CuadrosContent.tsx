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
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cuadros</h1>
          <p className="text-muted-foreground">
            {cuadros.length} {cuadros.length === 1 ? "cuadro" : "cuadros"}{" "}
            registrados
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
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
