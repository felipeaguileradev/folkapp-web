"use client";

import { useState } from "react";
import {
  ArrowLeftRight,
  Package,
  RotateCcw,
  Wrench,
  MessageSquare,
  PlusCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HistorialEntry } from "../../domain/entities";
import type { TipoEvento } from "@/shared/types";

interface HistorialTimelineProps {
  entries: HistorialEntry[];
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
}

const EVENTO_ICONS: Record<TipoEvento, React.ReactNode> = {
  Asignación: <Package className="h-4 w-4" />,
  Devolución: <RotateCcw className="h-4 w-4" />,
  "Cambio de estado": <Clock className="h-4 w-4" />,
  Reparación: <Wrench className="h-4 w-4" />,
  Préstamo: <ArrowLeftRight className="h-4 w-4" />,
  Traspaso: <ArrowLeftRight className="h-4 w-4" />,
  "Comentario agregado": <MessageSquare className="h-4 w-4" />,
  "Creación de prenda": <PlusCircle className="h-4 w-4" />,
};

const EVENTO_COLORS: Record<TipoEvento, string> = {
  Asignación: "bg-blue-100 text-blue-700",
  Devolución: "bg-green-100 text-green-700",
  "Cambio de estado": "bg-yellow-100 text-yellow-700",
  Reparación: "bg-orange-100 text-orange-700",
  Préstamo: "bg-purple-100 text-purple-700",
  Traspaso: "bg-cyan-100 text-cyan-700",
  "Comentario agregado": "bg-gray-100 text-gray-700",
  "Creación de prenda": "bg-emerald-100 text-emerald-700",
};

export function HistorialTimeline({
  entries,
  onLoadMore,
  isLoadingMore,
  hasMore,
}: HistorialTimelineProps) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Sin historial registrado
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {entries.map((entry, index) => (
        <div key={entry.id} className="flex gap-3 py-2">
          {/* Icon */}
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0",
              EVENTO_COLORS[entry.tipoEvento],
            )}
          >
            {EVENTO_ICONS[entry.tipoEvento]}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {entry.tipoEvento}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {entry.fecha.toLocaleDateString("es-CL")}{" "}
                {entry.fecha.toLocaleTimeString("es-CL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {entry.descripcion && (
              <p className="text-sm mt-0.5 text-muted-foreground">
                {entry.descripcion}
              </p>
            )}
          </div>
        </div>
      ))}

      {/* Load more */}
      {hasMore && onLoadMore && (
        <div className="pt-2 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? "Cargando..." : "Cargar más"}
          </Button>
        </div>
      )}
    </div>
  );
}
