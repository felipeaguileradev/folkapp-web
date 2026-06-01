import { createClient } from "@/shared/lib/supabase/server";
import { SupabaseMovimientoRepository } from "../../infrastructure/repositories";
import { MovimientosContent } from "../components/MovimientosContent";
import type { MovimientoFilters } from "../../domain/ports";
import type { TipoMovimiento } from "@/shared/types";

interface MovimientosPageProps {
  searchParams?: {
    tipo?: string;
    devuelta?: string;
    cuadroId?: string;
  };
}

export async function MovimientosPage({ searchParams }: MovimientosPageProps) {
  const supabase = createClient();
  const repository = new SupabaseMovimientoRepository(supabase);

  const filters: MovimientoFilters = {};
  if (searchParams?.tipo) filters.tipo = searchParams.tipo as TipoMovimiento;
  if (searchParams?.devuelta !== undefined) {
    filters.devuelta = searchParams.devuelta === "true";
  }
  if (searchParams?.cuadroId) filters.cuadroId = searchParams.cuadroId;

  const movimientos = await repository.findActivos(filters);

  return <MovimientosContent movimientos={movimientos} filters={filters} />;
}
