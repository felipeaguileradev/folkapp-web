import Link from "next/link";
import { Calendar, ArrowRight, MapPin } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import type { Funcion } from "@/modules/funciones/domain/entities";

interface FuncionesProximasProps {
  funciones: Funcion[];
}

export function FuncionesProximas({ funciones }: FuncionesProximasProps) {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold">Próximas Funciones</h2>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-xs text-primary hover:text-primary/80 rounded-full px-3"
        >
          <Link href="/funciones" className="gap-1">
            Ver todas
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      {/* Content */}
      {funciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Calendar className="h-8 w-8 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">
            No hay funciones próximas
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {funciones.map((funcion) => (
            <Link
              key={funcion.id}
              href={`/funciones/${funcion.id}`}
              className="flex items-center gap-3 rounded-xl border border-border/50 p-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 shrink-0">
                <Calendar className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight truncate">
                  {funcion.nombre}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-muted-foreground">
                    {funcion.fecha.toLocaleDateString("es-CL", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                  {funcion.lugar && (
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {funcion.lugar}
                    </span>
                  )}
                </div>
              </div>
              <Badge
                variant="outline"
                className="shrink-0 text-[10px] font-medium"
              >
                {funcion.cuadrosQueSePresenten.length} cuadros
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
