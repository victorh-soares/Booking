"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, Loader2, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";
import { resetPasswordAction } from "@/app/_actions/reset-password-actions";
import { AuthInput } from "../login/_components/auth-input";
import { LoginBanner } from "../login/_components/login-banner";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token.trim()) {
      setError("Token de redefinição não informado. Por favor, solicite a redefinição novamente.");
      return;
    }

    if (newPassword.length < 6) {
      setError("A nova senha deve conter pelo menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem. Verifique e tente novamente.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await resetPasswordAction({
        token: token.trim(),
        newPassword,
      });

      if (!res.success) {
        setError(res.message);
      } else {
        setSuccess(res.message);
        setTimeout(() => {
          router.push("/login");
        }, 2500);
      }
    } catch (err: any) {
      setError(err?.message || "Ocorreu um erro ao redefinir sua senha.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto my-auto w-full max-w-md space-y-7 py-6">
      <div>
        <h2 className="text-foreground text-3xl font-bold tracking-tight">
          Redefinir senha
        </h2>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Crie uma nova senha segura para sua conta.
        </p>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Token / Código de Redefinição"
          icon={KeyRound}
          type="text"
          required
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Cole ou digite o código/token"
        />

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
          label="Confirmar Nova Senha"
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
            "Salvar Nova Senha"
          )}
        </button>
      </form>

      <div className="pt-2 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Voltar para o Login</span>
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-background grid min-h-screen grid-cols-1 font-sans lg:grid-cols-12">
      <LoginBanner />
      <div className="relative flex min-h-screen flex-col justify-between p-6 sm:p-12 lg:col-span-7">
        <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Carregando...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
