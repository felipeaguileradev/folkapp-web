"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { GeneroBailarin, Categoria } from "@/shared/types";
import type { PlantillaItem } from "../../domain/entities";
import { gestionarPlantillaAction } from "../../infrastructure/actions";

interface PlantillaEditorProps {
  cuadroId: string;
  genero: GeneroBailarin;
  items: PlantillaItem[];
}

interface PlantillaItemForm {
  id: string;
  categoria: Categoria;
  nombrePrenda: string;
  orden: number;
}

const CATEGORIA_OPTIONS: Categoria[] = [
  "Tocado",
  "Ropa superior",
  "Ropa inferior",
  "Calzado",
  "Accesorio",
  "Joyería",
];

const MAX_ITEMS = 30;

export function PlantillaEditor({
  cuadroId,
  genero,
  items: initialItems,
}: PlantillaEditorProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<PlantillaItemForm[]>(
    initialItems.map((item) => ({
      id: item.id,
      categoria: item.categoria,
      nombrePrenda: item.nombrePrenda,
      orden: item.orden,
    })),
  );

  const handleAddItem = () => {
    if (items.length >= MAX_ITEMS) return;
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        categoria: "Accesorio",
        nombrePrenda: "",
        orden: items.length + 1,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    // Reordenar
    setItems(updated.map((item, i) => ({ ...item, orden: i + 1 })));
  };

  const handleItemChange = (
    index: number,
    field: "categoria" | "nombrePrenda",
    value: string,
  ) => {
    const updated = [...items];
    if (field === "categoria") {
      updated[index] = { ...updated[index], categoria: value as Categoria };
    } else {
      updated[index] = { ...updated[index], nombrePrenda: value };
    }
    setItems(updated);
  };

  const handleSave = async () => {
    setError(null);
    setIsSubmitting(true);

    // Filtrar ítems vacíos
    const validItems = items.filter((item) => item.nombrePrenda.trim());

    const input = validItems.map((item) => ({
      cuadroId,
      genero,
      categoria: item.categoria,
      nombrePrenda: item.nombrePrenda.trim(),
      orden: item.orden,
    }));

    const result = await gestionarPlantillaAction(cuadroId, genero, input);

    if (result.success) {
      router.refresh();
    } else {
      setError(result.error);
    }

    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">
          Plantilla {genero === "Masculino" ? "Masculina" : "Femenina"}
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddItem}
            disabled={items.length >= MAX_ITEMS}
          >
            <Plus className="mr-1 h-3 w-3" />
            Agregar
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {error && (
          <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Sin ítems en la plantilla. Agrega prendas requeridas.
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground w-5">
                  {index + 1}
                </span>
                <Select
                  value={item.categoria}
                  onValueChange={(val) =>
                    handleItemChange(index, "categoria", val)
                  }
                >
                  <SelectTrigger className="w-[130px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIA_OPTIONS.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={item.nombrePrenda}
                  onChange={(e) =>
                    handleItemChange(index, "nombrePrenda", e.target.value)
                  }
                  placeholder="Nombre de la prenda"
                  className="flex-1 h-8 text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(index)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground pt-2">
          {items.length}/{MAX_ITEMS} ítems
        </p>
      </CardContent>
    </Card>
  );
}
