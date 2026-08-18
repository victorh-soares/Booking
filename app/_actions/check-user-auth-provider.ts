"use server";

import { prisma } from "@/lib/prisma";

export async function checkUserAuthProvider(email: string) {
  if (!email || !email.trim()) {
    return {
      userExists: false,
      hasGoogleAccountOnly: false,
      hasPasswordAccount: false,
    };
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { accounts: true },
  });

  if (!user) {
    return {
      userExists: false,
      hasGoogleAccountOnly: false,
      hasPasswordAccount: false,
    };
  }

  const hasGoogle = user.accounts.some((acc) => acc.providerId === "google");
  const hasCredential = user.accounts.some(
    (acc) =>
      acc.providerId === "credential" ||
      acc.providerId === "email" ||
      Boolean(acc.password),
  );

  // If user signed in with Google and has no password credential set
  if (hasGoogle && !hasCredential) {
    return {
      userExists: true,
      hasGoogleAccountOnly: true,
      hasPasswordAccount: false,
    };
  }

  return {
    userExists: true,
    hasGoogleAccountOnly: false,
    hasPasswordAccount: hasCredential || user.accounts.length === 0,
  };
}
