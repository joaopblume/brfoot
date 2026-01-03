import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfilePanel } from "@/components/ProfilePanel";

export const dynamic = "force-dynamic";

export default async function MeuPerfilPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const username =
    user.user_metadata?.username ||
    user.user_metadata?.full_name ||
    user.email ||
    "Usuario";
  const avatarUrl = user.user_metadata?.avatar_url || null;

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_25%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.05),transparent_20%),linear-gradient(135deg,rgba(0,0,0,0.2),transparent_30%)]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2740%27 height=%2740%27 viewBox=%270 0 40 40%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath d=%27M0 20h40M20 0v40%27 stroke=%27%23ffffff12%27 stroke-width=%271%27/%3E%3C/svg%3E')]" />
      <main className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16">
        <section className="w-full max-w-2xl rounded-3xl bg-white/5 p-10 shadow-2xl shadow-emerald-900/60 ring-1 ring-white/10 backdrop-blur">
          <div className="mb-8 space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">
              Meu Perfil
            </p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Informacoes do jogador
            </h1>
            <p className="text-sm text-emerald-100">
              Atualize seus dados e escolha sua foto de perfil.
            </p>
          </div>

          <ProfilePanel
            userId={user.id}
            initialUsername={username}
            email={user.email}
            initialAvatarUrl={avatarUrl}
          />
        </section>
      </main>
    </div>
  );
}
