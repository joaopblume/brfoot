"use client";

import { useRouter } from "next/navigation";

import { createCalendar } from "@/lib/calendar";

const storageKey = (teamId: number) => `meu-time-calendar-${teamId}`;

export default function ConfirmStartButton({
  teamId,
  teamName,
}: {
  teamId: number;
  teamName: string | null;
}) {
  const router = useRouter();

  const handleStart = () => {
    const matches = createCalendar(teamId, teamName);
    try {
      localStorage.setItem(storageKey(teamId), JSON.stringify(matches));
    } catch (error) {
      console.error("Falha ao salvar calendario:", error);
    }
    router.push(`/novo-jogo/confirm/${teamId}/meu-time`);
  };

  return (
    <button
      type="button"
      onClick={handleStart}
      className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950 shadow-md shadow-emerald-900/40 transition hover:bg-emerald-400 focus:outline-none focus:ring focus:ring-emerald-300"
    >
      Ir para MEU-TIME
    </button>
  );
}
