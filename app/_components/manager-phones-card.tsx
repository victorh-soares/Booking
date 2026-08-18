"use client";

import { useState } from "react";
import { Phone, Plus, Trash2, Save } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { toast } from "sonner";
import { updateBarbershopPhonesAction } from "../_actions/manager-settings-actions";

interface ManagerPhonesCardProps {
  barbershopId: string;
  initialPhones: string[];
}

export function ManagerPhonesCard({
  barbershopId,
  initialPhones,
}: ManagerPhonesCardProps) {
  const [phones, setPhones] = useState<string[]>(initialPhones || []);
  const [newPhone, setNewPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddPhone = () => {
    const clean = newPhone.trim();
    if (!clean) return;
    if (phones.includes(clean)) {
      toast.error("Este número já está cadastrado.");
      return;
    }
    setPhones([...phones, clean]);
    setNewPhone("");
  };

  const handleRemovePhone = (index: number) => {
    setPhones(phones.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const res = await updateBarbershopPhonesAction(barbershopId, phones);
    setIsSaving(false);
    if (res.success) {
      toast.success("Telefones atualizados com sucesso!");
    } else {
      toast.error(res.error || "Erro ao salvar telefones.");
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="text-primary size-5" />
            <CardTitle className="text-lg font-bold">
              Telefones de Contato
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
            <span>{isSaving ? "Salvando..." : "Salvar Telefones"}</span>
          </Button>
        </div>
        <CardDescription>
          Estes telefones são exibidos aos clientes na página pública do seu
          estabelecimento.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            type="text"
            placeholder="(11) 99999-9999"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            className="bg-background rounded-xl"
          />
          <Button
            type="button"
            onClick={handleAddPhone}
            variant="secondary"
            className="shrink-0 gap-2 rounded-xl"
          >
            <Plus className="size-4" />
            <span>Adicionar</span>
          </Button>
        </div>

        <div className="space-y-2">
          {phones.length === 0 ? (
            <p className="text-muted-foreground text-xs italic">
              Nenhum telefone cadastrado no momento.
            </p>
          ) : (
            phones.map((phone, idx) => (
              <div
                key={idx}
                className="border-border bg-background flex items-center justify-between rounded-xl border p-3"
              >
                <div className="flex items-center gap-3">
                  <Phone className="text-muted-foreground size-4" />
                  <span className="text-sm font-semibold">{phone}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemovePhone(idx)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive size-8 rounded-lg"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
