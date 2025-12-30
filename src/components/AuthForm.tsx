"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export function AuthForm() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpErr) throw signUpErr;
        setMessage("Conta criada. Verifique seu email, se aplicavel, e entre.");
        setMode("login");
        return;
      } else {
        const { error: loginErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginErr) throw loginErr;
        router.push("/novo-jogo");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao autenticar.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="space-y-5 rounded-2xl bg-white p-6 text-left text-zinc-900 shadow-xl shadow-emerald-900/25 ring-1 ring-emerald-50"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-emerald-900">
          {mode === "login" ? "Entrar na sua conta" : "Criar uma nova conta"}
        </div>
        <div className="flex items-center gap-2 rounded-full bg-emerald-50 p-1 text-xs font-semibold text-emerald-800">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setMessage(null);
            }}
            className={`rounded-full px-3 py-1 transition ${
              mode === "login"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/40"
                : "hover:bg-emerald-100"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
              setMessage(null);
            }}
            className={`rounded-full px-3 py-1 transition ${
              mode === "signup"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/40"
                : "hover:bg-emerald-100"
            }`}
          >
            Cadastro
          </button>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-zinc-700">E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className="mt-1 w-full rounded-lg border border-emerald-100 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-200 transition focus:border-emerald-400 focus:ring"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-zinc-700">Senha</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
          className="mt-1 w-full rounded-lg border border-emerald-100 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-200 transition focus:border-emerald-400 focus:ring"
        />
      </div>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-900/30 transition hover:-translate-y-0.5 hover:bg-emerald-500 focus:outline-none focus:ring focus:ring-emerald-300"
        disabled={loading}
      >
        {loading ? "Enviando..." : mode === "login" ? "Entrar" : "Cadastrar"}
      </button>

      {message && <p className="text-xs text-emerald-700">{message}</p>}
      {error && <p className="text-sm text-rose-700">{error}</p>}
    </form>
  );
}
