"use client";

import { useState } from "react";
import {
  TableProperties,
  ArrowLeftRight,
  ClipboardCheck,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

type ReportType = "inventario" | "movimientos" | "verificacion";

const REPORT_CARDS = [
  {
    type: "inventario" as ReportType,
    title: "Inventario completo",
    description: "Todas las prendas con estado, cuadro y propietario.",
    icon: TableProperties,
    iconBg: "bg-emerald-100 text-emerald-600",
  },
  {
    type: "movimientos" as ReportType,
    title: "Movimientos del mes",
    description: "Asignaciones, préstamos y traspasos con fechas.",
    icon: ArrowLeftRight,
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    type: "verificacion" as ReportType,
    title: "Verificación por función",
    description: "Estado del checklist de vestuario por evento.",
    icon: ClipboardCheck,
    iconBg: "bg-orange-100 text-cuadro-huaso",
  },
];

export function ReportesContent() {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (tipo: ReportType, format: "pdf" | "excel") => {
    const key = `${tipo}-${format}`;
    setIsGenerating(key);
    setError(null);

    try {
      const params = new URLSearchParams({ tipo });
      const response = await fetch(
        `/api/reportes/${format}?${params.toString()}`,
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || `Error al generar ${format.toUpperCase()}`,
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reporte-${tipo}.${format === "pdf" ? "pdf" : "xlsx"}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al generar el reporte. Intenta de nuevo.",
      );
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[30px] font-bold tracking-tight font-display">
          Reportes
        </h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Genera reportes para auditoría y control
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-[14px] bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {REPORT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.type}
              className="border border-border rounded-2xl p-5"
            >
              <div
                className={`w-[42px] h-[42px] rounded-[13px] flex items-center justify-center mb-3.5 ${card.iconBg}`}
              >
                <Icon className="h-[22px] w-[22px]" />
              </div>
              <h3 className="text-[15px] font-bold">{card.title}</h3>
              <p className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed">
                {card.description}
              </p>
              <div className="flex gap-2 mt-3.5">
                <Button
                  onClick={() => handleGenerate(card.type, "pdf")}
                  disabled={isGenerating !== null}
                  className="flex-1 bg-sidebar text-white font-bold text-xs py-2.5 h-auto rounded-[10px]"
                >
                  {isGenerating === `${card.type}-pdf` ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "PDF"
                  )}
                </Button>
                <Button
                  onClick={() => handleGenerate(card.type, "excel")}
                  disabled={isGenerating !== null}
                  variant="outline"
                  className="flex-1 font-bold text-xs py-2.5 h-auto rounded-[10px]"
                >
                  {isGenerating === `${card.type}-excel` ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Excel"
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent reports section - placeholder */}
      <div>
        <h3 className="text-[15px] font-bold font-display mb-3">
          Reportes recientes
        </h3>
        <div className="border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3.5 px-[18px] py-3.5 text-muted-foreground">
            <div className="w-9 h-9 rounded-[11px] bg-secondary flex items-center justify-center shrink-0">
              <Download className="h-[19px] w-[19px]" />
            </div>
            <p className="text-[13px]">
              Los reportes generados aparecerán aquí
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
