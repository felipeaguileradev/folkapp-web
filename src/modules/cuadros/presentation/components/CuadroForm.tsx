"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import type { Cuadro } from "../../domain/entities";
import {
  crearCuadroAction,
  actualizarCuadroAction,
} from "../../infrastructure/actions";

interface CuadroFormProps {
  cuadro?: Cuadro;
  onSuccess: () => void;
}

export function CuadroForm({ cuadro, onSuccess }: CuadroFormProps) {
  const isEditing = !!cuadro;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState(cuadro?.nombre ?? "");
  const [zonaGeografica, setZonaGeografica] = useState(
    cuadro?.zonaGeografica ?? "",
  );
  const [descripcion, setDescripcion] = useState(cuadro?.descripcion ?? "");
  const [colorUi, setColorUi] = useState(cuadro?.colorUi ?? "#0F6E56");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!nombre || !zonaGeografica || !colorUi) {
        setError("Completa todos los campos obligatorios");
        setIsSubmitting(false);
        return;
      }

      const formData = {
        nombre,
        zonaGeografica,
        descripcion: descripcion || null,
        colorUi,
      };

      if (isEditing) {
        const result = await actualizarCuadroAction(cuadro.id, formData);
        if (result.success) {
          onSuccess();
        } else {
          setError(result.error);
        }
      } else {
        const result = await crearCuadroAction(formData);
        if (result.success) {
          onSuccess();
        } else {
          setError(result.error);
        }
      }
    } catch {
      setError("Error inesperado al guardar el cuadro");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
          placeholder="Ej: Huaso"
          maxLength={50}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="zonaGeografica">Zona geográfica *</Label>
        <Input
          id="zonaGeografica"
          value={zonaGeografica}
          onChange={(e) => setZonaGeografica(e.target.value)}
          placeholder="Ej: Zona Central"
          maxLength={100}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="colorUi">Color UI *</Label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            id="colorUi"
            value={colorUi}
            onChange={(e) => setColorUi(e.target.value)}
            className="h-10 w-10 cursor-pointer rounded border"
          />
          <Input
            value={colorUi}
            onChange={(e) => setColorUi(e.target.value)}
            placeholder="#0F6E56"
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción del cuadro..."
          maxLength={500}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : "Crear cuadro"}
        </Button>
      </div>
    </form>
  );
}
