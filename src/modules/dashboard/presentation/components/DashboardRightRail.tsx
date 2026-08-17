import Link from "next/link";
import { Clock, AlertTriangle, QrCode } from "lucide-react";
import type { Alerta } from "@/modules/alertas/domain/entities";
import type { Funcion } from "@/modules/funciones/domain/entities";

interface DashboardRightRailProps {
  alertas: Alerta[];
  funciones: Funcion[];
}

export function DashboardRightRail({
  alertas,
  funciones,
}: DashboardRightRailProps) {
  const proximaFuncion = funciones[0];
  const checklistPct = proximaFuncion?.resultadoChecklist
    ? Math.round(
        (proximaFuncion.resultadoChecklist.verificados /
          proximaFuncion.resultadoChecklist.totalItems) *
          100,
      )
    : 0;

  return (
    <div className="w-[290px] shrink-0 hidden xl:flex flex-col gap-3.5">
      {/* Alertas */}
      <div className="bg-card rounded-[22px] p-5">
        <div className="flex justify-between items-center mb-3.5">
          <h3 className="text-[15px] font-bold font-display">Alertas</h3>
          <Link
            href="/alertas"
            className="text-[11px] font-bold bg-primary text-white px-2.5 py-1 rounded-full"
          >
            {alertas.length}
          </Link>
        </div>

        <div className="space-y-3.5">
          {alertas.slice(0, 2).map((alerta) => (
            <div key={alerta.id} className="flex gap-3">
              <div
                className={`w-[38px] h-[38px] rounded-xl flex items-center justify-center shrink-0 ${
                  alerta.prioridad === "Alta"
                    ? "bg-red-100 text-red-600"
                    : "bg-amber-100 text-amber-600"
                }`}
              >
                {alerta.tipoCondicion === "prestamo_vencido" ? (
                  <Clock className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold truncate">
                  {alerta.tipoCondicion === "prestamo_vencido"
                    ? "Devolución vencida"
                    : alerta.tipoCondicion === "faltante_sin_movimiento"
                      ? "Prenda faltante"
                      : alerta.descripcion}
                </p>
                <p className="text-[11.5px] text-muted-foreground truncate">
                  {alerta.descripcion}
                </p>
              </div>
            </div>
          ))}

          {alertas.length === 0 && (
            <p className="text-[12px] text-muted-foreground">
              No hay alertas activas
            </p>
          )}
        </div>
      </div>

      {/* Próxima función */}
      {proximaFuncion && (
        <Link
          href={`/funciones/${proximaFuncion.id}`}
          className="bg-primary rounded-[22px] p-5 text-white relative overflow-hidden block hover:opacity-95 transition-opacity"
        >
          <div className="absolute -right-[30px] -bottom-10 w-[140px] h-[140px] rounded-full bg-white/[.12]" />
          <p className="text-[11px] tracking-[2px] uppercase opacity-80">
            Próxima función
          </p>
          <h4 className="text-xl font-bold mt-1.5 font-display">
            {proximaFuncion.nombre}
          </h4>
          <p className="text-[12.5px] opacity-90 mt-1">
            {proximaFuncion.fecha.toLocaleDateString("es-CL", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
            {proximaFuncion.lugar && ` · ${proximaFuncion.lugar}`}
          </p>

          {proximaFuncion.resultadoChecklist && (
            <div className="mt-4 bg-white/15 rounded-[14px] p-3.5">
              <div className="flex justify-between text-[11.5px] mb-1.5">
                <span>Checklist de vestuario</span>
                <b>{checklistPct}%</b>
              </div>
              <div className="h-1.5 bg-white/25 rounded-[3px] overflow-hidden">
                <div
                  className="h-full bg-white rounded-[3px]"
                  style={{ width: `${checklistPct}%` }}
                />
              </div>
            </div>
          )}
        </Link>
      )}

      {/* Registro rápido */}
      <div className="bg-sidebar rounded-[22px] p-5 text-white">
        <h4 className="text-[15px] font-bold font-display mb-1">
          Registro rápido
        </h4>
        <p className="text-xs text-white/55 mb-3.5">
          Asigna o presta una prenda
        </p>

        <div className="flex items-center gap-2.5 bg-white/[.08] rounded-[13px] px-3 py-2.5 mb-2.5">
          <QrCode className="h-[18px] w-[18px] text-white/60" />
          <span className="text-[12.5px] text-white/60">Código de prenda…</span>
        </div>

        <Link
          href="/movimientos"
          className="block w-full text-center bg-primary text-white font-bold text-[13px] py-3 rounded-[13px] hover:opacity-90 transition-opacity"
        >
          Registrar movimiento
        </Link>
      </div>
    </div>
  );
}
