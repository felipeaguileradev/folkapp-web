"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";
import type { Prenda } from "../../domain/entities";
import type { Cuadro } from "@/modules/cuadros/domain/entities";
import { PrendaForm } from "./PrendaForm";
import { PrendaBulkForm } from "./PrendaBulkForm";

type FormMode = "individual" | "masivo";

interface PrendaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  prenda?: Prenda;
  cuadros: Cuadro[];
  /** Datos iniciales para pre-llenar el formulario (ej: al duplicar una prenda) */
  initialData?: Prenda;
}

export function PrendaFormDialog({
  open,
  onOpenChange,
  onSuccess,
  prenda,
  cuadros,
  initialData,
}: PrendaFormDialogProps) {
  const isEditing = !!prenda;
  const isDuplicating = !!initialData && !isEditing;
  const [mode, setMode] = useState<FormMode>("individual");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Editar prenda"
              : isDuplicating
                ? "Crear copia de prenda"
                : "Nueva prenda"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos de la prenda"
              : isDuplicating
                ? "Se creará una nueva prenda con los mismos datos. El código se generará automáticamente."
                : "Completa los datos para registrar prendas en el inventario"}
          </DialogDescription>
        </DialogHeader>

        {/* Mode toggle (solo en creación, no en duplicado) */}
        {!isEditing && !isDuplicating && (
          <div className="flex gap-1 p-1 rounded-lg bg-muted w-fit">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-md text-xs px-3 h-8",
                mode === "individual" &&
                  "bg-background shadow-sm text-foreground",
              )}
              onClick={() => setMode("individual")}
            >
              Individual
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-md text-xs px-3 h-8",
                mode === "masivo" && "bg-background shadow-sm text-foreground",
              )}
              onClick={() => setMode("masivo")}
            >
              Creación masiva
            </Button>
          </div>
        )}

        {/* Form content */}
        {mode === "individual" || isEditing || isDuplicating ? (
          <PrendaForm
            prenda={prenda}
            onSuccess={onSuccess}
            cuadros={cuadros}
            initialData={initialData}
          />
        ) : (
          <PrendaBulkForm onSuccess={onSuccess} cuadros={cuadros} />
        )}
      </DialogContent>
    </Dialog>
  );
}
