import type { DashboardStats } from "../../domain/entities";

interface StatusDonutChartProps {
  stats: DashboardStats;
}

export function StatusDonutChart({ stats }: StatusDonutChartProps) {
  const total = stats.totalPrendas || 1;
  const disponiblePct = Math.round((stats.prendasDisponibles / total) * 100);
  const enUsoPct = Math.round((stats.prendasEnUso / total) * 100);
  const faltantesPct = Math.round((stats.prendasFaltantes / total) * 100);
  const otrasPct = 100 - disponiblePct - enUsoPct - faltantesPct;

  // Build conic-gradient
  const seg1 = disponiblePct;
  const seg2 = seg1 + enUsoPct;
  const seg3 = seg2 + faltantesPct;

  const gradient = `conic-gradient(#16a34a 0% ${seg1}%, #2f6bff ${seg1}% ${seg2}%, #d97706 ${seg2}% ${seg3}%, #94a3b8 ${seg3}% 100%)`;

  const items = [
    {
      label: "Disponible",
      value: stats.prendasDisponibles,
      color: "bg-emerald-600",
    },
    { label: "En uso", value: stats.prendasEnUso, color: "bg-primary" },
    {
      label: "Faltante",
      value: stats.prendasFaltantes,
      color: "bg-amber-600",
    },
    {
      label: "Otra",
      value:
        total -
        stats.prendasDisponibles -
        stats.prendasEnUso -
        stats.prendasFaltantes,
      color: "bg-slate-400",
    },
  ].filter((item) => item.value > 0);

  return (
    <div className="border border-border rounded-[20px] p-5">
      <h3 className="text-sm font-bold mb-4">Prendas por estado</h3>

      <div className="flex items-center gap-5">
        {/* Donut */}
        <div
          className="w-[110px] h-[110px] rounded-full shrink-0 flex items-center justify-center"
          style={{ background: gradient }}
        >
          <div className="w-[70px] h-[70px] rounded-full bg-card flex flex-col items-center justify-center">
            <span className="text-[22px] font-bold font-display">
              {stats.totalPrendas}
            </span>
            <span className="text-[9.5px] text-muted-foreground">prendas</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 flex flex-col gap-2.5">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs">
              <span className={`w-[9px] h-[9px] rounded-[3px] ${item.color}`} />
              <span>{item.label}</span>
              <b className="ml-auto">{item.value}</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
