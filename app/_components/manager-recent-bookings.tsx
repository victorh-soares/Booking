"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export interface BookingData {
  id: string;
  clientName: string;
  clientAvatar?: string;
  serviceName: string;
  barbershopName?: string;
  date: string;
  rawDate: Date;
  status: "CONFIRMADO" | "CANCELADO" | "FINALIZADO";
  price: number;
}

interface ManagerRecentBookingsProps {
  bookings: BookingData[];
  onViewAll?: () => void;
}

export function StatusBadge({ status }: { status: BookingData["status"] }) {
  switch (status) {
    case "CONFIRMADO":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-emerald-500 uppercase">
          <CheckCircle2 className="size-3.5" />
          CONFIRMADO
        </span>
      );
    case "CANCELADO":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-rose-500 uppercase">
          <XCircle className="size-3.5" />
          CANCELADO
        </span>
      );
    case "FINALIZADO":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-500/20 bg-zinc-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
          <CheckCircle2 className="size-3.5" />
          FINALIZADO
        </span>
      );
  }
}

export function ManagerRecentBookings({
  bookings,
  onViewAll,
}: ManagerRecentBookingsProps) {
  // Return the last 5 bookings
  const recentFiveBookings = bookings.slice(0, 5);

  return (
    <div className="border-border bg-card rounded-2xl border p-6 shadow-xs">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-card-foreground text-lg font-bold tracking-tight">
          Agendamentos recentes
        </h2>
        <button
          type="button"
          onClick={onViewAll}
          className="text-primary text-xs font-semibold transition-colors hover:underline cursor-pointer"
        >
          Ver todos
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="text-foreground w-full text-left text-sm">
          <thead className="border-border text-muted-foreground border-b text-xs font-semibold uppercase">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Serviço</th>
              <th className="px-4 py-3">Data e Hora</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-border/60 divide-y font-medium">
            {recentFiveBookings.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-muted-foreground py-8 text-center text-sm"
                >
                  Nenhum agendamento encontrado para esta barbearia.
                </td>
              </tr>
            ) : (
              recentFiveBookings.map((booking) => (
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
  );
}
