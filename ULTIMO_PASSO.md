# Atlas Studio — Agendamento de Produção Noturna e Suporte ao Hub
**Atualizado em:** 25/09/2026, aproximadamente 21:28 (America/Bahia).

## Versões
- V1 funcional: tag `atlas-visual-v1-checkpoint-2026-09-24`, commit `78b60db`; imagem preservada no VPS.
- V2: branch `codex/atlas-visual-v2`. Reversão em `CHECKPOINTS.md`.

## Estado relevante
- Avaliação detalhada do vídeo de 4m12s da Mongólia entregue ao criador (gancho forte, roteiro com arco narrativo das 4 estações e tensão econômica, imagens reais com alta coerência como a van russa 4x4 e Ulaanbaatar).
- Configuração de publicação para o YouTube verificada: workflow no n8n está ativo (`youTubeOAuth2Api`), e a chave de publicação automática permanece desligada no painel conforme solicitado para testes manuais futuros.

## Ajustes desta revisão
- **Suporte ao criador no store (`lib/store.mjs`)**: Adicionado o método `create` em `createStore`, permitindo que o agendador autônomo e o Hub de pautas instanciem novos jobs com segurança sem erros de execução.
- **Pauta agendada para a virada**: Tema selecionado para o canal: *"Why 90% of Australia Is Completely Empty"* (5 minutos, com geração automática dos 5 Shorts verticais habilitada).
- **Garantia de disparo**: Configurado para início automático às 23:45 (America/Bahia) pelo agendador autônomo do container Docker `atlas-studio`. Fila e parâmetros validados diretamente dentro do container.

## Validação e próximo passo
- 109/109 testes unitários locais aprovados (`npm test`).
- Verificação direta via Docker no VPS: `autoRunTime: "23:45"`, `enabled: true`, 1 pauta na fila com `generateShorts: true`.
- Próximo passo: O robô iniciará a produção às 23:45; Daniel revisará o vídeo principal e os 5 Shorts amanhã pelo painel web.