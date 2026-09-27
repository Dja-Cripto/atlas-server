# Atlas Studio — estado atual
**Atualizado em:** 27/09/2026, aproximadamente 10:45 (America/Bahia).

## Versões
- V2 funcional preservada na tag `atlas-visual-v2-checkpoint-2026-09-26` (commit `d64e2ea`); procedimento de retorno em `CHECKPOINTS.md`.
- V3 em `codex/atlas-visual-v3`. Alterações atuais beneficiam novas produções; vídeos já renderizados são preservados.

## Estado validado da V3
- Vídeo de teste “Why Does Tokyo Have So Many Vending Machines?”: 52 segundos, Full HD, 9 cenas de vídeo real, narração e trilha equilibradas, sem tela vazia. Um clipe de loja indiana apareceu numa cena contextual de Tóquio; o filtro agora rejeita mídia explicitamente identificada como outro país. O Short vertical desse projeto estava em renderização durante esta revisão e ainda exige inspeção visual após concluir.
- Música documental e de Shorts usa lista revisada, sem rock/horror por padrão. Faixas são normalizadas antes da mistura; se a normalização falhar, a cópia é descartada para manter voz limpa, nunca uma trilha desequilibrada.
- Projetos marcados para cinco Shorts agora executam os cinco em sequência também ao iniciar a etapa Shorts manualmente. Um projeto criado sem essa opção continua gerando apenas um Short por ação manual.
- Agendador do Banco de Pautas usa dia/hora da Bahia, recupera a execução quando passa do minuto configurado, persiste a data após iniciar e aguarda a produção ativa terminar. Pautas adicionadas depois do horário ainda podem iniciar no mesmo dia se nenhuma começou. Agendamento de publicação exige MP4 principal e, quando cinco Shorts foram solicitados, todos os cinco MP4s prontos.

## Validação e limites
- Suíte `npm test`: 133 testes aprovados. Testes específicos cobrem sequência, horário diário, música sem normalização, mídia de país errado e agendamento incompleto.
- Projeto de teste de Tóquio está configurado com `generateShorts=false` e `shortsCount=0`; por isso o Short manual é 1/1. O Banco de Pautas está ativo mas sem pautas pendentes. Publicação automática está desligada; o agendamento só prepara a fila e não envia ao YouTube até a integração e a chave de publicação estarem prontas.
- O Short precisa de revisão do MP4 final. Deploy/integrações no servidor ainda não foram verificados nesta máquina. Fallback do roteiro Luna para Gemini continua não implementado após rejeição anterior da revisão automática de autorização.
- Arquivos de benchmark e alterações paralelas fora desta revisão não foram incorporados ao snapshot.

## Próximo passo recomendado
Assim que o Short terminar, conferir proporção vertical, legendas, mídias e áudio. Depois enviar a V3 ao servidor, configurar pautas e publicação conforme desejado e fazer uma produção marcada para cinco Shorts, verificando a sequência completa e a fila de agendamento.
