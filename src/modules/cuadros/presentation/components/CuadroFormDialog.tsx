"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import type { Cuadro } from "../../domain/entities";
import { CuadroForm } from "./CuadroForm";

interface CuadroFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  cuadro?: Cuadro;
}

export function CuadroFormDialog({
  open,
  onOpenChange,
  onSuccess,
  cuadro,
}: CuadroFormDialogProps) {
  const isEditing = !!cuadro;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar cuadro" : "Nuevo cuadro"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos del cuadro"
              : "Completa los datos para registrar un nuevo cuadro de baile"}
          </DialogDescription>
        </DialogHeader>
        <CuadroForm cuadro={cuadro} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}
