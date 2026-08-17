"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Check, Search, Package, X } from "lucide-react";
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
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/lib/utils";
import { asignarPrendaAction } from "@/modules/movimientos/infrastructure/actions";
import {
  obtenerPrendasDisponiblesAction,
  type PrendaDisponibleOption,
} from "@/modules/inventario/infrastructure/actions";
import type { GeneroBailarin } from "@/shared/types";

interface AsignarPrendaBailarinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bailarinId: string;
  genero: GeneroBailarin;
  cuadrosMap: Record<string, string>;
}

export function AsignarPrendaBailarinDialog({
  open,
  onOpenChange,
  bailarinId,
  genero,
  cuadrosMap,
}: AsignarPrendaBailarinDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [prendas, setPrendas] = useState<PrendaDisponibleOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setIsLoading(true);
    obtenerPrendasDisponiblesAction(genero).then((result) => {
      if (result.success) {
        setPrendas(result.data);
      }
      setIsLoading(false);
    });

    setSelectedIds(new Set());
    setSearchQuery("");
    setError(null);
  }, [open, genero]);

  const filteredPrendas = useMemo(() => {
    if (!searchQuery.trim()) return prendas;
    const query = searchQuery.toLowerCase();
    return prendas.filter(
      (p) =>
        p.nombre.toLowerCase().includes(query) ||
        p.codigoIdentificador.toLowerCase().includes(query) ||
        p.categoria.toLowerCase().includes(query) ||
        p.color?.toLowerCase().includes(query) ||
        p.tallaONumero?.toLowerCase().includes(query) ||
        p.identificadorFisico?.toLowerCase().includes(query),
    );
  }, [prendas, searchQuery]);

  const selectedPrendas = prendas.filter((p) => selectedIds.has(p.id));

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleRemove = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedIds.size === 0) {
      setError("Selecciona al menos una prenda para asignar");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const errors: string[] = [];
    let successCount = 0;

    for (const prendaId of selectedIds) {
      const result = await asignarPrendaAction({ prendaId, bailarinId });
      if (result.success) {
        successCount++;
      } else {
        const prenda = prendas.find((p) => p.id === prendaId);
        errors.push(`${prenda?.nombre ?? prendaId}: ${result.error}`);
      }
    }

    if (errors.length > 0 && successCount === 0) {
      setError(errors.join(". "));
    } else if (errors.length > 0) {
      setError(
        `${successCount} asignadas correctamente. Errores: ${errors.join(". ")}`,
      );
      setTimeout(() => {
        onOpenChange(false);
        router.refresh();
      }, 2000);
    } else {
      onOpenChange(false);
      router.refresh();
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Asignar prendas</DialogTitle>
          <DialogDescription>
            Selecciona las prendas disponibles para asignar a este bailarín.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex-1 overflow-hidden flex flex-col"
        >
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Prendas seleccionadas */}
          {selectedPrendas.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Seleccionadas ({selectedPrendas.length})
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {selectedPrendas.map((prenda) => (
                  <Badge
                    key={prenda.id}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {prenda.nombre}
                    <button
                      type="button"
                      onClick={() => handleRemove(prenda.id)}
                      className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Búsqueda y listado */}
          <div className="space-y-1.5 flex-1 overflow-hidden flex flex-col">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, código, color, talla..."
                className="pl-9"
              />
            </div>

            <div className="flex-1 overflow-y-auto rounded-md border border-input min-h-0 max-h-64">
              {isLoading ? (
                <p className="p-3 text-sm text-muted-foreground text-center">
                  Cargando prendas disponibles...
                </p>
              ) : filteredPrendas.length === 0 ? (
                <div className="p-4 text-center">
                  <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No hay prendas disponibles
                  </p>
                </div>
              ) : (
                <div className="py-1">
                  {filteredPrendas.map((prenda) => {
                    const isSelected = selectedIds.has(prenda.id);
                    return (
                      <button
                        key={prenda.id}
                        type="button"
                        onClick={() => handleToggle(prenda.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-accent transition-colors",
                          isSelected && "bg-accent/50",
                        )}
                      >
                        <div
                          className={cn(
                            "h-4 w-4 shrink-0 rounded border flex items-center justify-center",
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-input",
                          )}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              {prenda.nombre}
                            </p>
                            <span className="text-xs text-muted-foreground font-mono shrink-0">
                              {prenda.codigoIdentificador}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {prenda.color && (
                              <span className="text-xs text-muted-foreground">
                                Color: {prenda.color}
                              </span>
                            )}
                            {prenda.tallaONumero && (
                              <span className="text-xs text-muted-foreground">
                                Talla: {prenda.tallaONumero}
                              </span>
                            )}
                            {prenda.identificadorFisico && (
                              <span className="text-xs text-muted-foreground">
                                ID: {prenda.identificadorFisico}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              Dueño: {prenda.propietario}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="secondary" className="text-xs">
                            {prenda.categoria}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {cuadrosMap[prenda.cuadroId] ?? "—"}
                          </Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {filteredPrendas.length} prendas disponibles
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || selectedIds.size === 0}
            >
              {isSubmitting
                ? "Asignando..."
                : `Asignar ${selectedIds.size > 0 ? `(${selectedIds.size})` : ""}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
