import { notFound } from "next/navigation";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { FuncionDetailPage } from "@/modules/funciones/presentation/pages/FuncionDetailPage";

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  if (!isFeatureEnabled("funciones")) return notFound();
  return <FuncionDetailPage funcionId={params.id} />;
}
