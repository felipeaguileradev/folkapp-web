interface CuadroBadgeProps {
  color: string;
  nombre: string;
}

export function CuadroBadge({ color, nombre }: CuadroBadgeProps) {
  return (
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
      style={{ backgroundColor: color }}
      title={nombre}
      aria-label={`Color del cuadro ${nombre}`}
    >
      {nombre[0]}
    </span>
  );
}
