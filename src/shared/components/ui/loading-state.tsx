"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  /** Tiempo en ms antes de mostrar el mensaje de "tardando más" (default: 10000) */
  slowThreshold?: number;
  /** Mensaje personalizado */
  message?: string;
}

/**
 * Componente de loading que muestra un mensaje adicional
 * si la carga tarda más de 10 segundos.
 */
export function LoadingState({
  slowThreshold = 10000,
  message = "Cargando...",
}: LoadingStateProps) {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsSlow(true), slowThreshold);
    return () => clearTimeout(timer);
  }, [slowThreshold]);

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {isSlow && (
        <p className="text-xs text-muted-foreground animate-in fade-in">
          Está tardando más de lo esperado...
        </p>
      )}
    </div>
  );
}
