"use client";

import { useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";

type ReportType =
  | "inventario"
  | "lista-compras"
  | "ficha-bailarin"
  | "estado-cuadro";

const REPORT_OPTIONS: {
  value: ReportType;
  label: string;
  description: string;
}[] = [
  {
    value: "inventario",
    label: "Reporte de Inventario",
    description: "Listado completo de prendas con filtros",
  },
  {
    value: "lista-compras",
    label: "Lista de Compras",
    description: "Prendas faltantes agrupadas por cuadro",
  },
  {
    value: "ficha-bailarin",
    label: "Ficha de Bailarín",
    description: "Nombre, tallas y vestuario asignado",
  },
  {
    value: "estado-cuadro",
    label: "Estado de Cuadro",
    description: "Completitud, alertas y prendas en reparación",
  },
];

export function ReportesContent() {
  const [selectedReport, setSelectedReport] = useState<ReportType | "">("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePdf = async () => {
    if (!selectedReport) return;
    setIsGenerating(true);
    setError(null);

    try {
      const params = new URLSearchParams({ tipo: selectedReport });
      const response = await fetch(`/api/reportes/pdf?${params.toString()}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al generar PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reporte-${selectedReport}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al generar el reporte. Intenta de nuevo.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateExcel = async () => {
    if (!selectedReport) return;
    setIsGenerating(true);
    setError(null);

    try {
      const params = new URLSearchParams({ tipo: selectedReport });
      const response = await fetch(`/api/reportes/excel?${params.toString()}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al generar Excel");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reporte-${selectedReport}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al generar el reporte. Intenta de nuevo.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground">
          Genera y exporta reportes del inventario de vestuario
        </p>
      </div>

      {/* Report selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tipo de reporte</CardTitle>
          <CardDescription>
            Selecciona el tipo de reporte que deseas generar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Reporte</Label>
            <Select
              value={selectedReport}
              onValueChange={(val) => setSelectedReport(val as ReportType)}
            >
              <SelectTrigger className="w-full max-w-sm">
                <SelectValue placeholder="Seleccionar tipo de reporte" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedReport && (
            <p className="text-sm text-muted-foreground">
              {
                REPORT_OPTIONS.find((o) => o.value === selectedReport)
                  ?.description
              }
            </p>
          )}
        </CardContent>
      </Card>

      {/* Export buttons */}
      {selectedReport && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Exportar</CardTitle>
            <CardDescription>
              Descarga el reporte en el formato deseado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-4">
                {error}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                  onClick={() => setError(null)}
                >
                  Reintentar
                </Button>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleGeneratePdf}
                disabled={isGenerating}
                variant="outline"
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Descargar PDF
              </Button>
              <Button
                onClick={handleGenerateExcel}
                disabled={isGenerating}
                variant="outline"
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Descargar Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
