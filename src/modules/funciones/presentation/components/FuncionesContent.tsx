"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Calendar, MapPin } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Funcion } from "../../domain/entities";
import type { EstadoFuncion } from "@/shared/types";
import { FuncionFormDialog } from "./FuncionFormDialog";

interface FuncionesContentProps {
  funciones: Funcion[];
}

const ESTADO_STYLES: Record<EstadoFuncion, string> = {
  Pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "En curso": "bg-blue-100 text-blue-800 border-blue-200",
  Finalizada: "bg-green-100 text-green-800 border-green-200",
};

export function FuncionesContent({ funciones }: FuncionesContentProps) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreateSuccess = () => {
    setIsCreateOpen(false);
    router.refresh();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[30px] font-bold tracking-tight font-display">
            Funciones
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Eventos y verificación de vestuario
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary text-white font-bold text-[13px] px-[18px] py-3 h-auto rounded-[14px] gap-1.5"
        >
          <Plus className="h-[19px] w-[19px]" />
          Nueva función
        </Button>
      </div>

      {/* List */}
      {funciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">
            No hay funciones registradas
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {funciones.map((funcion) => {
            const pct = funcion.resultadoChecklist
              ? Math.round(
                  (funcion.resultadoChecklist.verificados /
                    funcion.resultadoChecklist.totalItems) *
                    100,
                )
              : 0;
            const barColor =
              pct >= 80
                ? "bg-emerald-600"
                : pct >= 50
                  ? "bg-primary"
                  : "bg-amber-600";

            return (
              <Link
                key={funcion.id}
                href={`/funciones/${funcion.id}`}
                className="border border-border rounded-2xl p-[18px] hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <p className="text-base font-bold">{funcion.nombre}</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[11px] shrink-0",
                      ESTADO_STYLES[funcion.estado],
                    )}
                  >
                    {funcion.estado}
                  </Badge>
                </div>
                <div className="flex items-center gap-3.5 text-[12.5px] text-muted-foreground mt-2">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-[15px] w-[15px]" />
                    {funcion.fecha.toLocaleDateString("es-CL", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  {funcion.lugar && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-[15px] w-[15px]" />
                      {funcion.lugar}
                    </span>
                  )}
                </div>
                {funcion.resultadoChecklist && (
                  <div className="mt-3.5">
                    <div className="flex justify-between text-[11.5px] text-muted-foreground mb-1.5">
                      <span>Checklist de vestuario</span>
                      <b className="text-foreground">{pct}%</b>
                    </div>
                    <div className="h-[7px] bg-secondary rounded overflow-hidden">
                      <div
                        className={`h-full rounded ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <FuncionFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
