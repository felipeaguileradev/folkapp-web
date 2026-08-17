"use client";

import { cn } from "@/lib/utils";

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// Mock data for weekly movements — will be replaced with real data
const MOCK_DATA = [
  { devoluciones: 40, prestamos: 62 },
  { devoluciones: 55, prestamos: 48 },
  { devoluciones: 70, prestamos: 88 },
  { devoluciones: 35, prestamos: 52 },
  { devoluciones: 80, prestamos: 66 },
  { devoluciones: 25, prestamos: 30 },
];

export function WeeklyMovementsChart() {
  return (
    <div className="border border-border rounded-[20px] p-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-1.5">
        <h3 className="text-sm font-bold">Movimientos por semana</h3>
        <span className="text-[11px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
          +12%
        </span>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-3 h-[150px] pt-4">
        {MOCK_DATA.map((day, index) => (
          <div
            key={DAYS[index]}
            className="flex-1 flex flex-col items-center gap-1.5"
          >
            <div className="w-full flex gap-[3px] items-end h-32">
              <div
                className="flex-1 bg-[#c9d3e8] rounded-[5px]"
                style={{ height: `${day.devoluciones}%` }}
              />
              <div
                className="flex-1 bg-primary rounded-[5px]"
                style={{ height: `${day.prestamos}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">
              {DAYS[index]}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 border-t border-border pt-3">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="w-2 h-2 rounded-[3px] bg-[#c9d3e8]" />
          Devoluciones
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="w-2 h-2 rounded-[3px] bg-primary" />
          Préstamos/asignaciones
        </div>
      </div>
    </div>
  );
}
