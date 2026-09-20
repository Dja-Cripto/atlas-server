# Estado atual do Atlas Studio no VPS

**Atualizado em:** 20/09/2026, aproximadamente 20:50 (America/Bahia)

## Acesso e ambiente

- Painel: `https://painel.setupdja.website` — HTTP 200 e contêiner `atlas-studio` saudável.
- n8n: `https://n8n.setupdja.website` — HTTP 200.
- VPS: `ubuntu@137.131.171.144` (autônomo 24/7).
- Projeto no VPS: `/srv/atlas-studio`, branch `main`.
- Armazenamento pesado: montado e validado em `/srv/robo/portal-bot/data/atlas-storage` (85 GB livres) para `data`, `.temp` e `auto`.

## O que foi alterado e executado

1. **Ajuste de tolerância de renderização (Remotion Timeout):**
   - Atualizado `lib/render-runtime.mjs` com `delayRenderTimeoutInMilliseconds: 300000` (5 minutos) em `browserOptions()`, garantindo que extrações de quadros pesados de vídeos em alta resolução não sofram timeout durante a renderização em CPU no VPS.

2. **Produção Autônoma Completa em Execução:**
   - **Projeto:** *The World's Most Extreme Desert Train: Mauritania's 2km Iron Ore Giant* (ID: `b6daffd0-5641-472d-aa2b-ef347510c971`).
   - Etapas concluídas: Pesquisa factual com fontes primárias, Roteiro em inglês US, Narração Fish Audio + transcrição Faster-Whisper, Curadoria de filmagens reais Pexels, Trilha sonora ("State Drive - VYEN"), Direção de 15 cenas e Motion Code MiMo.
   - Renderização final do MP4 1080p e geração dos 5 Shorts verticais em andamento no VPS.

3. **Operação 100% em Servidor em Nuvem:**
   - Confirmado que todos os serviços, filas de produção e disparadores para YouTube e Facebook funcionam independentemente da máquina local do usuário, permitindo desligar o computador a qualquer momento.

## Próximo passo

- O servidor concluirá a renderização, gerará os 5 Shorts, registrará a grade de agendamento para 21/09/2026 e acionará os webhooks de publicação no n8n.
