"use client";

import { useEffect, useState } from "react";

import type { CalendarMatch } from "@/lib/calendar";

const storageKey = (teamId: number) => `meu-time-calendar-${teamId}`;

export default function MeuTimeCalendar({ teamId }: { teamId: number }) {
  const [matches, setMatches] = useState<CalendarMatch[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(teamId));
      if (!raw) return;
      const parsed = JSON.parse(raw) as CalendarMatch[];
      if (Array.isArray(parsed)) {
        setMatches(parsed);
      }
    } catch (error) {
      console.error("Falha ao carregar calendario:", error);
    }
  }, [teamId]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-white/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-50 shadow-inner transition hover:bg-white/20"
      >
        <CalendarIcon />
        Calendario
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-emerald-100 bg-emerald-950 p-6 text-emerald-50 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon />
                <span className="text-sm font-semibold uppercase tracking-[0.2em]">
                  Calendario
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-emerald-100 px-2 py-1 text-xs font-semibold uppercase text-emerald-100 transition hover:bg-emerald-900"
              >
                Fechar
              </button>
            </div>

            <div className="mt-4 space-y-2 max-h-[360px] overflow-auto">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="rounded-lg border border-emerald-50 bg-emerald-50/90 px-3 py-2 text-sm text-emerald-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{match.dateLabel}</span>
                    <span className="rounded-full bg-emerald-900/90 px-2 py-0.5 text-xs font-semibold text-emerald-50">
                      {match.venue}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-emerald-800">{match.opponent}</div>
                </div>
              ))}
              {matches.length === 0 && (
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  Nenhuma partida gerada.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 text-emerald-200"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M8 2v4M16 2v4M3 10h18" />
      <path d="M8 14h2M12 14h2M16 14h2M8 18h2M12 18h2" />
    </svg>
  );
}
