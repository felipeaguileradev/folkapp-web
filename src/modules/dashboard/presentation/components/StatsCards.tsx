import { Package, Users, ArrowLeftRight, Palette } from "lucide-react";
import type { DashboardStats } from "../../domain/entities";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total prendas",
      value: stats.totalPrendas,
      icon: Package,
      iconBg: "bg-sidebar text-white",
    },
    {
      title: "Bailarines",
      value: stats.bailarinesActivos,
      icon: Users,
      iconBg: "bg-sidebar text-white",
    },
    {
      title: "En uso",
      value: stats.prendasEnUso,
      icon: ArrowLeftRight,
      iconBg: "bg-primary text-white",
    },
    {
      title: "Cuadros",
      value: stats.totalCuadros,
      icon: Palette,
      iconBg: "bg-cuadro-huaso text-white",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="border border-border rounded-2xl p-4 flex items-center gap-3.5"
          >
            <div
              className={`w-[42px] h-[42px] rounded-[13px] flex items-center justify-center shrink-0 ${card.iconBg}`}
            >
              <Icon className="h-[22px] w-[22px]" />
            </div>
            <div>
              <p className="text-[22px] font-bold leading-none font-display">
                {card.value}
              </p>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">
                {card.title}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
