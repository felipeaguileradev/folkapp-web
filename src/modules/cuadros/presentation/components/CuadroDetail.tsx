"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, MapPin } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
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
import { toast } from "@/shared/hooks/useToast";
import type { Cuadro, PlantillaItem } from "../../domain/entities";
import { eliminarCuadroAction } from "../../infrastructure/actions";
import { CuadroBadge } from "./CuadroBadge";
import { CuadroFormDialog } from "./CuadroFormDialog";
import { PlantillaEditor } from "./PlantillaEditor";

interface CuadroDetailProps {
  cuadro: Cuadro;
  plantillaMasculino: PlantillaItem[];
  plantillaFemenino: PlantillaItem[];
}

export function CuadroDetail({
  cuadro,
  plantillaMasculino,
  plantillaFemenino,
}: CuadroDetailProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await eliminarCuadroAction(cuadro.id);

    if (result.success) {
      router.push("/cuadros");
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

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/cuadros">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a cuadros
          </Link>
        </Button>
      </div>

      {/* Info card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex items-center gap-3">
            <CuadroBadge color={cuadro.colorUi} nombre={cuadro.nombre} />
            <div>
              <CardTitle className="text-xl">{cuadro.nombre}</CardTitle>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                <span>{cuadro.zonaGeografica}</span>
              </div>
            </div>
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar este cuadro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará
                    permanentemente el cuadro{" "}
                    <span className="font-medium">{cuadro.nombre}</span>.
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
        {cuadro.descripcion && (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {cuadro.descripcion}
            </p>
          </CardContent>
        )}
      </Card>

      {/* Plantillas */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <PlantillaEditor
          cuadroId={cuadro.id}
          genero="Masculino"
          items={plantillaMasculino}
        />
        <PlantillaEditor
          cuadroId={cuadro.id}
          genero="Femenino"
          items={plantillaFemenino}
        />
      </div>

      {/* Edit Dialog */}
      <CuadroFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={handleEditSuccess}
        cuadro={cuadro}
      />
    </>
  );
}
