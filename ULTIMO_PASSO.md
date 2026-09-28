# Atlas Studio — estado atual

Atualizado em 28/09/2026, aproximadamente 15:25 (America/Bahia).

## Último trabalho
- **Pré-pesquisa econômica de viabilidade (`lib/topic-presearch.mjs`)**:
  - Delineamento narrativo em 4 blocos estruturados via IA sob teto rígido de US$ 0,10 por tema (custo real observado de ~$0,000135 por avaliação).
  - Consulta de acervo em fontes abertas e gratuitas (Wikimedia Commons para fotos e vídeos, Pexels e Library of Congress) com deduplicação atômica de mídias.
  - Critérios de suficiência para vídeos longos de 10 a 15 minutos (mínimo de 600 segundos): exigência de filmagem real de abertura (duração >= 6s), no mínimo 20 mídias distintas e cobertura de blocos essenciais.
  - Temas com material insuficiente são marcados com `insufficient`, sem travar a fila, registrando as lacunas e persistindo o inventário em `data/presearch/${topicId}.json`.
- **Fila única persistente, trava do worker e agendamento às 00:00 (`lib/topics.mjs`)**:
  - Implementada trava única por lease persistido em disco (`data/worker.lease`) com renovação periódica e expiração automática, impedindo concorrência entre requisições manuais e o disparo diário.
  - Disparo idempotente diário às 00:00 (America/Bahia) com limite agregado de até 10 temas e US$ 1,00 diário de pré-avaliação.
  - Avanço automático na fila quando um tema é insuficiente ou duplicado até encontrar um tema aprovado para o dia.
  - Semeado banco com as 5 ideias editoriais iniciais aprovadas (`v3-japan-earthquake-design`, `v3-netherlands-water-life`, `v3-singapore-water`, `v3-panama-canal-journey`, `v3-mongolia-seasons`).
  - Alerta persistente emitido para temas com acervo insuficiente: *"Daniel, o tema [título] não teve conteúdo suficiente para um vídeo de 10 minutos."*
- **Interface e visibilidade no Hub e Banco de Pautas (`public/app.js`, `public/style.css`)**:
  - Badges e filtros para os novos estados (`pre_evaluating`, `insufficient`, `inconclusive`, `approved`).
  - Exibição de métricas da pré-pesquisa (vídeos, fotos e custo de token em cada pauta).
  - Botão de reavaliação manual para pautas marcadas como insuficientes ou inconclusivas.
- **Suíte de testes automatizados (`tests/topic-presearch.test.mjs`)**:
  - Testes unitários para cálculo de custo de tokens, deduplicação, semeadura idempotente e concorrência com lease de worker.

## Estado verificado
- **165 testes automatizados passando com 100% de sucesso (`npm test`)**:
  - 165 pass, 0 fail.
- **Servidor ativo e operacional (`http://localhost:4310`)**:
  - Endpoints `/api/topics` e `/api/hub` respondendo com 200 OK e 5 pautas na fila.
  - Disparo automático ativo para 00:00 (America/Bahia).
  - Geração de capas mantida desativada (`thumbnailGenerationDisabled: true`) para economia de testes.
  - Publicação automática mantida pausada.

## Erros ou limitações que continuam abertos
- A publicação e a geração de capas continuam deliberadamente desligadas durante o período de testes.
- A aprovação de mídia na pré-pesquisa é uma estimativa fundamentada de acervo público; a adequação editorial final ocorre durante o download e montagem das cenas.

## Próximo passo recomendado
- Daniel pode acompanhar o ciclo automático da meia-noite ou disparar uma produção manual no painel para validar a geração completa de 10-15 minutos e os 5 Shorts sequenciais no novo fluxo.
