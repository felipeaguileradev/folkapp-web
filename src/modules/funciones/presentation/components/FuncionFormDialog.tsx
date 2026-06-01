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
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { crearFuncionAction } from "../../infrastructure/actions";

interface FuncionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Cuadros disponibles (en producción vendrían de la DB)
const CUADROS = [
  { id: "huaso", name: "Huaso" },
  { id: "norte", name: "Norte" },
  { id: "rapa-nui", name: "Rapa Nui" },
] as const;

export function FuncionFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: FuncionFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [lugar, setLugar] = useState("");
  const [cuadrosSeleccionados, setCuadrosSeleccionados] = useState<string[]>(
    [],
  );
  const [bailarinesIds, setBailarinesIds] = useState("");

  const handleToggleCuadro = (cuadroId: string) => {
    setCuadrosSeleccionados((prev) =>
      prev.includes(cuadroId)
        ? prev.filter((id) => id !== cuadroId)
        : [...prev, cuadroId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!nombre || cuadrosSeleccionados.length === 0) {
        setError("Completa nombre y selecciona al menos un cuadro");
        setIsSubmitting(false);
        return;
      }

      // Parsear IDs de bailarines (separados por coma o nueva línea)
      const bailarines = bailarinesIds
        .split(/[,\n]/)
        .map((id) => id.trim())
        .filter(Boolean);

      if (bailarines.length === 0) {
        setError("Agrega al menos un bailarín");
        setIsSubmitting(false);
        return;
      }

      const result = await crearFuncionAction({
        nombre: nombre.trim(),
        fecha: new Date(fecha),
        lugar: lugar.trim() || null,
        cuadrosQueSePresenten: cuadrosSeleccionados,
        bailarinesConvocados: bailarines,
      });

      if (result.success) {
        // Reset form
        setNombre("");
        setLugar("");
        setCuadrosSeleccionados([]);
        setBailarinesIds("");
        onSuccess();
      } else {
        setError(result.error);
      }
    } catch {
      setError("Error inesperado al crear la función");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva función</DialogTitle>
          <DialogDescription>
            Crea una función y se generará automáticamente el checklist de
            vestuario
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Gala Aniversario 2026"
              maxLength={100}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha *</Label>
              <Input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lugar">Lugar</Label>
              <Input
                id="lugar"
                value={lugar}
                onChange={(e) => setLugar(e.target.value)}
                placeholder="Ej: Teatro Municipal"
                maxLength={200}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cuadros que se presentan *</Label>
            <div className="flex flex-wrap gap-2">
              {CUADROS.map((cuadro) => {
                const isSelected = cuadrosSeleccionados.includes(cuadro.id);
                return (
                  <Button
                    key={cuadro.id}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggleCuadro(cuadro.id)}
                    className="min-w-[44px] min-h-[44px]"
                  >
                    {cuadro.name}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bailarines">
              Bailarines convocados * (IDs separados por coma)
            </Label>
            <Input
              id="bailarines"
              value={bailarinesIds}
              onChange={(e) => setBailarinesIds(e.target.value)}
              placeholder="uuid1, uuid2, uuid3..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear función"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
