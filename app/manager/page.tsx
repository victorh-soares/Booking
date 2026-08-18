import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ManagerDashboard } from "../_components/manager-dashboard";
import { format } from "date-fns";

export const revalidate = 0;

export default async function ManagerPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const userEmail = session.user.email?.toLowerCase().trim();

  // Find all barbershops
  const barbershops = await prisma.barbershop.findMany({
    include: {
      services: true,
      schedules: true,
      bookings: {
        include: {
          user: true,
          service: true,
        },
        orderBy: {
          date: "desc",
        },
      },
    },
  });

  if (barbershops.length === 0) {
    redirect("/");
  }

  // Check if any barbershop matches user's email
  let matchedBarbershop = barbershops.find(
    (b: any) => b.email && b.email.toLowerCase().trim() === userEmail,
  );

  // Fallback for dev testing if no barbershop email is set in DB yet
  if (!matchedBarbershop) {
    const hasAnyEmailInDb = barbershops.some((b: any) => Boolean(b.email));
    if (!hasAnyEmailInDb) {
      matchedBarbershop = barbershops[0];
    }
  }

  if (!matchedBarbershop) {
    redirect("/");
  }

  // Fetch all bookings for this barbershop
  const barbershopBookings = await prisma.booking.findMany({
    where: {
      barbershopId: matchedBarbershop.id,
    },
    include: {
      user: true,
      service: true,
      barbershop: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  // Calculate metrics from database
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );
  const todayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );

  const allDbBookings = matchedBarbershop.bookings || [];

  // 1. Agendamentos hoje (não cancelados) vs ontem
  const todayBookingsCount = allDbBookings.filter((b: any) => {
    const bd = new Date(b.date);
    return bd >= todayStart && bd <= todayEnd && !b.cancelled;
  }).length;

  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const yesterdayEnd = new Date(todayEnd);
  yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

  const yesterdayBookingsCount = allDbBookings.filter((b: any) => {
    const bd = new Date(b.date);
    return bd >= yesterdayStart && bd <= yesterdayEnd && !b.cancelled;
  }).length;

  const todayTrend =
    yesterdayBookingsCount > 0
      ? ((todayBookingsCount - yesterdayBookingsCount) / yesterdayBookingsCount) *
        100
      : todayBookingsCount > 0
        ? 100
        : 0;

  // 2. Usuários únicos atendidos/agendados nesta semana vs semana passada
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);

  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  twoWeeksAgo.setHours(0, 0, 0, 0);

  const weeklyUsersCount = new Set(
    allDbBookings
      .filter((b: any) => !b.cancelled && new Date(b.date) >= weekAgo)
      .map((b: any) => b.userId),
  ).size;

  const previousWeekUsersCount = new Set(
    allDbBookings
      .filter(
        (b: any) =>
          !b.cancelled &&
          new Date(b.date) >= twoWeeksAgo &&
          new Date(b.date) < weekAgo,
      )
      .map((b: any) => b.userId),
  ).size;

  const weeklyUsersTrend =
    previousWeekUsersCount > 0
      ? ((weeklyUsersCount - previousWeekUsersCount) / previousWeekUsersCount) *
        100
      : weeklyUsersCount > 0
        ? 100
        : 0;

  // 3. Faturamento deste mês vs mês passado (soma dos valores dos agendamentos)
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const prevMonthDate = new Date(now);
  prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
  const prevMonth = prevMonthDate.getMonth();
  const prevMonthYear = prevMonthDate.getFullYear();

  const monthlyBookings = allDbBookings.filter(
    (b: any) =>
      !b.cancelled &&
      new Date(b.date).getMonth() === currentMonth &&
      new Date(b.date).getFullYear() === currentYear,
  );

  const monthlyRevenue = monthlyBookings.reduce(
    (acc: number, b: any) => acc + (b.service?.priceInCents || 0),
    0,
  );

  const prevMonthBookings = allDbBookings.filter(
    (b: any) =>
      !b.cancelled &&
      new Date(b.date).getMonth() === prevMonth &&
      new Date(b.date).getFullYear() === prevMonthYear,
  );

  const prevMonthRevenue = prevMonthBookings.reduce(
    (acc: number, b: any) => acc + (b.service?.priceInCents || 0),
    0,
  );

  const monthlyRevenueTrend =
    prevMonthRevenue > 0
      ? ((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
      : monthlyRevenue > 0
        ? 100
        : 0;

  // Map recent bookings for the UI table
  const formattedRecentBookings =
    barbershopBookings.length > 0
      ? barbershopBookings.map((b) => {
          const isFuture = new Date(b.date) >= now;
          let status: "CONFIRMADO" | "CANCELADO" | "FINALIZADO" = "CONFIRMADO";

          if (b.cancelled) {
            status = "CANCELADO";
          } else if (!isFuture) {
            status = "FINALIZADO";
          }

          return {
            id: b.id,
            clientName: b.user?.name || b.user?.email || "Cliente",
            clientAvatar: b.user?.image || undefined,
            serviceName: b.service?.name || "Serviço",
            barbershopName: matchedBarbershop.name,
            date: format(new Date(b.date), "dd/MM/yyyy HH:mm"),
            rawDate: new Date(b.date),
            status,
            price: b.service?.priceInCents || 0,
          };
        })
      : [];

  const hasBookingsInDb = allDbBookings.length > 0;

  // Daily bookings for the last 7 days from real database bookings
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const dailyBookingsData = last7Days.map((dayDate) => {
    const nextDay = new Date(dayDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const count = hasBookingsInDb
      ? matchedBarbershop.bookings.filter((b: any) => {
          const bDate = new Date(b.date);
          return bDate >= dayDate && bDate < nextDay;
        }).length
      : 0;

    return {
      day: format(dayDate, "dd/MM"),
      count,
    };
  });

  // Top services rankings from real database bookings
  const serviceBookingCounts: Record<string, number> = {};
  if (hasBookingsInDb) {
    matchedBarbershop.bookings.forEach((b: any) => {
      if (b.serviceId) {
        serviceBookingCounts[b.serviceId] =
          (serviceBookingCounts[b.serviceId] || 0) + 1;
      }
    });
  }

  const topServicesData =
    matchedBarbershop.services && matchedBarbershop.services.length > 0
      ? matchedBarbershop.services
          .map((service: any) => ({
            id: service.id,
            name: service.name,
            count: serviceBookingCounts[service.id] || 0,
            imageUrl: service.imageUrl,
          }))
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 5)
      : [];

  const confirmedCount = allDbBookings.filter(
    (b: any) => !b.cancelled && new Date(b.date) >= now,
  ).length;

  const cancelledCount = allDbBookings.filter((b: any) => b.cancelled).length;

  const finishedCount = allDbBookings.filter(
    (b: any) => !b.cancelled && new Date(b.date) < now,
  ).length;

  return (
    <ManagerDashboard
      user={{
        name: session.user.name || "Administrador",
        email: session.user.email || "",
        image: session.user.image || undefined,
      }}
      barbershop={{
        id: matchedBarbershop.id,
        name: matchedBarbershop.name,
        address: matchedBarbershop.address,
        imageUrl: matchedBarbershop.imageUrl,
        phones: matchedBarbershop.phones || [],
        closedDates: matchedBarbershop.closedDates || [],
        schedules: matchedBarbershop.schedules || [],
      }}
      stats={{
        todayBookingsCount,
        weeklyUsersCount,
        monthlyRevenue,
        todayTrend,
        weeklyUsersTrend,
        monthlyRevenueTrend,
      }}
      recentBookings={formattedRecentBookings}
      allBookings={formattedRecentBookings}
      dailyBookings={dailyBookingsData}
      topServices={topServicesData}
      bookingStatusCounts={{
        confirmed: confirmedCount,
        cancelled: cancelledCount,
        finished: finishedCount,
      }}
    />
  );
}
