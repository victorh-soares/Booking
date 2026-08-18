"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { updateBarbershopClosedDatesAction } from "../_actions/manager-settings-actions";
import { ManagerPhonesCard } from "./manager-phones-card";
import {
  ManagerCalendarCard,
  BarbershopSchedule,
} from "./manager-calendar-card";
import { ManagerScheduleCard } from "./manager-schedule-card";
// import { ManagerClosedDatesCard } from "./manager-closed-dates-card";

interface ManagerSettingsSectionProps {
  barbershop: {
    id: string;
    name: string;
    phones: string[];
    closedDates?: string[];
    schedules?: BarbershopSchedule[];
  };
}

const DAYS_OF_WEEK = [
  { id: 1, label: "Segunda-feira", short: "Seg" },
  { id: 2, label: "Terça-feira", short: "Ter" },
  { id: 3, label: "Quarta-feira", short: "Qua" },
  { id: 4, label: "Quinta-feira", short: "Qui" },
  { id: 5, label: "Sexta-feira", short: "Sex" },
  { id: 6, label: "Sábado", short: "Sáb" },
  { id: 0, label: "Domingo", short: "Dom" },
];

const TIME_OPTIONS = Array.from({ length: 33 }, (_, i) => {
  const totalMinutes = 6 * 60 + i * 30; // 06:00 to 22:00
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});

const INTERVAL_OPTIONS = [
  { value: 15, label: "15 minutos" },
  { value: 30, label: "30 minutos" },
  { value: 45, label: "45 minutos" },
  { value: 60, label: "60 minutos (1 hora)" },
];

export function ManagerSettingsSection({
  barbershop,
}: ManagerSettingsSectionProps) {
  // Shared schedules state (7 days of week)
  const defaultSchedules: BarbershopSchedule[] = DAYS_OF_WEEK.map((day) => {
    const existing = barbershop.schedules?.find((s) => s.dayOfWeek === day.id);
    if (existing) {
      return {
        dayOfWeek: existing.dayOfWeek,
        isOpen: existing.isOpen,
        startTime: existing.startTime || "08:00",
        endTime: existing.endTime || "18:00",
        slotIntervalInMinutes: existing.slotIntervalInMinutes || 30,
        breakStartTime: existing.breakStartTime ?? "12:00",
        breakEndTime: existing.breakEndTime ?? "13:00",
      };
    }
    return {
      dayOfWeek: day.id,
      isOpen: day.id !== 0, // Open Mon-Sat, closed Sun by default
      startTime: "08:00",
      endTime: "18:00",
      slotIntervalInMinutes: 30,
      breakStartTime: "12:00",
      breakEndTime: "13:00",
    };
  });

  const [schedules, setSchedules] =
    useState<BarbershopSchedule[]>(defaultSchedules);

  // Shared closed dates state
  const [closedDates, setClosedDates] = useState<string[]>(
    barbershop.closedDates || [],
  );

  const handleToggleBlockDateFromCalendar = async (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    let updated: string[];
    if (closedDates.includes(dateStr)) {
      updated = closedDates.filter((d) => d !== dateStr);
      toast.info(`Data ${format(date, "dd/MM/yyyy")} desbloqueada.`);
    } else {
      updated = [...closedDates, dateStr].sort();
      toast.warning(`Data ${format(date, "dd/MM/yyyy")} bloqueada.`);
    }
    setClosedDates(updated);
    await updateBarbershopClosedDatesAction(barbershop.id, updated);
  };

  return (
    <div className="space-y-8">
      {/* Header Title */}
      <div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">
          Configurações
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Gerencie telefones de contato, horários de atendimento dinâmicos e
          datas indisponíveis.
        </p>
      </div>

      {/* 1. SEÇÃO DE TELEFONES DE CONTATO */}
      <ManagerPhonesCard
        barbershopId={barbershop.id}
        initialPhones={barbershop.phones}
      />

      {/* 2. CALENDÁRIO INTERATIVO DE ATENDIMENTO E DISPONIBILIDADE */}
      <ManagerCalendarCard
        schedules={schedules}
        closedDates={closedDates}
        onToggleBlockDate={handleToggleBlockDateFromCalendar}
        daysOfWeek={DAYS_OF_WEEK}
      />

      {/* 3. SEÇÃO DE HORÁRIOS DE ATENDIMENTO E FUNCIONAMENTO */}
      <ManagerScheduleCard
        barbershopId={barbershop.id}
        schedules={schedules}
        onSchedulesChange={setSchedules}
        daysOfWeek={DAYS_OF_WEEK}
        timeOptions={TIME_OPTIONS}
        intervalOptions={INTERVAL_OPTIONS}
      />

      {/* 4. SEÇÃO DE DATAS INDISPONÍVEIS / FERIADOS / FOLGAS */}
      {/* <ManagerClosedDatesCard
        barbershopId={barbershop.id}
        closedDates={closedDates}
        onClosedDatesChange={setClosedDates}
      /> */}
    </div>
  );
}
