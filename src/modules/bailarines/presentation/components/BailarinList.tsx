"use client";

import Link from "next/link";
import { User, Users } from "lucide-react";
import type { Bailarin } from "../../domain";

interface BailarinListProps {
  bailarines: Bailarin[];
  cuadrosMap: Record<string, string>;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function BailarinList({ bailarines, cuadrosMap }: BailarinListProps) {
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
    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      {bailarines.map((bailarin) => (
        <Link
          key={bailarin.id}
          href={`/bailarines/${bailarin.id}`}
          className="border border-border rounded-2xl p-[18px] hover:shadow-md transition-shadow"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-3.5">
            <div className="w-11 h-11 rounded-[13px] bg-sidebar text-white flex items-center justify-center font-bold text-sm shrink-0">
              {getInitials(bailarin.nombreCompleto)}
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-bold truncate">
                {bailarin.nombreCompleto}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                <User className="h-3.5 w-3.5" />
                {bailarin.genero}
              </div>
            </div>
            <span
              className={`ml-auto w-2 h-2 rounded-full shrink-0 ${
                bailarin.activo ? "bg-emerald-600" : "bg-slate-400"
              }`}
            />
          </div>

          {/* Tallas */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {bailarin.tallas.camisa && (
              <span className="text-[11px] font-semibold text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg">
                Camisa {bailarin.tallas.camisa}
              </span>
            )}
            {bailarin.tallas.pantalon && (
              <span className="text-[11px] font-semibold text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg">
                Pant. {bailarin.tallas.pantalon}
              </span>
            )}
            {bailarin.tallas.calzado && (
              <span className="text-[11px] font-semibold text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg">
                Calzado {bailarin.tallas.calzado}
              </span>
            )}
          </div>

          {/* Cuadros */}
          <div className="flex flex-wrap gap-1.5">
            {bailarin.cuadrosActivos.map((cuadroId) => (
              <span
                key={cuadroId}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground border border-border px-2.5 py-1 rounded-full"
              >
                {cuadrosMap[cuadroId] ?? cuadroId}
              </span>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}
