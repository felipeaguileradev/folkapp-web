import { createClient } from "@/shared/lib/supabase/server";
import { SupabasePrendaRepository } from "../../infrastructure/repositories";
import { SupabaseCuadroRepository } from "@/modules/cuadros/infrastructure/repositories";
import { InventarioContent } from "../components/InventarioContent";
import type { PrendaFilters } from "../../domain/ports";
import type { Pagination } from "@/shared/types";

interface InventarioPageProps {
  searchParams?: {
    page?: string;
    cuadroId?: string;
    genero?: string;
    categoria?: string;
    estado?: string;
    propietario?: string;
    q?: string;
  };
}

export async function InventarioPage({ searchParams }: InventarioPageProps) {
  const supabase = createClient();
  const repository = new SupabasePrendaRepository(supabase);
  const cuadroRepository = new SupabaseCuadroRepository();

  const page = Number(searchParams?.page) || 1;
  const pageSize = 10;

  const filters: PrendaFilters = {};
  if (searchParams?.cuadroId) filters.cuadroId = searchParams.cuadroId;
  if (searchParams?.genero)
    filters.genero = searchParams.genero as PrendaFilters["genero"];
  if (searchParams?.categoria)
    filters.categoria = searchParams.categoria as PrendaFilters["categoria"];
  if (searchParams?.estado)
    filters.estado = searchParams.estado as PrendaFilters["estado"];
  if (searchParams?.propietario)
    filters.propietario =
      searchParams.propietario as PrendaFilters["propietario"];

  const pagination: Pagination = { page, pageSize };

  // Si hay búsqueda, usar search; si no, usar findAll con paginación
  const searchQuery = (searchParams?.q ?? "").trim();

  const [cuadros, summary] = await Promise.all([
    cuadroRepository.findAll(),
    repository.getSummary(),
  ]);

  if (searchQuery.length >= 2) {
    const results = await repository.search(searchQuery, filters);
    return (
      <InventarioContent
        prendas={results}
        total={results.length}
        page={1}
        totalPages={1}
        pageSize={pageSize}
        filters={filters}
        searchQuery={searchQuery}
        cuadros={cuadros}
        summary={summary}
      />
    );
  }

  const result = await repository.findAll(filters, pagination);

  return (
    <InventarioContent
      prendas={result.data}
      total={result.total}
      page={result.page}
      totalPages={result.totalPages}
      pageSize={result.pageSize}
      filters={filters}
      searchQuery={searchQuery}
      cuadros={cuadros}
      summary={summary}
    />
  );
}
