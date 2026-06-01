"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { History } from "lucide-react";
import type { HistorialEntry } from "../../domain/entities";
import { HistorialTimeline } from "./HistorialTimeline";

interface HistorialBailarinListProps {
  bailarinId: string;
  initialEntries?: HistorialEntry[];
}

const LIMIT = 50;

/**
 * Componente para el perfil del bailarín que muestra su historial
 * de eventos con paginación "cargar más".
 */
export function HistorialBailarinList({
  bailarinId,
  initialEntries = [],
}: HistorialBailarinListProps) {
  const [entries, setEntries] = useState<HistorialEntry[]>(initialEntries);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialEntries.length >= LIMIT);

  const handleLoadMore = async () => {
    if (entries.length === 0) return;

    setIsLoadingMore(true);

    // En una implementación completa, esto llamaría a un server action
    // con el cursor del último entry. Por ahora indicamos que no hay más.
    setHasMore(false);
    setIsLoadingMore(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4" />
          Historial de actividad
        </CardTitle>
      </CardHeader>
      <CardContent>
        <HistorialTimeline
          entries={entries}
          onLoadMore={handleLoadMore}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
        />
      </CardContent>
    </Card>
  );
}
