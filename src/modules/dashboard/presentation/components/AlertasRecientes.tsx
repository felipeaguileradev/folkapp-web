import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import type { Alerta } from "@/modules/alertas/domain/entities";
import { cn } from "@/lib/utils";

interface AlertasRecientesProps {
  alertas: Alerta[];
}

const PRIORIDAD_STYLES: Record<string, string> = {
  Alta: "bg-red-100 text-red-700 border-red-200",
  Media: "bg-amber-100 text-amber-700 border-amber-200",
  Baja: "bg-blue-100 text-blue-700 border-blue-200",
};

const PRIORIDAD_DOT: Record<string, string> = {
  Alta: "bg-red-500",
  Media: "bg-amber-500",
  Baja: "bg-blue-500",
};

export function AlertasRecientes({ alertas }: AlertasRecientesProps) {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold">Alertas Recientes</h2>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-xs text-primary hover:text-primary/80 rounded-full px-3"
        >
          <Link href="/alertas" className="gap-1">
            Ver todas
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      {/* Content */}
      {alertas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertTriangle className="h-8 w-8 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">
            No hay alertas activas
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alertas.map((alerta) => (
            <div
              key={alerta.id}
              className="flex items-center gap-3 rounded-xl border border-border/50 p-3 hover:bg-muted/30 transition-colors"
            >
              <div
                className={cn(
                  "w-2.5 h-2.5 rounded-full shrink-0",
                  PRIORIDAD_DOT[alerta.prioridad] ?? "bg-gray-400",
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight truncate">
                  {alerta.descripcion}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {alerta.fechaGeneracion.toLocaleDateString("es-CL")}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "shrink-0 text-[10px] font-medium border",
                  PRIORIDAD_STYLES[alerta.prioridad],
                )}
              >
                {alerta.prioridad}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
