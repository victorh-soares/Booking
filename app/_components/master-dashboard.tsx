"use client";

import { useState } from "react";
import {
  Building2Icon,
  PlusIcon,
  ScissorsIcon,
  PencilIcon,
  Trash2Icon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  SearchIcon,
  ExternalLinkIcon,
  ShieldCheckIcon,
  UserPlusIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BarbershopFormModal } from "./barbershop-form-modal";
import { ServiceFormModal } from "./service-form-modal";
import {
  deleteBarbershopAction,
  deleteServiceAction,
  addMasterAdminEmailAction,
  removeMasterAdminEmailAction,
} from "@/app/_actions/master-actions";
import { toast } from "sonner";

interface BarbershopServiceData {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  priceInCents: number;
  barbershopId: string;
}

interface BarbershopData {
  id: string;
  name: string;
  address: string;
  description: string;
  imageUrl: string;
  email: string | null;
  phones: string[];
  services: BarbershopServiceData[];
}

interface MasterAdminData {
  id: string;
  email: string;
  createdAt: Date;
}

interface MasterDashboardProps {
  barbershops: BarbershopData[];
  masterAdmins: MasterAdminData[];
}

export function MasterDashboard({
  barbershops,
  masterAdmins = [],
}: MasterDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "barbershops" | "services" | "master_admins"
  >("barbershops");
  const [search, setSearch] = useState("");
  const [selectedBarbershopFilter, setSelectedBarbershopFilter] =
    useState<string>("all");

  // New Master Email form state
  const [newMasterEmail, setNewMasterEmail] = useState("");
  const [isAddingEmail, setIsAddingEmail] = useState(false);

  // Barbershop Modal states
  const [isBarbershopModalOpen, setIsBarbershopModalOpen] = useState(false);
  const [barbershopToEdit, setBarbershopToEdit] =
    useState<BarbershopData | null>(null);

  // Service Modal states
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<{
    id: string;
    barbershopId: string;
    name: string;
    description: string;
    imageUrl: string;
    priceInCents: number;
  } | null>(null);
  const [defaultServiceBarbershopId, setDefaultServiceBarbershopId] =
    useState<string>("");

  // Calculate totals
  const totalBarbershops = barbershops.length;
  const allServices = barbershops.flatMap((b) =>
    b.services.map((s) => ({ ...s, barbershopName: b.name })),
  );
  const totalServices = allServices.length;
  const totalMasterAdmins = masterAdmins.length;

  // Filtered lists
  const filteredBarbershops = barbershops.filter((b) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;
    return (
      b.name.toLowerCase().includes(query) ||
      b.address.toLowerCase().includes(query) ||
      (b.email && b.email.toLowerCase().includes(query)) ||
      b.phones.some((p) => p.includes(query))
    );
  });

  const filteredServices = allServices.filter((s) => {
    const matchesShop =
      selectedBarbershopFilter === "all" ||
      s.barbershopId === selectedBarbershopFilter;

    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      s.name.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query) ||
      s.barbershopName.toLowerCase().includes(query);

    return matchesShop && matchesSearch;
  });

  const filteredMasterAdmins = masterAdmins.filter((m) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;
    return m.email.toLowerCase().includes(query);
  });

  // Handle Adding Master Email
  const handleAddMasterEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMasterEmail.trim()) {
      toast.error("Informe um e-mail válido.");
      return;
    }

    setIsAddingEmail(true);
    try {
      const res = await addMasterAdminEmailAction(newMasterEmail);
      if (res.success) {
        toast.success(`E-mail ${newMasterEmail} cadastrado como Master Admin!`);
        setNewMasterEmail("");
      } else {
        toast.error(res.error || "Erro ao adicionar e-mail.");
      }
    } catch {
      toast.error("Ocorreu um erro ao adicionar o e-mail.");
    } finally {
      setIsAddingEmail(false);
    }
  };

  // Handle Removing Master Email
  const handleRemoveMasterEmail = async (id: string, email: string) => {
    if (
      !confirm(
        `Tem certeza que deseja remover o e-mail "${email}" do acesso de Administrador Master?`,
      )
    ) {
      return;
    }

    try {
      const res = await removeMasterAdminEmailAction(id);
      if (res.success) {
        toast.success(`E-mail "${email}" removido com sucesso!`);
      } else {
        toast.error(res.error || "Erro ao remover e-mail.");
      }
    } catch {
      toast.error("Ocorreu um erro ao remover o e-mail.");
    }
  };

  // Handle Deletions
  const handleDeleteBarbershop = async (id: string, name: string) => {
    if (
      !confirm(
        `Tem certeza que deseja excluir a barbearia "${name}"? Todos os seus serviços vinculados também serão apagados do banco de dados.`,
      )
    ) {
      return;
    }

    try {
      const res = await deleteBarbershopAction(id);
      if (res.success) {
        toast.success(`Barbearia "${name}" excluída com sucesso!`);
      } else {
        toast.error(res.error || "Erro ao excluir barbearia.");
      }
    } catch {
      toast.error("Ocorreu um erro ao excluir a barbearia.");
    }
  };

  const handleDeleteService = async (id: string, name: string) => {
    if (
      !confirm(
        `Tem certeza que deseja excluir o serviço "${name}" do banco de dados?`,
      )
    ) {
      return;
    }

    try {
      const res = await deleteServiceAction(id);
      if (res.success) {
        toast.success(`Serviço "${name}" excluído com sucesso!`);
      } else {
        toast.error(res.error || "Erro ao excluir serviço.");
      }
    } catch {
      toast.error("Ocorreu um erro ao excluir o serviço.");
    }
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-8 max-w-7xl">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6 border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <ShieldCheckIcon className="size-8 text-sky-600 dark:text-sky-400" />
            Painel do Administrador Master
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerenciamento direto do banco de dados de barbearias, serviços, contatos e permissões master.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setBarbershopToEdit(null);
              setIsBarbershopModalOpen(true);
            }}
            className="gap-2 bg-sky-600 hover:bg-sky-700 text-white font-medium"
          >
            <PlusIcon className="size-4" /> Nova Barbearia
          </Button>
          <Button
            onClick={() => {
              setServiceToEdit(null);
              setDefaultServiceBarbershopId(
                selectedBarbershopFilter !== "all"
                  ? selectedBarbershopFilter
                  : barbershops[0]?.id || "",
              );
              setIsServiceModalOpen(true);
            }}
            variant="outline"
            className="gap-2"
          >
            <PlusIcon className="size-4" /> Novo Serviço
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Barbearias
            </CardTitle>
            <Building2Icon className="size-5 text-sky-600 dark:text-sky-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBarbershops}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Cadastradas no banco de dados
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Serviços
            </CardTitle>
            <ScissorsIcon className="size-5 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Serviços cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Admins Master
            </CardTitle>
            <ShieldCheckIcon className="size-5 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMasterAdmins}</div>
            <p className="text-xs text-muted-foreground mt-1">
              E-mails com acesso master
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
        <div className="flex flex-wrap gap-2 border-b border-border sm:border-b-0 pb-2 sm:pb-0">
          <Button
            variant={activeTab === "barbershops" ? "default" : "ghost"}
            onClick={() => setActiveTab("barbershops")}
            className="rounded-full text-sm"
          >
            <Building2Icon className="mr-2 size-4" /> Barbearias ({filteredBarbershops.length})
          </Button>
          <Button
            variant={activeTab === "services" ? "default" : "ghost"}
            onClick={() => setActiveTab("services")}
            className="rounded-full text-sm"
          >
            <ScissorsIcon className="mr-2 size-4" /> Serviços ({filteredServices.length})
          </Button>
          <Button
            variant={activeTab === "master_admins" ? "default" : "ghost"}
            onClick={() => setActiveTab("master_admins")}
            className="rounded-full text-sm"
          >
            <ShieldCheckIcon className="mr-2 size-4" /> E-mails Master ({filteredMasterAdmins.length})
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {activeTab === "services" && (
            <select
              value={selectedBarbershopFilter}
              onChange={(e) => setSelectedBarbershopFilter(e.target.value)}
              className="border-input bg-background text-foreground rounded-md border px-3 py-2 text-sm focus:outline-hidden"
            >
              <option value="all">Todas as Barbearias</option>
              {barbershops.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          <div className="relative w-full sm:w-72">
            <SearchIcon className="text-muted-foreground absolute left-3 top-2.5 size-4" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar..."
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Tab 1: Barbearias */}
      {activeTab === "barbershops" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBarbershops.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              Nenhuma barbearia encontrada.
            </div>
          ) : (
            filteredBarbershops.map((shop) => (
              <Card key={shop.id} className="border-border overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={shop.imageUrl}
                      alt={shop.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs rounded-full px-3 py-1 text-white text-xs font-semibold">
                      {shop.services.length} serviços
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-bold tracking-tight text-foreground">
                        {shop.name}
                      </h3>
                      <Link
                        href={`/barbershops/${shop.id}`}
                        target="_blank"
                        className="text-muted-foreground hover:text-foreground"
                        title="Ver no site"
                      >
                        <ExternalLinkIcon className="size-4" />
                      </Link>
                    </div>

                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <MapPinIcon className="size-4 shrink-0 text-sky-600" />
                      <span>{shop.address}</span>
                    </div>

                    {shop.email && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MailIcon className="size-4 shrink-0 text-amber-500" />
                        <span className="font-mono text-foreground">{shop.email}</span>
                      </div>
                    )}

                    {shop.phones && shop.phones.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {shop.phones.map((phone, i) => (
                          <Badge key={i} variant="outline" className="text-[11px] font-normal gap-1">
                            <PhoneIcon className="size-3 text-emerald-500" /> {phone}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground line-clamp-2 pt-1">
                      {shop.description}
                    </p>
                  </CardContent>
                </div>

                <div className="flex items-center justify-between border-t border-border p-4 bg-muted/30">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBarbershopToEdit(shop);
                      setIsBarbershopModalOpen(true);
                    }}
                    className="gap-2 text-xs"
                  >
                    <PencilIcon className="size-3.5" /> Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteBarbershop(shop.id, shop.name)}
                    className="gap-2 text-xs"
                  >
                    <Trash2Icon className="size-3.5" /> Excluir
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Serviços */}
      {activeTab === "services" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              Nenhum serviço encontrado.
            </div>
          ) : (
            filteredServices.map((service) => (
              <Card key={service.id} className="border-border overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="relative h-40 w-full bg-slate-100 dark:bg-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 bg-emerald-600 font-bold text-white text-xs px-2.5 py-1 rounded-md shadow-md">
                      {(service.priceInCents / 100).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-2">
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider mb-1">
                      {service.barbershopName}
                    </Badge>

                    <h3 className="text-base font-bold tracking-tight text-foreground">
                      {service.name}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {service.description}
                    </p>
                  </CardContent>
                </div>

                <div className="flex items-center justify-between border-t border-border p-4 bg-muted/30">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setServiceToEdit({
                        id: service.id,
                        barbershopId: service.barbershopId,
                        name: service.name,
                        description: service.description,
                        imageUrl: service.imageUrl,
                        priceInCents: service.priceInCents,
                      });
                      setIsServiceModalOpen(true);
                    }}
                    className="gap-2 text-xs"
                  >
                    <PencilIcon className="size-3.5" /> Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteService(service.id, service.name)}
                    className="gap-2 text-xs"
                  >
                    <Trash2Icon className="size-3.5" /> Excluir
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Master Admin Emails */}
      {activeTab === "master_admins" && (
        <div className="space-y-6">
          {/* Add New Master Admin Email Form */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <UserPlusIcon className="size-5 text-sky-600" />
                Adicionar Novo E-mail de Administrador Master
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMasterEmail} className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  value={newMasterEmail}
                  onChange={(e) => setNewMasterEmail(e.target.value)}
                  placeholder="Ex: administrador@dominio.com"
                  className="flex-1"
                  required
                />
                <Button type="submit" disabled={isAddingEmail} className="gap-2 bg-sky-600 hover:bg-sky-700 text-white">
                  <PlusIcon className="size-4" /> {isAddingEmail ? "Adicionando..." : "Adicionar Master"}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-2">
                Os usuários cadastrados aqui terão permissão para acessar o Painel Master (/master) e gerenciar todo o banco de dados.
              </p>
            </CardContent>
          </Card>

          {/* List of Master Admin Emails */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMasterAdmins.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                Nenhum e-mail master cadastrado no banco de dados.
              </div>
            ) : (
              filteredMasterAdmins.map((item) => (
                <Card key={item.id} className="border-border">
                  <CardContent className="p-5 flex items-center justify-between gap-3">
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <MailIcon className="size-4 text-sky-600 shrink-0" />
                        <span className="font-semibold text-sm truncate font-mono">
                          {item.email}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Adicionado em: {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMasterEmail(item.id, item.email)}
                      className="text-destructive hover:bg-destructive/10 shrink-0"
                      title="Remover acesso Master"
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <BarbershopFormModal
        isOpen={isBarbershopModalOpen}
        onClose={() => setIsBarbershopModalOpen(false)}
        barbershopToEdit={barbershopToEdit}
      />

      <ServiceFormModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        barbershops={barbershops.map((b) => ({ id: b.id, name: b.name }))}
        serviceToEdit={serviceToEdit}
        defaultBarbershopId={defaultServiceBarbershopId}
      />
    </div>
  );
}
