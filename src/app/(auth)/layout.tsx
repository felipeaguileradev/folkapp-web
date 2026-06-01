import { Sidebar } from "@/shared/components/layout/Sidebar";
import { TopBar } from "@/shared/components/layout/TopBar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <TopBar />
        <main className="flex-1 px-6 pb-6">{children}</main>
      </div>
    </div>
  );
}
