"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { XIcon } from "lucide-react";
import {
  createServiceAction,
  updateServiceAction,
} from "@/app/_actions/master-actions";

interface BarbershopOption {
  id: string;
  name: string;
}

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  barbershops: BarbershopOption[];
  serviceToEdit?: {
    id: string;
    barbershopId: string;
    name: string;
    description: string;
    imageUrl: string;
    priceInCents: number;
  } | null;
  defaultBarbershopId?: string;
}

export function ServiceFormModal({
  isOpen,
  onClose,
  barbershops,
  serviceToEdit,
  defaultBarbershopId,
}: ServiceFormModalProps) {
  const [barbershopId, setBarbershopId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [priceInReais, setPriceInReais] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (serviceToEdit) {
      setBarbershopId(serviceToEdit.barbershopId || "");
      setName(serviceToEdit.name || "");
      setDescription(serviceToEdit.description || "");
      setImageUrl(serviceToEdit.imageUrl || "");
      setPriceInReais((serviceToEdit.priceInCents / 100).toFixed(2));
    } else {
      setBarbershopId(
        defaultBarbershopId || (barbershops[0] ? barbershops[0].id : ""),
      );
      setName("");
      setDescription("");
      setImageUrl("");
      setPriceInReais("");
    }
  }, [serviceToEdit, defaultBarbershopId, barbershops, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const priceNum = parseFloat(priceInReais.replace(",", "."));
      if (isNaN(priceNum) || priceNum < 0) {
        toast.error("Insira um preço válido em R$.");
        setIsSubmitting(false);
        return;
      }

      const priceInCents = Math.round(priceNum * 100);

      let result;
      if (serviceToEdit) {
        result = await updateServiceAction(serviceToEdit.id, {
          name,
          description,
          imageUrl,
          priceInCents,
        });
      } else {
        if (!barbershopId) {
          toast.error("Selecione uma barbearia para o serviço.");
          setIsSubmitting(false);
          return;
        }
        result = await createServiceAction({
          barbershopId,
          name,
          description,
          imageUrl,
          priceInCents,
        });
      }

      if (result.success) {
        toast.success(
          serviceToEdit
            ? "Serviço atualizado com sucesso!"
            : "Serviço cadastrado com sucesso!",
        );
        onClose();
      } else {
        toast.error(result.error || "Erro ao salvar serviço.");
      }
    } catch (err: any) {
      toast.error("Ocorreu um erro ao salvar o serviço.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-background border-border relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border p-6 shadow-2xl">
        <button
          onClick={onClose}
          type="button"
          className="text-muted-foreground hover:text-foreground absolute top-4 right-4 rounded-full p-1 transition"
        >
          <XIcon className="size-5" />
        </button>

        <h2 className="mb-4 text-xl font-bold">
          {serviceToEdit ? "Editar Serviço" : "Cadastrar Novo Serviço"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!serviceToEdit && (
            <div>
              <label className="text-foreground mb-1 block text-xs font-semibold">
                Barbearia *
              </label>
              <select
                value={barbershopId}
                onChange={(e) => setBarbershopId(e.target.value)}
                required
                className="border-input bg-background text-foreground w-full rounded-md border px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              >
                <option value="" disabled>
                  Selecione uma barbearia
                </option>
                {barbershops.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-foreground mb-1 block text-xs font-semibold">
              Nome do Serviço *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Corte Degradê, Barba Completa"
              required
            />
          </div>

          <div>
            <label className="text-foreground mb-1 block text-xs font-semibold">
              Preço (em R$) *
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={priceInReais}
              onChange={(e) => setPriceInReais(e.target.value)}
              placeholder="Ex: 50.00"
              required
            />
          </div>

          <div>
            <label className="text-foreground mb-1 block text-xs font-semibold">
              Descrição *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva os detalhes e duração do serviço..."
              rows={3}
              required
              className="border-input bg-background text-foreground w-full rounded-md border px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="text-foreground mb-1 block text-xs font-semibold">
              URL da Imagem *
            </label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://exemplo.com/servico.png"
              required
            />
            {imageUrl && (
              <div className="border-border relative mt-2 h-28 w-full overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Pré-visualização do serviço"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : serviceToEdit
                  ? "Salvar Alterações"
                  : "Criar Serviço"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
