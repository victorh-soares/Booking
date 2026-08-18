"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function checkIsBarbershopAdmin() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.email) {
      return { isAdmin: false, barbershop: null };
    }

    const userEmail = session.user.email.toLowerCase().trim();

    // Check if user is registered in MasterAdmin table
    const masterAdmin = await prisma.masterAdmin.findUnique({
      where: { email: userEmail },
    });

    // Query barbershops
    const barbershops = await prisma.barbershop.findMany({
      include: {
        services: true,
      },
    });

    // Check if any barbershop matches user's email
    let matchedBarbershop = barbershops.find(
      (b: any) => b.email && b.email.toLowerCase().trim() === userEmail,
    );

    // Fallback for dev testing if no barbershop email set in DB yet
    if (!matchedBarbershop && barbershops.length > 0) {
      const hasAnyEmailInDb = barbershops.some((b: any) => Boolean(b.email));
      if (!hasAnyEmailInDb) {
        matchedBarbershop = barbershops[0];
      }
    }

    const isAdmin = Boolean(masterAdmin) || Boolean(matchedBarbershop);

    return {
      isAdmin,
      isMasterAdmin: Boolean(masterAdmin),
      barbershop: matchedBarbershop || barbershops[0] || null,
    };
  } catch (error) {
    console.error("Error in checkIsBarbershopAdmin:", error);
    return { isAdmin: false, barbershop: null };
  }
}
