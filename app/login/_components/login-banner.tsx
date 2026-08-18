"use client";

import { CalendarDays } from "lucide-react";

export function LoginBanner() {
  return (
    <div className="border-border/60 relative hidden flex-col justify-between overflow-hidden border-r bg-gradient-to-b from-sky-50/80 via-slate-50 to-blue-50/60 p-10 select-none lg:col-span-5 lg:flex xl:p-14 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Brand Logo */}
      <div className="group flex w-fit items-center gap-3">
        <div className="relative flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-blue-500 text-white shadow-md shadow-sky-500/20 transition-transform group-hover:scale-105">
          <CalendarDays className="size-6" />
          <span className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
            ✓
          </span>
        </div>
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Here<span className="text-sky-600">Booking</span>
        </span>
      </div>

      {/* Title & Subtitle */}
      <div className="my-auto max-w-sm space-y-3.5">
        <h1 className="text-3xl leading-[1.25] font-extrabold tracking-tight text-slate-900 xl:text-4xl dark:text-white">
          Agende seu horário com facilidade
        </h1>
        <p className="text-sm leading-relaxed font-medium text-slate-600 dark:text-slate-400">
          Encontre os melhores serviços perto de você e reserve em poucos
          cliques.
        </p>
      </div>
    </div>
  );
}
