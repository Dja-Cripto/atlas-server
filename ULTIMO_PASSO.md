# Atlas Studio — Otimização de Renderização Visual V2 (CPU ARM64)
**Atualizado em:** 24/09/2026, aproximadamente 20:35 (America/Bahia).

## Checkpoint e versão
- V1 estável: tag `atlas-visual-v1-checkpoint-2026-09-24`, commit `78b60db`, enviada ao GitHub.
- Imagem V1 preservada no VPS: `atlas-studio:visual-v1-checkpoint-2026-09-24`.
- V2: branch `codex/atlas-visual-v2` e `main`. Commit `3211e32`. Procedimento de reversão em `CHECKPOINTS.md`.
- Painel: https://painel.setupdja.website; código do servidor: /srv/atlas-studio.

## Alterações
- **Eliminação de camadas duplicadas e blur pesado**:
  - Removido `filter: blur(12px)` e `blur(16px)` de `SceneBackdrop.tsx` e `ShortsBackdrop.tsx`, substituindo por cor sólida escura `#0f1a18` com opacidade suave e gradiente.
  - Em `motion-author.mjs`, o `SceneBackdrop` não é mais montado em cenas que já possuem imagem ou vídeo (evita decodificação dupla da mídia por quadro).
- **Restrições de performance no GLM e validação**:
  - `sceneContract`: adicionada seção obrigatória de restrições para CPU (proibição de `backdropFilter`, filtros SVG como `feTurbulence`, `mixBlendMode`, e teto de raio de sombra a <= 6px).
  - `validateMotionCode`: rejeita `mixBlendMode`, `backdropFilter`, elementos `<filter>` e primitivas `<fe*>`.
  - `normalizeMotionCode`: remove automaticamente resquícios de `backdropFilter`, `mixBlendMode`, `<feTurbulence>`, `<feGaussianBlur>`, `<feColorMatrix>` e `<filter>`.
  - `generateFallbackSceneCode`: removido `backdropFilter: 'blur(8px)'`.
- **Otimização de mapas SVG**:
  - `ContextMap.tsx`: o zoom dinâmico foi migrado da matriz `<g transform="scale(...)">` para transformação CSS no container `<svg>`, reaproveitando cache vetorial.
- **Configurações do Remotion para ARM64**:
  - `render-runtime.mjs`: `gl` atualizado para `angle-egl` com flags `--disable-gpu`, `--disable-software-rasterizer` e `--disable-dev-shm-usage`. Concorrência ajustada para 2.
- **Transições no AutomaticVideo**:
  - Removido blur animado em `<Freeze>`, substituído por fade de opacidade simples.

## Validação e resultados medidos
- **96/96 testes unitários** aprovados no Node.js (`npm test`).
- **Renderização real do Vídeo Principal (Job `968140ed-b84a-45af-acf0-c36e728565dc`)**:
  - **Duração**: 60.8 segundos (1.824 quadros) em 1080p (1920x1080).
  - **Tempo de renderização**: **432.9 segundos (7 minutos e 12 segundos)**.
  - **Taxa de quadros medida**: Média de **4.21 FPS**, com trechos finais atingindo **9.2 FPS** (salto brutal em relação aos 0.3 FPS anteriores).
  - **Trilha sonora**: *"Liquid Time"* (estilo Vox/documentário, zero rock/guitarras).
  - **Arquivo**: `/app/data/long_videos/968140ed-b84a-45af-acf0-c36e728565dc/video-ef7db079-9f42-4e3a-b94f-7138ec3772c2.mp4` (160.24 MB).
- **Short vertical (1080x1920)**: Em programação e renderização sequencial no mesmo job.

## Próximo passo
Acompanhar a conclusão da renderização do Short vertical correspondente e validar o pacote completo no painel web.
