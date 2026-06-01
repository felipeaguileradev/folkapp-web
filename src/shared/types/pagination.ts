// Interfaces de paginación compartidas

/** Parámetros de paginación offset-based */
export interface Pagination {
  page: number;
  pageSize: number;
}

/** Resultado paginado con metadatos */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Paginación basada en cursor (para historial con "cargar más") */
export interface CursorPagination {
  cursor?: string;
  limit: number;
}
