"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/lib/utils";
import { traspasarPrendaAction } from "../../infrastructure/actions";
import {
  obtenerBailarinesActivosAction,
  type BailarinOption,
} from "@/modules/bailarines/infrastructure/actions";

interface TraspasoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prendaId: string;
  bailarinOrigenId: string;
}

export function TraspasoDialog({
  open,
  onOpenChange,
  prendaId,
  bailarinOrigenId,
}: TraspasoDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bailarinDestinoId, setBailarinDestinoId] = useState("");
  const [observacion, setObservacion] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [bailarines, setBailarines] = useState<BailarinOption[]>([]);
  const [isLoadingBailarines, setIsLoadingBailarines] = useState(false);

  // Cargar bailarines al abrir el diálogo
  useEffect(() => {
    if (!open) return;

    setIsLoadingBailarines(true);
    obtenerBailarinesActivosAction().then((result) => {
      if (result.success) {
        setBailarines(result.data.filter((b) => b.id !== bailarinOrigenId));
      }
      setIsLoadingBailarines(false);
    });

    // Reset state al abrir
    setBailarinDestinoId("");
    setObservacion("");
    setSearchQuery("");
    setError(null);
  }, [open, bailarinOrigenId]);

  const selectedBailarin = bailarines.find((b) => b.id === bailarinDestinoId);

  const filteredBailarines = searchQuery.trim()
    ? bailarines.filter((b) =>
        b.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : bailarines;

  const handleSelect = (id: string) => {
    setBailarinDestinoId(id);
    setSearchQuery("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bailarinDestinoId) {
      setError("Selecciona un bailarín destino");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await traspasarPrendaAction({
      prendaId,
      bailarinOrigenId,
      bailarinDestinoId,
      observacion: observacion || null,
    });

    if (result.success) {
      onOpenChange(false);
      router.refresh();
    } else {
      setError(result.error);
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Traspasar prenda</DialogTitle>
          <DialogDescription>
            Transfiere esta prenda a otro bailarín. El estado de la prenda se
            mantiene.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label>Bailarín destino *</Label>

            {selectedBailarin ? (
              <div className="flex items-center justify-between rounded-md border border-input px-3 py-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">
                    {selectedBailarin.nombreCompleto}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto px-2 py-1 text-xs"
                  onClick={() => {
                    setBailarinDestinoId("");
                    setSearchQuery("");
                  }}
                >
                  Cambiar
                </Button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar bailarín por nombre..."
                    className="pl-9"
                  />
                </div>

                <div className="max-h-44 overflow-y-auto rounded-md border border-input">
                  {isLoadingBailarines ? (
                    <p className="p-3 text-sm text-muted-foreground text-center">
                      Cargando bailarines...
                    </p>
                  ) : filteredBailarines.length === 0 ? (
                    <p className="p-3 text-sm text-muted-foreground text-center">
                      No se encontraron bailarines
                    </p>
                  ) : (
                    <div className="py-1">
                      {filteredBailarines.map((bailarin) => (
                        <button
                          key={bailarin.id}
                          type="button"
                          className={cn(
                            "flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors",
                            "hover:bg-accent hover:text-accent-foreground",
                            "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                          )}
                          onClick={() => handleSelect(bailarin.id)}
                        >
                          {bailarin.nombreCompleto}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacion">Observación</Label>
            <Textarea
              id="observacion"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Motivo del traspaso..."
              maxLength={500}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !bailarinDestinoId}>
              {isSubmitting ? "Traspasando..." : "Traspasar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
