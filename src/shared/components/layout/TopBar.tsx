"use client";

import Link from "next/link";
import { Search, Bell } from "lucide-react";
import { Input } from "@/shared/components/ui/input";

export function TopBar() {
  return (
    <header className="flex items-center gap-3.5 px-7 py-5">
      {/* Search */}
      <div className="relative flex-1 max-w-[380px]">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground" />
        <Input
          placeholder="Buscar prenda, bailarín, cuadro…"
          className="pl-11 bg-secondary border-none rounded-2xl h-11 text-sm placeholder:text-muted-foreground"
        />
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-2.5">
        {/* Notifications */}
        <Link
          href="/alertas"
          className="relative flex items-center justify-center w-11 h-11 rounded-[14px] bg-sidebar text-white hover:opacity-90 transition-opacity"
          aria-label="Ver alertas"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-[9px] right-[9px] min-w-4 h-4 rounded-full bg-primary text-[9px] font-bold text-white flex items-center justify-center border-2 border-sidebar px-0.5">
            2
          </span>
        </Link>

        {/* User */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-10 h-10 rounded-[13px] bg-cuadro-huaso text-white flex items-center justify-center font-extrabold text-[13px]">
            BF
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-[13px] font-bold">Coordinación</p>
            <p className="text-[11px] text-muted-foreground">Administrador</p>
          </div>
        </div>
      </div>
    </header>
  );
}
