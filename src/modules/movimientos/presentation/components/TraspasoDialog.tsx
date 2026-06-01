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
import { traspasarPrendaAction } from "../../infrastructure/actions";

interface TraspasoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prendaId: string;
  bailarinOrigenId: string;
}

export function TraspasoDialog({
  open,
  onOpenChange,
  prendaId,
  bailarinOrigenId,
}: TraspasoDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bailarinDestinoId, setBailarinDestinoId] = useState("");
  const [observacion, setObservacion] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bailarinDestinoId) {
      setError("Selecciona un bailarín destino");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await traspasarPrendaAction({
      prendaId,
      bailarinOrigenId,
      bailarinDestinoId,
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
          <DialogTitle>Traspasar prenda</DialogTitle>
          <DialogDescription>
            Transfiere esta prenda a otro bailarín. El estado de la prenda se
            mantiene.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="bailarinDestinoId">ID del bailarín destino *</Label>
            <Input
              id="bailarinDestinoId"
              value={bailarinDestinoId}
              onChange={(e) => setBailarinDestinoId(e.target.value)}
              placeholder="UUID del bailarín destino"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacion">Observación</Label>
            <Textarea
              id="observacion"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Motivo del traspaso..."
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
              {isSubmitting ? "Traspasando..." : "Traspasar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
