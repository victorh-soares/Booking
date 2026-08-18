"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export interface ScheduleInput {
  dayOfWeek: number;
  isOpen: boolean;
  startTime: string;
  endTime: string;
  slotIntervalInMinutes: number;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
}

export async function updateBarbershopPhonesAction(
  barbershopId: string,
  phones: string[],
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Não autorizado." };
    }

    if (!barbershopId) {
      return { success: false, error: "ID da barbearia é obrigatório." };
    }

    const cleanPhones = (phones || [])
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const barbershop = await prisma.barbershop.update({
      where: { id: barbershopId },
      data: {
        phones: cleanPhones,
      },
    });

    revalidatePath("/manager");
    revalidatePath("/");
    revalidatePath(`/barbershops/${barbershopId}`);

    return { success: true, phones: barbershop.phones };
  } catch (error: any) {
    console.error("Erro ao atualizar telefones:", error);
    return {
      success: false,
      error: error.message || "Erro ao atualizar telefones.",
    };
  }
}

export async function updateBarbershopSchedulesAction(
  barbershopId: string,
  schedules: ScheduleInput[],
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Não autorizado." };
    }

    if (!barbershopId) {
      return { success: false, error: "ID da barbearia é obrigatório." };
    }

    // Upsert schedule for each day of week (0 to 6)
    for (const schedule of schedules) {
      await prisma.barbershopSchedule.upsert({
        where: {
          barbershopId_dayOfWeek: {
            barbershopId,
            dayOfWeek: schedule.dayOfWeek,
          },
        },
        create: {
          barbershopId,
          dayOfWeek: schedule.dayOfWeek,
          isOpen: schedule.isOpen,
          startTime: schedule.startTime || "08:00",
          endTime: schedule.endTime || "18:00",
          slotIntervalInMinutes: Number(schedule.slotIntervalInMinutes) || 30,
          breakStartTime: schedule.breakStartTime || null,
          breakEndTime: schedule.breakEndTime || null,
        },
        update: {
          isOpen: schedule.isOpen,
          startTime: schedule.startTime || "08:00",
          endTime: schedule.endTime || "18:00",
          slotIntervalInMinutes: Number(schedule.slotIntervalInMinutes) || 30,
          breakStartTime: schedule.breakStartTime || null,
          breakEndTime: schedule.breakEndTime || null,
        },
      });
    }

    revalidatePath("/manager");
    revalidatePath("/");
    revalidatePath(`/barbershops/${barbershopId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao atualizar horários:", error);
    return {
      success: false,
      error: error.message || "Erro ao atualizar horários.",
    };
  }
}

export async function updateBarbershopClosedDatesAction(
  barbershopId: string,
  closedDates: string[],
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Não autorizado." };
    }

    if (!barbershopId) {
      return { success: false, error: "ID da barbearia é obrigatório." };
    }

    const cleanDates = Array.from(
      new Set(
        (closedDates || []).map((d) => d.trim()).filter((d) => d.length > 0),
      ),
    );

    const barbershop = await prisma.barbershop.update({
      where: { id: barbershopId },
      data: {
        closedDates: cleanDates,
      },
    });

    revalidatePath("/manager");
    revalidatePath("/");
    revalidatePath(`/barbershops/${barbershopId}`);

    return { success: true, closedDates: barbershop.closedDates };
  } catch (error: any) {
    console.error("Erro ao atualizar datas bloqueadas:", error);
    return {
      success: false,
      error: error.message || "Erro ao atualizar datas bloqueadas.",
    };
  }
}
