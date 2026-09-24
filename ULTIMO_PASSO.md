# Atlas Studio — Correção de Mapas e Continuidade Visual de Fundo
**Atualizado em:** 24/09/2026, aproximadamente 21:00 (America/Bahia).

## Checkpoint e versão
- V1 estável: tag `atlas-visual-v1-checkpoint-2026-09-24`, commit `78b60db`, enviada ao GitHub.
- Imagem V1 preservada no VPS: `atlas-studio:visual-v1-checkpoint-2026-09-24`.
- V2: branch `codex/atlas-visual-v2` e `main`. Procedimento de reversão em `CHECKPOINTS.md`.
- Painel: https://painel.setupdja.website; código do servidor: /srv/atlas-studio.

## Alterações
- **Correção da renderização de mapas cartográficos**:
  - Em `lib/motion-author.mjs`, corrigida a condição de montagem do `SceneBackdrop` de `!scene.asset && !scene.map` para `Boolean(scene.map || !scene.asset)`. Quando uma cena possuía mapa (`scene.map`), a negação anterior desabilitava o `SceneBackdrop`, impedindo que o `ContextMap` fosse montado e deixando a tela preta com apenas o texto overlay.
- **Herança de mapa e mídia em cenas de texto/título**:
  - Em `renderer/src/SceneBackdrop.tsx` e `renderer/src/ShortsBackdrop.tsx`, adicionada verificação de mapa herdado: `if(backgroundScene?.map && !scene.asset) return <ContextMap map={backgroundScene.map} duration={duration}/>;`. Quando uma cena de texto sucede uma cena de mapa (ex: títulos e explicações geopolíticas), o mapa continua visível por baixo da tipografia animada, eliminando telas com apenas degradê vazio.
  - Restaurado suporte a vídeo de fundo herdado via `<OffthreadVideo>` com opacidade reduzida e sobreposição escura suave (sem blur pesado de CPU).
  - Em `lib/motion-author.mjs`, `sceneUnits` agora pesquisa candidatos com asset ou mapa (`candidate.asset || candidate.map`) ao definir `backgroundIndex`, garantindo que cenas sem mídia própria herdem o mapa relevante anterior em vez de ficarem desprovidas de contexto visual.

## Validação e resultados
- 96/96 testes automatizados aprovados no Node.js (`npm test`).
- Diagnóstico validado contra as capturas de tela enviadas pelo usuário (cenas de mapa e transição entre França e Brasil).
- Preservada a alta velocidade de renderização da CPU (4 a 9 FPS) sem reintroduzir filtros pesados de desfoque.

## Próximo passo
Sincronizar no VPS e regerar o vídeo de teste da França e Brasil para validação visual direta pelo usuário.
