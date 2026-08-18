"use server";

import { actionClient } from "@/lib/action-client";
import { prisma } from "@/lib/prisma";
import z from "zod";
import { endOfDay, format, startOfDay } from "date-fns";

const inputSchema = z.object({
  barbershopId: z.string(),
  date: z.coerce.date(),
  serviceId: z.string().optional(),
});

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export const getDateAvailableTimeSlots = actionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: { barbershopId, date, serviceId } }) => {
    if (!barbershopId || !date) {
      return [];
    }

    // Fetch barbershop with schedules & closedDates
    const barbershop = await prisma.barbershop.findUnique({
      where: { id: barbershopId },
      include: {
        schedules: true,
      },
    });

    if (!barbershop) {
      return [];
    }

    // 1. Check if date is in closedDates (YYYY-MM-DD)
    const dateOnlyStr = format(date, "yyyy-MM-dd");
    if (barbershop.closedDates && barbershop.closedDates.includes(dateOnlyStr)) {
      return [];
    }

    // 2. Find schedule for dayOfWeek (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeek = date.getDay();
    const daySchedule = barbershop.schedules.find(
      (s) => s.dayOfWeek === dayOfWeek,
    );

    // Default configuration if no specific schedule row is saved in DB yet
    const isOpen = daySchedule ? daySchedule.isOpen : dayOfWeek !== 0;
    const startTime = daySchedule?.startTime || "08:00";
    const endTime = daySchedule?.endTime || "18:00";
    const slotIntervalInMinutes = daySchedule?.slotIntervalInMinutes || 30;
    const breakStartTime = daySchedule?.breakStartTime ?? "12:00";
    const breakEndTime = daySchedule?.breakEndTime ?? "13:00";

    if (!isOpen) {
      return [];
    }

    // 3. Service duration
    let serviceDuration = 30;
    if (serviceId) {
      const service = await prisma.barbershopService.findUnique({
        where: { id: serviceId },
      });
      if (service?.durationInMinutes) {
        serviceDuration = service.durationInMinutes;
      }
    }

    // Convert working bounds to minutes
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const breakStartMinutes = breakStartTime
      ? timeToMinutes(breakStartTime)
      : null;
    const breakEndMinutes = breakEndTime
      ? timeToMinutes(breakEndTime)
      : null;

    // 4. Generate candidate time slots dynamically based on interval
    const candidateSlots: { timeStr: string; startM: number; endM: number }[] =
      [];

    for (
      let m = startMinutes;
      m <= endMinutes - serviceDuration;
      m += slotIntervalInMinutes
    ) {
      const slotStartM = m;
      const slotEndM = m + serviceDuration;

      // Skip if slot overlaps with break/lunch time
      if (
        breakStartMinutes !== null &&
        breakEndMinutes !== null &&
        breakStartMinutes < breakEndMinutes
      ) {
        if (
          slotStartM < breakEndMinutes &&
          slotEndM > breakStartMinutes
        ) {
          continue; // Overlaps with lunch break
        }
      }

      candidateSlots.push({
        timeStr: minutesToTime(slotStartM),
        startM: slotStartM,
        endM: slotEndM,
      });
    }

    // 5. Fetch existing bookings for this barbershop on this date
    const bookings = await prisma.booking.findMany({
      where: {
        barbershopId,
        date: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
        OR: [{ cancelled: false }, { cancelled: null }],
      },
      include: {
        service: true,
      },
    });

    const occupiedRanges = bookings.map((b) => {
      const bDate = new Date(b.date);
      const bStartM = bDate.getHours() * 60 + bDate.getMinutes();
      const bDuration = b.service?.durationInMinutes || 30;
      return {
        startM: bStartM,
        endM: bStartM + bDuration,
      };
    });

    // 6. Filter candidate slots that overlap with any existing booking
    const availableSlots = candidateSlots.filter((slot) => {
      const isOccupied = occupiedRanges.some(
        (occ) => slot.startM < occ.endM && slot.endM > occ.startM,
      );
      return !isOccupied;
    });

    // 7. If target date is TODAY, exclude past time slots
    const now = new Date();
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    if (isToday) {
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      return availableSlots
        .filter((slot) => slot.startM > nowMinutes)
        .map((slot) => slot.timeStr);
    }

    return availableSlots.map((slot) => slot.timeStr);
  });
