# Atlas Studio — Continuidade da produção
**Atualizado em:** 26/09/2026, aproximadamente 11:40 (America/Bahia).

## Versões
- V1 funcional: tag `atlas-visual-v1-checkpoint-2026-09-24`, commit `78b60db`; imagem preservada no VPS.
- V2: branch `codex/atlas-visual-v2`. Reversão em `CHECKPOINTS.md`.

## Estado relevante
- A produção longa *Iceland: The Country Where Earth Is Still Being Created* tem 106 cenas e parou na revisão visual de `shot-79`, antes das animações e antes dos Shorts. As demais 105 cenas estavam resolvidas; roteiro, narração e mídias ficam preservados para retomada.
- A busca encontrou milhares de candidatos, mas a recuperação armazenada sugeriu `kind: "video"`; a revisão aceitava apenas `footage`. Era um erro de normalização, não evidência de que não existe mídia para o tema.

## Correção
- A revisão visual passou a aceitar aliases de mídia que já são aceitos no planejamento, mantendo a exigência de um arquivo real validado.
- Quando uma cena falha, o robô tenta reaproveitar mídia já revisada do mesmo local antes de repetir buscas; a seleção passa novamente pela revisão visual e não aceita vídeo mais curto que a cena.
- Se a mídia real continuar indisponível, o modelo de imagem já configurado cria uma ilustração editorial Full HD para aquela cena. Ela recebe animação, não é apresentada como registro do local exato e não entra na contagem de fotografia real. Se a imagem também falhar na geração/validação, a cena segue bloqueada para evitar quadro vazio.
- A mesma recuperação vale para Shorts; eles podem consultar a mídia já salva do vídeo principal e não avançam com cena sem mídia ou ilustração.
- O vídeo principal continua independente dos Shorts. Os Shorts só podem começar após o MP4 principal estar pronto e validado.

## Validação e próximo passo
- 113/113 testes locais aprovados; testes novos cobrem o alias `video`, mídia do mesmo local, duração insuficiente e ilustração sem inflar a contagem de mídia real. Sintaxe e `git diff --check` aprovados.
- Limitação: a adequação artística da mídia recuperada ou da ilustração para `shot-79` ainda depende da execução real durante a retomada; nenhuma cena vazia será liberada.
- Próximo passo: publicar esta correção no VPS e retomar apenas a produção interrompida da Islândia, preservando as 106 cenas já planejadas.