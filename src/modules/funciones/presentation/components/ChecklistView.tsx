"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  X,
  Calendar,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { toast } from "@/shared/hooks/useToast";
import type { Funcion, ChecklistItem } from "../../domain/entities";
import type { EstadoVerificacion } from "@/shared/types";
import {
  verificarItemAction,
  marcarFaltanteAction,
  finalizarFuncionAction,
} from "../../infrastructure/actions";
import { ProgressIndicator } from "./ProgressIndicator";

interface ChecklistViewProps {
  funcion: Funcion;
  items: ChecklistItem[];
}

const ESTADO_ITEM_STYLES: Record<EstadoVerificacion, string> = {
  pendiente: "bg-gray-50 border-gray-200",
  verificado: "bg-green-50 border-green-200",
  faltante: "bg-red-50 border-red-200",
};

export function ChecklistView({ funcion, items }: ChecklistViewProps) {
  const router = useRouter();
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Agrupar ítems por bailarín
  const groupedByBailarin = items.reduce(
    (acc, item) => {
      if (!acc[item.bailarinId]) {
        acc[item.bailarinId] = [];
      }
      acc[item.bailarinId].push(item);
      return acc;
    },
    {} as Record<string, ChecklistItem[]>,
  );

  const totalItems = items.length;
  const verificados = items.filter((i) => i.estado === "verificado").length;
  const faltantes = items.filter((i) => i.estado === "faltante").length;

  const handleVerificar = async (itemId: string) => {
    await verificarItemAction(itemId);
    router.refresh();
  };

  const handleMarcarFaltante = async (itemId: string) => {
    await marcarFaltanteAction(itemId);
    router.refresh();
  };

  const handleFinalizar = async () => {
    setIsFinalizing(true);
    const result = await finalizarFuncionAction(funcion.id);

    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Error al finalizar",
        description: result.error,
      });
    }

    setIsFinalizing(false);
    router.refresh();
  };

  const isFinalized = funcion.estado === "Finalizada";

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/funciones">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a funciones
          </Link>
        </Button>
      </div>

      {/* Header card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-xl">{funcion.nombre}</CardTitle>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {funcion.fecha.toLocaleDateString("es-CL")}
              </span>
              {funcion.lugar && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {funcion.lugar}
                </span>
              )}
            </div>
          </div>
          {!isFinalized && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={isFinalizing}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {isFinalizing ? "Finalizando..." : "Finalizar función"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Finalizar esta función?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Una vez finalizada, no se
                    podrán hacer más cambios en la función.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleFinalizar}>
                    {isFinalizing ? "Finalizando..." : "Finalizar"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardHeader>
        <CardContent>
          <ProgressIndicator
            total={totalItems}
            verificados={verificados}
            faltantes={faltantes}
          />
        </CardContent>
      </Card>

      {/* Checklist grouped by bailarin */}
      <div className="space-y-4 mt-6">
        {Object.entries(groupedByBailarin).map(
          ([bailarinId, bailarinItems]) => (
            <Card key={bailarinId}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Bailarín: {bailarinId.slice(0, 8)}...
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {bailarinItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center justify-between rounded-md border p-2",
                      ESTADO_ITEM_STYLES[item.estado],
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.prendaCategoria}
                      </Badge>
                      <span className="text-sm">{item.prendaNombre}</span>
                    </div>

                    {!isFinalized && item.estado === "pendiente" && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
                          onClick={() => handleVerificar(item.id)}
                          title="Verificar"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                          onClick={() => handleMarcarFaltante(item.id)}
                          title="Marcar faltante"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {item.estado === "verificado" && (
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 border-green-200 text-xs"
                      >
                        ✓ Verificado
                      </Badge>
                    )}

                    {item.estado === "faltante" && (
                      <Badge
                        variant="outline"
                        className="bg-red-100 text-red-800 border-red-200 text-xs"
                      >
                        ✗ Faltante
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ),
        )}
      </div>
    </>
  );
}
