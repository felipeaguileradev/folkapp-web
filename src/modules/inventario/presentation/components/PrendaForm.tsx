"use client";

import { useState, useEffect } from "react";
import { Search, Check } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { Prenda } from "../../domain/entities";
import type {
  Genero,
  Categoria,
  EstadoPrenda,
  Propietario,
} from "@/shared/types";
import type { Cuadro } from "@/modules/cuadros/domain/entities";
import {
  crearPrendaAction,
  actualizarPrendaAction,
} from "../../infrastructure/actions";
import {
  obtenerBailarinesActivosAction,
  type BailarinOption,
} from "@/modules/bailarines/infrastructure/actions";
import { ImageUploader } from "./ImageUploader";

interface PrendaFormProps {
  prenda?: Prenda;
  onSuccess: () => void;
  cuadros: Cuadro[];
  /** Datos iniciales para pre-llenar (usado al duplicar) */
  initialData?: Prenda;
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

export function PrendaForm({
  prenda,
  onSuccess,
  cuadros,
  initialData,
}: PrendaFormProps) {
  const isEditing = !!prenda;

  // Usar initialData (duplicar) o prenda (editar) como fuente de datos iniciales
  const source = prenda ?? initialData;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [nombre, setNombre] = useState(source?.nombre ?? "");
  const [cuadroId, setCuadroId] = useState(source?.cuadroId ?? "");
  const [genero, setGenero] = useState<Genero | "">(source?.genero ?? "");
  const [categoria, setCategoria] = useState<Categoria | "">(
    source?.categoria ?? "",
  );
  const [estado, setEstado] = useState<EstadoPrenda>(
    source?.estado ?? "Disponible",
  );
  const [propietario, setPropietario] = useState<Propietario>(
    source?.propietario ?? "Ballet",
  );
  const [propietarioNombre, setPropietarioNombre] = useState(
    source?.propietarioNombre ?? "",
  );
  const [color, setColor] = useState(source?.color ?? "");
  const [tallaONumero, setTallaONumero] = useState(source?.tallaONumero ?? "");
  const [identificadorFisico, setIdentificadorFisico] = useState(
    source?.identificadorFisico ?? "",
  );
  const [ubicacion, setUbicacion] = useState(source?.ubicacion ?? "");
  const [comentarios, setComentarios] = useState(source?.comentarios ?? "");
  const [fechaIngreso, setFechaIngreso] = useState(
    source?.fechaIngreso
      ? source.fechaIngreso.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  );

  // Bailarín (cuando estado es "En uso")
  const [bailarinId, setBailarinId] = useState(source?.bailarinActualId ?? "");
  const [bailarines, setBailarines] = useState<BailarinOption[]>([]);
  const [bailarinSearch, setBailarinSearch] = useState("");
  const [isLoadingBailarines, setIsLoadingBailarines] = useState(false);

  useEffect(() => {
    if (estado === "En uso" && bailarines.length === 0) {
      setIsLoadingBailarines(true);
      obtenerBailarinesActivosAction().then((result) => {
        if (result.success) {
          setBailarines(result.data);
        }
        setIsLoadingBailarines(false);
      });
    }
  }, [estado, bailarines.length]);

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
          propietarioNombre:
            propietario === "Personal" ? propietarioNombre || null : null,
          bailarinActualId:
            estado === "En uso" && bailarinId ? bailarinId : null,
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
        const cuadro = cuadros.find((c) => c.id === cuadroId);
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
            propietarioNombre:
              propietario === "Personal" ? propietarioNombre || null : null,
            bailarinActualId:
              estado === "En uso" && bailarinId ? bailarinId : null,
            color: color || null,
            tallaONumero: tallaONumero || null,
            identificadorFisico: identificadorFisico || null,
            ubicacion: ubicacion || null,
            comentarios: comentarios || null,
            fechaIngreso: new Date(fechaIngreso),
          },
          cuadro.nombre as "Huaso" | "Norte" | "Rapa Nui",
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

      {/* Bailarín (solo si estado es "En uso") */}
      {estado === "En uso" && (
        <div className="space-y-2">
          <Label>Bailarín asignado (opcional)</Label>
          {bailarinId ? (
            <div className="flex items-center justify-between rounded-md border border-input px-3 py-2">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">
                  {bailarines.find((b) => b.id === bailarinId)
                    ?.nombreCompleto ?? bailarinId}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs"
                onClick={() => {
                  setBailarinId("");
                  setBailarinSearch("");
                }}
              >
                Quitar
              </Button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={bailarinSearch}
                  onChange={(e) => setBailarinSearch(e.target.value)}
                  placeholder="Buscar bailarín..."
                  className="pl-9"
                />
              </div>
              <div className="max-h-32 overflow-y-auto rounded-md border border-input">
                {isLoadingBailarines ? (
                  <p className="p-2 text-xs text-muted-foreground text-center">
                    Cargando...
                  </p>
                ) : (
                  <div className="py-1">
                    {bailarines
                      .filter((b) =>
                        bailarinSearch.trim()
                          ? b.nombreCompleto
                              .toLowerCase()
                              .includes(bailarinSearch.toLowerCase())
                          : true,
                      )
                      .map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            setBailarinId(b.id);
                            setBailarinSearch("");
                          }}
                          className={cn(
                            "w-full px-3 py-1.5 text-left text-sm hover:bg-muted transition-colors",
                          )}
                        >
                          {b.nombreCompleto}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

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

      {/* Nombre del dueño (solo si propietario es Personal) */}
      {propietario === "Personal" && (
        <div className="space-y-2">
          <Label htmlFor="propietarioNombre">Nombre del dueño</Label>
          <Input
            id="propietarioNombre"
            value={propietarioNombre}
            onChange={(e) => setPropietarioNombre(e.target.value)}
            placeholder="Ej: Felipe Araya"
            maxLength={100}
          />
        </div>
      )}

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
