"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CalendarProps {
  mode?: "single";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: { before?: Date };
  className?: string;
  locale?: unknown;
}

export function Calendar({
  selected,
  onSelect,
  disabled,
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    selected || new Date(),
  );

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const isSameDay = (d1: Date, d2?: Date) => {
    if (!d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isBeforeDisabled = (d: Date) => {
    if (!disabled?.before) return false;
    const beforeDate = new Date(disabled.before);
    beforeDate.setHours(0, 0, 0, 0);
    const targetDate = new Date(d);
    targetDate.setHours(0, 0, 0, 0);
    return targetDate < beforeDate;
  };

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptySlots = Array.from({ length: startingDayOfWeek }, (_, i) => i);

  return (
    <div className={cn("flex flex-col gap-3 rounded-lg border p-3", className)}>
      {/* Mês e Navegação */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="text-muted-foreground hover:text-foreground p-1"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-semibold capitalize">
          {monthNames[month]} {year}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="text-muted-foreground hover:text-foreground p-1"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Dias da Semana */}
      <div className="text-muted-foreground grid grid-cols-7 text-center text-xs">
        {daysOfWeek.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Grade de Dias */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {emptySlots.map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {daysArray.map((dayNum) => {
          const dateObj = new Date(year, month, dayNum);
          const isSelected = isSameDay(dateObj, selected);
          const isDisabled = isBeforeDisabled(dateObj);

          return (
            <button
              key={dayNum}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect?.(dateObj)}
              className={cn(
                "flex h-8 w-full cursor-pointer items-center justify-center rounded-md transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "hover:bg-accent hover:text-accent-foreground",
                isDisabled &&
                  "cursor-not-allowed opacity-30 hover:bg-transparent",
              )}
            >
              {dayNum}
            </button>
          );
        })}
      </div>
    </div>
  );
}
