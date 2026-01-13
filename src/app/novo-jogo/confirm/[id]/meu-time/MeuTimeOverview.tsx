"use client";

import { useEffect, useMemo, useState } from "react";

import type { CalendarMatch } from "@/lib/calendar";
import MeuTimeCalendar from "./MeuTimeCalendar";

type MetaPayload = {
  coachName?: string | null;
  leagueName?: string | null;
  season?: number | null;
  stadiumName?: string | null;
  fans?: number | null;
  cash?: number | null;
};

const metaKey = (teamId: number) => `novo-jogo-meta-${teamId}`;
const calendarKey = (teamId: number) => `meu-time-calendar-${teamId}`;

export default function MeuTimeOverview({ teamId }: { teamId: number }) {
  const [meta, setMeta] = useState<MetaPayload | null>(null);
  const [nextMatch, setNextMatch] = useState<CalendarMatch | null>(null);

  useEffect(() => {
    try {
      const rawMeta = localStorage.getItem(metaKey(teamId));
      if (rawMeta) {
        setMeta(JSON.parse(rawMeta) as MetaPayload);
      }
    } catch (error) {
      console.error("Falha ao carregar meta:", error);
    }

    try {
      const rawCalendar = localStorage.getItem(calendarKey(teamId));
      if (!rawCalendar) return;
      const parsed = JSON.parse(rawCalendar) as CalendarMatch[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setNextMatch(parsed[0]);
      }
    } catch (error) {
      console.error("Falha ao carregar calendario:", error);
    }
  }, [teamId]);

  const year = useMemo(() => new Date().getFullYear(), []);
  const coachName = meta?.coachName?.trim() || "Nao informado";
  const stadiumName = meta?.stadiumName?.trim() || "CASTELO BRANCO";
  const fans = meta?.fans ?? 500000;
  const cash = meta?.cash ?? 54000000;

  const leagueLabel = meta?.leagueName
    ? `${meta.leagueName}${meta.season ? ` (${meta.season})` : ""}`
    : "Nao definido";

  const fansLabel = new Intl.NumberFormat("pt-BR").format(fans);
  const cashLabel = `US$ ${Math.round(cash / 1_000_000)}M`;

  const nextRoundLabel = nextMatch
    ? `${nextMatch.opponent} - ${nextMatch.venue}`
    : "Nao definido";

  return (
    <section className="grid gap-3 rounded-2xl border border-emerald-100/60 bg-emerald-950/30 p-4 text-emerald-50 shadow-inner sm:grid-cols-2 lg:grid-cols-3">
      <div className="flex items-center">
        <MeuTimeCalendar teamId={teamId} />
      </div>
      <InfoItem label="Treinador" value={coachName} />
      <InfoItem label="Ano" value={String(year)} />
      <InfoItem label="Estadio" value={stadiumName} />
      <InfoItem label="Torcedores" value={fansLabel} />
      <InfoItem label="Caixa" value={cashLabel} />
      <InfoItem label="Campeonato" value={leagueLabel} />
      <InfoItem label="Proxima rodada" value={nextRoundLabel} wide />
    </section>
  );
}

function InfoItem({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={`rounded-lg border border-emerald-100/40 bg-white/5 px-3 py-2 ${wide ? "sm:col-span-2 lg:col-span-3" : ""}`}>
      <div className="text-[11px] uppercase tracking-[0.2em] text-emerald-200">{label}</div>
      <div className="mt-1 text-sm font-semibold text-emerald-50">{value}</div>
    </div>
  );
}
