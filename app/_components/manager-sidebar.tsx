"use client";

import {
  LayoutDashboard,
  Scissors,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  HomeIcon,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { SheetClose } from "./ui/sheet";

export type ManagerTab =
  | "dashboard"
  | "services"
  | "bookings"
  | "reports"
  | "settings";

interface ManagerSidebarProps {
  user: {
    name: string;
    email: string;
    image?: string;
  };
  activeTab: ManagerTab;
  onSelectTab: (tab: ManagerTab) => void;
  onLogout: () => void;
  isSheet?: boolean;
}

export function ManagerSidebar({
  user,
  activeTab,
  onSelectTab,
  onLogout,
  isSheet = false,
}: ManagerSidebarProps) {
  const navItems: {
    id: ManagerTab;
    label: string;
    icon: typeof LayoutDashboard;
  }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "bookings", label: "Agendamentos", icon: Calendar },
    { id: "reports", label: "Relatórios", icon: BarChart3 },
    { id: "settings", label: "Configurações", icon: Settings },
  ];

  const renderNavButton = (item: (typeof navItems)[0]) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    const button = (
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={`w-full justify-start gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
          isActive
            ? "bg-secondary text-primary border-border border font-bold shadow-xs"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }`}
        onClick={() => onSelectTab(item.id)}
      >
        <Icon className="size-4" />
        <span>{item.label}</span>
      </Button>
    );

    if (isSheet) {
      return (
        <SheetClose key={item.id} asChild>
          {button}
        </SheetClose>
      );
    }

    return <div key={item.id}>{button}</div>;
  };

  return (
    <div className="flex h-full flex-col justify-between gap-6 p-6">
      <div className="flex flex-col gap-6">
        {/* User Card */}
        <div className="border-border bg-card flex items-center gap-3 rounded-2xl border p-3.5 shadow-xs">
          <Avatar className="border-border size-10 shrink-0 border">
            <AvatarImage src={user.image} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <p className="text-card-foreground truncate text-sm font-bold">
              {user.name}
            </p>
            <p className="text-muted-foreground truncate text-xs">
              Administrador
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => renderNavButton(item))}
        </nav>
      </div>

      {/* Exit & Logout Buttons */}
      <div className="border-border flex flex-col gap-2 border-t pt-6">
        {/* {isSheet ? (
          <SheetClose asChild>
            <Link href="/">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <HomeIcon className="size-4" />
                <span>Início do cliente</span>
              </Button>
            </Link>
          </SheetClose>
        ) : (
          <Link href="/">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <HomeIcon className="size-4" />
              <span>Início do cliente</span>
            </Button>
          </Link>
        )} }

        {/* <Separator className="my-1" /> */}

        {isSheet ? (
          <SheetClose asChild>
            <Button
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full justify-start gap-3.5 rounded-xl px-4 py-3 text-xs font-semibold transition-all"
              onClick={onLogout}
            >
              <LogOut className="size-4" />
              <span>Sair da conta</span>
            </Button>
          </SheetClose>
        ) : (
          <Button
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full justify-start gap-3.5 rounded-xl px-4 py-3 text-xs font-semibold transition-all"
            onClick={onLogout}
          >
            <LogOut className="size-4" />
            <span>Sair da conta</span>
          </Button>
        )}
      </div>
    </div>
  );
}
