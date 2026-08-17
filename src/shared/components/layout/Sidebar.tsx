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
import { FEATURES, FeatureKey } from "@/lib/feature-flags";
import { logoutAction } from "@/modules/auth/presentation/actions";

const NAV_ITEMS: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  feature: FeatureKey;
}[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    feature: "dashboard",
  },
  {
    href: "/inventario",
    label: "Inventario",
    icon: Package,
    feature: "inventario",
  },
  {
    href: "/bailarines",
    label: "Bailarines",
    icon: Users,
    feature: "bailarines",
  },
  {
    href: "/movimientos",
    label: "Movimientos",
    icon: ArrowLeftRight,
    feature: "movimientos",
  },
  { href: "/cuadros", label: "Cuadros", icon: Palette, feature: "cuadros" },
  {
    href: "/funciones",
    label: "Funciones",
    icon: Calendar,
    feature: "funciones",
  },
  { href: "/alertas", label: "Alertas", icon: Bell, feature: "alertas" },
  { href: "/reportes", label: "Reportes", icon: FileText, feature: "reportes" },
];

const visibleNavItems = NAV_ITEMS.filter((item) => FEATURES[item.feature]);

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
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
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

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-16 transform transition-transform duration-200",
          "md:sticky md:top-0 md:h-screen md:translate-x-0",
          "flex flex-col items-center py-4 gap-4",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center justify-center w-11 h-11 rounded-[14px] bg-sidebar text-white font-extrabold text-[13px] shrink-0"
        >
          BF
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col items-center gap-2.5 mt-1">
          {visibleNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                title={item.label}
                className={cn(
                  "flex items-center justify-center w-11 h-11 rounded-[14px] transition-all duration-200",
                  isActive
                    ? "bg-primary text-white shadow-lg"
                    : "bg-white text-muted-foreground shadow-sm hover:shadow-md hover:text-foreground",
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
          className="mt-auto flex items-center justify-center w-11 h-11 rounded-[14px] bg-white text-muted-foreground shadow-sm hover:shadow-md hover:text-foreground transition-colors"
          aria-label="Cerrar sesión"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </aside>
    </>
  );
}
