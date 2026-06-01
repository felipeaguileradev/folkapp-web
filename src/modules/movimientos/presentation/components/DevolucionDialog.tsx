"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { devolverPrendaAction } from "../../infrastructure/actions";

interface DevolucionDialogProps {
  movimientoId: string | null;
  onClose: () => void;
}

export function DevolucionDialog({
  movimientoId,
  onClose,
}: DevolucionDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!movimientoId) return;

    setIsSubmitting(true);
    setError(null);

    const result = await devolverPrendaAction(movimientoId);

    if (result.success) {
      onClose();
      router.refresh();
    } else {
      setError(result.error);
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={!!movimientoId} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar devolución</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas registrar la devolución de esta prenda?
            La prenda volverá al estado &quot;Disponible&quot;.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Procesando..." : "Confirmar devolución"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
