import { notFound } from "next/navigation";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { BailarinesPage } from "@/modules/bailarines/presentation/pages/BailarinesPage";

interface PageProps {
  searchParams: {
    page?: string;
    cuadroId?: string;
    genero?: string;
    activo?: string;
    q?: string;
  };
}

export default function Page({ searchParams }: PageProps) {
  if (!isFeatureEnabled("bailarines")) return notFound();
  return <BailarinesPage searchParams={searchParams} />;
}
