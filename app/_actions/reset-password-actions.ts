"use server";

import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "better-auth/crypto";
import { checkUserAuthProvider } from "./check-user-auth-provider";

export async function verifyEmailForResetAction(email: string) {
  if (!email || !email.trim()) {
    return {
      success: false,
      message: "Por favor, informe seu e-mail.",
    };
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check user and auth provider in database
  const authInfo = await checkUserAuthProvider(normalizedEmail);

  if (!authInfo.userExists) {
    return {
      success: false,
      message: "E-mail não encontrado no sistema. Verifique o e-mail digitado.",
    };
  }

  if (authInfo.hasGoogleAccountOnly) {
    return {
      success: false,
      isGoogleOnly: true,
      message:
        "Este e-mail está cadastrado com o Google. Por favor, faça login clicando em 'Continuar com Google'.",
    };
  }

  return {
    success: true,
    message: "E-mail verificado no banco de dados. Agora defina sua nova senha.",
  };
}

export async function updateUserPasswordDirectAction({
  email,
  newPassword,
}: {
  email: string;
  newPassword: string;
}) {
  if (!email || !email.trim()) {
    return {
      success: false,
      message: "E-mail não informado.",
    };
  }

  if (!newPassword || newPassword.length < 6) {
    return {
      success: false,
      message: "A nova senha deve ter pelo menos 6 caracteres.",
    };
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { accounts: true },
    });

    if (!user) {
      return {
        success: false,
        message: "Usuário não encontrado no banco de dados.",
      };
    }

    const credentialAccount = user.accounts.find(
      (acc) => acc.providerId === "credential",
    );

    // Hash the new password using Better Auth's native crypto hasher
    const hashedPassword = await hashPassword(newPassword);

    if (credentialAccount) {
      await prisma.account.update({
        where: { id: credentialAccount.id },
        data: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.account.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          accountId: user.id,
          providerId: "credential",
          password: hashedPassword,
        },
      });
    }

    return {
      success: true,
      message: "Senha alterada com sucesso! Faça login com sua nova senha.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Ocorreu um erro ao atualizar a senha no banco de dados.",
    };
  }
}

// Backward compatibility exports
export async function requestPasswordResetAction(email: string) {
  return verifyEmailForResetAction(email);
}

export async function resetPasswordAction({
  token,
  newPassword,
}: {
  token: string;
  newPassword: string;
}) {
  // Interpret token as email if passed in token form
  return updateUserPasswordDirectAction({
    email: token,
    newPassword,
  });
}
