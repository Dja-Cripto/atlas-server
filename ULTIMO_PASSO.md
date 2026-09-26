# Atlas Studio — Continuidade da produção
**Atualizado em:** 26/09/2026, aproximadamente 15:10 (America/Bahia).

## Versões
- V1 funcional: tag `atlas-visual-v1-checkpoint-2026-09-24`, commit `78b60db`; imagem preservada no VPS.
- V2: branch `codex/atlas-visual-v2`. Reversão em `CHECKPOINTS.md`.

## Estado relevante
- A produção longa *Iceland: The Country Where Earth Is Still Being Created* tem 106 cenas. A busca visual foi concluída e a programação parou na cena 57; as 56 anteriores foram preservadas. O MP4 e os Shorts ainda não estavam concluídos.
- A cena 57 recebeu código do GLM, mas três respostas falharam em validações diferentes. A última falhou apenas no plano de tempos da animação. O bloqueio final foi causado pelo limite rígido de três cenas de reserva, já consumido pelas cenas 1, 6 e 26.

## Correção
- Planos de tempo inválidos retornados pelo modelo são reconstruídos localmente a partir da intenção da cena; o código visual ainda precisa passar por todas as validações técnicas e factuais.
- A reserva visual pode cobrir até 5% das cenas, com mínimo de duas (seis em 106), e até três cenas consecutivas. Exceder o limite pausa a produção e mantém as cenas já prontas.
- Na retomada, cenas de reserva já validadas são reutilizadas e continuam contabilizadas no limite; o robô não repete chamadas do modelo nem reinicia a contagem para elas.

## Validação e próximo passo
- 114/114 testes locais aprovados, incluindo recuperação de plano de tempo inválido e retomada de cenas de reserva. `git diff --check` aprovado.
- Correção publicada no VPS (commit `82f2a56`), serviço reiniciado e produção retomada. As cenas prontas foram reutilizadas; a cena 57 passou e o robô avançou para a cena 58 sem aumentar as três reservas existentes. A conclusão do vídeo ainda não foi validada.
- Próximo passo: acompanhar as demais cenas, a renderização do MP4 e os Shorts; revisar o resultado pelo painel.
