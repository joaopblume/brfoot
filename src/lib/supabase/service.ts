import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "./env";

export function createServiceSupabaseClient() {
  const { supabaseUrl } = getSupabaseEnv();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY for server-side operations.");
  }

  return createClient(supabaseUrl, serviceKey);
}
