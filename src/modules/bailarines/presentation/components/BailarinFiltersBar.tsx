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
import type { BailarinFilters } from "../../domain";

interface BailarinFiltersBarProps {
  currentFilters: BailarinFilters;
}

const GENERO_OPTIONS = ["Masculino", "Femenino"] as const;

export function BailarinFiltersBar({
  currentFilters,
}: BailarinFiltersBarProps) {
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
    params.delete("page");

    startTransition(() => {
      router.push(`/bailarines?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      router.push("/bailarines");
    });
  };

  const hasActiveFilters =
    currentFilters.genero ||
    currentFilters.cuadroId ||
    currentFilters.activo !== undefined;

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
        value={
          currentFilters.activo === undefined
            ? ""
            : currentFilters.activo
              ? "true"
              : "false"
        }
        onValueChange={(val) =>
          updateFilter("activo", val === "all" ? undefined : val)
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="true">Activos</SelectItem>
          <SelectItem value="false">Inactivos</SelectItem>
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
