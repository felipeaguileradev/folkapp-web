import { Sidebar } from "@/shared/components/layout/Sidebar";
import { TopBar } from "@/shared/components/layout/TopBar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen p-4 gap-3.5">
      <Sidebar />
      <div className="flex-1 min-w-0 bg-card rounded-[26px] flex flex-col">
        <TopBar />
        <main className="flex-1 px-7 pb-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
