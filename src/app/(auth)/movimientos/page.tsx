import { MovimientosPage } from "@/modules/movimientos/presentation/pages/MovimientosPage";

interface PageProps {
  searchParams: {
    tipo?: string;
    devuelta?: string;
    cuadroId?: string;
  };
}

export default function Page({ searchParams }: PageProps) {
  return <MovimientosPage searchParams={searchParams} />;
}
