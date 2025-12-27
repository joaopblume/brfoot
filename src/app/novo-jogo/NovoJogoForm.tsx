"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

type FormProps = {
  leagues: LeagueRow[];
  leagueTeams: Record<string, TimeRow[]>;
  latestSeasonByLeague: Record<string, number>;
};

export default function NovoJogoForm({
  leagues,
  leagueTeams,
  latestSeasonByLeague,
}: FormProps) {
  const router = useRouter();
  const [selectedLeague, setSelectedLeague] = useState<string>(
    leagues[0] ? String(leagues[0].id) : "",
  );
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const teamsOptions = useMemo(() => {
    if (!selectedLeague) return [];
    return leagueTeams[selectedLeague] ?? [];
  }, [selectedLeague, leagueTeams]);

  useEffect(() => {
    if (teamsOptions.length > 0) {
      setSelectedTeam(String(teamsOptions[0].id));
    } else {
      setSelectedTeam("");
    }
    setErrorMsg(null);
  }, [teamsOptions]);

  const hasLeagues = leagues.length > 0;
  const hasTeamsForLeague = teamsOptions.length > 0;

  async function handleConfirm() {
    setErrorMsg(null);
    const team = teamsOptions.find((t) => String(t.id) === selectedTeam);
    if (!team) {
      setErrorMsg("Selecione um time.");
      return;
    }
    setSubmitting(true);
    router.push(`/novo-jogo/confirm/${team.id}`);
  }

  return (
    <form className="space-y-5 rounded-2xl bg-white p-6 text-left text-emerald-950 shadow-lg shadow-black/30">
      <div>
        <label className="text-sm font-semibold text-emerald-800">
          Nome do treinador
        </label>
        <input
          type="text"
          required
          placeholder="Ex.: Joao Silva"
          className="mt-2 w-full rounded-lg border border-emerald-100 bg-white px-3 py-2 text-emerald-950 outline-none ring-emerald-200 transition focus:border-emerald-400 focus:ring"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-emerald-800">
            Liga
          </label>
          <select
            name="liga"
            required
            className="mt-2 w-full rounded-lg border border-emerald-100 bg-white px-3 py-2 text-emerald-950 outline-none ring-emerald-200 transition focus:border-emerald-400 focus:ring"
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
          >
            <option value="" disabled>
              Selecione uma liga
            </option>
            {hasLeagues ? (
              leagues.map((liga) => (
                <option key={String(liga.id)} value={String(liga.id)}>
                  {liga.name ?? liga.code ?? `Liga ${liga.id}`}{" "}
                  {latestSeasonByLeague[String(liga.id)]
                    ? `(${latestSeasonByLeague[String(liga.id)]})`
                    : ""}
                </option>
              ))
            ) : (
              <option value="" disabled>
                Nenhuma liga cadastrada
              </option>
            )}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-emerald-800">
            Time
          </label>
          <select
            name="time"
            required
            className="mt-2 w-full rounded-lg border border-emerald-100 bg-white px-3 py-2 text-emerald-950 outline-none ring-emerald-200 transition focus:border-emerald-400 focus:ring"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            disabled={!hasTeamsForLeague}
          >
            {!selectedLeague && (
              <option value="" disabled>
                Selecione uma liga primeiro
              </option>
            )}
            {selectedLeague && !hasTeamsForLeague && (
              <option value="" disabled>
                Nenhum time associado a esta liga
              </option>
            )}
            {teamsOptions.map((time) => (
              <option key={String(time.id)} value={String(time.id)}>
                {time.name ?? `Time ${time.id}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={handleConfirm}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-900/40 transition hover:bg-emerald-500 focus:outline-none focus:ring focus:ring-emerald-300"
        disabled={submitting || !selectedTeam}
      >
        {submitting ? "Abrindo escalação..." : "Confirmar time"}
      </button>

      {errorMsg && <p className="text-sm text-rose-700">{errorMsg}</p>}
    </form>
  );
}
