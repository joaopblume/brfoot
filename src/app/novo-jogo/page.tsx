import { createServerSupabaseClient } from "@/lib/supabase/server";
import NovoJogoForm from "./NovoJogoForm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type TimeRow = {
  id: number | string;
  name?: string;
  football_data_team_id?: number | string | null;
  badge?: string | null;
  flag?: string | null;
  crest_url?: string | null;
  flag_url?: string | null;
};

type LeagueRow = {
  id: number | string;
  code: string | null;
  name: string | null;
};

type SeasonRow = {
  id: number | string; // CHANGED: precisa do id da temporada
  tourney_id: number | string;
  season: number;
};

type JoinRow = {
  temporada_id: number | string;
  time_id: number | string;
};

export default async function NovoJogoPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const [{ data: leagues, error: leagueErr }, { data: seasons, error: seasonErr }] =
    await Promise.all([
      supabase.from("LigaCampeonato").select("id, code, name"),
      supabase
        .from("LigaCampeonatoTemporada")
        .select("id, tourney_id, season") // CHANGED: remove team_ids e pega id
        .order("season", { ascending: false }),
    ]);

  const errorMessage = leagueErr?.message || seasonErr?.message || null;

  const leaguesList: LeagueRow[] = leagues ?? [];
  const seasonsList: SeasonRow[] = seasons ?? [];

  // ultima season por liga + qual é a temporada_id dessa season
  const latestSeasonByLeague: Record<string, number> = {};
  const latestTemporadaIdByLeague: Record<string, string> = {};

  for (const row of seasonsList) {
    const leagueId = String(row.tourney_id);
    const currentSeason = latestSeasonByLeague[leagueId];
    if (currentSeason === undefined || row.season > currentSeason) {
      latestSeasonByLeague[leagueId] = row.season;
      latestTemporadaIdByLeague[leagueId] = String(row.id);
    }
  }

  // buscar joins (LigaTemporadaTime) das temporadas mais recentes
  const temporadaIds = Array.from(new Set(Object.values(latestTemporadaIdByLeague)));
  let joinRows: JoinRow[] = [];

  if (temporadaIds.length > 0) {
    const { data: joinData, error: joinErr } = await supabase
      .from("LigaTemporadaTime")
      .select("temporada_id, time_id")
      .in("temporada_id", temporadaIds);

    if (joinErr && !errorMessage) {
      console.error("Erro ao buscar LigaTemporadaTime:", joinErr.message);
    }

    joinRows = joinData ?? [];
  }

  // montar leagueId -> teamIds usando o mapeamento leagueId -> temporadaId
  const leagueTeamIds: Record<string, (number | string)[]> = {};
  for (const [leagueId, temporadaId] of Object.entries(latestTemporadaIdByLeague)) {
    leagueTeamIds[leagueId] = joinRows
      .filter((r) => String(r.temporada_id) === String(temporadaId))
      .map((r) => r.time_id);
  }

  const allTeamIds = Array.from(
    new Set(Object.values(leagueTeamIds).flat().map((id) => String(id))),
  );

  let times: TimeRow[] = [];
  if (allTeamIds.length > 0) {
    const { data: timesData, error: timesErr } = await supabase
      .from("Time")
      .select("id, name, football_data_team_id, badge, flag, crest_url, flag_url")
      .in("id", allTeamIds);

    if (timesErr && !errorMessage) {
      console.error("Erro ao buscar times:", timesErr.message);
    }

    times = timesData ?? [];
  }

  const timesById = new Map<string, TimeRow>();
  times.forEach((t) => {
    timesById.set(String(t.id), t);
  });

  const leagueTeams: Record<string, TimeRow[]> = {};
  Object.entries(leagueTeamIds).forEach(([leagueId, teamIds]) => {
    leagueTeams[leagueId] = teamIds
      .map((id) => timesById.get(String(id)))
      .filter(Boolean) as TimeRow[];
  });

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_25%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.05),transparent_20%),linear-gradient(135deg,rgba(0,0,0,0.2),transparent_30%)]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2740%27 height=%2740%27 viewBox=%270 0 40 40%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath d=%27M0 20h40M20 0v40%27 stroke=%27%23ffffff12%27 stroke-width=%271%27/%3E%3C/svg%3E')]" />
      <main className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16">
        <section className="w-full max-w-3xl rounded-3xl bg-white/5 p-10 shadow-2xl shadow-emerald-900/60 ring-1 ring-white/10 backdrop-blur">
          <div className="mb-8 space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">
              Novo Jogo
            </p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Selecione liga e clube para iniciar
            </h1>
            <p className="text-sm text-emerald-100">
              Dados carregados do Supabase: ligas e times vinculados a ultima temporada.
            </p>
          </div>

          {errorMessage ? (
            <div className="rounded-lg border border-rose-200/70 bg-rose-50/70 px-4 py-3 text-sm text-rose-800">
              Erro ao buscar dados: {errorMessage}
            </div>
          ) : (
            <NovoJogoForm
              leagues={leaguesList}
              leagueTeams={leagueTeams}
              latestSeasonByLeague={latestSeasonByLeague}
            />
          )}
        </section>
      </main>
    </div>
  );
}
