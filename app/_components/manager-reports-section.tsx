"use client";

import { useState, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Award,
  Filter,
  Calendar as CalendarIcon,
  Scissors,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { BookingData, StatusBadge } from "./manager-recent-bookings";

export type PeriodFilter = "semana" | "mes" | "semestre" | "anual" | "todos";

interface ManagerReportsSectionProps {
  bookings: BookingData[];
}

export function ManagerReportsSection({ bookings }: ManagerReportsSectionProps) {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("todos");

  // 1. Filter bookings to only include FINALIZADO within selected period
  const finishedBookings = useMemo(() => {
    const now = new Date();

    return bookings.filter((b) => {
      // Only include finished bookings for financial revenue report
      if (b.status !== "FINALIZADO") return false;

      const bDate = new Date(b.rawDate || b.date);

      if (periodFilter === "semana") {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        if (bDate < weekAgo) return false;
      } else if (periodFilter === "mes") {
        const monthAgo = new Date(now);
        monthAgo.setDate(monthAgo.getDate() - 30);
        monthAgo.setHours(0, 0, 0, 0);
        if (bDate < monthAgo) return false;
      } else if (periodFilter === "semestre") {
        const semesterAgo = new Date(now);
        semesterAgo.setDate(semesterAgo.getDate() - 180);
        semesterAgo.setHours(0, 0, 0, 0);
        if (bDate < semesterAgo) return false;
      } else if (periodFilter === "anual") {
        const yearAgo = new Date(now);
        yearAgo.setDate(yearAgo.getDate() - 365);
        yearAgo.setHours(0, 0, 0, 0);
        if (bDate < yearAgo) return false;
      }

      return true;
    });
  }, [bookings, periodFilter]);

  // 2. Financial Metrics Calculation
  const financialStats = useMemo(() => {
    const totalCount = finishedBookings.length;

    const totalRevenue = finishedBookings.reduce(
      (acc, b) => acc + (b.price || 0),
      0
    );

    const averageTicket = totalCount > 0 ? totalRevenue / totalCount : 0;

    // Group revenue by service name
    const serviceMap: Record<
      string,
      { serviceName: string; count: number; totalRevenue: number }
    > = {};

    finishedBookings.forEach((b) => {
      const name = b.serviceName || "Serviço";
      if (!serviceMap[name]) {
        serviceMap[name] = { serviceName: name, count: 0, totalRevenue: 0 };
      }
      serviceMap[name].count += 1;
      serviceMap[name].totalRevenue += b.price || 0;
    });

    const serviceBreakdown = Object.values(serviceMap).sort(
      (a, b) => b.totalRevenue - a.totalRevenue
    );

    const topService = serviceBreakdown.length > 0 ? serviceBreakdown[0] : null;

    return {
      totalCount,
      totalRevenue,
      averageTicket,
      serviceBreakdown,
      topService,
    };
  }, [finishedBookings]);

  const periods: { id: PeriodFilter; label: string }[] = [
    { id: "todos", label: "Todos os períodos" },
    { id: "semana", label: "Semana (7 dias)" },
    { id: "mes", label: "Mês (30 dias)" },
    { id: "semestre", label: "Semestre (6 meses)" },
    { id: "anual", label: "Anual (365 dias)" },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Relatório Financeiro
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Acompanhe o faturamento detalhado dos agendamentos finalizados.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border-border rounded-2xl border p-4 shadow-xs flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Filter className="size-4 text-primary" />
          <span>Filtrar período:</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {periods.map((p) => {
            const isActive = periodFilter === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriodFilter(p.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Financial Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Faturamento Total */}
        <div className="bg-card border-border rounded-2xl border p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              Faturamento Total
            </span>
            <div className="bg-emerald-500/10 text-emerald-500 flex size-9 items-center justify-center rounded-xl border border-emerald-500/20">
              <DollarSign className="size-5" />
            </div>
          </div>
          <p className="text-card-foreground mt-3 text-2xl font-bold tracking-tight">
            {(financialStats.totalRevenue / 100).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Agendamentos finalizados
          </p>
        </div>

        {/* Card 2: Serviços Concluídos */}
        <div className="bg-card border-border rounded-2xl border p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              Serviços Concluídos
            </span>
            <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-xl border border-primary/20">
              <CheckCircle2 className="size-5" />
            </div>
          </div>
          <p className="text-card-foreground mt-3 text-2xl font-bold tracking-tight">
            {financialStats.totalCount}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Atendimentos realizados
          </p>
        </div>

        {/* Card 3: Ticket Médio */}
        <div className="bg-card border-border rounded-2xl border p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              Ticket Médio
            </span>
            <div className="bg-blue-500/10 text-blue-500 flex size-9 items-center justify-center rounded-xl border border-blue-500/20">
              <TrendingUp className="size-5" />
            </div>
          </div>
          <p className="text-card-foreground mt-3 text-2xl font-bold tracking-tight">
            {(financialStats.averageTicket / 100).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Por serviço finalizado
          </p>
        </div>

        {/* Card 4: Maior Faturamento por Serviço */}
        <div className="bg-card border-border rounded-2xl border p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              Principal Serviço
            </span>
            <div className="bg-amber-500/10 text-amber-500 flex size-9 items-center justify-center rounded-xl border border-amber-500/20">
              <Award className="size-5" />
            </div>
          </div>
          <p className="text-card-foreground mt-3 truncate text-lg font-bold tracking-tight">
            {financialStats.topService
              ? financialStats.topService.serviceName
              : "Nenhum"}
          </p>
          <p className="text-muted-foreground mt-1 text-xs font-medium">
            {financialStats.topService
              ? (financialStats.topService.totalRevenue / 100).toLocaleString(
                  "pt-BR",
                  { style: "currency", currency: "BRL" }
                )
              : "R$ 0,00"}
          </p>
        </div>
      </div>

      {/* Main Grid: Revenue Breakdown by Service & Finished Transactions Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Faturamento por Serviço (Breakdown) */}
        <div className="border-border bg-card flex flex-col rounded-2xl border p-6 shadow-xs lg:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <Scissors className="size-5 text-primary" />
            <h2 className="text-card-foreground text-lg font-bold tracking-tight">
              Faturamento por Serviço
            </h2>
          </div>

          {financialStats.serviceBreakdown.length === 0 ? (
            <div className="my-auto py-12 text-center text-muted-foreground text-sm">
              Nenhum serviço finalizado no período.
            </div>
          ) : (
            <div className="space-y-4">
              {financialStats.serviceBreakdown.map((item, index) => {
                const percentage =
                  financialStats.totalRevenue > 0
                    ? Math.round(
                        (item.totalRevenue / financialStats.totalRevenue) * 100
                      )
                    : 0;

                return (
                  <div key={item.serviceName} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-foreground font-semibold truncate max-w-[160px]">
                        {index + 1}. {item.serviceName}
                      </span>
                      <span className="text-muted-foreground font-mono">
                        {(item.totalRevenue / 100).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}{" "}
                        ({percentage}%)
                      </span>
                    </div>

                    <div className="relative w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-muted-foreground text-right">
                      {item.count} atendimento{item.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Historical Table of Finished Transactions */}
        <div className="border-border bg-card rounded-2xl border p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-card-foreground text-lg font-bold tracking-tight">
              Lançamentos Finalizados
            </h2>
            <span className="text-xs text-muted-foreground font-mono bg-muted/60 px-3 py-1 rounded-full">
              {finishedBookings.length} registros
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="text-foreground w-full text-left text-sm">
              <thead className="border-border text-muted-foreground border-b text-xs font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Serviço</th>
                  <th className="px-4 py-3">Data e Hora</th>
                  <th className="px-4 py-3 text-right">Valor Final</th>
                </tr>
              </thead>
              <tbody className="divide-border/60 divide-y font-medium">
                {finishedBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-muted-foreground py-12 text-center text-sm"
                    >
                      Nenhum agendamento finalizado encontrado no período.
                    </td>
                  </tr>
                ) : (
                  finishedBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar className="border-border size-9 border">
                            <AvatarImage src={booking.clientAvatar} />
                            <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                              {booking.clientName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-foreground font-semibold">
                            {booking.clientName}
                          </span>
                        </div>
                      </td>
                      <td className="text-muted-foreground px-4 py-4 whitespace-nowrap">
                        {booking.serviceName}
                      </td>
                      <td className="text-muted-foreground px-4 py-4 font-mono text-xs whitespace-nowrap">
                        {booking.date}
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-xs font-bold text-emerald-500 whitespace-nowrap">
                        +{" "}
                        {(booking.price / 100).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
