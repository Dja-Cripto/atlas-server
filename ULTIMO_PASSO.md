# Atlas Studio — geração visual com GLM
**Atualizado em:** 25/09/2026, aproximadamente 14:47 (America/Bahia).

## Versões
- V1 funcional: tag `atlas-visual-v1-checkpoint-2026-09-24`, commit `78b60db`; imagem `atlas-studio:visual-v1-checkpoint-2026-09-24` preservada no VPS.
- V2: branch `codex/atlas-visual-v2`. Reversão em `CHECKPOINTS.md`.

## Diagnóstico
- No teste `The 13-Kilometer Gap Between Europe and Africa`, a direção global e duas cenas chegaram aos limites de tempo; a primeira usou reserva visual e a produção pausou na segunda por falha recorrente. Pesquisa, voz, plano e mídias foram preservados.
- Chave, endpoint e streaming da OpenCode responderam normalmente a chamadas fictícias do mesmo VPS. O GLM-5.3-Flash não recebe nível de raciocínio no código anterior; o fabricante informa que o padrão é `max`. Em teste sintético, `low` concluiu em 34s; o padrão excedeu 60s. Esta diferença é evidência de custo de raciocínio, mas a taxa real de acerto precisa ser validada na produção retomada.
- Chamadas canceladas por timeout podem não aparecer como inferências concluídas na tela da OpenCode. O log local anterior também escondia se a resposta HTTP já tinha chegado.

## Alterações
- As chamadas visuais ao GLM-5.3-Flash, inclusive direção e Shorts, enviam `reasoning_effort: low` sem trocar de modelo nem limitar a liberdade de composição.
- O log informa se o timeout ocorreu antes da resposta HTTP ou durante o stream após HTTP 200. Corrigida a corrida entre cancelamento do stream e sinalização de timeout, que podia gerar resposta vazia e repetição desnecessária.
- Ao retomar uma produção, cenas que usaram reserva visual são reprogramadas; cenas válidas continuam preservadas.
- Continuam válidas as regras visuais: vídeo descritivo pode ficar limpo, fotografia tem animação, dados relevantes recebem explicação visual e falhas sistêmicas pausam cedo.

## Validação e próximo passo
- 101/101 testes locais aprovados; TypeScript do renderizador aprovado. Testes incluem `reasoning_effort`, retomada de reserva e timeout após HTTP 200.
- Atualizar o VPS sem produção ativa, retomar o mesmo teste e conferir se cenas passam a ser programadas e se a OpenCode registra as chamadas concluídas. Ainda não há validação editorial do novo vídeo.