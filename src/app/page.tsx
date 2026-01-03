import { AuthForm } from "@/components/AuthForm";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProfilePanel } from "@/components/ProfilePanel";

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const username =
    user?.user_metadata?.username ||
    user?.user_metadata?.full_name ||
    user?.email ||
    "Usuario";
  const avatarUrl = user?.user_metadata?.avatar_url || null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b1315] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(80,200,140,0.25),_transparent_55%)]" />
      <div className="pointer-events-none absolute -left-32 top-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-400/10 blur-[100px]" />

      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-14 px-6 py-12">
        <header className="flex flex-wrap items-center justify-between gap-6 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/30">
              <span className="text-lg font-black tracking-tight">BF</span>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-emerald-200">
                BRASFOOT
              </p>
              <p className="text-base font-semibold text-white">Manager 2025</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm text-emerald-100">
            {user && (
              <a
                className="rounded-full px-3 py-1 transition hover:bg-white/10"
                href="/novo-jogo"
              >
                Novo jogo
              </a>
            )}
            {user && (
              <a
                className="rounded-full px-3 py-1 transition hover:bg-white/10"
                href="/meu-perfil"
              >
                Meu Perfil
              </a>
            )}
            <a className="rounded-full px-3 py-1 transition hover:bg-white/10" href="/att">
              Atualizacoes
            </a>
          </nav>
        </header>

        <section className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.9fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-100">
              Central de gestores
            </div>
            <div className="space-y-5">
              <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
                Construa seu clube. Negocie estrelas. Governe a temporada.
              </h1>
              <p className="max-w-xl text-base text-emerald-100 md:text-lg">
                A plataforma definitiva para quem vive o futebol de dentro do vestiario. Estatisticas,
                scout e financeiro reunidos em um painel profissional.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Clubes ativos", value: "1.284" },
                { label: "Ligas disponiveis", value: "47" },
                { label: "Treinos taticos", value: "18" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm"
                >
                  <p className="text-lg font-semibold text-white">{stat.value}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-emerald-100">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                Mercado atualizado
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                Base e financeiro
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                Analises em tempo real
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {!user && <AuthForm />}
            {user && (
              <ProfilePanel
                userId={user.id}
                initialUsername={username}
                email={user.email}
                initialAvatarUrl={avatarUrl}
                showNovoJogo
              />
            )}

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-emerald-50">
              <p className="text-sm font-semibold text-white">Painel do treinador</p>
              <ul className="mt-3 space-y-2 text-emerald-100">
                <li>• Escalacoes e taticas personalizadas por partida.</li>
                <li>• Negociacoes com clausulas e gatilhos reais.</li>
                <li>• Evolucao da base e controle financeiro.</li>
              </ul>
              <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-emerald-100">
                Dica: apos autenticar, voce sera direcionado para /novo-jogo para escolher liga e time.
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Atualizacoes</p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              Mercado de transferencias ao vivo
            </h3>
            <p className="mt-3 text-sm text-emerald-100">
              Acompanhe rumores, confirmacoes e avaliacoes de desempenho com indicadores de risco e
              impacto imediato na sua folha.
            </p>
            <div className="mt-5 grid gap-3 text-xs text-emerald-100">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <span>Scout internacional liberado</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-[10px] uppercase">
                  Novo
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <span>Relatorios financeiros da temporada</span>
                <span className="text-[10px] uppercase text-emerald-200">Atualizado</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Analise de desempenho",
                desc: "Indicadores de pressao, posse e conversao em um unico painel.",
              },
              {
                title: "Calendario inteligente",
                desc: "Prevencao de lesoes com alertas automaticos de desgaste.",
              },
              {
                title: "Base integrada",
                desc: "Projecao de talentos com trilhas de evolucao e custos.",
              },
              {
                title: "Controle de gastos",
                desc: "Limites de folha e metas de investimento por meta.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-5"
              >
                <h4 className="text-base font-semibold text-white">{card.title}</h4>
                <p className="mt-2 text-sm text-emerald-100">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
