import { notFound } from "next/navigation";

import { createServiceSupabaseClient } from "@/lib/supabase/service";

type TimeRow = {
  id: number;
  name: string | null;
  badge?: string | null;
  flag?: string | null;
  crest_url?: string | null;
  flag_url?: string | null;
};

type PlayerRow = {
  id: number;
  name: string;
  team: number | null;
};

export default async function MeuTimePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const teamId = Number(params.id);
  if (Number.isNaN(teamId)) return notFound();

  const supabase = createServiceSupabaseClient();

  const { data: team, error: teamErr } = await supabase
    .from("Time")
    .select("id, name, badge, flag, crest_url, flag_url")
    .eq("id", teamId)
    .single();

  if (teamErr || !team) return notFound();

  const { data: players, error: playersErr } = await supabase
    .from("Jogador")
    .select("id, name, team")
    .eq("team", teamId)
    .order("name", { ascending: true });

  if (playersErr) return notFound();

  const crest = team.crest_url ?? team.badge;
  const flag = team.flag_url ?? team.flag;

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-50">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="flex items-center gap-4">
          {crest && (
            <img
              src={crest}
              alt="Escudo"
              className="h-16 w-16 rounded bg-white object-contain p-2 shadow"
            />
          )}
          <div className="flex flex-col">
            <h1 className="text-3xl font-semibold">{team.name ?? `Time ${team.id}`}</h1>
            {flag && (
              <span className="mt-1 flex items-center gap-2 text-sm text-emerald-100">
                <img src={flag} alt="Bandeira" className="h-5 w-7 rounded object-cover" />
                Bandeira
              </span>
            )}
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-950/40 p-6 flex items-center justify-center">
            <div className="relative mx-auto aspect-square w-[85%] sm:w-[70%] lg:w-[60%] overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-900/70 to-emerald-950">
              <FieldLines />
              <div className="absolute inset-0 flex items-center justify-center text-sm text-emerald-100">
                Area de escalação
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-white p-3 shadow-inner text-emerald-950">
            <h2 className="text-sm font-semibold text-emerald-900">MEU-TIME</h2>
            <div className="mt-2 space-y-2 max-h-[460px] overflow-auto">
              {(players ?? []).map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border border-emerald-50 bg-emerald-50/60 px-3 py-2 text-sm font-medium text-emerald-900"
                >
                  {p.name ?? `Jogador ${p.id}`}
                </div>
              ))}
              {(!players || players.length === 0) && (
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  Nenhum jogador retornado para este time.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function FieldLines() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0"
            style={{
              top: `${i * 10}%`,
              height: "10%",
              background: i % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent",
            }}
          />
        ))}
      </div>
      <div className="absolute left-0 right-0 top-1/2 h-px bg-white/35" />
      <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30" />
      <div className="absolute left-1/2 bottom-0 h-24 w-64 -translate-x-1/2 border border-white/25" />
      <div className="absolute left-1/2 bottom-0 h-12 w-32 -translate-x-1/2 border border-white/25" />
      <div className="absolute left-1/2 bottom-0 h-4 w-20 -translate-x-1/2 border border-white/35" />
    </div>
  );
}
