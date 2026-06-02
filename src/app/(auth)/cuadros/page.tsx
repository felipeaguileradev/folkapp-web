import { notFound } from "next/navigation";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { CuadrosPage } from "@/modules/cuadros/presentation/pages/CuadrosPage";

export default function Page() {
  if (!isFeatureEnabled("cuadros")) return notFound();
  return <CuadrosPage />;
}
