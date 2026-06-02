import { notFound } from "next/navigation";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { ReportesPage } from "@/modules/reportes/presentation/pages/ReportesPage";

export default function Page() {
  if (!isFeatureEnabled("reportes")) return notFound();
  return <ReportesPage />;
}
