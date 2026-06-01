import { CuadroDetailPage } from "@/modules/cuadros/presentation/pages/CuadroDetailPage";

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  return <CuadroDetailPage cuadroId={params.id} />;
}
