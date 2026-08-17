"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, Copy } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { toast } from "@/shared/hooks/useToast";
import type { Prenda } from "../../domain/entities";
import type { EstadoPrenda } from "@/shared/types";
import type { Cuadro } from "@/modules/cuadros/domain/entities";
import {
  eliminarPrendaAction,
  eliminarPrendasMasivoAction,
} from "../../infrastructure/actions";
import { PrendaFormDialog } from "./PrendaFormDialog";

interface PrendaTableProps {
  prendas: Prenda[];
  cuadros: Cuadro[];
}

const ESTADO_STYLES: Record<EstadoPrenda, string> = {
  Disponible: "bg-green-100 text-green-800 border-green-200",
  "En uso": "bg-blue-100 text-blue-800 border-blue-200",
  "En reparación": "bg-yellow-100 text-yellow-800 border-yellow-200",
  Faltante: "bg-red-100 text-red-800 border-red-200",
  Prestada: "bg-purple-100 text-purple-800 border-purple-200",
  "Dada de baja": "bg-gray-100 text-gray-800 border-gray-200",
};

export function PrendaTable({ prendas, cuadros }: PrendaTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "single" | "bulk";
    id?: string;
    name?: string;
  } | null>(null);
  const [duplicateTarget, setDuplicateTarget] = useState<Prenda | null>(null);

  const isAllSelected =
    prendas.length > 0 && selectedIds.size === prendas.length;
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(prendas.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    setSelectedIds(next);
  };

  const handleDeleteSingle = (prenda: Prenda) => {
    setDeleteTarget({ type: "single", id: prenda.id, name: prenda.nombre });
  };

  const handleDeleteBulk = () => {
    setDeleteTarget({ type: "bulk" });
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);

    if (deleteTarget?.type === "single" && deleteTarget.id) {
      const result = await eliminarPrendaAction(deleteTarget.id);
      if (result.success) {
        toast({
          variant: "success",
          title: "Prenda eliminada",
          description: `Se eliminó "${deleteTarget.name}" correctamente.`,
        });
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(deleteTarget.id!);
          return next;
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error al eliminar",
          description: result.error,
        });
      }
    } else if (deleteTarget?.type === "bulk") {
      const ids = Array.from(selectedIds);
      const result = await eliminarPrendasMasivoAction(ids);
      if (result.success) {
        toast({
          variant: "success",
          title: "Prendas eliminadas",
          description: `Se eliminaron ${result.data.deleted} prendas correctamente.`,
        });
        setSelectedIds(new Set());
      } else {
        toast({
          variant: "destructive",
          title: "Error al eliminar",
          description: result.error,
        });
      }
    }

    setIsDeleting(false);
    setDeleteTarget(null);
    router.refresh();
  };

  if (prendas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground text-lg">
          No se encontraron prendas
        </p>
        <p className="text-muted-foreground text-sm mt-1">
          Intenta ajustar los filtros o crear una nueva prenda
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2.5 mb-3">
          <span className="text-sm font-medium">
            {selectedIds.size}{" "}
            {selectedIds.size === 1
              ? "prenda seleccionada"
              : "prendas seleccionadas"}
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteBulk}
            className="ml-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar seleccionadas
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={
                  isAllSelected
                    ? true
                    : isSomeSelected
                      ? "indeterminate"
                      : false
                }
                onCheckedChange={handleSelectAll}
                aria-label="Seleccionar todas"
              />
            </TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Género</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Propietario</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prendas.map((prenda) => (
            <TableRow
              key={prenda.id}
              className={cn(
                "cursor-pointer",
                selectedIds.has(prenda.id) && "bg-muted/50",
              )}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.has(prenda.id)}
                  onCheckedChange={(checked) =>
                    handleSelectOne(prenda.id, !!checked)
                  }
                  aria-label={`Seleccionar ${prenda.nombre}`}
                />
              </TableCell>
              <TableCell>
                <Link
                  href={`/inventario/${prenda.id}`}
                  className="font-mono text-sm font-medium hover:underline"
                >
                  {prenda.codigoIdentificador}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/inventario/${prenda.id}`}
                  className="hover:underline"
                >
                  {prenda.nombre}
                </Link>
              </TableCell>
              <TableCell>{prenda.categoria}</TableCell>
              <TableCell>{prenda.genero}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(ESTADO_STYLES[prenda.estado])}
                >
                  {prenda.estado}
                </Badge>
              </TableCell>
              <TableCell>{prenda.propietario}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => setDuplicateTarget(prenda)}
                    title="Crear copia"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteSingle(prenda)}
                    title="Eliminar prenda"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget?.type === "single"
                ? "¿Eliminar esta prenda?"
                : `¿Eliminar ${selectedIds.size} prendas?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === "single" ? (
                <>
                  Se eliminará permanentemente la prenda{" "}
                  <span className="font-medium">{deleteTarget.name}</span> del
                  inventario. Esta acción no se puede deshacer.
                </>
              ) : (
                <>
                  Se eliminarán permanentemente{" "}
                  <span className="font-medium">
                    {selectedIds.size} prendas
                  </span>{" "}
                  del inventario. Esta acción no se puede deshacer.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate dialog */}
      <PrendaFormDialog
        open={duplicateTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDuplicateTarget(null);
        }}
        onSuccess={() => {
          setDuplicateTarget(null);
          router.refresh();
        }}
        cuadros={cuadros}
        initialData={duplicateTarget ?? undefined}
      />
    </>
  );
}
