import { notFound } from "next/navigation";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { MovimientosPage } from "@/modules/movimientos/presentation/pages/MovimientosPage";

interface PageProps {
  searchParams: {
    tipo?: string;
    devuelta?: string;
    cuadroId?: string;
  };
}

export default function Page({ searchParams }: PageProps) {
  if (!isFeatureEnabled("movimientos")) return notFound();
  return <MovimientosPage searchParams={searchParams} />;
}
