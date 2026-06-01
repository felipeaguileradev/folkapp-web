"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Package,
  Users,
  ArrowLeftRight,
  Palette,
  Bell,
  Calendar,
  FileText,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/modules/auth/presentation/actions";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventario", label: "Inventario", icon: Package },
  { href: "/bailarines", label: "Bailarines", icon: Users },
  { href: "/movimientos", label: "Movimientos", icon: ArrowLeftRight },
  { href: "/cuadros", label: "Cuadros", icon: Palette },
  { href: "/alertas", label: "Alertas", icon: Bell },
  { href: "/funciones", label: "Funciones", icon: Calendar },
  { href: "/reportes", label: "Reportes", icon: FileText },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden min-w-[44px] min-h-[44px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Compact icon style */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[72px] bg-[hsl(var(--sidebar))] transform transition-transform duration-200 md:relative md:translate-x-0 flex flex-col items-center py-6 rounded-r-2xl md:rounded-2xl md:m-3",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 mb-8"
        >
          <span className="text-sm font-bold text-white">BF</span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col items-center gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                title={item.label}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-white text-[hsl(var(--sidebar))] shadow-lg"
                    : "text-white/70 hover:bg-white/15 hover:text-white",
                )}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          className="flex items-center justify-center w-10 h-10 rounded-xl text-white/70 hover:bg-white/15 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </aside>
    </>
  );
}
