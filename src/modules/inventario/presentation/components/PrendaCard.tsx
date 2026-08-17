"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowLeftRight,
  Edit,
  Trash2,
  Copy,
  Calendar,
  MapPin,
  Tag,
  User,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
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
import type { Prenda } from "../../domain/entities";
import type { EstadoPrenda } from "@/shared/types";
import { toast } from "@/shared/hooks/useToast";
import { eliminarPrendaAction } from "../../infrastructure/actions";
import { PrendaFormDialog } from "./PrendaFormDialog";
import { TraspasoDialog } from "@/modules/movimientos/presentation/components";
import type { Cuadro } from "@/modules/cuadros/domain/entities";

interface PrendaCardProps {
  prenda: Prenda;
  cuadros: Cuadro[];
  bailarinNombre: string | null;
}

const ESTADO_STYLES: Record<EstadoPrenda, string> = {
  Disponible: "bg-green-100 text-green-800 border-green-200",
  "En uso": "bg-blue-100 text-blue-800 border-blue-200",
  "En reparación": "bg-yellow-100 text-yellow-800 border-yellow-200",
  Faltante: "bg-red-100 text-red-800 border-red-200",
  Prestada: "bg-purple-100 text-purple-800 border-purple-200",
  "Dada de baja": "bg-gray-100 text-gray-800 border-gray-200",
};

export function PrendaCard({
  prenda,
  cuadros,
  bailarinNombre,
}: PrendaCardProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
  const [isTraspasoOpen, setIsTraspasoOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await eliminarPrendaAction(prenda.id);

    if (result.success) {
      router.push("/inventario");
    } else {
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: result.error,
      });
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    setIsEditOpen(false);
    router.refresh();
  };

  const handleDuplicateSuccess = () => {
    setIsDuplicateOpen(false);
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/inventario">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inventario
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main info card */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-xl">{prenda.nombre}</CardTitle>
              <p className="text-sm text-muted-foreground font-mono mt-1">
                {prenda.codigoIdentificador}
              </p>
            </div>
            <div className="flex gap-2">
              {prenda.bailarinActualId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTraspasoOpen(true)}
                >
                  <ArrowLeftRight className="mr-2 h-4 w-4" />
                  Traspasar
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDuplicateOpen(true)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Crear copia
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isDeleting}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting ? "Eliminando..." : "Eliminar"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar esta prenda?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará
                      permanentemente la prenda{" "}
                      <span className="font-medium">{prenda.nombre}</span> del
                      inventario.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? "Eliminando..." : "Eliminar"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(ESTADO_STYLES[prenda.estado])}
              >
                {prenda.estado}
              </Badge>
              <Badge variant="secondary">{prenda.categoria}</Badge>
              <Badge variant="secondary">{prenda.genero}</Badge>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem
                icon={<Tag className="h-4 w-4" />}
                label="Propietario"
                value={prenda.propietario}
              />
              <DetailItem
                icon={<MapPin className="h-4 w-4" />}
                label="Ubicación"
                value={prenda.ubicacion ?? "Sin ubicación"}
              />
              <DetailItem
                icon={<Calendar className="h-4 w-4" />}
                label="Fecha de ingreso"
                value={prenda.fechaIngreso.toLocaleDateString("es-CL")}
              />
              <DetailItem
                icon={<User className="h-4 w-4" />}
                label="Bailarín actual"
                value={bailarinNombre ?? "Sin asignar"}
              />
            </div>

            {prenda.color && (
              <DetailItem
                icon={<Tag className="h-4 w-4" />}
                label="Color"
                value={prenda.color}
              />
            )}

            {prenda.tallaONumero && (
              <DetailItem
                icon={<Tag className="h-4 w-4" />}
                label="Talla / Número"
                value={prenda.tallaONumero}
              />
            )}

            {prenda.identificadorFisico && (
              <DetailItem
                icon={<Tag className="h-4 w-4" />}
                label="Identificador físico"
                value={prenda.identificadorFisico}
              />
            )}

            {prenda.comentarios && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Comentarios
                  </p>
                  <p className="text-sm">{prenda.comentarios}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Image card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Foto</CardTitle>
          </CardHeader>
          <CardContent>
            {prenda.fotoUrl ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-md">
                <Image
                  src={prenda.fotoUrl}
                  alt={prenda.nombre}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-md bg-muted">
                <p className="text-sm text-muted-foreground">Sin foto</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <PrendaFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={handleEditSuccess}
        prenda={prenda}
        cuadros={cuadros}
      />

      {/* Duplicate Dialog */}
      <PrendaFormDialog
        open={isDuplicateOpen}
        onOpenChange={setIsDuplicateOpen}
        onSuccess={handleDuplicateSuccess}
        cuadros={cuadros}
        initialData={prenda}
      />

      {/* Traspaso Dialog */}
      {prenda.bailarinActualId && (
        <TraspasoDialog
          open={isTraspasoOpen}
          onOpenChange={setIsTraspasoOpen}
          prendaId={prenda.id}
          bailarinOrigenId={prenda.bailarinActualId}
        />
      )}
    </>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
}
