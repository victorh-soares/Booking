"use client";

import Image from "next/image";
import Link from "next/link";
import { Building2Icon, MenuIcon, MessageCircleIcon } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/_components/ui/sheet";
import SidebarMenu from "@/app/_components/sidebar-menu";
import { ThemeToggle } from "@/app/_components/theme-toggle";

import { ReactNode } from "react";
import { CalendarDays } from "lucide-react";

interface HeaderProps {
  barbershopName?: string;
  barbershopId?: string;
  sidebarContent?: ReactNode;
  hideMenuOnDesktop?: boolean;
}

const Header = ({
  barbershopName,
  barbershopId,
  sidebarContent,
  hideMenuOnDesktop = false,
}: HeaderProps) => {
  return (
    <header className="bg-background flex items-center justify-between border-b px-5 py-5">
      <div className="flex items-center gap-3">
        <div className="group flex w-fit items-center gap-3">
          <div className="relative flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-blue-500 text-white shadow-md shadow-sky-500/20 transition-transform group-hover:scale-105">
            <CalendarDays className="size-6" />
            <span className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
              ✓
            </span>
          </div>
          <span
            suppressHydrationWarning
            className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Here<span className="text-sky-600">Booking</span>
          </span>
        </div>
        {barbershopName && (
          <div className="border-border bg-card text-foreground hidden items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-xs sm:flex">
            <Building2Icon className="text-primary size-4" />
            {barbershopId ? (
              <Link
                href={`/barbershops/${barbershopId}`}
                className="hover:underline"
              >
                {barbershopName}
              </Link>
            ) : (
              <span>{barbershopName}</span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="outline" size="icon" asChild>
          {/* <Link href="/chat">
            <MessageCircleIcon />
          </Link> */}
        </Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={hideMenuOnDesktop ? "lg:hidden" : ""}
            >
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent className="flex w-[370px] flex-col overflow-y-auto p-0">
            <SheetHeader className="shrink-0 border-b px-5 py-6 text-left">
              <SheetTitle className="text-lg font-bold">Menu</SheetTitle>
            </SheetHeader>
            {sidebarContent ?? <SidebarMenu />}
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
