"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Calendar, MapPin } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Funcion } from "../../domain/entities";
import type { EstadoFuncion } from "@/shared/types";
import { FuncionFormDialog } from "./FuncionFormDialog";

interface FuncionesContentProps {
  funciones: Funcion[];
}

const ESTADO_STYLES: Record<EstadoFuncion, string> = {
  Pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "En curso": "bg-blue-100 text-blue-800 border-blue-200",
  Finalizada: "bg-green-100 text-green-800 border-green-200",
};

export function FuncionesContent({ funciones }: FuncionesContentProps) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreateSuccess = () => {
    setIsCreateOpen(false);
    router.refresh();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Funciones</h1>
          <p className="text-muted-foreground">
            {funciones.length}{" "}
            {funciones.length === 1 ? "función" : "funciones"} registradas
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva función
        </Button>
      </div>

      {/* List */}
      {funciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">
            No hay funciones registradas
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {funciones.map((funcion) => (
            <Link key={funcion.id} href={`/funciones/${funcion.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <p className="font-medium">{funcion.nombre}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {funcion.fecha.toLocaleDateString("es-CL")}
                      </span>
                      {funcion.lugar && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {funcion.lugar}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {funcion.resultadoChecklist && (
                      <span className="text-sm text-muted-foreground">
                        {funcion.resultadoChecklist.verificados}/
                        {funcion.resultadoChecklist.totalItems} verificados
                      </span>
                    )}
                    <Badge
                      variant="outline"
                      className={cn(ESTADO_STYLES[funcion.estado])}
                    >
                      {funcion.estado}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <FuncionFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
