"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { Bailarin, TallaPersonalizada } from "../../domain";
import type { GeneroBailarin } from "@/shared/types";
import {
  crearBailarinAction,
  actualizarBailarinAction,
} from "../../infrastructure/actions";

interface CuadroOption {
  id: string;
  name: string;
}

interface BailarinFormProps {
  bailarin?: Bailarin;
  cuadrosDisponibles: CuadroOption[];
  onSuccess: () => void;
}

const GENERO_OPTIONS: GeneroBailarin[] = ["Masculino", "Femenino"];
const MAX_CUSTOM_TALLAS = 5;

export function BailarinForm({
  bailarin,
  cuadrosDisponibles,
  onSuccess,
}: BailarinFormProps) {
  const isEditing = !!bailarin;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [nombreCompleto, setNombreCompleto] = useState(
    bailarin?.nombreCompleto ?? "",
  );
  const [genero, setGenero] = useState<GeneroBailarin | "">(
    bailarin?.genero ?? "",
  );
  const [cuadrosActivos, setCuadrosActivos] = useState<string[]>(() => {
    const ids = bailarin?.cuadrosActivos ?? [];
    // Solo mantener IDs que existan en la lista de cuadros disponibles
    const validIds = cuadrosDisponibles.map((c) => c.id);
    return ids.filter((id) => validIds.includes(id));
  });
  const [fechaIngreso, setFechaIngreso] = useState(
    bailarin?.fechaIngreso
      ? bailarin.fechaIngreso.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  );
  const [notas, setNotas] = useState(bailarin?.notas ?? "");

  // Tallas
  const [camisa, setCamisa] = useState(bailarin?.tallas.camisa ?? "");
  const [pantalon, setPantalon] = useState(bailarin?.tallas.pantalon ?? "");
  const [sombrero, setSombrero] = useState(bailarin?.tallas.sombrero ?? "");
  const [calzado, setCalzado] = useState(bailarin?.tallas.calzado ?? "");
  const [personalizados, setPersonalizados] = useState<TallaPersonalizada[]>(
    bailarin?.tallas.personalizados ?? [],
  );

  const handleToggleCuadro = (cuadroId: string) => {
    setCuadrosActivos((prev) => {
      if (prev.includes(cuadroId)) {
        return prev.filter((id) => id !== cuadroId);
      }
      return [...prev, cuadroId];
    });
  };

  const handleAddCustomTalla = () => {
    if (personalizados.length >= MAX_CUSTOM_TALLAS) return;
    setPersonalizados([...personalizados, { nombre: "", valor: "" }]);
  };

  const handleRemoveCustomTalla = (index: number) => {
    setPersonalizados(personalizados.filter((_, i) => i !== index));
  };

  const handleCustomTallaChange = (
    index: number,
    field: "nombre" | "valor",
    value: string,
  ) => {
    const updated = [...personalizados];
    updated[index] = { ...updated[index], [field]: value };
    setPersonalizados(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!nombreCompleto || !genero) {
        setError("Completa todos los campos obligatorios (nombre, género)");
        setIsSubmitting(false);
        return;
      }

      const formData = {
        nombreCompleto,
        genero,
        cuadrosActivos,
        tallas: {
          camisa: camisa || null,
          pantalon: pantalon || null,
          sombrero: sombrero || null,
          calzado: calzado || null,
          personalizados: personalizados.filter((p) => p.nombre && p.valor),
        },
        activo: bailarin?.activo ?? true,
        fechaIngreso: new Date(fechaIngreso),
        notas: notas || null,
      };

      if (isEditing) {
        const result = await actualizarBailarinAction(bailarin.id, formData);
        if (result.success) {
          onSuccess();
        } else {
          setError(result.error);
        }
      } else {
        const result = await crearBailarinAction(formData);
        if (result.success) {
          onSuccess();
        } else {
          setError(result.error);
        }
      }
    } catch {
      setError("Error inesperado al guardar el bailarín");
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

      {/* Nombre */}
      <div className="space-y-2">
        <Label htmlFor="nombreCompleto">Nombre completo *</Label>
        <Input
          id="nombreCompleto"
          value={nombreCompleto}
          onChange={(e) => setNombreCompleto(e.target.value)}
          placeholder="Ej: Felipe Araya"
          maxLength={100}
          required
        />
      </div>

      {/* Género y Fecha */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Género *</Label>
          <Select
            value={genero}
            onValueChange={(val) => setGenero(val as GeneroBailarin)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar género" />
            </SelectTrigger>
            <SelectContent>
              {GENERO_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fechaIngreso">Fecha de ingreso</Label>
          <Input
            id="fechaIngreso"
            type="date"
            value={fechaIngreso}
            onChange={(e) => setFechaIngreso(e.target.value)}
          />
        </div>
      </div>

      {/* Cuadros */}
      <div className="space-y-2">
        <Label>Cuadros activos</Label>
        <div className="flex flex-wrap gap-2">
          {cuadrosDisponibles.map((cuadro) => {
            const isSelected = cuadrosActivos.includes(cuadro.id);
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
        <p className="text-xs text-muted-foreground">
          {cuadrosActivos.length} seleccionados
        </p>
      </div>

      {/* Tallas predefinidas */}
      <div className="space-y-2">
        <Label>Tallas</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="camisa" className="text-xs text-muted-foreground">
              Camisa
            </Label>
            <Input
              id="camisa"
              value={camisa}
              onChange={(e) => setCamisa(e.target.value)}
              placeholder="Ej: M, L"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pantalon" className="text-xs text-muted-foreground">
              Pantalón
            </Label>
            <Input
              id="pantalon"
              value={pantalon}
              onChange={(e) => setPantalon(e.target.value)}
              placeholder="Ej: 38, 40"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sombrero" className="text-xs text-muted-foreground">
              Sombrero
            </Label>
            <Input
              id="sombrero"
              value={sombrero}
              onChange={(e) => setSombrero(e.target.value)}
              placeholder="Ej: 56, 58"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="calzado" className="text-xs text-muted-foreground">
              Calzado
            </Label>
            <Input
              id="calzado"
              value={calzado}
              onChange={(e) => setCalzado(e.target.value)}
              placeholder="Ej: 42, 43"
            />
          </div>
        </div>
      </div>

      {/* Tallas personalizadas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">
            Tallas personalizadas ({personalizados.length}/{MAX_CUSTOM_TALLAS})
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddCustomTalla}
            disabled={personalizados.length >= MAX_CUSTOM_TALLAS}
          >
            <Plus className="mr-1 h-3 w-3" />
            Agregar
          </Button>
        </div>
        {personalizados.map((custom, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={custom.nombre}
              onChange={(e) =>
                handleCustomTallaChange(index, "nombre", e.target.value)
              }
              placeholder="Nombre"
              maxLength={30}
              className="flex-1"
            />
            <Input
              value={custom.valor}
              onChange={(e) =>
                handleCustomTallaChange(index, "valor", e.target.value)
              }
              placeholder="Valor"
              maxLength={30}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveCustomTalla(index)}
              className="min-w-[44px] min-h-[44px]"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      {/* Notas */}
      <div className="space-y-2">
        <Label htmlFor="notas">Notas</Label>
        <Textarea
          id="notas"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Notas adicionales..."
          maxLength={500}
          rows={3}
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : "Registrar bailarín"}
        </Button>
      </div>
    </form>
  );
}
