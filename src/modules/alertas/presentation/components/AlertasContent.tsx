"use client";

import { Bell } from "lucide-react";
import { Separator } from "@/shared/components/ui/separator";
import type { Alerta } from "../../domain/entities";
import { AlertasList } from "./AlertasList";

interface AlertasContentProps {
  alertasActivas: Alerta[];
  alertasResueltas: Alerta[];
}

export function AlertasContent({
  alertasActivas,
  alertasResueltas,
}: AlertasContentProps) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alertas</h1>
          <p className="text-muted-foreground">
            {alertasActivas.length}{" "}
            {alertasActivas.length === 1 ? "alerta activa" : "alertas activas"}
          </p>
        </div>
      </div>

      {/* Active alerts */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Alertas activas</h2>
        <AlertasList alertas={alertasActivas} showResolverButton />
      </div>

      {/* Resolved alerts */}
      {alertasResueltas.length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
              Historial de alertas resueltas
            </h2>
            <AlertasList alertas={alertasResueltas} />
          </div>
        </>
      )}
    </div>
  );
}
