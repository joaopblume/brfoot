export type CalendarMatch = {
  id: string;
  dateLabel: string;
  opponent: string;
  venue: "EM CASA" | "FORA";
};

const OPPONENTS = [
  "Atletico Central",
  "Porto Azul",
  "Norte Unido",
  "Ferroviario",
  "Serra Verde",
  "Litoral FC",
  "Real Horizonte",
  "Guara City",
  "Uniao Sul",
  "Estrela Nova",
  "Vila Matriz",
  "Santa Marina",
];

export function createCalendar(teamId: number, teamName: string | null, total = 10) {
  const baseName = teamName ?? `Time ${teamId}`;
  const baseDate = new Date();

  return Array.from({ length: total }, (_, index): CalendarMatch => {
    const randomGap = Math.floor(Math.random() * 4);
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + index * 7 + randomGap + 1);

    const opponent = OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)];
    const venueSeed = Math.random() > 0.5 ? "EM CASA" : null;
    const venue = venueSeed ?? "FORA";

    return {
      id: `${teamId}-${index}-${date.getTime()}`,
      dateLabel: date.toLocaleDateString("pt-BR"),
      opponent: `${baseName} vs ${opponent}`,
      venue,
    };
  });
}
