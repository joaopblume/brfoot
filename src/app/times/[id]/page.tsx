import { notFound } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SlotId } from "@/lib/lineup";

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
  name: string | null;
  char1: string | null; // posição textual
  birthday: string | null;
  team: number | null;
};

function groupByPosition(players: PlayerRow[]) {
  const groups: Record<string, PlayerRow[]> = {};
  players.forEach((p) => {
    const key = p.char1 ?? "Sem posição";
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });
  return groups;
}

export default async function TimePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createServerSupabaseClient();
  const teamId = Number(params.id);

  const { data: team, error: teamErr } = await supabase
    .from("Time")
    .select("id, name, badge, flag, crest_url, flag_url")
    .eq("id", teamId)
    .single();

  if (teamErr || !team) {
    return notFound();
  }

  const { data: players, error: playersErr } = await supabase
    .from("Jogador")
    .select("id, name, char1, birthday, team")
    .eq("team", teamId)
    .order("name", { ascending: true });

  if (playersErr) {
    return notFound();
  }

  const groups = groupByPosition(players ?? []);
  const crest = team.crest_url ?? team.badge;
  const flag = team.flag_url ?? team.flag;

  const positionColor = (pos: string | null) => {
    if (!pos) return { color: "bg-zinc-200 text-zinc-700", label: "Sem posição" };
    const p = pos.toLowerCase();
    if (p.includes("keeper")) return { color: "bg-orange-100 text-orange-800", label: pos };
    if (p.includes("back") || p.includes("def")) return { color: "bg-blue-100 text-blue-800", label: pos };
    if (p.includes("mid")) return { color: "bg-emerald-100 text-emerald-800", label: pos };
    if (p.includes("wing") || p.includes("forward") || p.includes("attack")) {
      return { color: "bg-red-100 text-red-800", label: pos };
    }
    return { color: "bg-zinc-200 text-zinc-700", label: pos };
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12">
        <header className="space-y-3">
          <div className="flex items-center gap-4">
            {crest && (
              <img
                src={crest}
                alt="Escudo"
                className="h-16 w-16 rounded bg-white object-contain p-2 shadow"
              />
            )}
            <h1 className="text-3xl font-semibold">{team.name ?? `Time ${team.id}`}</h1>
          </div>
          {flag && (
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <img src={flag} alt="Bandeira" className="h-5 w-7 rounded object-cover" />
              <span>Bandeira</span>
            </div>
          )}
        </header>

        <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-4 py-3">
            <h2 className="text-lg font-semibold text-zinc-800">Elenco</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-2">Jogador</th>
                  <th className="px-4 py-2">Posição</th>
                  <th className="px-4 py-2">Aniversário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {(players ?? []).map((player) => {
                  const pos = player.char1;
                  const { color, label } = positionColor(pos);
                  return (
                    <tr key={player.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-2 font-medium text-zinc-800">
                        {player.name ?? `Jogador ${player.id}`}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${color}`}
                        >
                          {label ?? "Sem posição"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs text-zinc-500">
                        {player.birthday ?? "—"}
                      </td>
                    </tr>
                  );
                })}
                {(!players || players.length === 0) && (
                  <tr>
                    <td className="px-4 py-6 text-sm text-zinc-600" colSpan={3}>
                      Nenhum jogador cadastrado para este time.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
