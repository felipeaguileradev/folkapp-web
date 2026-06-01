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
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { asignarPrendaAction } from "../../infrastructure/actions";

interface AsignacionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prendaId: string;
  bailarinId?: string;
}

export function AsignacionDialog({
  open,
  onOpenChange,
  prendaId,
  bailarinId: defaultBailarinId,
}: AsignacionDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bailarinId, setBailarinId] = useState(defaultBailarinId ?? "");
  const [fechaDevolucion, setFechaDevolucion] = useState("");
  const [observacion, setObservacion] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bailarinId) {
      setError("Selecciona un bailarín");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await asignarPrendaAction({
      prendaId,
      bailarinId,
      fechaDevolucionEsperada: fechaDevolucion
        ? new Date(fechaDevolucion)
        : null,
      observacion: observacion || null,
    });

    if (result.success) {
      onOpenChange(false);
      router.refresh();
    } else {
      setError(result.error);
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar prenda</DialogTitle>
          <DialogDescription>
            Asigna esta prenda a un bailarín. La prenda pasará al estado
            &quot;En uso&quot;.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="bailarinId">ID del bailarín *</Label>
            <Input
              id="bailarinId"
              value={bailarinId}
              onChange={(e) => setBailarinId(e.target.value)}
              placeholder="UUID del bailarín"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaDevolucion">
              Fecha de devolución esperada
            </Label>
            <Input
              id="fechaDevolucion"
              type="date"
              value={fechaDevolucion}
              onChange={(e) => setFechaDevolucion(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacion">Observación</Label>
            <Textarea
              id="observacion"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Notas adicionales..."
              maxLength={500}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Asignando..." : "Asignar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
