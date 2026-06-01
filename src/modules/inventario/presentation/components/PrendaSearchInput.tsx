"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/shared/components/ui/input";

interface PrendaSearchInputProps {
  defaultValue: string;
}

export function PrendaSearchInput({ defaultValue }: PrendaSearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(defaultValue);

  const handleSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (term.length >= 2) {
        params.set("q", term);
        params.delete("page"); // Reset page on new search
      } else {
        params.delete("q");
      }

      startTransition(() => {
        router.push(`/inventario?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Buscar por nombre, código o bailarín (mín. 2 caracteres)..."
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          handleSearch(e.target.value);
        }}
        className={`pl-9 ${isPending ? "opacity-70" : ""}`}
      />
    </div>
  );
}
