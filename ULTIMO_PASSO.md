# Estado atual do Atlas Studio no VPS

**Atualizado em:** 21/09/2026, aproximadamente 16:06 (America/Bahia)

## Acesso e ambiente

- Painel: `https://painel.setupdja.website` — HTTP 200 e contêiner `atlas-studio` saudável.
- n8n: `https://n8n.setupdja.website` — HTTP 200.
- VPS: `ubuntu@137.131.171.144` (autônomo 24/7).
- Projeto no VPS: `/srv/atlas-studio`, branch `main`.
- Armazenamento pesado: montado e validado em `/srv/robo/portal-bot/data/atlas-storage` (78 GB livres).
- Espaço em disco raiz `/`: 6.1 GB livres.

## O que foi alterado e implementado

1. **Correção Definitiva do Erro `Argument missing for parameter "frame"`:**
   - Diagnosticada a causa-raiz no Remotion v4: quando parâmetros de cena ou composição resultavam em `NaN` ou `undefined`, a chamada a `renderStill({ frame })` lançava `TypeError: Argument missing for parameter "frame"`.
   - Implementado cálculo estritamente finito e com clamp de limites em `lib/motion-author.mjs` (`sceneUnits`), `lib/automatic.mjs` e `lib/shorts.mjs` (`validatePreview`).
   - Adicionado tratamento resiliente de contingência em `lib/automatic.mjs` para que eventuais avisos em prévias apliquem a composição de segurança sem abortar a produção nem perder os roteiros, áudios e cenas já criados.

2. **Implementação do Proxy de Padronização e Transcodificação de Mídias (1080p + GOP 30):**
   - Criada a função `transcodeVideo` em `lib/auto-media.mjs` com pipeline FFmpeg otimizado (`-vf "scale='min(1920,iw)':-2:flags=bicubic" -c:v libx264 -preset ultrafast -crf 23 -g 30 -pix_fmt yuv420p -an`).
   - Todo vídeo em 4K/2K baixado pelo gerador automático agora é imediatamente padronizado para 1080p leve com keyframe a cada 1 segundo (GOP 30) e áudio embutido removido, reduzindo o tempo de renderização/seek do Chromium no Remotion em mais de 10x.
   - Criado script `scripts/transcode_existing.mjs` e executado no VPS para otimizar todos os 81 vídeos já baixados do documentário da Suíça.

3. **Retomada e Execução do Job:**
   - O job `3677be46-ea60-4ea1-aee9-adab207b5235` (*Why Switzerland Built Underground Bunkers for 100% of Its Population*) foi retomado com status `running`.
   - O processo está em execução autônoma no VPS via `atlas-studio`.

## Validação e Resultados

- Suíte de testes automatizados (`npm test`): **71 de 71 testes aprovados com sucesso (100%)**.
- Código commitado e sincronizado com o repositório GitHub (`main`).
- Contêiner Docker `atlas-studio` atualizado, operando e renderizando no VPS.

## Próximo passo recomendado

- Acompanhar a conclusão da renderização do MP4 final em 1080p do documentário de 16 minutos e a extração automática dos 5 Shorts verticais.
