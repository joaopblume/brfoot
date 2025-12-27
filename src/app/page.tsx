export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 text-zinc-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.06),_transparent_35%)]" />
      <main className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-3xl rounded-3xl bg-white/5 p-10 shadow-2xl shadow-emerald-950/50 ring-1 ring-white/10 backdrop-blur">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                <span className="text-xl font-black tracking-tight">BF</span>
              </div>
              <div className="text-left">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">
                  Brasfoor
                </p>
                <h1 className="text-3xl font-semibold leading-tight">Manager 2025</h1>
              </div>
            </div>
            <p className="max-w-2xl text-base text-emerald-100">
              Monte seu clube, negocie jogadores e domine os campeonatos. Faça login para continuar.
            </p>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-[1.2fr_1fr]">
            <form className="space-y-4 rounded-2xl bg-white p-6 text-left text-zinc-900 shadow-lg shadow-emerald-900/20">
              <div>
                <label className="text-sm font-medium text-zinc-700">E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  className="mt-1 w-full rounded-lg border border-emerald-100 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-200 transition focus:border-emerald-400 focus:ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700">Senha</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-lg border border-emerald-100 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-200 transition focus:border-emerald-400 focus:ring"
                />
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-900/30 transition hover:bg-emerald-500 focus:outline-none focus:ring focus:ring-emerald-300"
              >
                Entrar
              </button>
              <p className="text-xs text-zinc-500">
                Esqueceu a senha? <span className="font-medium text-emerald-600">Recuperar</span>
              </p>
            </form>

            <div className="flex flex-col justify-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-emerald-50">
              <p className="text-sm font-semibold text-white">Seja o treinador</p>
              <ul className="space-y-2">
                <li>• Monte escalações e táticas personalizadas.</li>
                <li>• Negocie transferências e renovações.</li>
                <li>• Evolua categorias de base e finanças.</li>
              </ul>
              <div className="mt-2 rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-xs text-emerald-100">
                Dica: este formulário ainda não chama Supabase. Posso ligar ao auth (email/senha ou
                magic link) quando você quiser.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
