import { PrendaDetailPage } from "@/modules/inventario/presentation/pages/PrendaDetailPage";

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  return <PrendaDetailPage prendaId={params.id} />;
}
