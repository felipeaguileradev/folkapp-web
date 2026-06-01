"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Prenda } from "../../domain/entities";
import type { EstadoPrenda } from "@/shared/types";

interface PrendaTableProps {
  prendas: Prenda[];
}

const ESTADO_STYLES: Record<EstadoPrenda, string> = {
  Disponible: "bg-green-100 text-green-800 border-green-200",
  "En uso": "bg-blue-100 text-blue-800 border-blue-200",
  "En reparación": "bg-yellow-100 text-yellow-800 border-yellow-200",
  Faltante: "bg-red-100 text-red-800 border-red-200",
  Prestada: "bg-purple-100 text-purple-800 border-purple-200",
  "Dada de baja": "bg-gray-100 text-gray-800 border-gray-200",
};

export function PrendaTable({ prendas }: PrendaTableProps) {
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Género</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Propietario</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {prendas.map((prenda) => (
          <TableRow key={prenda.id} className="cursor-pointer">
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
