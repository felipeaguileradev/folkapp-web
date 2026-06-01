import type { Tallas } from "../../domain";

interface TallasSectionProps {
  tallas: Tallas;
}

const TALLA_LABELS: Record<string, string> = {
  camisa: "Camisa",
  pantalon: "Pantalón",
  sombrero: "Sombrero",
  calzado: "Calzado",
};

export function TallasSection({ tallas }: TallasSectionProps) {
  const predefinedEntries = Object.entries(TALLA_LABELS);
  const hasPredefined = predefinedEntries.some(
    ([key]) => tallas[key as keyof Tallas] !== null,
  );
  const hasCustom = tallas.personalizados && tallas.personalizados.length > 0;

  if (!hasPredefined && !hasCustom) {
    return (
      <p className="text-sm text-muted-foreground">Sin tallas registradas</p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Tallas predefinidas */}
      {predefinedEntries.map(([key, label]) => {
        const value = tallas[key as keyof Omit<Tallas, "personalizados">];
        if (!value) return null;
        return (
          <div key={key} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
          </div>
        );
      })}

      {/* Tallas personalizadas */}
      {hasCustom && (
        <>
          <div className="border-t pt-2 mt-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Personalizadas
            </p>
            {tallas.personalizados.map((custom, index) => (
              <div key={index} className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{custom.nombre}</span>
                <span className="font-medium">{custom.valor}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
