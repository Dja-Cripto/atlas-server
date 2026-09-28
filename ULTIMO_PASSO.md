# Atlas Studio — estado atual

Atualizado em 28/09/2026, aproximadamente 14:45 (America/Bahia).

## Último trabalho
- **Correção da descoberta e seleção de mídia (`lib/auto-plan.mjs`, `lib/auto-media.mjs`)**:
  - `hasLocation` reformulado para rejeitar animais/aves (`phasianus`, `birds`, `galliformes`) em correspondências geográficas e exigir validação de termos compostos, eliminando vídeos de faisão ave em "Pheasant Island".
  - `candidatePool` ampliado para até 18 candidatos com intercalação de exatas e contextuais, avaliados em lotes sucessivos de 6 via `chooseBatch` sem descarte cego de candidatos remanescentes.
  - `reusableMediaCandidates` e `reusableAssetFromCache`: corrigida a checagem de reuso (`!candidate.files?.length`), impedindo que fotografias contornassem limites de uso; bloqueada repetição consecutiva da mesma imagem.
  - Adicionadas variantes de busca por entidades locais e idiomas regionais (*Isla de los Faisanes*, *Île des Faisans*, *Konpantzia*, *Bidasoa*, *Hendaye*, *Irun*).
  - Geração de capas mantida desativada temporariamente para testes (`thumbnailGenerationDisabled`).

## Estado verificado
- **Produção teste de 1 minuto validada com 100% de sucesso**:
  - Job `5423368f-44bc-4d10-8f23-6284f1d8f0b9` (Run `d679d649-9b9c-4fb0-ab5d-fcee9fc2c6b6`): 56,7 s, 1080p Full HD (1.699 quadros), 131,95 MB.
  - **100% de cobertura com mídias reais**: 4 vídeos reais distintos (abertura aérea do Rio Bidasoa em 1080p por Marc Espejo, tomadas de Irún e Hendaye por Quahadi, e tomada aérea por Marian Croitoru) e 6 fotografias autênticas (Ignacio Gavira, Iñaki LL [fotos de 2025 de ângulos distintos] e monumento do Tratado dos Pireneus de 1659 por Tangopaso).
  - **Zero fotos duplicadas em loop**: o problema de repetição da mesma imagem entre os segundos 12 e 50 foi completamente resolvido.
  - **Zero falsos-positivos de aves**: nenhuma mídia de pássaros foi selecionada.
  - **Geração de capas**: pulada com sucesso sem travar a finalização do pacote.
  - Todos os 161 testes automatizados passando (`npm test`).

## Limitações e observações abertas
- Temas hiperlocais (como a Ilha dos Faisões, um pedaço de terra de 200m) têm acervo público factual finito na internet, sendo adequados para vídeos de 1 a 2 minutos, mas insuficientes para vídeos longos de 10 a 15 minutos sem repetição.
- Temas longos exigirão uma etapa prévia de mensuração de inventário para garantir que haja material antes de produzir o vídeo completo.

## Próximo passo recomendado
- Implementar a etapa de **pré-validação de inventário de mídia** para a fila de agendamento automático da meia-noite:
  - Avaliar o volume de mídias reais encontradas para o tema antes de roteirizar/narrar;
  - Se o acervo for insuficiente para a duração mínima de 10 minutos (10-15 min), avançar automaticamente para o próximo tema da lista.

## Plano seguinte aprovado — 28/09/2026
- PROXIMO_PASSO.md foi substituído pelo escopo atual: pré-pesquisa econômica para no mínimo dez minutos, principal de 10–15 min, cinco Shorts sequenciais, banco com cinco sugestões, fila única manual/agendada à meia-noite America/Bahia e avisos persistentes.
- Resultado curto aprovado por Daniel; não reabrir reconstrução visual/busca já realizada como tarefa automática. Afirmar insuficiência de temas somente após avaliação, não pelo caráter hiperlocal.
- Capas e publicação devem permanecer desligadas. Dois dias de teste não autorizam postagem automática ao final.
- Esta atualização é somente documental: não foram inseridas ideias no banco ativo, criados agendamentos, alterado código ou implantado servidor. Próximo executor implementa/valida e depois atualiza servidor conforme plano.
- Validação desta etapa: revisão do documento contra o pedido; sem testes ou chamadas pagas. O próximo passo recomendado acima é substituído pelo plano completo em PROXIMO_PASSO.md.
