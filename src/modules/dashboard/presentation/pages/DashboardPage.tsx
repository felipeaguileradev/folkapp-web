import {
  getDashboardStatsAction,
  getAlertasRecientesAction,
  getFuncionesProximasAction,
} from "../../infrastructure/actions";
import { StatsCards } from "../components/StatsCards";
import { WeeklyMovementsChart } from "../components/WeeklyMovementsChart";
import { StatusDonutChart } from "../components/StatusDonutChart";
import { DashboardRightRail } from "../components/DashboardRightRail";

export async function DashboardPage() {
  const [statsResult, alertasResult, funcionesResult] = await Promise.all([
    getDashboardStatsAction(),
    getAlertasRecientesAction(),
    getFuncionesProximasAction(),
  ]);

  const stats = statsResult.success ? statsResult.data : null;
  const alertas = alertasResult.success ? alertasResult.data : [];
  const funciones = funcionesResult.success ? funcionesResult.data : [];

  return (
    <div className="flex gap-3.5">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-[32px] font-bold tracking-tight font-display">
            Dashboard
          </h1>
          <div className="flex bg-secondary rounded-[14px] p-1">
            <span className="text-[12.5px] font-semibold text-muted-foreground px-4 py-2 cursor-pointer">
              Semana
            </span>
            <span className="text-[12.5px] font-bold text-white bg-sidebar rounded-[11px] px-4 py-2 cursor-pointer">
              Mes
            </span>
          </div>
        </div>

        {/* Stats */}
        {stats && <StatsCards stats={stats} />}

        {/* Charts */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-3.5 mt-5">
            <WeeklyMovementsChart />
            <StatusDonutChart stats={stats} />
          </div>
        )}
      </div>

      {/* Right Rail */}
      <DashboardRightRail alertas={alertas} funciones={funciones} />
    </div>
  );
}
