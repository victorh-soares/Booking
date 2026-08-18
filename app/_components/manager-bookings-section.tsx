"use client";

import { useState, useMemo } from "react";
import { Search, Calendar as CalendarIcon, Filter, DollarSign, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { BookingData, StatusBadge } from "./manager-recent-bookings";

export type PeriodFilter = "semana" | "mes" | "semestre" | "anual" | "todos";
export type StatusFilter = "TODOS" | "CONFIRMADO" | "CANCELADO" | "FINALIZADO";

interface ManagerBookingsSectionProps {
  bookings: BookingData[];
}

export function ManagerBookingsSection({ bookings }: ManagerBookingsSectionProps) {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("todos");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("TODOS");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBookings = useMemo(() => {
    const now = new Date();

    return bookings.filter((b) => {
      const bDate = new Date(b.rawDate || b.date);

      // 1. Period Filtering
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

      // 2. Status Filtering
      if (statusFilter !== "TODOS" && b.status !== statusFilter) {
        return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesClient = b.clientName.toLowerCase().includes(query);
        const matchesService = b.serviceName.toLowerCase().includes(query);
        if (!matchesClient && !matchesService) return false;
      }

      return true;
    });
  }, [bookings, periodFilter, statusFilter, searchQuery]);

  // Compute Period Stats
  const periodStats = useMemo(() => {
    const totalCount = filteredBookings.length;
    const confirmedCount = filteredBookings.filter((b) => b.status === "CONFIRMADO").length;
    const finishedCount = filteredBookings.filter((b) => b.status === "FINALIZADO").length;
    const cancelledCount = filteredBookings.filter((b) => b.status === "CANCELADO").length;

    const totalRevenue = filteredBookings
      .filter((b) => b.status !== "CANCELADO")
      .reduce((acc, b) => acc + (b.price || 0), 0);

    return {
      totalCount,
      confirmedCount,
      finishedCount,
      cancelledCount,
      totalRevenue,
    };
  }, [filteredBookings]);

  const periods: { id: PeriodFilter; label: string }[] = [
    { id: "todos", label: "Todos os períodos" },
    { id: "semana", label: "Semana (7 dias)" },
    { id: "mes", label: "Mês (30 dias)" },
    { id: "semestre", label: "Semestre (6 meses)" },
    { id: "anual", label: "Anual (365 dias)" },
  ];

  const statuses: { id: StatusFilter; label: string }[] = [
    { id: "TODOS", label: "Todos" },
    { id: "CONFIRMADO", label: "Confirmados" },
    { id: "FINALIZADO", label: "Finalizados" },
    { id: "CANCELADO", label: "Cancelados" },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Agendamentos
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Gerencie e acompanhe todos os agendamentos registrados no sistema.
          </p>
        </div>
      </div>

      {/* KPI Cards Summary for current Selection */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card border-border rounded-2xl border p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              Total no período
            </span>
            <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
              <CalendarIcon className="size-4" />
            </div>
          </div>
          <p className="text-card-foreground mt-2 text-2xl font-bold">
            {periodStats.totalCount}
          </p>
        </div>

        <div className="bg-card border-border rounded-2xl border p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              Confirmados
            </span>
            <div className="bg-emerald-500/10 text-emerald-500 flex size-8 items-center justify-center rounded-lg">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <p className="text-card-foreground mt-2 text-2xl font-bold">
            {periodStats.confirmedCount}
          </p>
        </div>

        <div className="bg-card border-border rounded-2xl border p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              Finalizados
            </span>
            <div className="bg-zinc-500/10 text-zinc-500 flex size-8 items-center justify-center rounded-lg">
              <Clock className="size-4" />
            </div>
          </div>
          <p className="text-card-foreground mt-2 text-2xl font-bold">
            {periodStats.finishedCount}
          </p>
        </div>

        <div className="bg-card border-border rounded-2xl border p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              Receita do Período
            </span>
            <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
              <DollarSign className="size-4" />
            </div>
          </div>
          <p className="text-card-foreground mt-2 text-2xl font-bold">
            {(periodStats.totalRevenue / 100).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-card border-border rounded-2xl border p-5 shadow-xs space-y-4">
        {/* Period Selector Tabs */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Filter className="size-4 text-primary" />
            <span>Período:</span>
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

        {/* Search & Status Filter Row */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Buscar por cliente ou serviço..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background border-border rounded-xl text-xs"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {statuses.map((s) => {
              const isActive = statusFilter === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatusFilter(s.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-secondary text-primary border-border border font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="border-border bg-card rounded-2xl border p-6 shadow-xs">
        <div className="overflow-x-auto">
          <table className="text-foreground w-full text-left text-sm">
            <thead className="border-border text-muted-foreground border-b text-xs font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Serviço</th>
                <th className="px-4 py-3">Data e Hora</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-border/60 divide-y font-medium">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-muted-foreground py-12 text-center text-sm"
                  >
                    Nenhum agendamento encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
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
                    <td className="text-foreground px-4 py-4 font-mono text-xs font-semibold whitespace-nowrap">
                      {(booking.price / 100).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
