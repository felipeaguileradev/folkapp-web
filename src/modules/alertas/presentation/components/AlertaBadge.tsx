"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, AlertTriangle, Wrench, CheckCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/shared/hooks/useToast";
import type { Alerta } from "../../domain/entities";
import type { Prioridad } from "@/shared/types";
import { resolverAlertaAction } from "../../infrastructure/actions";

interface AlertaBadgeProps {
  alerta: Alerta;
  showResolverButton?: boolean;
}

const PRIORIDAD_BADGE: Record<Prioridad, { bg: string; color: string }> = {
  Alta: { bg: "bg-red-100", color: "text-red-700" },
  Media: { bg: "bg-amber-100", color: "text-amber-700" },
  Baja: { bg: "bg-secondary", color: "text-muted-foreground" },
};

const ICON_CONFIG: Record<string, { icon: typeof Clock; bg: string }> = {
  prestamo_vencido: { icon: Clock, bg: "bg-red-100 text-red-600" },
  faltante_sin_movimiento: {
    icon: AlertTriangle,
    bg: "bg-amber-100 text-amber-600",
  },
  reparacion_prolongada: {
    icon: Wrench,
    bg: "bg-amber-100 text-amber-600",
  },
  default: { icon: CheckCircle, bg: "bg-emerald-100 text-emerald-600" },
};

export function AlertaBadge({ alerta, showResolverButton }: AlertaBadgeProps) {
  const router = useRouter();
  const [isResolving, setIsResolving] = useState(false);

  const prioridadStyle = PRIORIDAD_BADGE[alerta.prioridad];
  const iconCfg = ICON_CONFIG[alerta.tipoCondicion] ?? ICON_CONFIG.default;
  const Icon = iconCfg.icon;

  const handleResolver = async () => {
    setIsResolving(true);
    const result = await resolverAlertaAction(alerta.id);

    if (result.success) {
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error al resolver",
        description: result.error,
      });
    }
    setIsResolving(false);
  };

  return (
    <div
      className={cn(
        "border border-border rounded-2xl px-[18px] py-4 flex items-center gap-4",
        alerta.resuelta && "opacity-60",
      )}
    >
      {/* Icon */}
      <div
        className={`w-11 h-11 rounded-[13px] flex items-center justify-center shrink-0 ${iconCfg.bg}`}
      >
        <Icon className="h-[22px] w-[22px]" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[14.5px] font-bold truncate">
          {alerta.tipoCondicion === "prestamo_vencido"
            ? "Devolución vencida"
            : alerta.tipoCondicion === "faltante_sin_movimiento"
              ? "Prenda faltante"
              : alerta.tipoCondicion.replace(/_/g, " ")}
        </p>
        <p className="text-[12.5px] text-muted-foreground mt-0.5 truncate">
          {alerta.descripcion}
        </p>
        {alerta.resuelta && alerta.fechaResolucion && (
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-emerald-600" />
            Resuelta el {alerta.fechaResolucion.toLocaleDateString("es-CL")}
          </p>
        )}
      </div>

      {/* Severity badge */}
      <span
        className={cn(
          "text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0",
          prioridadStyle.bg,
          prioridadStyle.color,
        )}
      >
        {alerta.prioridad}
      </span>

      {/* Resolver button */}
      {showResolverButton && !alerta.resuelta && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleResolver}
          disabled={isResolving}
          className="shrink-0 text-[12.5px] font-bold rounded-[11px] h-auto py-2.5 px-3.5"
        >
          {isResolving ? "..." : "Resolver"}
        </Button>
      )}
    </div>
  );
}
