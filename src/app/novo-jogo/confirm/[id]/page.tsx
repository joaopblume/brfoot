import Link from "next/link";
import { notFound } from "next/navigation";

import { buildLineup433, SlotId } from "@/lib/lineup";
import { createServiceSupabaseClient } from "@/lib/supabase/service";
import ConfirmStartButton from "./ConfirmStartButton";

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
  char1: string | null;
  birthday: string | null;
  team: number | null;
};


export default async function ConfirmPage(props: { params: Promise<{ id: string }> }) {
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
    .select("id, name, char1, birthday, team")
    .eq("team", teamId)
    .order("name", { ascending: true });

  if (playersErr) return notFound();

  const crest = team.crest_url ?? team.badge;
  const flag = team.flag_url ?? team.flag;

  const positionColor = (pos?: string | null) => {
    if (!pos) return { className: "bg-zinc-200 text-zinc-700", label: "Sem posição" };
    const p = pos.toLowerCase();
    if (p.includes("keeper")) return { className: "bg-orange-100 text-orange-800", label: pos };
    if (p.includes("back") || p.includes("def")) return { className: "bg-blue-100 text-blue-800", label: pos };
    if (p.includes("mid")) return { className: "bg-emerald-100 text-emerald-800", label: pos };
    if (p.includes("wing") || p.includes("forward") || p.includes("attack") || p.includes("offence")) {
      return { className: "bg-red-100 text-red-800", label: pos };
    }
    return { className: "bg-zinc-200 text-zinc-700", label: pos };
  };

  // NEW: mesma lógica do positionColor, mas retornando um rank numérico
  const positionRank = (pos?: string | null) => {
    if (!pos) return 99;
    const p = pos.toLowerCase();
    if (p.includes("keeper")) return 1;
    if (p.includes("back") || p.includes("def")) return 2;
    if (p.includes("mid")) return 3;
    if (p.includes("wing") || p.includes("forward") || p.includes("attack")) return 4;
    return 98;
  };

  // NEW: ordenação final no frontend (posição -> nome -> id)
  const sortedPlayers = [...(players ?? [])].sort((a, b) => {
    const ra = positionRank(a.char1);
    const rb = positionRank(b.char1);
    if (ra !== rb) return ra - rb;

    const na = (a.name ?? "").toLowerCase();
    const nb = (b.name ?? "").toLowerCase();
    if (na !== nb) return na.localeCompare(nb);

    return a.id - b.id;
  });

  const lineup = buildLineup433(
    // NEW: usa sortedPlayers pra lineup também
    sortedPlayers.map((p) => ({
      id: p.id,
      name: p.name ?? undefined,
      char1: p.char1 ?? undefined,
    })),
  );

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-50">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <div>
          <Link
            href="/novo-jogo"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-100/60 bg-emerald-900/60 px-5 py-2 text-sm font-medium text-emerald-50 transition hover:border-emerald-100 hover:bg-emerald-900 focus:outline-none focus:ring focus:ring-emerald-300"
          >
            ← Voltar para seleção de time
          </Link>
        </div>
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
              {lineup.map((a) => (
                <PlayerMarker
                  key={a.slot}
                  slot={a.slot}
                  name={a.player.name ?? a.player.char1 ?? "Jogador"}
                  x={a.x}
                  y={a.y}
                />
              ))}
              {lineup.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-emerald-100">
                  Nenhum jogador para escalar.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-white p-3 shadow-inner text-emerald-950">
            <h2 className="text-sm font-semibold text-emerald-900">MEU-TIME</h2>
            <div className="mt-2 space-y-2 max-h-[460px] overflow-auto">
              {/* NEW: usa sortedPlayers */}
              {sortedPlayers.map((p) => {
                const { className, label } = positionColor(p.char1);
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-emerald-50 bg-emerald-50/60 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-emerald-900 truncate max-w-[160px]">
                      {p.name ?? `Jogador ${p.id}`}
                    </span>
                    <span
                      className={`ml-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${className}`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
              {(!players || players.length === 0) && (
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  Nenhum jogador retornado para este time.
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <Link
            href={`/novo-jogo/confirm/${team.id}/meu-time`}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/80 bg-emerald-500 px-5 py-2 text-sm font-medium text-emerald-950 transition hover:border-emerald-300 hover:bg-emerald-400 focus:outline-none focus:ring focus:ring-emerald-300"
          >
            Ir para MEU-TIME
          </Link>
        </div>
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

function PlayerMarker({
  slot,
  name,
  x,
  y,
}: {
  slot: SlotId;
  name: string;
  x: number;
  y: number;
}) {
  return (
    <div
      className="absolute flex flex-col items-center"
      style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
    >
      <div className="h-10 w-10 rounded-full bg-white/90 text-xs font-semibold text-emerald-800 shadow flex items-center justify-center">
        {slot}
      </div>
      <div className="mt-1 max-w-[140px] truncate rounded bg-black/50 px-2 py-0.5 text-[11px] text-white">
        {name}
      </div>
    </div>
  );
}
