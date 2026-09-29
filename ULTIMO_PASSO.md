# Atlas Studio — estado atual

Atualizado em 29/09/2026, aproximadamente 13:10 (America/Bahia).

## Último trabalho
- **Reaproveitamento de acervo do documentário para Shorts (`lib/shorts.mjs`, `lib/auto-media.mjs`)**:
  - Implementada a função `borrowMatchingAsset(scene, longAssets, usedSrcs)` para reaproveitar os 146 arquivos de mídia em Full HD já baixados e verificados do documentário principal nos Shorts do mesmo tema quando buscas externas para termos abstratos/conceituais não retornarem resultado.
  - Ajustado `lib/auto-media.mjs` (`reusableAssetFromCache` e `sourceScene`): a flag `isShort: true` agora impede que as URLs do cache do vídeo longo sejam adicionadas a `usedUrls` como mídias proibidas no Short, permitindo o reaproveitamento contextual do mesmo país/tema.
  - Corrigida a condição de retomada em `lib/shorts.mjs`: cenas com `missingVisual: true` remanescentes de falhas anteriores são filtradas em vez de ignoradas, permitindo a resolução com o novo pipeline.
  - Adicionada rede de segurança ao final de `repairVisuals`: qualquer cena pendente após a revisão é atendida com uma mídia válida do documentário principal, garantindo 100% de cobertura sem interromper a esteira.
- **Suíte de testes automatizados (`tests/shorts-render.test.mjs`)**:
  - Teste unitário para `borrowMatchingAsset` validando score por palavras-chave, controle de `usedSrcs` para não repetir mídias dentro do Short e integridade dos metadados de crédito.
- **Deploy no VPS (`ubuntu@137.131.171.144`)**:
  - Código commitado e enviado para a branch `codex/atlas-visual-v3` (commit `4057b1c`).
  - Atualizado no VPS via `git pull` em `/srv/atlas-studio` e container reiniciado.
  - O `short-0` foi disparado novamente: todas as 11 cenas foram resolvidas com sucesso (0 cenas pendentes), a programação das cenas via Luna/GLM concluiu, a validação de prévia passou e a renderização do MP4 está em andamento no servidor a ~3,2 quadros/s.

## Estado verificado
- **166 testes automatizados passando com 100% de sucesso (`npm test`)**:
  - 166 pass, 0 fail.
- **Short 1 em renderização ativa no VPS (`137.131.171.144:4310`)**:
  - `status: running`, `error: null`.
  - Todas as 11 cenas com mídia/diagrama em Full HD, sem travar em `shot-5` ou `shot-9`.
  - Renderização vertical 1080x1920 avançando com Remotion a ~3,2 fps.
- **Vídeo principal de 15 minutos verificado e íntegro no VPS**:
  - `video-84746866-bd26-4543-9845-2374d2d28b44.mp4` (1.5 GB, 14.3 min, 148 cenas, 91 vídeos, 55 fotos, 0 cenas sem mídia).

## Erros ou limitações que continuam abertos
- A publicação automática e a geração de capas continuam deliberadamente desligadas durante o período de testes.

## Próximo passo recomendado
- Aguardar a conclusão da renderização do Short 1 no painel (`http://localhost:4310`) e inspecionar o resultado do primeiro vídeo vertical antes de seguir para os próximos.
