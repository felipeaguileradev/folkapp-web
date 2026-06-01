"use client";

import { ArrowLeftRight, Clock, AlertTriangle } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { Movimiento } from "../../domain/entities";
import type { TipoMovimiento } from "@/shared/types";
import { DevolucionDialog } from "./DevolucionDialog";
import { useState } from "react";

interface MovimientoListProps {
  movimientos: Movimiento[];
}

const TIPO_STYLES: Record<TipoMovimiento, string> = {
  Asignación: "bg-blue-100 text-blue-800 border-blue-200",
  "Préstamo interno": "bg-purple-100 text-purple-800 border-purple-200",
  "Préstamo externo": "bg-orange-100 text-orange-800 border-orange-200",
  Devolución: "bg-green-100 text-green-800 border-green-200",
  Traspaso: "bg-cyan-100 text-cyan-800 border-cyan-200",
};

function isOverdue(movimiento: Movimiento): boolean {
  if (movimiento.devuelta) return false;
  if (!movimiento.fechaDevolucionEsperada) return false;
  return new Date() > movimiento.fechaDevolucionEsperada;
}

export function MovimientoList({ movimientos }: MovimientoListProps) {
  const [devolucionMovimientoId, setDevolucionMovimientoId] = useState<
    string | null
  >(null);

  if (movimientos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ArrowLeftRight className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg">
          No se encontraron movimientos
        </p>
        <p className="text-muted-foreground text-sm mt-1">
          Los movimientos se crean al asignar, prestar o traspasar prendas
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Prenda</TableHead>
            <TableHead>Bailarín</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Devolución esperada</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movimientos.map((movimiento) => {
            const overdue = isOverdue(movimiento);
            return (
              <TableRow
                key={movimiento.id}
                className={overdue ? "bg-red-50" : ""}
              >
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(TIPO_STYLES[movimiento.tipo])}
                  >
                    {movimiento.tipo}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {movimiento.prendaId.slice(0, 8)}...
                </TableCell>
                <TableCell className="text-sm">
                  {movimiento.bailarinId.slice(0, 8)}...
                  {movimiento.bailarinDestinoId && (
                    <span className="text-muted-foreground">
                      {" → "}
                      {movimiento.bailarinDestinoId.slice(0, 8)}...
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {movimiento.fechaInicio.toLocaleDateString("es-CL")}
                </TableCell>
                <TableCell>
                  {movimiento.fechaDevolucionEsperada ? (
                    <div className="flex items-center gap-1">
                      {overdue && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          overdue && "text-red-600 font-medium",
                        )}
                      >
                        {movimiento.fechaDevolucionEsperada.toLocaleDateString(
                          "es-CL",
                        )}
                      </span>
                      {overdue && (
                        <Badge variant="destructive" className="text-xs ml-1">
                          Vencido
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {movimiento.devuelta ? (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-200"
                    >
                      Devuelta
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-yellow-100 text-yellow-800 border-yellow-200"
                    >
                      Pendiente
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {!movimiento.devuelta && movimiento.tipo !== "Traspaso" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDevolucionMovimientoId(movimiento.id)}
                    >
                      Devolver
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <DevolucionDialog
        movimientoId={devolucionMovimientoId}
        onClose={() => setDevolucionMovimientoId(null)}
      />
    </>
  );
}
