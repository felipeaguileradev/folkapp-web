import {
  Package,
  Users,
  Palette,
  Bell,
  ArrowLeftRight,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import type { DashboardStats } from "../../domain/entities";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Prendas",
      value: stats.totalPrendas.toLocaleString("es-CL"),
      description: `${stats.prendasDisponibles} disponibles`,
      icon: Package,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      title: "Bailarines Activos",
      value: stats.bailarinesActivos.toLocaleString("es-CL"),
      description: `${stats.totalBailarines} registrados`,
      icon: Users,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
    },
    {
      title: "Cuadros",
      value: stats.totalCuadros.toLocaleString("es-CL"),
      description: "Cuadros de baile",
      icon: Palette,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
    },
    {
      title: "Alertas Activas",
      value: stats.alertasActivas.toLocaleString("es-CL"),
      description:
        stats.alertasAlta > 0
          ? `${stats.alertasAlta} de prioridad alta`
          : "Sin alertas urgentes",
      icon: stats.alertasAlta > 0 ? AlertTriangle : CheckCircle,
      iconColor: stats.alertasAlta > 0 ? "text-red-600" : "text-emerald-600",
      iconBg: stats.alertasAlta > 0 ? "bg-red-100" : "bg-emerald-100",
    },
    {
      title: "Prendas en Uso",
      value: stats.prendasEnUso.toLocaleString("es-CL"),
      description: `${stats.prendasFaltantes} faltantes`,
      icon: ArrowLeftRight,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-100",
    },
    {
      title: "Funciones Próximas",
      value: stats.funcionesProximas.toLocaleString("es-CL"),
      description: "Pendientes de realizar",
      icon: Calendar,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-100",
    },
    {
      title: "Movimientos Activos",
      value: stats.movimientosActivos.toLocaleString("es-CL"),
      description: "Sin devolver",
      icon: Bell,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-100",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full ${card.iconBg} shrink-0`}
            >
              <Icon className={`h-5 w-5 ${card.iconColor}`} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold leading-tight">{card.value}</p>
              <p className="text-xs text-muted-foreground truncate">
                {card.title}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
