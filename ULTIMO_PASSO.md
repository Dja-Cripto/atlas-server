# Atlas Studio — geração visual com GLM
**Atualizado em:** 25/09/2026, aproximadamente 15:02 (America/Bahia).

## Versões
- V1 funcional: tag `atlas-visual-v1-checkpoint-2026-09-24`, commit `78b60db`; imagem `atlas-studio:visual-v1-checkpoint-2026-09-24` preservada no VPS.
- V2: branch `codex/atlas-visual-v2`. Reversão em `CHECKPOINTS.md`.

## Diagnóstico
- No teste `The 13-Kilometer Gap Between Europe and Africa`, a direção global e as primeiras cenas chegaram aos limites de tempo com a configuração anterior. Chave, endpoint e streaming da OpenCode responderam normalmente a chamadas fictícias feitas no mesmo VPS; o robô estava chamando a API. Chamadas abortadas podem não aparecer como inferências concluídas no painel da OpenCode.
- O GLM-5.3-Flash usava o nível padrão de raciocínio `max`. Em teste sintético, `low` concluiu em 34 s; o padrão excedeu 60 s. Com `low`, a produção retomada programou as nove cenas sem reserva visual em 587,8 s e entrou na validação do render.
- As tentativas restantes foram respostas incompletas ou TSX inválido do modelo, não falhas de conexão. Exemplo observado: aspas duplicadas na cor de uma borda; outro retorno não tinha o código solicitado. O modelo corrigiu essas cenas nas tentativas seguintes.

## Alterações
- As chamadas visuais ao GLM-5.3-Flash, inclusive direção e Shorts, enviam `reasoning_effort: low` sem limitar a liberdade de composição.
- O log diferencia timeout antes da resposta HTTP e durante o stream após HTTP 200; foi corrigida a corrida no cancelamento do stream que podia causar repetição desnecessária.
- Ao retomar produção, cenas de reserva são reprogramadas e cenas válidas são preservadas.
- O gerador repara localmente um erro comum de aspas em cores de bordas, evitando uma chamada adicional. Respostas inválidas passam a registrar e mostrar no painel se faltou código, transição ou se o TSX não passou na validação.
- Permanecem as regras visuais: vídeo descritivo pode ficar limpo; fotografia tem animação; dados relevantes recebem explicação visual; falhas sistêmicas pausam cedo.

## Validação, limites e próximo passo
- 102/102 testes locais aprovados; TypeScript do renderizador aprovado. As nove cenas do teste foram programadas sem reserva. A validação da prévia e o MP4 final ainda não haviam terminado neste registro.
- Próximo passo: concluir a validação e o render deste teste, verificar o arquivo final e publicar a última correção de diagnóstico no VPS quando a produção não estiver ativa. Ainda falta avaliação editorial do vídeo final.