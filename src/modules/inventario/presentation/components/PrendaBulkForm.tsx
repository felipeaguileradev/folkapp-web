"use client";

import { useState } from "react";
import { Minus, Plus, Copy } from "lucide-react";
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
import { Separator } from "@/shared/components/ui/separator";
import type {
  Genero,
  Categoria,
  EstadoPrenda,
  Propietario,
} from "@/shared/types";
import type { Cuadro } from "@/modules/cuadros/domain/entities";
import {
  crearPrendasMasivoAction,
  type BulkItemOverride,
} from "../../infrastructure/actions";

interface PrendaBulkFormProps {
  onSuccess: () => void;
  cuadros: Cuadro[];
}

const GENERO_OPTIONS: Genero[] = ["Masculino", "Femenino", "Unisex"];
const CATEGORIA_OPTIONS: Categoria[] = [
  "Tocado",
  "Ropa superior",
  "Ropa inferior",
  "Calzado",
  "Accesorio",
  "Joyería",
];
const ESTADO_OPTIONS: EstadoPrenda[] = [
  "Disponible",
  "En uso",
  "En reparación",
  "Faltante",
  "Prestada",
  "Dada de baja",
];
const PROPIETARIO_OPTIONS: Propietario[] = ["Ballet", "Personal"];

interface ItemOverrideState {
  tallaONumero: string;
  identificadorFisico: string;
  color: string;
}

export function PrendaBulkForm({ onSuccess, cuadros }: PrendaBulkFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Base form state
  const [nombre, setNombre] = useState("");
  const [cuadroId, setCuadroId] = useState("");
  const [genero, setGenero] = useState<Genero | "">("");
  const [categoria, setCategoria] = useState<Categoria | "">("");
  const [estado, setEstado] = useState<EstadoPrenda>("Disponible");
  const [propietario, setPropietario] = useState<Propietario>("Ballet");
  const [color, setColor] = useState("");
  const [tallaONumero, setTallaONumero] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Bulk quantity
  const [cantidad, setCantidad] = useState(6);

  // Individual overrides
  const [showOverrides, setShowOverrides] = useState(false);
  const [overrides, setOverrides] = useState<ItemOverrideState[]>(
    Array.from({ length: 6 }, () => ({
      tallaONumero: "",
      identificadorFisico: "",
      color: "",
    })),
  );

  const handleCantidadChange = (newCantidad: number) => {
    const clamped = Math.max(1, Math.min(50, newCantidad));
    setCantidad(clamped);

    // Adjust overrides array
    setOverrides((prev) => {
      if (clamped > prev.length) {
        return [
          ...prev,
          ...Array.from({ length: clamped - prev.length }, () => ({
            tallaONumero: "",
            identificadorFisico: "",
            color: "",
          })),
        ];
      }
      return prev.slice(0, clamped);
    });
  };

  const updateOverride = (
    index: number,
    field: keyof ItemOverrideState,
    value: string,
  ) => {
    setOverrides((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (!nombre || !cuadroId || !genero || !categoria) {
        setError("Completa todos los campos obligatorios");
        setIsSubmitting(false);
        return;
      }

      const cuadro = cuadros.find((c) => c.id === cuadroId);
      if (!cuadro) {
        setError("Selecciona un cuadro válido");
        setIsSubmitting(false);
        return;
      }

      const baseData = {
        nombre,
        cuadroId,
        genero: genero as Genero,
        categoria: categoria as Categoria,
        estado,
        propietario,
        color: color || null,
        tallaONumero: tallaONumero || null,
        identificadorFisico: null as string | null,
        ubicacion: ubicacion || null,
        comentarios: comentarios || null,
        fechaIngreso: new Date(fechaIngreso),
      };

      // Build overrides only if they have values
      let bulkOverrides: BulkItemOverride[] | undefined;
      if (showOverrides) {
        bulkOverrides = overrides.map((ov) => ({
          tallaONumero: ov.tallaONumero || undefined,
          identificadorFisico: ov.identificadorFisico || undefined,
          color: ov.color || undefined,
        }));

        // If all overrides are empty, don't send them
        const hasAnyOverride = bulkOverrides.some(
          (ov) => ov.tallaONumero || ov.identificadorFisico || ov.color,
        );
        if (!hasAnyOverride) {
          bulkOverrides = undefined;
        }
      }

      const result = await crearPrendasMasivoAction(
        baseData,
        cuadro.nombre as "Huaso" | "Norte" | "Rapa Nui",
        cantidad,
        bulkOverrides,
      );

      if (result.success) {
        setSuccessMessage(
          `Se crearon ${result.data.length} prendas exitosamente`,
        );
        setTimeout(() => onSuccess(), 1500);
      } else {
        setError(result.error);
      }
    } catch {
      setError("Error inesperado al crear las prendas");
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
      {successMessage && (
        <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {/* Cantidad */}
      <div className="space-y-2">
        <Label>Cantidad de prendas a crear</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => handleCantidadChange(cantidad - 1)}
            disabled={cantidad <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={cantidad}
            onChange={(e) => handleCantidadChange(Number(e.target.value))}
            className="w-20 text-center"
            min={1}
            max={50}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => handleCantidadChange(cantidad + 1)}
            disabled={cantidad >= 50}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground ml-2">
            prendas iguales
          </span>
        </div>
      </div>

      <Separator />

      {/* Datos base compartidos */}
      <p className="text-sm font-medium text-muted-foreground">
        Datos comunes para todas las prendas
      </p>

      {/* Nombre */}
      <div className="space-y-2">
        <Label htmlFor="bulk-nombre">Nombre *</Label>
        <Input
          id="bulk-nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Manta huaso"
          maxLength={100}
          required
        />
      </div>

      {/* Cuadro y Género */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Cuadro *</Label>
          <Select value={cuadroId} onValueChange={setCuadroId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cuadro" />
            </SelectTrigger>
            <SelectContent>
              {cuadros.map((cuadro) => (
                <SelectItem key={cuadro.id} value={cuadro.id}>
                  {cuadro.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Género *</Label>
          <Select
            value={genero}
            onValueChange={(val) => setGenero(val as Genero)}
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
      </div>

      {/* Categoría y Estado */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Categoría *</Label>
          <Select
            value={categoria}
            onValueChange={(val) => setCategoria(val as Categoria)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIA_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Estado</Label>
          <Select
            value={estado}
            onValueChange={(val) => setEstado(val as EstadoPrenda)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              {ESTADO_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Propietario y Fecha */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Propietario</Label>
          <Select
            value={propietario}
            onValueChange={(val) => setPropietario(val as Propietario)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar propietario" />
            </SelectTrigger>
            <SelectContent>
              {PROPIETARIO_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bulk-fechaIngreso">Fecha de ingreso</Label>
          <Input
            id="bulk-fechaIngreso"
            type="date"
            value={fechaIngreso}
            onChange={(e) => setFechaIngreso(e.target.value)}
          />
        </div>
      </div>

      {/* Color, Talla, Ubicación */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="bulk-color">Color</Label>
          <Input
            id="bulk-color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="Ej: Negro"
            maxLength={50}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bulk-talla">Talla / Número</Label>
          <Input
            id="bulk-talla"
            value={tallaONumero}
            onChange={(e) => setTallaONumero(e.target.value)}
            placeholder="Ej: M, 42"
            maxLength={20}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bulk-ubicacion">Ubicación</Label>
          <Input
            id="bulk-ubicacion"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            placeholder="Ej: Armario 2"
            maxLength={100}
          />
        </div>
      </div>

      {/* Comentarios */}
      <div className="space-y-2">
        <Label htmlFor="bulk-comentarios">Comentarios</Label>
        <Textarea
          id="bulk-comentarios"
          value={comentarios}
          onChange={(e) => setComentarios(e.target.value)}
          placeholder="Notas adicionales..."
          maxLength={500}
          rows={2}
        />
      </div>

      <Separator />

      {/* Toggle para personalizar individualmente */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Personalizar individualmente</p>
          <p className="text-xs text-muted-foreground">
            Editar talla, color o identificador físico por cada unidad
          </p>
        </div>
        <Button
          type="button"
          variant={showOverrides ? "default" : "outline"}
          size="sm"
          onClick={() => setShowOverrides(!showOverrides)}
          className="gap-1.5"
        >
          <Copy className="h-4 w-4" />
          {showOverrides ? "Ocultar" : "Personalizar"}
        </Button>
      </div>

      {/* Individual overrides */}
      {showOverrides && (
        <div className="space-y-2 max-h-[200px] overflow-y-auto rounded-md border p-3">
          <div className="grid grid-cols-[40px_1fr_1fr_1fr] gap-2 text-xs font-medium text-muted-foreground sticky top-0 bg-background pb-1">
            <span>#</span>
            <span>Talla</span>
            <span>Color</span>
            <span>Identificador</span>
          </div>
          {overrides.slice(0, cantidad).map((ov, index) => (
            <div
              key={index}
              className="grid grid-cols-[40px_1fr_1fr_1fr] gap-2 items-center"
            >
              <span className="text-xs text-muted-foreground font-medium">
                {index + 1}
              </span>
              <Input
                value={ov.tallaONumero}
                onChange={(e) =>
                  updateOverride(index, "tallaONumero", e.target.value)
                }
                placeholder={tallaONumero || "—"}
                className="h-8 text-xs"
                maxLength={20}
              />
              <Input
                value={ov.color}
                onChange={(e) => updateOverride(index, "color", e.target.value)}
                placeholder={color || "—"}
                className="h-8 text-xs"
                maxLength={50}
              />
              <Input
                value={ov.identificadorFisico}
                onChange={(e) =>
                  updateOverride(index, "identificadorFisico", e.target.value)
                }
                placeholder="—"
                className="h-8 text-xs"
                maxLength={50}
              />
            </div>
          ))}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Creando..."
            : `Crear ${cantidad} ${cantidad === 1 ? "prenda" : "prendas"}`}
        </Button>
      </div>
    </form>
  );
}
