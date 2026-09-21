# Estado atual do Atlas Studio no VPS

**Atualizado em:** 21/09/2026, aproximadamente 07:20 (America/Bahia)

## Acesso e ambiente

- Painel: `https://painel.setupdja.website` — HTTP 200 e contêiner `atlas-studio` saudável.
- n8n: `https://n8n.setupdja.website` — HTTP 200.
- VPS: `ubuntu@137.131.171.144` (autônomo 24/7).
- Projeto no VPS: `/srv/atlas-studio`, branch `main`.
- Armazenamento pesado: montado e validado em `/srv/robo/portal-bot/data/atlas-storage` (80 GB livres).
- Espaço em disco raiz `/`: 5.5 GB livres recuperados após limpeza de cache.

## O que foi verificado e status da produção

1. **Vídeo Longo (1080p): CONCLUÍDO COM 100% DE SUCESSO**
   - **Projeto:** *The World's Most Extreme Desert Train: Mauritania's 2km Iron Ore Giant* (ID: `b6daffd0-5641-472d-aa2b-ef347510c971`).
   - MP4 final renderizado e salvo: `/outputs/b6daffd0-5641-472d-aa2b-ef347510c971/video-5e927cba-70ef-4f24-9b55-6b5cfdc56a29.mp4`.
   - Todas as 15 cenas, trilha sonora ("State Drive - VYEN"), pesquisa e narração em inglês US integradas.

2. **Geração dos 5 Shorts: CONTEÚDO E ÁUDIO 100% PRONTOS**
   - Short 1: *"The 2-Kilometer Iron Monster of the Sahara"* (50s)
   - Short 2: *"The Lethal Hitchhike: Free Rides on 84 Tons of Dust"* (52s)
   - Short 3: *"The Single Track Lifeline: Why a 704km Route Cannot Fail"* (55s)
   - Short 4: *"Sahara's Frozen Paradox: 45°C Days and Sub-Zero Nights"* (51s)
   - Short 5: *"The Industrial Train That Triggered a Military Coup"* (54s)
   - Roteiros, vozes Fish Audio, transcrições e composições Remotion gerados nas pastas `data/shorts/.../short_1` a `short_5`.

3. **Correções de Infraestrutura Aplicadas:**
   - Limpeza de 5.5 GB no disco raiz para evitar erro `ENOSPC`.
   - Configuração de `chromiumOptions` com `gl: 'swangle'` e multi-processo Linux em `lib/render-runtime.mjs`.
   - Adicionado `dir` ao objeto `createStore` e fallback em `lib/topics.mjs` para o agendador autônomo.
   - Renderização dos MP4s dos 5 Shorts em processamento.

## Próximo passo

- Concluir a renderização dos 5 MP4s dos Shorts e disparar a grade de agendamento no n8n para YouTube e Facebook.
