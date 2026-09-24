# Atlas Studio — Otimização de Renderização Visual V2 (CPU ARM64)
**Atualizado em:** 24/09/2026, aproximadamente 20:10 (America/Bahia).

## Checkpoint e versão
- V1 estável: tag `atlas-visual-v1-checkpoint-2026-09-24`, commit `78b60db`, enviada ao GitHub.
- Imagem V1 preservada no VPS: `atlas-studio:visual-v1-checkpoint-2026-09-24`.
- V2: branch `codex/atlas-visual-v2` e `main`. Procedimento de reversão em `CHECKPOINTS.md`.
- Painel: https://painel.setupdja.website; código do servidor: /srv/atlas-studio.

## Alterações
- **Eliminação de camadas duplicadas e blur pesado**:
  - Removido `filter: blur(12px)` e `blur(16px)` de `SceneBackdrop.tsx` e `ShortsBackdrop.tsx`, substituindo por cor sólida escura `#0f1a18` com opacidade suave e gradiente, mantendo a estética cinematográfica sem custo de convolução gaussiana na CPU.
  - Em `motion-author.mjs`, o `SceneBackdrop` não é mais montado em cenas que já possuem imagem ou vídeo (evita decodificação dupla da mídia por quadro).
- **Restrições de performance no GLM e validação**:
  - `sceneContract`: adicionada seção obrigatória de restrições para CPU (proibição de `backdropFilter`, filtros SVG como `feTurbulence`, `mixBlendMode`, e teto de raio de sombra a <= 6px).
  - `validateMotionCode`: rejeita `mixBlendMode`, `backdropFilter`, elementos `<filter>` e primitivas `<fe*>`.
  - `normalizeMotionCode`: remove automaticamente resquícios de `backdropFilter`, `mixBlendMode`, `<feTurbulence>`, `<feGaussianBlur>`, `<feColorMatrix>` e `<filter>`.
  - `generateFallbackSceneCode`: removido `backdropFilter: 'blur(8px)'`.
- **Otimização de mapas SVG**:
  - `ContextMap.tsx`: o zoom dinâmico foi migrado da matriz `<g transform="scale(...)">` para transformação CSS no container `<svg>`, permitindo que o Chromium reaproveite a rasterização vetorial em cache em vez de recalcular caminhos do GeoJSON por frame.
- **Configurações do Remotion para ARM64**:
  - `render-runtime.mjs`: `gl` atualizado para `angle-egl` com flags `--disable-gpu`, `--disable-software-rasterizer` e `--disable-dev-shm-usage`. Concorrência padrão ajustada de 4 para 2 para eliminar concorrência excessiva de threads no VPS de 4 vCPUs.
- **Transições no AutomaticVideo**:
  - Removido blur animado em `<Freeze>`, substituído por fade de opacidade simples.

## Validação e limites
- 96/96 testes automatizados aprovados no Node.js (`npm test`).
- Nenhuma dependência externa adicionada; integridade de dados e credenciais preservada.
- Validação da nova taxa de quadros (FPS) real no VPS pendente de execução imediata.

## Próximo passo
Enviar alterações ao GitHub, atualizar o código no VPS (`/srv/atlas-studio`), regenerar a produção de teste de 1 minuto + Short e monitorar os FPS de renderização no log.
