"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import type { Prenda } from "../../domain/entities";
import { PrendaForm } from "./PrendaForm";

interface PrendaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  prenda?: Prenda;
}

export function PrendaFormDialog({
  open,
  onOpenChange,
  onSuccess,
  prenda,
}: PrendaFormDialogProps) {
  const isEditing = !!prenda;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar prenda" : "Nueva prenda"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos de la prenda"
              : "Completa los datos para registrar una nueva prenda en el inventario"}
          </DialogDescription>
        </DialogHeader>
        <PrendaForm prenda={prenda} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}
