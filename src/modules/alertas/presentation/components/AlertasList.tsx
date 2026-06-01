"use client";

import { Bell } from "lucide-react";
import type { Alerta } from "../../domain/entities";
import { AlertaBadge } from "./AlertaBadge";

interface AlertasListProps {
  alertas: Alerta[];
  showResolverButton?: boolean;
}

export function AlertasList({
  alertas,
  showResolverButton = false,
}: AlertasListProps) {
  if (alertas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Bell className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No hay alertas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alertas.map((alerta) => (
        <AlertaBadge
          key={alerta.id}
          alerta={alerta}
          showResolverButton={showResolverButton}
        />
      ))}
    </div>
  );
}
