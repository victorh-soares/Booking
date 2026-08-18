"use client";

import Image from "next/image";
// import { ChevronDown } from "lucide-react";

export interface DailyBookingData {
  day: string;
  count: number;
}

export interface ServiceRank {
  id: string;
  name: string;
  count: number;
  imageUrl: string;
}

interface ManagerChartsSectionProps {
  dailyData?: DailyBookingData[];
  topServices: ServiceRank[];
}

export function ManagerChartsSection({
  dailyData = [
    { day: "30/01", count: 25 },
    { day: "31/01", count: 30 },
    { day: "01/02", count: 40 },
    { day: "02/02", count: 32 },
    { day: "03/02", count: 50 },
    { day: "04/02", count: 50 },
    { day: "05/02", count: 68 },
  ],
  topServices,
}: ManagerChartsSectionProps) {
  const maxDailyCount = Math.max(...dailyData.map((d) => d.count), 1);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Daily Bookings Chart */}
      <div className="border-border bg-card flex flex-col justify-between rounded-2xl border p-6 shadow-xs lg:col-span-7">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-card-foreground text-lg font-bold tracking-tight">
            Agendamentos por dia
          </h2>
          {/* <button
            type="button"
            className="text-muted-foreground bg-muted border-border hover:text-foreground flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <span>Últimos 7 dias</span>
            <ChevronDown className="size-3.5" />
          </button> */}
        </div>

        <div className="flex h-64 w-full flex-col justify-end pt-4">
          <div className="flex flex-1 items-end justify-between gap-3 px-2">
            {dailyData.map((item, idx) => {
              const heightPercent =
                maxDailyCount > 0
                  ? Math.round((item.count / maxDailyCount) * 100)
                  : 0;
              return (
                <div
                  key={idx}
                  className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div className="bg-muted text-primary border-border pointer-events-none mb-1 rounded-md border px-2 py-1 text-[11px] font-bold opacity-0 shadow-xs transition-opacity group-hover:opacity-100">
                    {item.count}
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="bg-primary/80 group-hover:bg-primary min-h-[8px] w-full rounded-t-lg transition-all duration-300"
                  />
                  <span className="text-muted-foreground mt-2 font-mono text-[11px]">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Services List */}
      <div className="border-border bg-card flex flex-col rounded-2xl border p-6 shadow-xs lg:col-span-5">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-card-foreground text-lg font-bold tracking-tight">
            Serviços mais reservados
          </h2>
          <button
            type="button"
            className="text-primary text-xs font-semibold transition-colors hover:underline"
          >
            {/* Ver todos */}
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          {topServices.length === 0 ? (
            <div className="text-muted-foreground flex flex-1 items-center justify-center py-8 text-center text-xs">
              Nenhum serviço cadastrado.
            </div>
          ) : (
            topServices.map((service, index) => (
              <div
                key={service.id}
                className="hover:bg-muted/40 flex items-center justify-between rounded-xl p-2.5 transition-colors"
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  <span className="bg-muted text-muted-foreground border-border flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold">
                    {index + 1}
                  </span>
                  <div className="border-border bg-muted relative size-11 shrink-0 overflow-hidden rounded-xl border">
                    <Image
                      src={service.imageUrl}
                      alt={service.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <p className="text-foreground truncate text-sm font-semibold">
                      {service.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {service.count}{" "}
                      {service.count === 1 ? "reserva" : "reservas"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
