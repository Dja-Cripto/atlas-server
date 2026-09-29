# Atlas Studio — estado atual

Atualizado em 29/09/2026, aproximadamente 12:55 (America/Bahia).

## Último trabalho
- **Reaproveitamento de acervo do documentário para Shorts (`lib/shorts.mjs`, `lib/auto-media.mjs`)**:
  - Implementada a função `borrowMatchingAsset(scene, longAssets, usedSrcs)` para reaproveitar os 146 arquivos de mídia em Full HD já baixados e verificados do documentário principal nos Shorts do mesmo tema quando buscas externas para termos abstratos/conceituais não retornarem resultado.
  - Ajustado `lib/auto-media.mjs` (`reusableAssetFromCache` e `sourceScene`): a flag `isShort: true` agora impede que as URLs do cache do vídeo longo sejam adicionadas a `usedUrls` como mídias proibidas no Short, permitindo o reaproveitamento contextual do mesmo país/tema.
  - Corrigida a condição de retomada em `lib/shorts.mjs`: cenas com `missingVisual: true` remanescentes de falhas anteriores são filtradas em vez de ignoradas, permitindo a resolução com o novo pipeline.
  - Adicionada rede de segurança ao final de `repairVisuals`: qualquer cena pendente após a revisão é atendida com uma mídia válida do documentário principal, garantindo 100% de cobertura sem interromper a esteira.
- **Suíte de testes automatizados (`tests/shorts-render.test.mjs`)**:
  - Teste unitário para `borrowMatchingAsset` validando score por palavras-chave, controle de `usedSrcs` para não repetir mídias dentro do Short e integridade dos metadados de crédito.
- **Deploy no VPS (`ubuntu@137.131.171.144`)**:
  - Código commitado e enviado para a branch `codex/atlas-visual-v3`.

## Estado verificado
- **166 testes automatizados passando com 100% de sucesso (`npm test`)**:
  - 166 pass, 0 fail.
- **Vídeo principal de 15 minutos verificado e íntegro no VPS**:
  - `video-84746866-bd26-4543-9845-2374d2d28b44.mp4` (1.5 GB, 14.3 min, 148 cenas, 91 vídeos, 55 fotos, 0 cenas sem mídia).

## Erros ou limitações que continuam abertos
- A publicação automática e a geração de capas continuam deliberadamente desligadas durante o período de testes.

## Próximo passo recomendado
- Realizar `git pull` no VPS `/srv/atlas-studio`, remover o `resolved.json` parcial do `short-0` e disparar a geração do Short no painel.
