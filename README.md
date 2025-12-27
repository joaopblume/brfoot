# Brfoor Manager

Um jogo de football manager inspirado no Brasfoot, rodando online (Next.js + Supabase) e preparado para modo offline (cache futuro). Escale seu time, gerencie elenco, sincronize dados e jogue temporadas.

## Stack
- Next.js (App Router, TypeScript)
- Supabase (PostgreSQL + RLS, service role para rotas server-side)
- TailwindCSS

## Funcionalidades atuais
- Seleção de liga/time e exibição do elenco com cores por faixa de campo.
- Escalação automática 4-3-3 com prioridade para posição nativa e fallback por proximidade.
- Job `/att` para atualizar times/jogadores a partir da Football-Data.org, com retry e log de erros.
- Página de confirmação do time (`/novo-jogo/confirm/[id]`) com escudo, bandeira, campo e lista de jogadores.

## Como rodar
1. Instale dependências: `npm install`
2. Configure `.env.local` com:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (apenas server-side)
   - `FOOTBALL_DATA_TOKEN` (para o job `/att`)
3. Dev server: `npm run dev`
4. Acesse:
   - Seleção de time: `http://localhost:3000/novo-jogo`
   - Confirmação/escalação: `http://localhost:3000/novo-jogo/confirm/<id>`
   - Job de atualização: `POST http://localhost:3000/att`

## Milestones (resumo)
- Cache
- Login + saves por jogador
- Contas reais
- Sugestão de alterações nos times pelos jogadores
- Gateway de pagamento
