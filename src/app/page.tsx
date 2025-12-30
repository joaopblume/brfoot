import { AuthForm } from "@/components/AuthForm";

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
              Monte seu clube, negocie jogadores e domine os campeonatos. Faça login ou crie uma conta
              para continuar.
            </p>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-[1.2fr_1fr]">
            <AuthForm />

            <div className="flex flex-col justify-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-emerald-50">
              <p className="text-sm font-semibold text-white">Seja o treinador</p>
              <ul className="space-y-2">
                <li>• Monte escalações e táticas personalizadas.</li>
                <li>• Negocie transferências e renovações.</li>
                <li>• Evolua categorias de base e finanças.</li>
              </ul>
              <div className="mt-2 rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-xs text-emerald-100">
                Dica: após autenticar, você será direcionado para /novo-jogo para escolher liga e time.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
