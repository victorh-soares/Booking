"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Plus, Trash2, Save } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { updateBarbershopClosedDatesAction } from "../_actions/manager-settings-actions";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ManagerClosedDatesCardProps {
  barbershopId: string;
  closedDates: string[];
  onClosedDatesChange: (closedDates: string[]) => void;
}

export function ManagerClosedDatesCard({
  barbershopId,
  closedDates,
  onClosedDatesChange,
}: ManagerClosedDatesCardProps) {
  const [newClosedDate, setNewClosedDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddClosedDate = () => {
    if (!newClosedDate) return;
    if (closedDates.includes(newClosedDate)) {
      toast.error("Esta data já está na lista de bloqueadas.");
      return;
    }
    const updated = [...closedDates, newClosedDate].sort();
    onClosedDatesChange(updated);
    setNewClosedDate("");
  };

  const handleRemoveClosedDate = (dateToRemove: string) => {
    const updated = closedDates.filter((d) => d !== dateToRemove);
    onClosedDatesChange(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const res = await updateBarbershopClosedDatesAction(
      barbershopId,
      closedDates,
    );
    setIsSaving(false);
    if (res.success) {
      toast.success("Datas bloqueadas salvas com sucesso!");
    } else {
      toast.error(res.error || "Erro ao salvar datas bloqueadas.");
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="text-primary size-5" />
            <CardTitle className="text-lg font-bold">
              Datas Indisponíveis (Feriados e Bloqueios)
            </CardTitle>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 rounded-xl"
          >
            <Save className="size-4" />
            <span>{isSaving ? "Salvando..." : "Salvar Bloqueios"}</span>
          </Button>
        </div>
        <CardDescription>
          Bloqueie datas específicas (como feriados ou folgas da equipe) para
          impedir novos agendamentos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            type="date"
            value={newClosedDate}
            onChange={(e) => setNewClosedDate(e.target.value)}
            className="bg-background rounded-xl"
          />
          <Button
            type="button"
            onClick={handleAddClosedDate}
            variant="secondary"
            className="shrink-0 gap-2 rounded-xl"
          >
            <Plus className="size-4" />
            <span>Bloquear Data</span>
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {closedDates.length === 0 ? (
            <p className="text-muted-foreground text-xs italic">
              Nenhuma data específica bloqueada no momento.
            </p>
          ) : (
            closedDates.map((dateStr) => {
              let formattedStr = dateStr;
              try {
                const parsed = parseISO(dateStr);
                formattedStr = format(parsed, "dd/MM/yyyy (EEE)", {
                  locale: ptBR,
                });
              } catch {
                formattedStr = dateStr;
              }

              return (
                <Badge
                  key={dateStr}
                  variant="outline"
                  className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold"
                >
                  <span>{formattedStr}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveClosedDate(dateStr)}
                    className="hover:text-destructive/80"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </Badge>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
