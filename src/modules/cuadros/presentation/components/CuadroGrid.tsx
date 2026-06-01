"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { Cuadro } from "../../domain/entities";
import { CuadroBadge } from "./CuadroBadge";

interface CuadroGridProps {
  cuadros: Cuadro[];
}

export function CuadroGrid({ cuadros }: CuadroGridProps) {
  if (cuadros.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground text-lg">
          No hay cuadros registrados
        </p>
        <p className="text-muted-foreground text-sm mt-1">
          Crea un nuevo cuadro para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cuadros.map((cuadro) => (
        <Link key={cuadro.id} href={`/cuadros/${cuadro.id}`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CuadroBadge color={cuadro.colorUi} nombre={cuadro.nombre} />
                <CardTitle className="text-base">{cuadro.nombre}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{cuadro.zonaGeografica}</span>
              </div>
              {cuadro.descripcion && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {cuadro.descripcion}
                </p>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
