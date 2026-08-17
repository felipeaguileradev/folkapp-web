"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowLeftRight,
  Edit,
  UserCheck,
  UserX,
  Calendar,
  Plus,
  Ruler,
  Shirt,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { toast } from "@/shared/hooks/useToast";
import type { Bailarin } from "../../domain";
import type { Prenda } from "@/modules/inventario/domain/entities";
import { toggleActivoAction } from "../../infrastructure/actions";
import { BailarinFormDialog } from "./BailarinFormDialog";
import { TallasSection } from "./TallasSection";
import { AsignarPrendaBailarinDialog } from "./AsignarPrendaBailarinDialog";
import { TraspasoDialog } from "@/modules/movimientos/presentation/components";

interface BailarinProfileProps {
  bailarin: Bailarin;
  cuadrosMap: Record<string, string>;
  prendasAsignadas?: Prenda[];
}

export function BailarinProfile({
  bailarin,
  cuadrosMap,
  prendasAsignadas,
}: BailarinProfileProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [traspasoPrendaId, setTraspasoPrendaId] = useState<string | null>(null);
  const [isAsignarOpen, setIsAsignarOpen] = useState(false);

  const handleToggleActivo = async () => {
    setIsToggling(true);
    const result = await toggleActivoAction(bailarin.id, !bailarin.activo);

    if (result.success) {
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
    setIsToggling(false);
  };

  const handleEditSuccess = () => {
    setIsEditOpen(false);
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/bailarines">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a bailarines
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main info */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-xl">
                {bailarin.nombreCompleto}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {bailarin.genero} · {bailarin.activo ? "Activo" : "Inactivo"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button
                variant={bailarin.activo ? "destructive" : "default"}
                size="sm"
                onClick={handleToggleActivo}
                disabled={isToggling}
              >
                {bailarin.activo ? (
                  <>
                    <UserX className="mr-2 h-4 w-4" />
                    {isToggling ? "Desactivando..." : "Desactivar"}
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    {isToggling ? "Activando..." : "Activar"}
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={bailarin.activo ? "default" : "secondary"}>
                {bailarin.activo ? "Activo" : "Inactivo"}
              </Badge>
              {bailarin.cuadrosActivos.map((cuadroId) => (
                <Badge key={cuadroId} variant="outline">
                  {(cuadrosMap ?? {})[cuadroId] ?? cuadroId}
                </Badge>
              ))}
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Fecha de ingreso
                  </p>
                  <p className="text-sm">
                    {bailarin.fechaIngreso.toLocaleDateString("es-CL")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Ruler className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Cuadros activos
                  </p>
                  <p className="text-sm">
                    {bailarin.cuadrosActivos.length}{" "}
                    {bailarin.cuadrosActivos.length === 1
                      ? "cuadro"
                      : "cuadros"}
                  </p>
                </div>
              </div>
            </div>

            {bailarin.notas && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Notas
                  </p>
                  <p className="text-sm">{bailarin.notas}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tallas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tallas</CardTitle>
          </CardHeader>
          <CardContent>
            <TallasSection tallas={bailarin.tallas} />
          </CardContent>
        </Card>
      </div>

      {/* Prendas asignadas */}
      {(() => {
        // Agrupar prendas por cuadro
        const prendasPorCuadro: Record<string, Prenda[]> = {};
        for (const prenda of prendasAsignadas ?? []) {
          const cuadroNombre = cuadrosMap[prenda.cuadroId] ?? "Sin cuadro";
          if (!prendasPorCuadro[cuadroNombre]) {
            prendasPorCuadro[cuadroNombre] = [];
          }
          prendasPorCuadro[cuadroNombre].push(prenda);
        }

        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Shirt className="h-4 w-4" />
                Prendas asignadas ({(prendasAsignadas ?? []).length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAsignarOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Asignar prenda
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              {(prendasAsignadas ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tiene prendas asignadas
                </p>
              ) : (
                Object.entries(prendasPorCuadro).map(
                  ([cuadroNombre, prendas]) => (
                    <div key={cuadroNombre} className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground">
                        {cuadroNombre}
                      </h4>
                      <div className="space-y-1.5">
                        {prendas.map((prenda) => (
                          <div
                            key={prenda.id}
                            className="flex items-center justify-between rounded-lg border px-3 py-2"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">
                                {prenda.nombre}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {prenda.codigoIdentificador}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant="secondary" className="text-xs">
                                {prenda.categoria}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setTraspasoPrendaId(prenda.id)}
                              >
                                <ArrowLeftRight className="h-4 w-4 mr-1" />
                                Traspasar
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                )
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* Edit Dialog */}
      <BailarinFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={handleEditSuccess}
        bailarin={bailarin}
        cuadrosDisponibles={Object.entries(cuadrosMap ?? {}).map(
          ([id, name]) => ({
            id,
            name,
          }),
        )}
      />

      {/* Traspaso Dialog */}
      {traspasoPrendaId && (
        <TraspasoDialog
          open={!!traspasoPrendaId}
          onOpenChange={(open) => {
            if (!open) setTraspasoPrendaId(null);
          }}
          prendaId={traspasoPrendaId}
          bailarinOrigenId={bailarin.id}
        />
      )}

      {/* Asignar Prenda Dialog */}
      <AsignarPrendaBailarinDialog
        open={isAsignarOpen}
        onOpenChange={setIsAsignarOpen}
        bailarinId={bailarin.id}
        genero={bailarin.genero}
        cuadrosMap={cuadrosMap}
      />
    </>
  );
}
