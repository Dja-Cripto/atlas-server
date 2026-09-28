# Atlas Studio — estado atual
**Atualizado em:** 28/09/2026, aproximadamente 11:00 (America/Bahia).

## Eliminação do Template Split-Screen e Implementação da Hierarquia de Relevância Visual
- **Fim do split-screen artificial:** O gerador visual (`lib/motion-author.mjs` e `lib/v3-direction.mjs`) agora proíbe categoricamente encolher fotos ou vídeos em caixas flutuantes divididas com o fundo exposto. Toda mídia documental passa a ocupar obrigatoriamente 100% da tela (1920x1080 full-bleed com `objectFit: 'cover'`) e movimento sutil de câmera (Ken Burns).
- **Overlays integrados sobre a imagem:** Explicações causais, esquemas SVG e dados devem ser renderizados exclusivamente como camadas translúcidas ou minimalistas sobre a mídia em tela cheia, preservando a estética de documentários modernos (Vox / Johnny Harris / Bloomberg).
- **Hierarquia editorial e preservação de fotos relevantes:** No reparador automático (`lib/video-coverage-repair.mjs`), a substituição de mídias não força vídeos genéricos apenas para quebrar sequências de fotos. O critério passa a ser a **redundância visual real** (ex.: mídias ou tratamentos idênticos em cenas adjacentes). Fotos excelentes e pertinentes para a narração são sempre preservadas.
- **Buscas em camadas simplificadas e validação de relevância:** `lib/auto-media.mjs` agora inclui `cleanSearchQuery` e `buildTieredVideoQueries`, eliminando termos que quebravam as buscas nas APIs (como "documentary footage", "official", "real footage") e testando queries curtas de 2 a 4 termos essenciais. O avaliador visual foi instruído a rejeitar vídeos contextuais desconexos, preferindo manter uma boa foto a usar um vídeo irrelevante.
- **Auditoria semântica no revisor:** `lib/editorial-review.mjs` ganhou as funções `isSplitScreenLayout` e `detectVisualRedundancy`, detectando caixas parciais desnecessárias e repetição de estruturas entre cenas vizinhas sem depender de coordenadas fixas.
- **Neutralidade do backdrop de contingência:** `renderer/src/SceneBackdrop.tsx` e `renderer/src/ShortsBackdrop.tsx` tiveram seus gradientes esverdeados substituídos por tons neutros cinematográficos profundos (`#090b0d` / `#181d21`) com vinheta suave e opacidade limpa.

## O que foi alterado no gerador (permanente para as próximas produções)
1. `lib/motion-author.mjs`: `sceneContract` e `directorContract` atualizados para exigir mídia full-bleed e overlays integrados, banindo split-screen boxes.
2. `lib/v3-direction.mjs`: `v3DirectionPrompt` atualizado para exigir queries concisas de 2-4 palavras e montagem full-bleed com overlays.
3. `lib/auto-media.mjs`: adicionados `cleanSearchQuery` e `buildTieredVideoQueries`; refinado o prompt do `choose` para barrar vídeos irrelevantes.
4. `lib/video-coverage-repair.mjs`: ordenação de candidatos prioriza a eliminação de redundâncias visuais reais antes de qualquer critério numérico.
5. `lib/editorial-review.mjs`: implementados `isSplitScreenLayout` e `detectVisualRedundancy` dentro de `reviewAuthoredBlocks`.
6. `renderer/src/SceneBackdrop.tsx` & `renderer/src/ShortsBackdrop.tsx`: paleta de contingência atualizada para carvão/ardósia neutro.
7. `tests/editorial-review.test.mjs`: novos testes unitários adicionados para validação de split-screens desnecessários e redundância visual.

## Validação e Resultados
- **160 testes unitários aprovados (`npm test`)** sem qualquer quebra ou regressão no pipeline.
- Detecção e aprovação de layouts testadas com sucesso: layouts em tela cheia com overlays aprovados; caixas divididas rejeitadas.

## Erros ou Limitações Abertos
- Nenhum erro de pipeline ou técnico em aberto no gerador.

## Próximo Passo Recomendado
- O usuário iniciar uma nova produção curta ou rodar um teste no painel para validar a nova estética cinematográfica full-bleed e a ausência do template repetitivo.
