"use client";

import { useState } from "react";
import { Clock, Save, Copy, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { updateBarbershopSchedulesAction } from "../_actions/manager-settings-actions";

export interface BarbershopSchedule {
  dayOfWeek: number;
  isOpen: boolean;
  startTime: string;
  endTime: string;
  slotIntervalInMinutes: number;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
}

interface ManagerScheduleCardProps {
  barbershopId: string;
  schedules: BarbershopSchedule[];
  onSchedulesChange: (schedules: BarbershopSchedule[]) => void;
  daysOfWeek: { id: number; label: string; short: string }[];
  timeOptions: string[];
  intervalOptions: { value: number; label: string }[];
}

export function ManagerScheduleCard({
  barbershopId,
  schedules,
  onSchedulesChange,
  daysOfWeek,
  timeOptions,
  intervalOptions,
}: ManagerScheduleCardProps) {
  const [activeDayTab, setActiveDayTab] = useState<number>(1); // 1 = Monday
  const [isSaving, setIsSaving] = useState(false);

  const currentDaySchedule = schedules.find(
    (s) => s.dayOfWeek === activeDayTab,
  ) || {
    dayOfWeek: activeDayTab,
    isOpen: true,
    startTime: "08:00",
    endTime: "18:00",
    slotIntervalInMinutes: 30,
    breakStartTime: "12:00",
    breakEndTime: "13:00",
  };

  const updateCurrentDaySchedule = (
    key: keyof BarbershopSchedule,
    value: any,
  ) => {
    const updated = schedules.map((s) =>
      s.dayOfWeek === activeDayTab ? { ...s, [key]: value } : s,
    );
    onSchedulesChange(updated);
  };

  const handleReplicateMonToFri = () => {
    const mondaySchedule = schedules.find((s) => s.dayOfWeek === 1);
    if (!mondaySchedule) return;

    const updated = schedules.map((s) => {
      if (s.dayOfWeek >= 1 && s.dayOfWeek <= 5) {
        return {
          ...s,
          isOpen: mondaySchedule.isOpen,
          startTime: mondaySchedule.startTime,
          endTime: mondaySchedule.endTime,
          slotIntervalInMinutes: mondaySchedule.slotIntervalInMinutes,
          breakStartTime: mondaySchedule.breakStartTime,
          breakEndTime: mondaySchedule.breakEndTime,
        };
      }
      return s;
    });

    onSchedulesChange(updated);
    toast.success(
      "Configuração de Segunda-feira replicada de Segunda a Sexta!",
    );
  };

  const handleSaveSchedules = async () => {
    setIsSaving(true);
    const res = await updateBarbershopSchedulesAction(barbershopId, schedules);
    setIsSaving(false);
    if (res.success) {
      toast.success("Horários de funcionamento salvos com sucesso!");
    } else {
      toast.error(res.error || "Erro ao salvar horários de funcionamento.");
    }
  };

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
          continue;
        }
      }
      const hh = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      slots.push(`${hh}:${mm}`);
    }
    return slots;
  };

  const previewSlots = generatePreviewSlots(currentDaySchedule);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Clock className="text-primary size-5" />
            <div>
              <CardTitle className="text-lg font-bold">
                Horários de Atendimento por Dia da Semana
              </CardTitle>
              <CardDescription className="mt-0.5">
                Configure abertura, fechamento, intervalo de horários e almoço.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReplicateMonToFri}
              className="gap-2 rounded-xl text-xs"
            >
              <Copy className="size-3.5" />
              <span>Replicar Seg ~ Sex</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveSchedules}
              disabled={isSaving}
              className="gap-2 rounded-xl"
            >
              <Save className="size-4" />
              <span>{isSaving ? "Salvando..." : "Salvar Horários"}</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Day of Week Selector Pills */}
        <div className="flex flex-wrap gap-2 border-b pb-4">
          {daysOfWeek.map((day) => {
            const sched = schedules.find((s) => s.dayOfWeek === day.id);
            const isActive = activeDayTab === day.id;
            const isDayOpen = sched ? sched.isOpen : day.id !== 0;

            return (
              <button
                key={day.id}
                type="button"
                onClick={() => setActiveDayTab(day.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-background text-muted-foreground hover:text-foreground border-border border"
                }`}
              >
                <span>{day.label}</span>
                <span
                  className={`size-2 rounded-full ${
                    isDayOpen ? "bg-emerald-500" : "bg-zinc-500"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Active Day Configuration Form */}
        <div className="border-border bg-background space-y-6 rounded-2xl border p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-foreground text-base font-bold">
                Configuração para{" "}
                {daysOfWeek.find((d) => d.id === activeDayTab)?.label}
              </h3>
              <p className="text-muted-foreground text-xs">
                Ajuste a disponibilidade e os parâmetros de agendamento para
                este dia.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold">Status do Dia:</span>
              <Button
                type="button"
                variant={currentDaySchedule.isOpen ? "default" : "secondary"}
                size="sm"
                onClick={() =>
                  updateCurrentDaySchedule(
                    "isOpen",
                    !currentDaySchedule.isOpen,
                  )
                }
                className="rounded-xl px-4 font-bold"
              >
                {currentDaySchedule.isOpen ? "Aberto" : "Fechado"}
              </Button>
            </div>
          </div>

          {currentDaySchedule.isOpen ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Horário Início */}
                <div className="space-y-1.5">
                  <label className="text-muted-foreground text-xs font-semibold">
                    Horário de Início
                  </label>
                  <select
                    value={currentDaySchedule.startTime}
                    onChange={(e) =>
                      updateCurrentDaySchedule("startTime", e.target.value)
                    }
                    className="border-border bg-card text-foreground focus:ring-primary w-full rounded-xl border p-2.5 text-sm font-semibold focus:ring-2 focus:outline-hidden"
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Horário Término */}
                <div className="space-y-1.5">
                  <label className="text-muted-foreground text-xs font-semibold">
                    Horário de Encerramento
                  </label>
                  <select
                    value={currentDaySchedule.endTime}
                    onChange={(e) =>
                      updateCurrentDaySchedule("endTime", e.target.value)
                    }
                    className="border-border bg-card text-foreground focus:ring-primary w-full rounded-xl border p-2.5 text-sm font-semibold focus:ring-2 focus:outline-hidden"
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Intervalo dos Horários */}
                <div className="space-y-1.5">
                  <label className="text-muted-foreground text-xs font-semibold">
                    Intervalo entre Horários
                  </label>
                  <select
                    value={currentDaySchedule.slotIntervalInMinutes}
                    onChange={(e) =>
                      updateCurrentDaySchedule(
                        "slotIntervalInMinutes",
                        Number(e.target.value),
                      )
                    }
                    className="border-border bg-card text-foreground focus:ring-primary w-full rounded-xl border p-2.5 text-sm font-semibold focus:ring-2 focus:outline-hidden"
                  >
                    {intervalOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pausa / Almoço */}
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-foreground text-sm font-bold">
                      Pausa para Almoço / Intervalo
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Bloqueia a geração de horários dentro deste período.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant={
                      currentDaySchedule.breakStartTime ? "outline" : "ghost"
                    }
                    size="sm"
                    onClick={() => {
                      if (currentDaySchedule.breakStartTime) {
                        updateCurrentDaySchedule("breakStartTime", null);
                        updateCurrentDaySchedule("breakEndTime", null);
                      } else {
                        updateCurrentDaySchedule("breakStartTime", "12:00");
                        updateCurrentDaySchedule("breakEndTime", "13:00");
                      }
                    }}
                    className="rounded-xl text-xs"
                  >
                    {currentDaySchedule.breakStartTime
                      ? "Remover Pausa"
                      : "Ativar Pausa"}
                  </Button>
                </div>

                {currentDaySchedule.breakStartTime && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-muted-foreground text-xs font-semibold">
                        Início da Pausa
                      </label>
                      <select
                        value={currentDaySchedule.breakStartTime}
                        onChange={(e) =>
                          updateCurrentDaySchedule(
                            "breakStartTime",
                            e.target.value,
                          )
                        }
                        className="border-border bg-card text-foreground focus:ring-primary w-full rounded-xl border p-2.5 text-sm font-semibold focus:ring-2 focus:outline-hidden"
                      >
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-muted-foreground text-xs font-semibold">
                        Fim da Pausa
                      </label>
                      <select
                        value={currentDaySchedule.breakEndTime || "13:00"}
                        onChange={(e) =>
                          updateCurrentDaySchedule(
                            "breakEndTime",
                            e.target.value,
                          )
                        }
                        className="border-border bg-card text-foreground focus:ring-primary w-full rounded-xl border p-2.5 text-sm font-semibold focus:ring-2 focus:outline-hidden"
                      >
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview de Horários Gerados Dinamicamente */}
              <div className="border-border bg-card/60 space-y-3 rounded-xl border p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-primary size-4" />
                  <p className="text-card-foreground text-xs font-bold tracking-wider uppercase">
                    Pré-visualização Dinâmica dos Horários
                  </p>
                </div>
                {previewSlots.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {previewSlots.map((slot) => (
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
                    Nenhum horário gerado com os parâmetros atuais. Verifique os
                    horários de início e término.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 rounded-xl bg-zinc-900/40 p-4 text-zinc-400">
              <AlertCircle className="size-5 shrink-0" />
              <p className="text-xs">
                A barbearia está configurada como <strong>Fechada</strong> para
                este dia da semana. Os clientes não poderão agendar horários.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
