import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

import { createClient } from "@supabase/supabase-js";
import { GET, POST } from "../src/app/att/route";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

describe("/att route", () => {
  it("GET retorna 405 e mensagem de uso", async () => {
    const res = GET();
    expect(res.status).toBe(405);
    await expect(res.json()).resolves.toEqual({ error: "Use POST" });
  });

  it("POST retorna 500 quando faltam env vars", async () => {
    delete process.env.FOOTBALL_DATA_TOKEN;
    delete process.env.SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const req = new Request("http://localhost/att", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.fatal).toBe(true);
    expect(String(body.error)).toMatch(/Missing env vars/i);
  });

  it("POST retorna sucesso quando nao ha competicoes", async () => {
    process.env.FOOTBALL_DATA_TOKEN = "test_token";
    process.env.SUPABASE_URL = "http://localhost:54321";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test_key";

    const mockedCreateClient = vi.mocked(createClient);
    mockedCreateClient.mockReturnValue({
      from: () => ({
        select: () => ({
          not: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    } as ReturnType<typeof createClient>);

    const req = new Request("http://localhost/att", {
      method: "POST",
      body: JSON.stringify({ season: 2025 }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.competitions_count).toBe(0);
    expect(body.steps?.[0]?.info).toBe("LigaCampeonato vazia");
  });
});
