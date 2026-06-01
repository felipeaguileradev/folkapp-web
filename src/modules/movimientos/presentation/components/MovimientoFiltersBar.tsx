"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { X } from "lucide-react";
import type { MovimientoFilters } from "../../domain/ports";

interface MovimientoFiltersBarProps {
  currentFilters: MovimientoFilters;
}

const TIPO_OPTIONS = [
  "Asignación",
  "Préstamo interno",
  "Préstamo externo",
  "Devolución",
  "Traspaso",
] as const;

export function MovimientoFiltersBar({
  currentFilters,
}: MovimientoFiltersBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.push(`/movimientos?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      router.push("/movimientos");
    });
  };

  const hasActiveFilters =
    currentFilters.tipo || currentFilters.devuelta !== undefined;

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${isPending ? "opacity-70" : ""}`}
    >
      <Select
        value={currentFilters.tipo ?? ""}
        onValueChange={(val) =>
          updateFilter("tipo", val === "all" ? undefined : val)
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {TIPO_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={
          currentFilters.devuelta === undefined
            ? ""
            : currentFilters.devuelta
              ? "true"
              : "false"
        }
        onValueChange={(val) =>
          updateFilter("devuelta", val === "all" ? undefined : val)
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Devolución" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="false">Pendientes</SelectItem>
          <SelectItem value="true">Devueltas</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-1 h-4 w-4" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
