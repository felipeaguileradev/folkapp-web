interface ProgressIndicatorProps {
  total: number;
  verificados: number;
  faltantes: number;
}

export function ProgressIndicator({
  total,
  verificados,
  faltantes,
}: ProgressIndicatorProps) {
  const pendientes = total - verificados - faltantes;
  const porcentaje = total > 0 ? Math.round((verificados / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          {verificados} de {total} verificados
        </span>
        <span className="text-muted-foreground">{porcentaje}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
        <div className="h-full flex">
          <div
            className="bg-green-500 transition-all"
            style={{ width: `${total > 0 ? (verificados / total) * 100 : 0}%` }}
          />
          <div
            className="bg-red-400 transition-all"
            style={{ width: `${total > 0 ? (faltantes / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Verificados ({verificados})
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          Faltantes ({faltantes})
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-gray-300" />
          Pendientes ({pendientes})
        </span>
      </div>
    </div>
  );
}
