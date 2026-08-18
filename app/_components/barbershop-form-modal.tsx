"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { PlusIcon, Trash2Icon, XIcon, ImageIcon } from "lucide-react";
import {
  createBarbershopAction,
  updateBarbershopAction,
  BarbershopInput,
} from "@/app/_actions/master-actions";

interface BarbershopFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  barbershopToEdit?: {
    id: string;
    name: string;
    address: string;
    description: string;
    imageUrl: string;
    email?: string | null;
    phones: string[];
  } | null;
}

export function BarbershopFormModal({
  isOpen,
  onClose,
  barbershopToEdit,
}: BarbershopFormModalProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [email, setEmail] = useState("");
  const [phones, setPhones] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (barbershopToEdit) {
      setName(barbershopToEdit.name || "");
      setAddress(barbershopToEdit.address || "");
      setDescription(barbershopToEdit.description || "");
      setImageUrl(barbershopToEdit.imageUrl || "");
      setEmail(barbershopToEdit.email || "");
      setPhones(
        barbershopToEdit.phones && barbershopToEdit.phones.length > 0
          ? barbershopToEdit.phones
          : [""],
      );
    } else {
      setName("");
      setAddress("");
      setDescription("");
      setImageUrl("");
      setEmail("");
      setPhones([""]);
    }
  }, [barbershopToEdit, isOpen]);

  if (!isOpen) return null;

  const handlePhoneChange = (index: number, value: string) => {
    const newPhones = [...phones];
    newPhones[index] = value;
    setPhones(newPhones);
  };

  const handleAddPhone = () => {
    setPhones([...phones, ""]);
  };

  const handleRemovePhone = (index: number) => {
    if (phones.length <= 1) {
      setPhones([""]);
      return;
    }
    const newPhones = phones.filter((_, i) => i !== index);
    setPhones(newPhones);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: BarbershopInput = {
        name,
        address,
        description,
        imageUrl,
        email: email ? email : undefined,
        phones,
      };

      let result;
      if (barbershopToEdit) {
        result = await updateBarbershopAction(barbershopToEdit.id, payload);
      } else {
        result = await createBarbershopAction(payload);
      }

      if (result.success) {
        toast.success(
          barbershopToEdit
            ? "Barbearia atualizada com sucesso!"
            : "Barbearia cadastrada com sucesso!",
        );
        onClose();
      } else {
        toast.error(result.error || "Erro ao salvar barbearia.");
      }
    } catch (err: any) {
      toast.error("Ocorreu um erro ao salvar a barbearia.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-background border-border relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border p-6 shadow-2xl">
        <button
          onClick={onClose}
          type="button"
          className="text-muted-foreground hover:text-foreground absolute top-4 right-4 rounded-full p-1 transition"
        >
          <XIcon className="size-5" />
        </button>

        <h2 className="mb-4 text-xl font-bold">
          {barbershopToEdit ? "Editar Barbearia" : "Cadastrar Nova Barbearia"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-foreground mb-1 block text-xs font-semibold">
              Nome da Barbearia *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Barbearia Aparatus"
              required
            />
          </div>

          <div>
            <label className="text-foreground mb-1 block text-xs font-semibold">
              Endereço *
            </label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: Av. Paulista, 1000 - São Paulo"
              required
            />
          </div>

          <div>
            <label className="text-foreground mb-1 block text-xs font-semibold">
              E-mail do Administrador (Para login e acesso)
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: admin@barbearia.com"
            />
            <p className="text-muted-foreground mt-1 text-[11px]">
              O administrador desta barbearia usará este e-mail para acessar a página de gestão (/manager).
            </p>
          </div>

          <div>
            <label className="text-foreground mb-1 block text-xs font-semibold">
              Descrição *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a barbearia, diferenciais e serviços oferecidos..."
              rows={3}
              required
              className="border-input bg-background text-foreground w-full rounded-md border px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="text-foreground mb-1 block text-xs font-semibold">
              URL da Imagem *
            </label>
            <div className="flex gap-2">
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.png"
                required
              />
            </div>
            {imageUrl && (
              <div className="border-border relative mt-2 h-32 w-full overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Pré-visualização"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-foreground block text-xs font-semibold">
                Números de Telefone
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddPhone}
                className="h-7 text-xs text-sky-600 dark:text-sky-400"
              >
                <PlusIcon className="mr-1 size-3" /> Adicionar Telefone
              </Button>
            </div>

            <div className="space-y-2">
              {phones.map((phone, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={phone}
                    onChange={(e) => handlePhoneChange(idx, e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                  {phones.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemovePhone(idx)}
                      className="text-destructive shrink-0"
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : barbershopToEdit
                  ? "Salvar Alterações"
                  : "Criar Barbearia"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
