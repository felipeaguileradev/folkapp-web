import { FuncionDetailPage } from "@/modules/funciones/presentation/pages/FuncionDetailPage";

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  return <FuncionDetailPage funcionId={params.id} />;
}
