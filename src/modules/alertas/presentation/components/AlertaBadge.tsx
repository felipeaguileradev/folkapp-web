"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Alerta } from "../../domain/entities";
import type { Prioridad } from "@/shared/types";
import { resolverAlertaAction } from "../../infrastructure/actions";

interface AlertaBadgeProps {
  alerta: Alerta;
  showResolverButton?: boolean;
}

const PRIORIDAD_CONFIG: Record<
  Prioridad,
  { icon: React.ReactNode; color: string; badgeClass: string }
> = {
  Alta: {
    icon: <AlertTriangle className="h-4 w-4" />,
    color: "border-l-red-500",
    badgeClass: "bg-red-100 text-red-800 border-red-200",
  },
  Media: {
    icon: <AlertCircle className="h-4 w-4" />,
    color: "border-l-yellow-500",
    badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  Baja: {
    icon: <Info className="h-4 w-4" />,
    color: "border-l-blue-500",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
  },
};

export function AlertaBadge({ alerta, showResolverButton }: AlertaBadgeProps) {
  const router = useRouter();
  const [isResolving, setIsResolving] = useState(false);

  const config = PRIORIDAD_CONFIG[alerta.prioridad];

  const entityLink =
    alerta.entidadTipo === "prenda"
      ? `/inventario/${alerta.entidadId}`
      : `/bailarines/${alerta.entidadId}`;

  const handleResolver = async () => {
    setIsResolving(true);
    const result = await resolverAlertaAction(alerta.id);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error);
    }
    setIsResolving(false);
  };

  return (
    <Card className={cn("border-l-4", config.color)}>
      <CardContent className="flex items-start gap-3 py-3 px-4">
        <span className="mt-0.5 text-muted-foreground">{config.icon}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className={cn("text-xs", config.badgeClass)}
            >
              {alerta.prioridad}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {alerta.tipoCondicion.replace(/_/g, " ")}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {alerta.fechaGeneracion.toLocaleDateString("es-CL")}
            </span>
          </div>
          <p className="text-sm">{alerta.descripcion}</p>

          {alerta.resuelta && alerta.fechaResolucion && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Resuelta el {alerta.fechaResolucion.toLocaleDateString("es-CL")}
              {alerta.resueltaPor === "sistema" ? " (automática)" : ""}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="ghost" size="sm" asChild>
            <Link href={entityLink}>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>

          {showResolverButton && !alerta.resuelta && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResolver}
              disabled={isResolving}
            >
              {isResolving ? "..." : "Resolver"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
