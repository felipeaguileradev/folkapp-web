"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import type { InventarioSummaryItem } from "../../domain/ports";
import type { Cuadro } from "@/modules/cuadros/domain/entities";
import type { Genero } from "@/shared/types";

interface InventarioSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: InventarioSummaryItem[];
  cuadros: Cuadro[];
}

interface GroupedByCuadro {
  cuadro: Cuadro;
  byGenero: Record<Genero, InventarioSummaryItem[]>;
}

const GENERO_LABELS: Record<Genero, string> = {
  Masculino: "Masculino",
  Femenino: "Femenino",
  Unisex: "Unisex",
};

const GENERO_ORDER: Genero[] = ["Masculino", "Femenino", "Unisex"];

export function InventarioSummaryDialog({
  open,
  onOpenChange,
  summary,
  cuadros,
}: InventarioSummaryDialogProps) {
  const grouped = groupByCuadro(summary, cuadros);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Resumen de Inventario</DialogTitle>
          <DialogDescription>
            Prendas agrupadas por cuadro y género
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {grouped.map((group, index) => (
            <div key={group.cuadro.id}>
              {index > 0 && <Separator className="mb-6" />}
              <CuadroGroup group={group} />
            </div>
          ))}

          {grouped.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay prendas registradas
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CuadroGroup({ group }: { group: GroupedByCuadro }) {
  const totalCuadro = Object.values(group.byGenero)
    .flat()
    .reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: group.cuadro.colorUi }}
        />
        <h3 className="font-semibold text-base">{group.cuadro.nombre}</h3>
        <Badge variant="secondary" className="text-xs">
          {totalCuadro} {totalCuadro === 1 ? "prenda" : "prendas"}
        </Badge>
      </div>

      <div className="ml-5 space-y-3">
        {GENERO_ORDER.map((genero) => {
          const items = group.byGenero[genero];
          if (!items || items.length === 0) return null;

          return <GeneroSection key={genero} genero={genero} items={items} />;
        })}
      </div>
    </div>
  );
}

function GeneroSection({
  genero,
  items,
}: {
  genero: Genero;
  items: InventarioSummaryItem[];
}) {
  const totalGenero = items.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground mb-1.5">
        {GENERO_LABELS[genero]} ({totalGenero})
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5">
        {items.map((item) => (
          <div
            key={`${item.genero}-${item.nombre}`}
            className="flex items-center justify-between text-sm py-0.5"
          >
            <span className="text-foreground">{item.nombre}</span>
            <span className="font-medium text-muted-foreground tabular-nums">
              ×{item.cantidad}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function groupByCuadro(
  summary: InventarioSummaryItem[],
  cuadros: Cuadro[],
): GroupedByCuadro[] {
  const cuadroMap = new Map(cuadros.map((c) => [c.id, c]));
  const groups = new Map<string, GroupedByCuadro>();

  for (const item of summary) {
    const cuadro = cuadroMap.get(item.cuadroId);
    if (!cuadro) continue;

    if (!groups.has(item.cuadroId)) {
      groups.set(item.cuadroId, {
        cuadro,
        byGenero: { Masculino: [], Femenino: [], Unisex: [] },
      });
    }

    const group = groups.get(item.cuadroId)!;
    group.byGenero[item.genero].push(item);
  }

  return Array.from(groups.values()).sort((a, b) =>
    a.cuadro.nombre.localeCompare(b.cuadro.nombre),
  );
}
