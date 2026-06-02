import { notFound } from "next/navigation";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { AlertasPage } from "@/modules/alertas/presentation/pages/AlertasPage";

export default function Page() {
  if (!isFeatureEnabled("alertas")) return notFound();
  return <AlertasPage />;
}
