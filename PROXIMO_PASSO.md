# Próximo passo — recuperação de cenas por segundo modelo
**Atualizado em:** 26/09/2026 (America/Bahia).

Este arquivo guarda decisões para testes futuros. Ele não altera a configuração do robô em produção. O estado já implementado continua em `ULTIMO_PASSO.md`.

## Recuperação de cenas por segundo modelo
- Fluxo proposto: até 3 tentativas com GLM-5.3-Flash; se a cena ainda falhar, até 2 tentativas com um segundo modelo; só então usar o template visual seguro já existente.
- Primeiro candidato para o teste comparativo: **Kimi K3**, disponível no OpenCode Go. Comparar em cenas reais que falharam no GLM; medir aprovação técnica, qualidade visual, tempo e consumo. **Kimi K2.7 Code** é alternativa de menor custo, não escolha definitiva.
- Limite proposto para templates: até **5% das cenas do vídeo**, calculado pelo total de cenas; acima disso, pausar com motivo e contagem visíveis no painel. Avaliar também uma sequência excessiva de reservas. Os números exatos para vídeos muito curtos dependem do teste.
- Nada deste fluxo foi ativado no gerador principal.
