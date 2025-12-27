import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { appendFile, mkdir } from "fs/promises";
import path from "path";

type FootballDataTeam = {
  id: number;
  name: string;
  crest?: string;
};

type FootballPlayer = {
  id: number;
  name?: string;
  position?: string;
  dateOfBirth?: string;
};

type FootballTeamDetail = {
  crest?: string;
  area?: { flag?: string };
  squad?: FootballPlayer[];
};

type CompetitionsRow = {
  id: number;
  code: string;
  name: string | null;
};

type ReqBody = {
  season?: number; // ex: 2025
};

type PipelineResult = {
  ok: boolean;
  fatal?: boolean;
  season: number;
  competitions_count?: number;
  competitions?: CompetitionsRow[];
  steps: Array<Record<string, unknown>>;
};

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "att-errors.txt");

async function logErrorToFile(payload: Record<string, unknown>) {
  try {
    await mkdir(LOG_DIR, { recursive: true });
    const line = `[${new Date().toISOString()}] ${JSON.stringify(payload)}\n`;
    await appendFile(LOG_FILE, line, "utf8");
  } catch (err) {
    console.error("[ATT_LOG_WRITE_FAILED]", err);
  }
}

function mapTeamToRow(t: FootballDataTeam) {
  return {
    football_data_team_id: t.id,
    name: t.name,
    badge: t.crest ?? null,
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractWaitSeconds(body: string): number | null {
  const match = body.match(/wait\s+(\d+)\s*seconds?/i);
  return match ? Number(match[1]) : null;
}

async function fetchJsonWithRateLimit<T>(
  url: string,
  token: string,
  label: string,
  retry = true,
): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "X-Auth-Token": token,
      Accept: "application/json",
    },
  });

  if (res.status === 429) {
    const body = await res.text();
    let waitSeconds = extractWaitSeconds(body) ?? null;
    const retryAfterHeader = res.headers.get("Retry-After");
    if (!waitSeconds && retryAfterHeader) {
      waitSeconds = Number(retryAfterHeader);
    }
    if (!waitSeconds) waitSeconds = 45;

    if (retry) {
      console.warn(`[rate_limit:${label}] waiting ${waitSeconds + 1}s`);
      await sleep((waitSeconds + 1) * 1000);
      return fetchJsonWithRateLimit<T>(url, token, label, false);
    }

    throw new Error(`rate_limit_${label}: ${body}`);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${label}_http_${res.status}: ${body}`);
  }

  return (await res.json()) as T;
}

async function fetchTeams(code: string, token: string) {
  const data = await fetchJsonWithRateLimit<{ teams?: FootballDataTeam[] }>(
    `https://api.football-data.org/v4/competitions/${code}/teams`,
    token,
    `teams_${code}`,
  );
  if (!data?.teams || !Array.isArray(data.teams)) {
    throw new Error(`teams_${code}_missing_array`);
  }
  return data.teams;
}

async function fetchTeamDetail(teamId: number | string, token: string) {
  const detail = await fetchJsonWithRateLimit<FootballTeamDetail>(
    `https://api.football-data.org/v4/teams/${teamId}`,
    token,
    `team_${teamId}`,
  );
  return detail;
}

export async function POST(req: Request) {
  const steps: Array<Record<string, unknown>> = [];

  try {
    const { season }: ReqBody = await req.json().catch(() => ({}));
    const SEASON = season ?? new Date().getFullYear();

    const FOOTBALL_DATA_TOKEN = process.env.FOOTBALL_DATA_TOKEN;
    const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!FOOTBALL_DATA_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        {
          ok: false,
          fatal: true,
          error:
            "Missing env vars (FOOTBALL_DATA_TOKEN / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)",
        },
        { status: 500 },
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1) carregar competicoes
    const { data: competitions, error: compErr } = await supabase
      .from("LigaCampeonato")
      .select("id, code, name")
      .not("code", "is", null);

    if (compErr) {
      return NextResponse.json(
        { ok: false, fatal: true, error: `LigaCampeonato: ${compErr.message}` },
        { status: 500 },
      );
    }

    const competitionsList: CompetitionsRow[] = competitions ?? [];
    if (!competitionsList.length) {
      return NextResponse.json({
        ok: true,
        season: SEASON,
        competitions_count: 0,
        steps: [{ info: "LigaCampeonato vazia" }],
      });
    }

    // 2) processar cada competicao
    for (const c of competitionsList) {
      const code = c.code?.trim();
      if (!code) {
        steps.push({ tourney_id: c.id, skipped: true, reason: "code_vazio" });
        continue;
      }

      // 2a) teams da competicao
      const teams = await fetchTeams(code, FOOTBALL_DATA_TOKEN);
      steps.push({ tourney_id: c.id, code, teams_fetched: teams.length });

      const rows = teams.map(mapTeamToRow);

      // 2b) upsert times
      const { error: upsertTimeErr } = await supabase
        .from("Time")
        .upsert(rows, { onConflict: "football_data_team_id" });

      if (upsertTimeErr) {
        const payload = { tourney_id: c.id, code, error: upsertTimeErr.message };
        await logErrorToFile(payload);
        throw new Error(`Time upsert failed: ${upsertTimeErr.message}`);
      }

      // 2c) mapear ids internos
      const footballIds = rows.map((r) => r.football_data_team_id);
      const { data: dbTeams, error: selectErr } = await supabase
        .from("Time")
        .select("id, football_data_team_id")
        .in("football_data_team_id", footballIds);

      if (selectErr) {
        const payload = { tourney_id: c.id, code, error: selectErr.message };
        await logErrorToFile(payload);
        throw new Error(`Time select failed: ${selectErr.message}`);
      }

      const timeIds = (dbTeams ?? []).map((t) => t.id);

      // 2d) upsert temporada
      const { error: seasonErr } = await supabase
        .from("LigaCampeonatoTemporada")
        .upsert(
          {
            tourney_id: c.id,
            season: SEASON,
            team_ids: timeIds,
            places: null,
          },
          { onConflict: "tourney_id,season" },
        );

      if (seasonErr) {
        const payload = { tourney_id: c.id, code, error: seasonErr.message };
        await logErrorToFile(payload);
        throw new Error(`LigaCampeonatoTemporada upsert failed: ${seasonErr.message}`);
      }

      // 2e) detalhe por time + jogadores
      for (const dbTeam of dbTeams ?? []) {
        const teamId = dbTeam.id;
        const footballId = dbTeam.football_data_team_id;

        try {
          const detail = await fetchTeamDetail(footballId, FOOTBALL_DATA_TOKEN);

          const crest =
            detail.crest ?? `https://crests.football-data.org/${footballId}.png`;
          const flag = detail.area?.flag ?? null;

          const { error: updateErr } = await supabase
            .from("Time")
            .update({
              badge: crest,
              flag,
              crest_url: crest,
              flag_url: flag,
            })
            .eq("id", teamId);

          if (updateErr) {
            const payload = {
              tourney_id: c.id,
              code,
              team_id: teamId,
              football_data_team_id: footballId,
              error: updateErr.message,
            };
            await logErrorToFile(payload);
            steps.push({ ...payload, skipped: true });
            continue;
          }

          const squad = detail.squad ?? [];
          if (squad.length > 0) {
            const { error: deleteErr } = await supabase
              .from("Jogador")
              .delete()
              .eq("team", teamId);

            if (deleteErr) {
              const payload = {
                tourney_id: c.id,
                code,
                team_id: teamId,
                football_data_team_id: footballId,
                error: deleteErr.message,
              };
              await logErrorToFile(payload);
              steps.push({ ...payload, skipped: true });
              continue;
            }

            const playerRows = squad.map((p) => ({
              name: p.name ?? null,
              team: teamId,
              position: null,
              char1: p.position ?? null,
              birthday: p.dateOfBirth ? p.dateOfBirth.split("T")[0] : null,
              foot: null,
              char2: null,
              star: null,
              power: null,
            }));

            const { error: insertErr } = await supabase.from("Jogador").insert(playerRows);
            if (insertErr) {
              const payload = {
                tourney_id: c.id,
                code,
                team_id: teamId,
                football_data_team_id: footballId,
                error: insertErr.message,
              };
              await logErrorToFile(payload);
              steps.push({ ...payload, skipped: true });
              continue;
            }

            steps.push({
              tourney_id: c.id,
              code,
              team_id: teamId,
              football_data_team_id: footballId,
              players_inserted: playerRows.length,
            });
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          const payload = {
            tourney_id: c.id,
            code,
            team_id: teamId,
            football_data_team_id: footballId,
            error: message,
          };
          await logErrorToFile(payload);
          steps.push({ ...payload, skipped: true });
          continue;
        }
      }

      steps.push({
        tourney_id: c.id,
        code,
        name: c.name,
        season: SEASON,
        teams_saved: timeIds.length,
      });
    }

    const payload: PipelineResult = {
      ok: true,
      season: SEASON,
      competitions_count: competitionsList.length,
      competitions: competitionsList,
      steps,
    };
    return NextResponse.json(payload);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[ATT_FATAL]", message);
    await logErrorToFile({ fatal: true, error: message, steps });
    return NextResponse.json(
      {
        ok: false,
        fatal: true,
        error: message,
        steps,
      },
      { status: 500 },
    );
  }
}

export const GET = () =>
  NextResponse.json({ error: "Use POST" }, { status: 405 });
