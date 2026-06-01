"use client";

import { useState } from "react";
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
import type { Prenda } from "../../domain/entities";
import type {
  Genero,
  Categoria,
  EstadoPrenda,
  Propietario,
} from "@/shared/types";
import {
  crearPrendaAction,
  actualizarPrendaAction,
} from "../../infrastructure/actions";
import { ImageUploader } from "./ImageUploader";

interface PrendaFormProps {
  prenda?: Prenda;
  onSuccess: () => void;
}

// Mapeo de cuadroId a nombre (se usará para generar código)
// En producción esto vendría de la DB, pero por ahora usamos los 3 cuadros conocidos
const CUADROS = [
  { id: "huaso", name: "Huaso" as const },
  { id: "norte", name: "Norte" as const },
  { id: "rapa-nui", name: "Rapa Nui" as const },
] as const;

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

export function PrendaForm({ prenda, onSuccess }: PrendaFormProps) {
  const isEditing = !!prenda;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [nombre, setNombre] = useState(prenda?.nombre ?? "");
  const [cuadroId, setCuadroId] = useState(prenda?.cuadroId ?? "");
  const [genero, setGenero] = useState<Genero | "">(prenda?.genero ?? "");
  const [categoria, setCategoria] = useState<Categoria | "">(
    prenda?.categoria ?? "",
  );
  const [estado, setEstado] = useState<EstadoPrenda>(
    prenda?.estado ?? "Disponible",
  );
  const [propietario, setPropietario] = useState<Propietario>(
    prenda?.propietario ?? "Ballet",
  );
  const [color, setColor] = useState(prenda?.color ?? "");
  const [tallaONumero, setTallaONumero] = useState(prenda?.tallaONumero ?? "");
  const [identificadorFisico, setIdentificadorFisico] = useState(
    prenda?.identificadorFisico ?? "",
  );
  const [ubicacion, setUbicacion] = useState(prenda?.ubicacion ?? "");
  const [comentarios, setComentarios] = useState(prenda?.comentarios ?? "");
  const [fechaIngreso, setFechaIngreso] = useState(
    prenda?.fechaIngreso
      ? prenda.fechaIngreso.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!nombre || !cuadroId || !genero || !categoria) {
        setError("Completa todos los campos obligatorios");
        setIsSubmitting(false);
        return;
      }

      if (isEditing) {
        const result = await actualizarPrendaAction(prenda.id, {
          nombre,
          cuadroId,
          genero,
          categoria,
          estado,
          propietario,
          color: color || null,
          tallaONumero: tallaONumero || null,
          identificadorFisico: identificadorFisico || null,
          ubicacion: ubicacion || null,
          comentarios: comentarios || null,
          fechaIngreso: new Date(fechaIngreso),
        });

        if (result.success) {
          onSuccess();
        } else {
          setError(result.error);
        }
      } else {
        const cuadro = CUADROS.find((c) => c.id === cuadroId);
        if (!cuadro) {
          setError("Selecciona un cuadro válido");
          setIsSubmitting(false);
          return;
        }

        const result = await crearPrendaAction(
          {
            nombre,
            cuadroId,
            genero,
            categoria,
            estado,
            propietario,
            color: color || null,
            tallaONumero: tallaONumero || null,
            identificadorFisico: identificadorFisico || null,
            ubicacion: ubicacion || null,
            comentarios: comentarios || null,
            fechaIngreso: new Date(fechaIngreso),
          },
          cuadro.name,
        );

        if (result.success) {
          onSuccess();
        } else {
          setError(result.error);
        }
      }
    } catch {
      setError("Error inesperado al guardar la prenda");
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
        <Label htmlFor="nombre">Nombre *</Label>
        <Input
          id="nombre"
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
              {CUADROS.map((cuadro) => (
                <SelectItem key={cuadro.id} value={cuadro.id}>
                  {cuadro.name}
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
          <Label htmlFor="fechaIngreso">Fecha de ingreso</Label>
          <Input
            id="fechaIngreso"
            type="date"
            value={fechaIngreso}
            onChange={(e) => setFechaIngreso(e.target.value)}
          />
        </div>
      </div>

      {/* Color y Talla */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="Ej: Negro"
            maxLength={50}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tallaONumero">Talla / Número</Label>
          <Input
            id="tallaONumero"
            value={tallaONumero}
            onChange={(e) => setTallaONumero(e.target.value)}
            placeholder="Ej: M, 42"
            maxLength={20}
          />
        </div>
      </div>

      {/* Identificador físico y Ubicación */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="identificadorFisico">Identificador físico</Label>
          <Input
            id="identificadorFisico"
            value={identificadorFisico}
            onChange={(e) => setIdentificadorFisico(e.target.value)}
            placeholder="Ej: Etiqueta roja #3"
            maxLength={50}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ubicacion">Ubicación</Label>
          <Input
            id="ubicacion"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            placeholder="Ej: Armario 2, estante 3"
            maxLength={100}
          />
        </div>
      </div>

      {/* Comentarios */}
      <div className="space-y-2">
        <Label htmlFor="comentarios">Comentarios</Label>
        <Textarea
          id="comentarios"
          value={comentarios}
          onChange={(e) => setComentarios(e.target.value)}
          placeholder="Notas adicionales sobre la prenda..."
          maxLength={500}
          rows={3}
        />
      </div>

      {/* Image uploader (solo en edición, ya que necesitamos el ID) */}
      {isEditing && (
        <div className="space-y-2">
          <Label>Foto</Label>
          <ImageUploader prendaId={prenda.id} currentUrl={prenda.fotoUrl} />
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : "Crear prenda"}
        </Button>
      </div>
    </form>
  );
}
