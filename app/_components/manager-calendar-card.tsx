"use client";

import { useState } from "react";
import {
  Calendar as CalendarIcon,
  Sparkles,
  AlertCircle,
  Lock,
  Unlock,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface BarbershopSchedule {
  dayOfWeek: number;
  isOpen: boolean;
  startTime: string;
  endTime: string;
  slotIntervalInMinutes: number;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
}

interface ManagerCalendarCardProps {
  schedules: BarbershopSchedule[];
  closedDates: string[];
  onToggleBlockDate: (date: Date) => void;
  daysOfWeek: { id: number; label: string; short: string }[];
}

export function ManagerCalendarCard({
  schedules,
  closedDates,
  onToggleBlockDate,
  daysOfWeek,
}: ManagerCalendarCardProps) {
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<
    Date | undefined
  >(new Date());

  const generatePreviewSlots = (sched: BarbershopSchedule) => {
    if (!sched.isOpen) return [];
    const parseM = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    const startM = parseM(sched.startTime);
    const endM = parseM(sched.endTime);
    const bStartM = sched.breakStartTime ? parseM(sched.breakStartTime) : null;
    const bEndM = sched.breakEndTime ? parseM(sched.breakEndTime) : null;

    const slots: string[] = [];
    for (let m = startM; m <= endM - 30; m += sched.slotIntervalInMinutes) {
      if (bStartM !== null && bEndM !== null && bStartM < bEndM) {
        if (m < bEndM && m + 30 > bStartM) {
          continue; // Overlaps lunch break
        }
      }
      const hh = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      slots.push(`${hh}:${mm}`);
    }
    return slots;
  };

  const getCalendarDateDetails = (date?: Date) => {
    if (!date) return null;
    const dateStr = format(date, "yyyy-MM-dd");
    const dayOfWeek = date.getDay();
    const daySched = schedules.find((s) => s.dayOfWeek === dayOfWeek) || {
      dayOfWeek,
      isOpen: dayOfWeek !== 0,
      startTime: "08:00",
      endTime: "18:00",
      slotIntervalInMinutes: 30,
      breakStartTime: "12:00",
      breakEndTime: "13:00",
    };

    const isExplicitlyBlocked = closedDates.includes(dateStr);
    const isDayOfWeekOpen = daySched.isOpen;
    const isAvailable = isDayOfWeekOpen && !isExplicitlyBlocked;

    const slots = isAvailable ? generatePreviewSlots(daySched) : [];

    return {
      dateStr,
      formattedDate: format(date, "EEEE, dd 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      }),
      dayLabel: daysOfWeek.find((d) => d.id === dayOfWeek)?.label,
      isExplicitlyBlocked,
      isDayOfWeekOpen,
      isAvailable,
      slots,
      daySched,
    };
  };

  const calendarDateDetails = getCalendarDateDetails(selectedCalendarDate);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarIcon className="text-primary size-5" />
          <div>
            <CardTitle className="text-lg font-bold">
              Calendário de Visualização da Agenda
            </CardTitle>
            <CardDescription className="mt-0.5">
              Clique em uma data para conferir os horários gerados em tempo
              real ou bloquear/desbloquear o dia.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Calendário */}
          <div className="border-border bg-background flex justify-center rounded-2xl border p-4 lg:col-span-5">
            <Calendar
              mode="single"
              selected={selectedCalendarDate}
              onSelect={(d) => d && setSelectedCalendarDate(d)}
              locale={ptBR}
              className="w-full"
            />
          </div>

          {/* Painel de detalhes da data selecionada */}
          <div className="border-border bg-background flex flex-col justify-between space-y-4 rounded-2xl border p-5 lg:col-span-7">
            {calendarDateDetails ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b pb-3">
                  <div>
                    <p className="text-muted-foreground text-xs font-semibold capitalize">
                      {calendarDateDetails.dayLabel}
                    </p>
                    <h3 className="text-foreground text-base font-bold capitalize">
                      {calendarDateDetails.formattedDate}
                    </h3>
                  </div>
                  <Badge
                    variant={
                      calendarDateDetails.isAvailable
                        ? "default"
                        : "destructive"
                    }
                    className="rounded-xl px-3 py-1 font-bold"
                  >
                    {calendarDateDetails.isExplicitlyBlocked
                      ? "Bloqueado Manualmente"
                      : calendarDateDetails.isDayOfWeekOpen
                      ? "Dia com Atendimento"
                      : "Dia Fechado (Sem Atendimento)"}
                  </Badge>
                </div>

                {/* Informações de configuração do dia */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="border-border bg-card rounded-xl border p-3">
                    <p className="text-muted-foreground font-semibold">
                      Horário de Funcionamento
                    </p>
                    <p className="text-foreground font-bold">
                      {calendarDateDetails.isDayOfWeekOpen
                        ? `${calendarDateDetails.daySched.startTime} às ${calendarDateDetails.daySched.endTime}`
                        : "Fechado"}
                    </p>
                  </div>
                  <div className="border-border bg-card rounded-xl border p-3">
                    <p className="text-muted-foreground font-semibold">
                      Intervalo dos Slots
                    </p>
                    <p className="text-foreground font-bold">
                      {calendarDateDetails.daySched.slotIntervalInMinutes}{" "}
                      minutos
                    </p>
                  </div>
                </div>

                {/* Grid de horários que serão exibidos aos clientes */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-primary size-4" />
                    <p className="text-xs font-bold tracking-wider uppercase">
                      Horários Gerados para esta Data (
                      {calendarDateDetails.slots.length})
                    </p>
                  </div>

                  {calendarDateDetails.isAvailable ? (
                    calendarDateDetails.slots.length > 0 ? (
                      <div className="flex max-h-[160px] flex-wrap gap-1.5 overflow-y-auto pr-1">
                        {calendarDateDetails.slots.map((slot) => (
                          <Badge
                            key={slot}
                            variant="secondary"
                            className="rounded-lg px-2.5 py-1 text-xs font-semibold"
                          >
                            {slot}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-xs italic">
                        Nenhum horário disponível para esta data com a
                        configuração atual.
                      </p>
                    )
                  ) : (
                    <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-xl p-3 text-xs">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>
                        {calendarDateDetails.isExplicitlyBlocked
                          ? "Esta data foi bloqueada manualmente pelo administrador."
                          : "Este dia da semana está configurado como fechado."}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Botão de Ação Rápida no Calendário */}
            {selectedCalendarDate && (
              <div className="pt-2">
                <Button
                  type="button"
                  variant={
                    closedDates.includes(
                      format(selectedCalendarDate, "yyyy-MM-dd"),
                    )
                      ? "default"
                      : "destructive"
                  }
                  size="sm"
                  onClick={() => onToggleBlockDate(selectedCalendarDate)}
                  className="w-full gap-2 rounded-xl font-bold"
                >
                  {closedDates.includes(
                    format(selectedCalendarDate, "yyyy-MM-dd"),
                  ) ? (
                    <>
                      <Unlock className="size-4" />
                      <span>
                        Desbloquear esta Data (
                        {format(selectedCalendarDate, "dd/MM")})
                      </span>
                    </>
                  ) : (
                    <>
                      <Lock className="size-4" />
                      <span>
                        Bloquear esta Data (
                        {format(selectedCalendarDate, "dd/MM")})
                      </span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
