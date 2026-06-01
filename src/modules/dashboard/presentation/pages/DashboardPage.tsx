import {
  getDashboardStatsAction,
  getAlertasRecientesAction,
  getFuncionesProximasAction,
} from "../../infrastructure/actions";
import { StatsCards } from "../components/StatsCards";
import { AlertasRecientes } from "../components/AlertasRecientes";
import { FuncionesProximas } from "../components/FuncionesProximas";

export async function DashboardPage() {
  const [statsResult, alertasResult, funcionesResult] = await Promise.all([
    getDashboardStatsAction(),
    getAlertasRecientesAction(),
    getFuncionesProximasAction(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      {statsResult.success && <StatsCards stats={statsResult.data} />}

      {/* Alertas y Funciones */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AlertasRecientes
          alertas={alertasResult.success ? alertasResult.data : []}
        />
        <FuncionesProximas
          funciones={funcionesResult.success ? funcionesResult.data : []}
        />
      </div>
    </div>
  );
}
