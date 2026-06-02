import { notFound } from "next/navigation";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { CuadroDetailPage } from "@/modules/cuadros/presentation/pages/CuadroDetailPage";

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  if (!isFeatureEnabled("cuadros")) return notFound();
  return <CuadroDetailPage cuadroId={params.id} />;
}
