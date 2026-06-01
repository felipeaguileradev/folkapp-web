import { InventarioPage } from "@/modules/inventario/presentation/pages/InventarioPage";

interface PageProps {
  searchParams: {
    page?: string;
    cuadroId?: string;
    genero?: string;
    categoria?: string;
    estado?: string;
    propietario?: string;
    q?: string;
  };
}

export default function Page({ searchParams }: PageProps) {
  return <InventarioPage searchParams={searchParams} />;
}
