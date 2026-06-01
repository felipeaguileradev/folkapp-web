import { Skeleton } from "@/shared/components/ui/skeleton";

/** Skeleton para una tabla con N filas */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton para una grid de cards */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border p-6 space-y-3">
          <Skeleton className="h-5 w-[60%]" />
          <Skeleton className="h-4 w-[40%]" />
          <Skeleton className="h-4 w-[80%]" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton para un detalle/perfil */
export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-8 w-[100px]" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-lg border p-6 space-y-4">
          <Skeleton className="h-6 w-[50%]" />
          <Skeleton className="h-4 w-[30%]" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
        <div className="rounded-lg border p-6 space-y-3">
          <Skeleton className="h-5 w-[60%]" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton para la página de listado */
export function ListPageSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-[150px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
        <Skeleton className="h-10 w-[140px]" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-10 w-[140px]" />
        <Skeleton className="h-10 w-[140px]" />
      </div>
      <TableSkeleton rows={8} />
    </div>
  );
}
