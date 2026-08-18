"use client";

import { Smartphone } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface PhoneItemProps {
  phone: string;
}

export function PhoneItem({ phone }: PhoneItemProps) {
  const handleCopyPhoneClick = (phone: string) => {
    navigator.clipboard.writeText(phone);
    toast.success("Telefone copiado com sucesso!");
  };

  return (
    <div className="flex items-center justify-between">
      {/* Esquerda: Ícone e número */}
      <div className="flex items-center gap-2">
        <Smartphone className="size-4" />
        <p className="text-sm">{phone}</p>
      </div>

      {/* Direita: Botão de Copiar */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleCopyPhoneClick(phone)}
      >
        Copiar
      </Button>
    </div>
  );
}
