"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  User as UserIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { checkUserAuthProvider } from "@/app/_actions/check-user-auth-provider";
import {
  verifyEmailForResetAction,
  updateUserPasswordDirectAction,
} from "@/app/_actions/reset-password-actions";

import { LoginBanner } from "./_components/login-banner";
import { AuthInput } from "./_components/auth-input";
import { GoogleAuthButton } from "./_components/google-auth-button";

type AuthMode = "login" | "signup" | "forgot-email" | "forgot-password";

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Password Reset state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isSignUp = authMode === "signup";

  const handleLoginOrSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Check if user is registered with Google in database
      const authInfo = await checkUserAuthProvider(email);

      if (authInfo.hasGoogleAccountOnly) {
        setError(
          "Este e-mail está cadastrado com o Google. Por favor, faça login clicando em 'Continuar com Google'.",
        );
        setIsLoading(false);
        return;
      }

      if (isSignUp) {
        if (!name.trim()) {
          setError("Por favor, informe seu nome.");
          setIsLoading(false);
          return;
        }

        if (authInfo.userExists) {
          setError("Este e-mail já está cadastrado. Faça login para entrar.");
          setIsLoading(false);
          return;
        }

        const { error: signUpError } = await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: "/",
        });

        if (signUpError) {
          setError(
            signUpError.message || "Falha ao criar conta. Tente novamente.",
          );
        } else {
          router.push("/");
        }
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/",
        });

        if (signInError) {
          setError(signInError.message || "E-mail ou senha incorretos.");
        } else {
          router.push("/");
        }
      }
    } catch (err: any) {
      setError(err?.message || "Ocorreu um erro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await verifyEmailForResetAction(email);

      if (!res.success) {
        setError(res.message);
      } else {
        setSuccess(res.message);
        setError(null);
        setAuthMode("forgot-password");
      }
    } catch (err: any) {
      setError(err?.message || "Ocorreu um erro ao verificar o e-mail.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem. Verifique e tente novamente.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await updateUserPasswordDirectAction({
        email,
        newPassword,
      });

      if (!res.success) {
        setError(res.message);
      } else {
        setSuccess(res.message);
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setAuthMode("login");
        }, 1800);
      }
    } catch (err: any) {
      setError(err?.message || "Ocorreu um erro ao salvar a nova senha.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (err: any) {
      setError("Falha ao entrar com o Google.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background grid min-h-screen grid-cols-1 font-sans lg:grid-cols-12">
      {/* Left Banner Section */}
      <LoginBanner />

      {/* Right Form Section */}
      <div className="relative flex min-h-screen flex-col justify-between p-6 sm:p-12 lg:col-span-7">
        {/* Header Controls */}
        <div className="flex w-full items-center justify-between">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-xl bg-sky-600 font-bold text-white">
              H
            </div>
            <span className="text-foreground text-lg font-bold">
              HereBooking
            </span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="mx-auto my-auto w-full max-w-md space-y-7 py-6">
          {/* Header Text */}
          <div>
            <h2 className="text-foreground text-3xl font-bold tracking-tight">
              {authMode === "signup"
                ? "Criar conta"
                : authMode === "forgot-email"
                  ? "Esqueceu sua senha?"
                  : authMode === "forgot-password"
                    ? "Redefinir senha"
                    : "Login"}
            </h2>
            <p className="text-muted-foreground mt-1.5 text-sm font-normal">
              {authMode === "signup"
                ? "Digite seu nome, e-mail e senha para se cadastrar."
                : authMode === "forgot-email"
                  ? "Digite seu e-mail para verificar sua conta no banco de dados."
                  : authMode === "forgot-password"
                    ? `Digite a nova senha para a conta: ${email}`
                    : ""}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* 1. LOGIN & SIGNUP FORMS */}
          {(authMode === "login" || authMode === "signup") && (
            <>
              <form onSubmit={handleLoginOrSignupSubmit} className="space-y-4">
                {isSignUp && (
                  <AuthInput
                    label="Nome"
                    icon={UserIcon}
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                  />
                )}

                <AuthInput
                  label="E-mail"
                  icon={Mail}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                />

                <AuthInput
                  label="Senha"
                  icon={Lock}
                  isPassword
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />

                {!isSignUp && (
                  <div className="flex justify-end pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setSuccess(null);
                        setAuthMode("forgot-email");
                      }}
                      className="cursor-pointer text-xs font-semibold text-[#0d5c3a] transition-colors hover:underline dark:text-emerald-400"
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#0d5c3a] py-3.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#09452b] disabled:opacity-70"
                >
                  {isLoading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : isSignUp ? (
                    "Cadastrar"
                  ) : (
                    "Entrar"
                  )}
                </button>
              </form>

              {/* Separator */}
              <div className="relative my-6 flex items-center justify-center">
                <div className="border-border/80 w-full border-t" />
                <span className="bg-background text-muted-foreground absolute px-4 text-xs font-medium">
                  ou continue com
                </span>
              </div>

              {/* Google Sign In */}
              <GoogleAuthButton
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              />

              {/* Switch signup/login footer */}
              <p className="text-muted-foreground mt-6 text-center text-xs">
                {isSignUp ? "Já tem uma conta?" : "Não tem uma conta?"}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccess(null);
                    setAuthMode(isSignUp ? "login" : "signup");
                  }}
                  className="ml-1 cursor-pointer font-semibold text-[#0d5c3a] hover:underline dark:text-emerald-400"
                >
                  {isSignUp ? "Faça login" : "Cadastre-se"}
                </button>
              </p>
            </>
          )}

          {/* 2. FORGOT PASSWORD STEP 1: VERIFY EMAIL IN DATABASE */}
          {authMode === "forgot-email" && (
            <form onSubmit={handleVerifyEmailSubmit} className="space-y-4">
              <AuthInput
                label="E-mail cadastrado"
                icon={Mail}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />

              <button
                type="submit"
                disabled={isLoading}
                className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#0d5c3a] py-3.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#09452b] disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  "Verificar e-mail"
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccess(null);
                    setAuthMode("login");
                  }}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Voltar para o Login</span>
                </button>
              </div>
            </form>
          )}

          {/* 3. FORGOT PASSWORD STEP 2: ENTER NEW PASSWORD & SAVE */}
          {authMode === "forgot-password" && (
            <form onSubmit={handleUpdatePasswordSubmit} className="space-y-4">
              <AuthInput
                label="Nova Senha"
                icon={Lock}
                isPassword
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="No mínimo 6 caracteres"
              />

              <AuthInput
                label="Repetir nova senha"
                icon={Lock}
                isPassword
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
              />

              <button
                type="submit"
                disabled={isLoading}
                className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#0d5c3a] py-3.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#09452b] disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  "Salvar nova senha"
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccess(null);
                    setAuthMode("login");
                  }}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Voltar para o Login</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

