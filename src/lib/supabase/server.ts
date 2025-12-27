import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

import { getSupabaseEnv } from "./env";

export async function createServerSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  const cookieStore = await cookies();
  const headerStore = await headers();

  const getAllCookies = () => {
    if (typeof cookieStore.getAll === "function") {
      return cookieStore.getAll();
    }

    // Fallback for environments where cookies().getAll is unavailable.
    const raw = headerStore?.get?.("cookie") ?? "";
    return raw
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const [name, ...rest] = item.split("=");
        return { name, value: rest.join("=") };
      });
  };

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return getAllCookies();
      },
      setAll(cookiesToSet) {
        if (typeof cookieStore.set !== "function") return;

        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Ignore write errors when called from Server Components (writes allowed in server actions/routes).
          }
        });
      },
    },
  });
}
