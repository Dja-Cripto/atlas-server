# Atlas Studio — estado da geração visual
**Atualizado em:** 25/09/2026, aproximadamente 21:00 (America/Bahia).

## Versões
- V1 funcional: tag `atlas-visual-v1-checkpoint-2026-09-24`, commit `78b60db`; imagem correspondente preservada no VPS.
- V2: branch `codex/atlas-visual-v2`. Reversão descrita em `CHECKPOINTS.md`.

## Estado relevante
- O vídeo *How Mongolia’s Nomadic Herders Follow the Seasons* concluiu 42 cenas. O usuário e avaliações externas consideraram boa a correspondência entre narração e mídia, os gráficos e a estabilidade visual. Restaram ajustes pontuais de ritmo e dos momentos de abertura e encerramento.
- A correção anterior da busca mantém vídeo/fotografia reais como prioridade e trata as metas de proporção como orientação editorial, sem bloquear uma produção que já tem representação válida. A correção de `endAt` continua preservada.

## Ajustes desta revisão
- O roteiro pede `[PAUSE]` apenas após uma explicação encerrada; a geração de voz aceita a pausa explícita somente depois de frase completa e no máximo três vezes. O silêncio adicionado caiu de 2,5 s para 0,9 s. A espera inicial caiu para 0,7 s, e a cauda final ficou em 2,3 s.
- A direção da primeira cena exige um foco visual central ou próximo do centro, com assunto real e um gancho legível quando fizer sentido, sem se limitar a legenda de canto. A última cena deve concluir visualmente o raciocínio. A composição do vídeo longo aplica fade curto para preto e reduz a música no fim. Shorts e cenas intermediárias não receberam mudança de estilo.
- As alterações atuam no gerador para as próximas produções; nenhum arquivo do vídeo já concluído foi substituído.

## Validação, limitações e próximo passo
- 109/109 testes locais aprovados. Ensaio sintético em Remotion renderizou vídeo horizontal e vertical com sucesso após o ajuste final.
- A verificação geral de estilo do renderizador ainda acusa 171 erros em cenas geradas/ignoradas e arquivos existentes; não são introduzidos por esta revisão. A duração de pausas naturais produzidas pelo Fish Audio e o resultado artístico da nova abertura ainda precisam ser observados em um vídeo novo.
- Próximo passo: gerar uma nova produção curta pelo painel e avaliar a primeira cena, o silêncio entre ideias e os segundos finais antes de ampliar qualquer outra mudança.