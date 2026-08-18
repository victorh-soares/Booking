"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Building2, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { ManagerSidebar, ManagerTab } from "./manager-sidebar";
import { ThemeToggle } from "./theme-toggle";

interface ManagerHeaderProps {
  user: {
    name: string;
    email: string;
    image?: string;
  };
  barbershop: {
    id: string;
    name: string;
    address: string;
    imageUrl: string;
  };
  activeTab: ManagerTab;
  onSelectTab: (tab: ManagerTab) => void;
  onLogout: () => void;
}

export function ManagerHeader({
  user,
  barbershop,
  activeTab,
  onSelectTab,
  onLogout,
}: ManagerHeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSelectTab = (tab: ManagerTab) => {
    onSelectTab(tab);
    setSidebarOpen(false);
  };

  return (
    <header className="border-border bg-background/90 sticky top-0 z-30 flex h-20 items-center justify-between border-b px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        {/* Mobile Sidebar Sheet */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground lg:hidden"
            >
              <Menu className="size-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <ManagerSidebar
              user={user}
              activeTab={activeTab}
              onSelectTab={handleSelectTab}
              onLogout={onLogout}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Top Right Controls */}
      <div className="flex items-center gap-3">
        {/* Dark/Light Mode Theme Toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            className="border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground relative flex size-10 items-center justify-center rounded-full border transition-colors"
            aria-label="Notificações"
          >
            <Bell className="size-5" />
            <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full text-[11px] font-bold">
              3
            </span>
          </button>
        </div>

        {/* Back to Barbershop Link */}
        <Button
          variant="outline"
          size="sm"
          asChild
          className="border-border bg-card text-foreground hover:bg-accent hidden rounded-full sm:flex"
        >
          <Link
            href={`/barbershops/${barbershop.id}`}
            className="flex items-center gap-2"
          >
            <Building2 className="text-primary size-4" />
            <span>{barbershop.name}</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
