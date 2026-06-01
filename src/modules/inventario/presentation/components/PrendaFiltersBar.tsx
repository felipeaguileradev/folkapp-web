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
import type { PrendaFilters } from "../../domain/ports";

interface PrendaFiltersBarProps {
  currentFilters: PrendaFilters;
}

const GENERO_OPTIONS = ["Masculino", "Femenino", "Unisex"] as const;
const CATEGORIA_OPTIONS = [
  "Tocado",
  "Ropa superior",
  "Ropa inferior",
  "Calzado",
  "Accesorio",
  "Joyería",
] as const;
const ESTADO_OPTIONS = [
  "Disponible",
  "En uso",
  "En reparación",
  "Faltante",
  "Prestada",
  "Dada de baja",
] as const;
const PROPIETARIO_OPTIONS = ["Ballet", "Personal"] as const;

export function PrendaFiltersBar({ currentFilters }: PrendaFiltersBarProps) {
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
    params.delete("page"); // Reset page on filter change

    startTransition(() => {
      router.push(`/inventario?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);

    startTransition(() => {
      router.push(`/inventario?${params.toString()}`);
    });
  };

  const hasActiveFilters =
    currentFilters.genero ||
    currentFilters.categoria ||
    currentFilters.estado ||
    currentFilters.propietario;

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${isPending ? "opacity-70" : ""}`}
    >
      <Select
        value={currentFilters.genero ?? ""}
        onValueChange={(val) =>
          updateFilter("genero", val === "all" ? undefined : val)
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Género" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {GENERO_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentFilters.categoria ?? ""}
        onValueChange={(val) =>
          updateFilter("categoria", val === "all" ? undefined : val)
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {CATEGORIA_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentFilters.estado ?? ""}
        onValueChange={(val) =>
          updateFilter("estado", val === "all" ? undefined : val)
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {ESTADO_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentFilters.propietario ?? ""}
        onValueChange={(val) =>
          updateFilter("propietario", val === "all" ? undefined : val)
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Propietario" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {PROPIETARIO_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
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
