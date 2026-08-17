"use client";

import { useState } from "react";
import {
  ArrowLeftRight,
  Clock,
  AlertTriangle,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";
import type { Movimiento } from "../../domain/entities";
import type { TipoMovimiento } from "@/shared/types";
import { DevolucionDialog } from "./DevolucionDialog";

interface MovimientoListProps {
  movimientos: Movimiento[];
}

const TIPO_CONFIG: Record<
  TipoMovimiento,
  { icon: typeof Clock; bg: string; badgeBg: string; badgeColor: string }
> = {
  "Préstamo interno": {
    icon: Clock,
    bg: "bg-blue-100 text-blue-600",
    badgeBg: "bg-blue-100",
    badgeColor: "text-blue-700",
  },
  "Préstamo externo": {
    icon: Clock,
    bg: "bg-blue-100 text-blue-600",
    badgeBg: "bg-blue-100",
    badgeColor: "text-blue-700",
  },
  Asignación: {
    icon: UserCheck,
    bg: "bg-emerald-100 text-emerald-600",
    badgeBg: "bg-emerald-100",
    badgeColor: "text-emerald-700",
  },
  Traspaso: {
    icon: ArrowLeftRight,
    bg: "bg-orange-100 text-cuadro-huaso",
    badgeBg: "bg-orange-100",
    badgeColor: "text-cuadro-huaso",
  },
  Devolución: {
    icon: ArrowLeftRight,
    bg: "bg-slate-100 text-slate-600",
    badgeBg: "bg-slate-100",
    badgeColor: "text-slate-700",
  },
};

function isOverdue(movimiento: Movimiento): boolean {
  if (movimiento.devuelta) return false;
  if (!movimiento.fechaDevolucionEsperada) return false;
  return new Date() > movimiento.fechaDevolucionEsperada;
}

export function MovimientoList({ movimientos }: MovimientoListProps) {
  const [devolucionMovimientoId, setDevolucionMovimientoId] = useState<
    string | null
  >(null);

  if (movimientos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ArrowLeftRight className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg">
          No se encontraron movimientos
        </p>
        <p className="text-muted-foreground text-sm mt-1">
          Los movimientos se crean al asignar, prestar o traspasar prendas
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2.5">
        {movimientos.map((movimiento) => {
          const overdue = isOverdue(movimiento);
          const config = TIPO_CONFIG[movimiento.tipo];
          const Icon = config.icon;

          return (
            <div
              key={movimiento.id}
              className={cn(
                "border border-border rounded-2xl px-[18px] py-4 flex items-center gap-4",
                overdue && "border-red-200 bg-red-50/50",
              )}
            >
              {/* Icon */}
              <div
                className={`w-11 h-11 rounded-[13px] flex items-center justify-center shrink-0 ${config.bg}`}
              >
                <Icon className="h-[22px] w-[22px]" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold truncate">
                    {movimiento.prendaId.slice(0, 8)}…
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground mt-0.5">
                  <span className="truncate">
                    {movimiento.bailarinId.slice(0, 8)}…
                  </span>
                  {movimiento.bailarinDestinoId && (
                    <>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {movimiento.bailarinDestinoId.slice(0, 8)}…
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Tipo + fecha */}
              <div className="text-right shrink-0">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[11px] font-bold border-0",
                    config.badgeBg,
                    config.badgeColor,
                  )}
                >
                  {movimiento.tipo}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {movimiento.fechaInicio.toLocaleDateString("es-CL", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>

              {/* Estado */}
              <div className="shrink-0 w-[110px] text-right">
                {overdue ? (
                  <Badge
                    variant="outline"
                    className="text-[11px] font-bold border-0 bg-red-100 text-red-700"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Vencido
                  </Badge>
                ) : movimiento.devuelta ? (
                  <Badge
                    variant="outline"
                    className="text-[11px] font-bold border-0 bg-secondary text-muted-foreground"
                  >
                    Devuelto
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[11px] font-bold border-0 bg-blue-100 text-blue-700"
                  >
                    Activo
                  </Badge>
                )}
              </div>

              {/* Action */}
              {!movimiento.devuelta && movimiento.tipo !== "Traspaso" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-[12.5px] font-bold rounded-[11px] h-auto py-2.5 px-3.5"
                  onClick={() => setDevolucionMovimientoId(movimiento.id)}
                >
                  Devolver
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <DevolucionDialog
        movimientoId={devolucionMovimientoId}
        onClose={() => setDevolucionMovimientoId(null)}
      />
    </>
  );
}
