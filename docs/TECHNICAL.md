# Estrutura Técnica

## Visão geral
- **Framework**: Next.js (App Router, TypeScript)
- **UI**: TailwindCSS
- **Dados**: Supabase (PostgreSQL), uso de service role em server-only e anon no client
- **Jobs**: Route handler `/att` para sincronizar ligas/times/jogadores com Football-Data.org
- **Logs**: `logs/att-errors.txt` para registrar erros de sync

## Pastas e arquivos principais
- `src/app/page.tsx` — Landing/login.
- `src/app/novo-jogo/page.tsx` — Seleção de liga/time.
- `src/app/novo-jogo/confirm/[id]/page.tsx` — Escudo, bandeira, campo 4-3-3 e lista de jogadores colorida.
- `src/app/times/[id]/page.tsx` — Visualização de time (escudo, lista de jogadores).
- `src/app/att/route.ts` — Job de atualização de ligas/times/jogadores com retry de rate limit e logs.
- `src/lib/lineup.ts` — Lógica de escalação 4-3-3 com prioridade de posição nativa e fallback.
- `src/lib/supabase/env.ts` — Leitura/validação de variáveis.
- `src/lib/supabase/server.ts` — Client Supabase para requests server-side usando anon key (cookies) para páginas normais.
- `src/lib/supabase/service.ts` — Client Supabase com service role para operações server-only.
- `logs/att-errors.txt` — Saída de erros do job `/att`.
- `milestones.md` — Lista de milestones.
- `README.md` — Visão do projeto.

## Fluxos
- **Seleção de time**: `/novo-jogo` mostra ligas/times; ao confirmar navega para `/novo-jogo/confirm/[id]`.
- **Confirmação**: `/novo-jogo/confirm/[id]` usa service role para carregar escudo, bandeira e elenco; renderiza campo 4-3-3 (lineup) + lista colorida por posição.
- **Atualização de dados**: `/att` lê ligas em `LigaCampeonato`, busca times e detalhes, atualiza `Time`, `LigaCampeonatoTemporada`, limpa e insere `Jogador`. Rate limit: retry único; erros logados e times com erro são marcados como skipped.

## Modelos (uso atual)
- `Time`: campos usados `id, name, football_data_team_id, badge/crest_url, flag/flag_url`.
- `LigaCampeonato`, `LigaCampeonatoTemporada`: relacionam ligas e times por temporada.
- `Jogador`: campos lidos/gravados `id, name, char1 (posição texto), birthday, team`.

## Notas de deploy/dev
- Necessário `SUPABASE_SERVICE_ROLE_KEY` para páginas/rotas que consultam com permissão total (`/att`, `/novo-jogo/confirm/[id]`).
- `FOOTBALL_DATA_TOKEN` requerido para `/att`.
- RLS: páginas client usam anon; se RLS ativo, garantir policies de select em `Time`/`Jogador` ou usar rotas server com service role.
