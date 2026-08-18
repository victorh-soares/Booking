"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface BarbershopInput {
  name: string;
  address: string;
  description: string;
  imageUrl: string;
  email?: string;
  phones: string[];
}

export interface ServiceInput {
  barbershopId: string;
  name: string;
  description: string;
  imageUrl: string;
  priceInCents: number;
}

export async function createBarbershopAction(data: BarbershopInput) {
  try {
    if (!data.name || !data.address || !data.description || !data.imageUrl) {
      return { success: false, error: "Preencha todos os campos obrigatórios." };
    }

    const cleanPhones = (data.phones || [])
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const barbershop = await prisma.barbershop.create({
      data: {
        name: data.name.trim(),
        address: data.address.trim(),
        description: data.description.trim(),
        imageUrl: data.imageUrl.trim(),
        email: data.email ? data.email.trim().toLowerCase() : null,
        phones: cleanPhones,
      },
    });

    revalidatePath("/master");
    revalidatePath("/");
    revalidatePath("/barbershops");

    return { success: true, barbershop };
  } catch (error: any) {
    console.error("Error creating barbershop:", error);
    return {
      success: false,
      error: error.message || "Erro ao criar barbearia.",
    };
  }
}

export async function updateBarbershopAction(
  id: string,
  data: BarbershopInput,
) {
  try {
    if (!id) {
      return { success: false, error: "ID da barbearia é obrigatório." };
    }

    const cleanPhones = (data.phones || [])
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const barbershop = await prisma.barbershop.update({
      where: { id },
      data: {
        name: data.name.trim(),
        address: data.address.trim(),
        description: data.description.trim(),
        imageUrl: data.imageUrl.trim(),
        email: data.email ? data.email.trim().toLowerCase() : null,
        phones: cleanPhones,
      },
    });

    revalidatePath("/master");
    revalidatePath("/");
    revalidatePath(`/barbershops/${id}`);
    revalidatePath("/barbershops");

    return { success: true, barbershop };
  } catch (error: any) {
    console.error("Error updating barbershop:", error);
    return {
      success: false,
      error: error.message || "Erro ao atualizar barbearia.",
    };
  }
}

export async function deleteBarbershopAction(id: string) {
  try {
    if (!id) {
      return { success: false, error: "ID da barbearia é obrigatório." };
    }

    // Delete bookings, services, and barbershop atomically
    await prisma.$transaction([
      prisma.booking.deleteMany({
        where: { barbershopId: id },
      }),
      prisma.barbershopService.deleteMany({
        where: { barbershopId: id },
      }),
      prisma.barbershop.delete({
        where: { id },
      }),
    ]);

    revalidatePath("/master");
    revalidatePath("/");
    revalidatePath("/barbershops");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting barbershop:", error);
    return {
      success: false,
      error: error.message || "Erro ao excluir barbearia.",
    };
  }
}

export async function createServiceAction(data: ServiceInput) {
  try {
    if (!data.barbershopId || !data.name || !data.description || !data.imageUrl) {
      return { success: false, error: "Preencha todos os campos obrigatórios." };
    }

    const service = await prisma.barbershopService.create({
      data: {
        barbershopId: data.barbershopId,
        name: data.name.trim(),
        description: data.description.trim(),
        imageUrl: data.imageUrl.trim(),
        priceInCents: Math.round(Number(data.priceInCents) || 0),
      },
    });

    revalidatePath("/master");
    revalidatePath(`/barbershops/${data.barbershopId}`);

    return { success: true, service };
  } catch (error: any) {
    console.error("Error creating service:", error);
    return {
      success: false,
      error: error.message || "Erro ao criar serviço.",
    };
  }
}

export async function updateServiceAction(id: string, data: Omit<ServiceInput, "barbershopId">) {
  try {
    if (!id) {
      return { success: false, error: "ID do serviço é obrigatório." };
    }

    const service = await prisma.barbershopService.update({
      where: { id },
      data: {
        name: data.name.trim(),
        description: data.description.trim(),
        imageUrl: data.imageUrl.trim(),
        priceInCents: Math.round(Number(data.priceInCents) || 0),
      },
    });

    revalidatePath("/master");
    revalidatePath(`/barbershops/${service.barbershopId}`);

    return { success: true, service };
  } catch (error: any) {
    console.error("Error updating service:", error);
    return {
      success: false,
      error: error.message || "Erro ao atualizar serviço.",
    };
  }
}

export async function deleteServiceAction(id: string) {
  try {
    if (!id) {
      return { success: false, error: "ID do serviço é obrigatório." };
    }

    const service = await prisma.barbershopService.findUnique({
      where: { id },
    });

    if (!service) {
      return { success: false, error: "Serviço não encontrado." };
    }

    await prisma.$transaction([
      prisma.booking.deleteMany({
        where: { serviceId: id },
      }),
      prisma.barbershopService.delete({
        where: { id },
      }),
    ]);

    revalidatePath("/master");
    revalidatePath(`/barbershops/${service.barbershopId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting service:", error);
    return {
      success: false,
      error: error.message || "Erro ao excluir serviço.",
    };
  }
}

export async function addMasterAdminEmailAction(email: string) {
  try {
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    if (!cleanEmail) {
      return { success: false, error: "E-mail inválido." };
    }

    const existing = await prisma.masterAdmin.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return { success: false, error: "Este e-mail já está cadastrado como Master Admin." };
    }

    const masterAdmin = await prisma.masterAdmin.create({
      data: { email: cleanEmail },
    });

    revalidatePath("/master");
    return { success: true, masterAdmin };
  } catch (error: any) {
    console.error("Error adding master admin email:", error);
    return {
      success: false,
      error: error.message || "Erro ao adicionar e-mail de Master Admin.",
    };
  }
}

export async function removeMasterAdminEmailAction(id: string) {
  try {
    if (!id) {
      return { success: false, error: "ID é obrigatório." };
    }

    await prisma.masterAdmin.delete({
      where: { id },
    });

    revalidatePath("/master");
    return { success: true };
  } catch (error: any) {
    console.error("Error removing master admin email:", error);
    return {
      success: false,
      error: error.message || "Erro ao remover e-mail de Master Admin.",
    };
  }
}

export async function getMasterAdminEmailsAction() {
  try {
    const masterAdmins = await prisma.masterAdmin.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, masterAdmins };
  } catch (error: any) {
    console.error("Error fetching master admin emails:", error);
    return { success: false, masterAdmins: [] };
  }
}

