"use client";

import Link from "next/link";
import { User, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Bailarin } from "../../domain";
import { ColorNorteBadge } from "./ColorNorteBadge";

interface BailarinListProps {
  bailarines: Bailarin[];
}

export function BailarinList({ bailarines }: BailarinListProps) {
  if (bailarines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg">
          No se encontraron bailarines
        </p>
        <p className="text-muted-foreground text-sm mt-1">
          Intenta ajustar los filtros o registrar un nuevo bailarín
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {bailarines.map((bailarin) => (
        <Link key={bailarin.id} href={`/bailarines/${bailarin.id}`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base leading-tight">
                  {bailarin.nombreCompleto}
                </CardTitle>
                {!bailarin.activo && (
                  <Badge variant="secondary" className="text-xs">
                    Inactivo
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{bailarin.genero}</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {bailarin.cuadrosActivos.map((cuadroId) => (
                  <Badge key={cuadroId} variant="outline" className="text-xs">
                    {cuadroId}
                  </Badge>
                ))}
              </div>

              {bailarin.colorNorte && (
                <ColorNorteBadge color={bailarin.colorNorte} />
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
