import { notFound } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

type TimeRow = {
  id: number | string;
  name?: string;
  created_at?: string;
  [key: string]: unknown;
};

export default async function TimesPage() {

  let times: TimeRow[] = [];
  let errorMessage: string | null = null;

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("Time").select("*");

    if (error) {
      errorMessage = error.message;
    } else {
      times = data ?? [];
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao conectar no Supabase.";
    errorMessage = message;
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Supabase
          </p>
          <h1 className="text-3xl font-semibold leading-tight">
            Times cadastrados
          </h1>
          <p className="text-sm text-zinc-600">
            Leitura direta da tabela <code className="font-semibold">public."Time"</code>.
          </p>
        </header>

        {errorMessage ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">
            Erro ao buscar times: {errorMessage}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="grid grid-cols-[80px_1fr_1fr] gap-4 border-b border-zinc-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <span>ID</span>
              <span>Nome</span>
              <span>Outros campos</span>
            </div>
            {times.length === 0 ? (
              <div className="px-4 py-4 text-sm text-zinc-600">
                Nenhum time cadastrado.
              </div>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {times.map((time) => (
                  <li key={time.id} className="grid grid-cols-[80px_1fr_1fr] gap-4 px-4 py-3 text-sm">
                    <span className="font-medium text-zinc-900">{String(time.id)}</span>
                    <span className="text-zinc-800">{time.name ?? "—"}</span>
                    <span className="text-xs text-zinc-500">
                      {Object.keys(time)
                        .filter((key) => key !== "id" && key !== "name")
                        .map((key) => `${key}: ${String(time[key])}`)
                        .join(" • ") || "—"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
