export type SlotId =
  | "GK"
  | "LB"
  | "LCB"
  | "RCB"
  | "RB"
  | "LDM"
  | "RDM"
  | "CAM"
  | "LW"
  | "RW"
  | "ST";

export type Slot = { id: SlotId; x: number; y: number };

export type PlayerForLineup = {
  id: string | number;
  name?: string | null;
  char1?: string | null;
  overall?: number | null;
};

export type AssignedSlot = {
  slot: SlotId;
  player: PlayerForLineup;
  x: number;
  y: number;
};

export const SLOTS_433: Slot[] = [
  { id: "GK", x: 50, y: 90 },

  { id: "LB", x: 18, y: 72 },
  { id: "LCB", x: 40, y: 74 },
  { id: "RCB", x: 60, y: 74 },
  { id: "RB", x: 82, y: 72 },

  { id: "LDM", x: 42, y: 54 },
  { id: "RDM", x: 58, y: 54 },
  { id: "CAM", x: 50, y: 40 },

  { id: "LW", x: 22, y: 24 },
  { id: "RW", x: 78, y: 24 },
  { id: "ST", x: 50, y: 16 },
];

const SLOT_BY_ID: Record<SlotId, Slot> = Object.fromEntries(
  SLOTS_433.map((s) => [s.id, s]),
) as Record<SlotId, Slot>;

const POSITION_TO_SLOTS: Record<string, SlotId[]> = {
  Goalkeeper: ["GK"],

  "Left-Back": ["LB"],
  "Right-Back": ["RB"],

  "Centre-Back": ["LCB", "RCB"],
  Defence: ["LB", "LCB", "RCB", "RB"],

  "Defensive Midfield": ["LDM", "RDM"],
  "Central Midfield": ["LDM", "RDM", "CAM"],
  "Attacking Midfield": ["CAM"],
  Midfield: ["LDM", "RDM", "CAM"],

  "Left Winger": ["LW"],
  "Right Winger": ["RW"],
  "Left Midfield": ["LW", "CAM"],

  "Centre-Forward": ["ST"],
  Offence: ["LW", "RW", "ST"],
};

const FILL_ORDER: SlotId[] = [
  "GK",
  "LB",
  "LCB",
  "RCB",
  "RB",
  "LDM",
  "RDM",
  "CAM",
  "LW",
  "RW",
  "ST",
];

function preferredSlots(p: PlayerForLineup): SlotId[] {
  const pos = p.char1 ?? "";
  return POSITION_TO_SLOTS[pos] ?? [];
}

function dist(a: SlotId, b: SlotId) {
  const A = SLOT_BY_ID[a];
  const B = SLOT_BY_ID[b];
  const dx = A.x - B.x;
  const dy = A.y - B.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function pickBest(cands: PlayerForLineup[]) {
  return cands
    .slice()
    .sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))[0];
}

export function buildLineup433(players: PlayerForLineup[]): AssignedSlot[] {
  const remaining = players.slice();
  const assigned: AssignedSlot[] = [];

  const take = (p: PlayerForLineup) => {
    const idx = remaining.findIndex((x) => x.id === p.id);
    if (idx >= 0) remaining.splice(idx, 1);
  };

  for (const slot of FILL_ORDER) {
    let chosen: PlayerForLineup | undefined;

    // 1) preferir jogador com mapeamento nativo único que inclua o slot
    const directStrict = remaining.filter((p) => {
      const prefs = preferredSlots(p);
      return prefs.length === 1 && prefs.includes(slot);
    });
    if (directStrict.length) {
      chosen = pickBest(directStrict);
    }

    // 2) se não houver nativo único, pegar qualquer jogador que tenha o slot como preferência
    if (!chosen) {
      const direct = remaining.filter((p) => preferredSlots(p).includes(slot));
      if (direct.length) {
        chosen = pickBest(direct);
      }
    }

    // 3) fallback: slot mais próximo das preferências do jogador
    if (!chosen) {
      const scored = remaining
        .map((p) => {
          const prefs = preferredSlots(p);
          if (!prefs.length) return null;
          const d = Math.min(...prefs.map((s) => dist(slot, s)));
          return { p, d };
        })
        .filter(Boolean) as { p: PlayerForLineup; d: number }[];

      if (scored.length) {
        scored.sort((a, b) => {
          if (a.d !== b.d) return a.d - b.d;
          return (b.p.overall ?? 0) - (a.p.overall ?? 0);
        });
        chosen = scored[0].p;
      }
    }

    // 4) último recurso: qualquer um restante
    if (!chosen && remaining.length) {
      chosen = pickBest(remaining);
    }

    if (!chosen) break;

    take(chosen);
    const pos = SLOT_BY_ID[slot];
    assigned.push({ slot, player: chosen, x: pos.x, y: pos.y });
  }

  return assigned;
}
