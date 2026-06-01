"use client";

import { Search, Bell } from "lucide-react";
import { Input } from "@/shared/components/ui/input";

export function TopBar() {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          className="pl-9 bg-card border-none shadow-sm rounded-xl h-10"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-xs font-semibold">
          BF
        </div>
      </div>
    </header>
  );
}
