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
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[30px] font-bold tracking-tight font-display">
          Alertas
        </h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          {alertasActivas.length}{" "}
          {alertasActivas.length === 1 ? "activa" : "activas"} · resolución
          automática al registrar el movimiento
        </p>
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
