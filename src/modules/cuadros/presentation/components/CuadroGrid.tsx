"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Cuadro } from "../../domain/entities";

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
        <Link
          key={cuadro.id}
          href={`/cuadros/${cuadro.id}`}
          className="border border-border rounded-[20px] overflow-hidden hover:shadow-md transition-shadow"
        >
          {/* Color band */}
          <div
            className="h-[74px] relative"
            style={{
              backgroundColor: cuadro.colorUi,
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(255,255,255,.16) 0 4px, transparent 4px 9px)",
            }}
          >
            {/* Chip with letter */}
            <div
              className="absolute left-[18px] -bottom-[22px] w-[52px] h-[52px] rounded-[15px] text-white flex items-center justify-center font-extrabold text-xl border-[3px] border-white font-display"
              style={{ background: cuadro.colorUi }}
            >
              {cuadro.nombre[0]}
            </div>
          </div>

          {/* Content */}
          <div className="px-[18px] pt-[30px] pb-[18px]">
            <h3 className="text-[17px] font-bold">{cuadro.nombre}</h3>
            <div className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground mt-0.5">
              <MapPin className="h-[15px] w-[15px]" />
              {cuadro.zonaGeografica}
            </div>
            {cuadro.descripcion && (
              <p className="text-[13px] text-muted-foreground/80 mt-2.5 leading-relaxed line-clamp-2">
                {cuadro.descripcion}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
