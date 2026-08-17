import { createClient } from "@/shared/lib/supabase/server";
import { SupabaseBailarinRepository } from "../../infrastructure/repositories/supabase-bailarin.repository";
import { SupabaseCuadroRepository } from "@/modules/cuadros/infrastructure/repositories/supabase-cuadro.repository";
import { BailarinesContent } from "../components/BailarinesContent";
import type { BailarinFilters } from "../../domain";
import type { Pagination } from "@/shared/types";

interface BailarinesPageProps {
  searchParams?: {
    page?: string;
    cuadroId?: string;
    genero?: string;
    activo?: string;
    q?: string;
  };
}

export async function BailarinesPage({ searchParams }: BailarinesPageProps) {
  const supabase = createClient();
  const repository = new SupabaseBailarinRepository(supabase);

  const page = Number(searchParams?.page) || 1;
  const pageSize = 10;

  const filters: BailarinFilters = {};
  if (searchParams?.cuadroId) filters.cuadroId = searchParams.cuadroId;
  if (searchParams?.genero)
    filters.genero = searchParams.genero as BailarinFilters["genero"];
  if (searchParams?.activo !== undefined) {
    filters.activo = searchParams.activo !== "false";
  }

  const pagination: Pagination = { page, pageSize };
  const result = await repository.findAll(filters, pagination);

  // Cargar cuadros para resolver nombres
  let cuadrosMap: Record<string, string> = {};
  try {
    const cuadroRepository = new SupabaseCuadroRepository();
    const cuadros = await cuadroRepository.findAll();
    for (const cuadro of cuadros) {
      cuadrosMap[cuadro.id] = cuadro.nombre;
    }
  } catch {
    // Si falla la carga de cuadros, continuar con mapa vacío
  }

  return (
    <BailarinesContent
      bailarines={result.data}
      total={result.total}
      page={result.page}
      totalPages={result.totalPages}
      pageSize={result.pageSize}
      filters={filters}
      cuadrosMap={cuadrosMap}
    />
  );
}
