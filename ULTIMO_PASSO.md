# Atlas Studio — estado atual

Atualizado em 28/09/2026, aproximadamente 13:30 (America/Bahia).

## Último trabalho
- Implementadas todas as diretrizes do `PROXIMO_PASSO.md` no pipeline do gerador:
  - `lib/opening-recovery.mjs`: suporte a queries contextuais/regionais e relaxamento de filtros estritos (`narrativeRole = 'context'`, subject neutro) para vídeos de abertura quando a localidade exata é uma micro-ilha/marco sem stock direto, garantindo abertura em filmagem real e contextual legítima.
  - `lib/automatic.mjs`: remoção da regra que deletava vídeo contextual ao retomar produção; exclusão explícita de mídias de cenas adjacentes na etapa de materialização de visuais; inserção de loop de reparo pre-continuidade (`detectConsecutiveMedia`) para eliminar mídias repetidas consecutivas.
  - `lib/motion-author.mjs` e `lib/v3-direction.mjs`: remoção de obrigação de tela cheia/Ken Burns em 100% das fotos; introdução de layout de enquadramento documental (`contain` com moldura e cards de métricas) sem deformação ou zoom forçado; permissão para fotos descansarem sem animação agressiva contínua.
  - `lib/auto-media.mjs`: trava de uso único para imagens de evidência (`maxAllowed = 1`), impedindo repetição da mesma foto ao longo da linha do tempo.
  - `lib/visual-continuity.mjs`: ajustes na tolerância de pacing e diversidade de mídia.
- Atualizado `PROXIMO_PASSO.md` com status de implementação e recomendações seguintes.

## Validação e resultado
- Testes automatizados executados via `npm test`: 161 testes passaram com 0 falhas.
- Produção de teste de 1 minuto executada com sucesso (`df6fb0ba-7683-413f-a4df-0747ccc938e0`, Pheasant Island, 56.70s, 1920x1080):
  - Cena 1 (abertura): Filmagem aérea real de ilha fluvial (`Pexels:5664876`) com card documental cinematográfico.
  - Cena 2: Filmagem real do Rio Bidasoa (`Wikimedia Commons:132520796`) com escala geográfica Hendaye-Irun.
  - Cena 3: Foto real (`Wikimedia Commons:11260833`) com layout contido (`contain`), moldura arquitetural e régua de escala métrica, sem zoom forçado.
  - Mídias consecutivas: Zero repetições consecutivas de imagens ou vídeos.
  - Render Remotion: 100% concluído no arquivo `video-12e0e521-ea8f-499f-afc8-47c8e174b15a.mp4`.

## Limitações abertas
- Na renderização sem aceleração de GPU (CPU ARM64), cenas com overlays SVG complexos ou filtros exigem render com concorrência moderada.
- Produções longas (>5 min) devem continuar monitorando a taxa de acerto de vídeos em queries geográficas obscuras.

## Próximo passo recomendado
- Realizar teste de produção completa com duração média (3 a 5 minutos) com Shorts habilitados para validar o pipeline fim a fim em escala real.
