"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Algo salió mal</h1>
        <p className="text-muted-foreground text-sm">
          Ocurrió un error inesperado
        </p>
        <button
          onClick={reset}
          className="inline-block rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
