# Atlas Studio — geração visual com GLM
**Atualizado em:** 25/09/2026, aproximadamente 15:28 (America/Bahia).

## Versões
- V1 funcional: tag `atlas-visual-v1-checkpoint-2026-09-24`, commit `78b60db`; imagem `atlas-studio:visual-v1-checkpoint-2026-09-24` preservada no VPS.
- V2: branch `codex/atlas-visual-v2`. Procedimento de reversão em `CHECKPOINTS.md`.

## Estado e diagnóstico
- O teste `The 13-Kilometer Gap Between Europe and Africa` chegou a `review`: MP4 final 1080p, capa e metadados concluídos; nove cenas programadas pelo GLM sem reservas após usar `reasoning_effort: low`.
- O vídeo concluído ainda usou o plano visual anterior: três mapas, dois diagramas sem filmagem e uma cena sem mídia. Cobertura: 32,2% de vídeo/foto. A cena do oceano perdeu a mídia por `Arquivo de mídia muito grande`; o reparo ficou pendente, mas o fluxo antigo continuou e renderizou. O limitador de mapas aceitava intenções diferentes como exceção e o planejador inseria diagramas sem buscar filmagem.
- A conectividade com a OpenCode funciona. Os timeouts anteriores decorreram principalmente do raciocínio padrão `max` do GLM-5.3-Flash; respostas incompletas ou TSX inválido explicaram tentativas adicionais. O painel da OpenCode pode não listar streams cancelados como inferências concluídas.

## Alterações
- O plano de cerca de um minuto aceita no máximo um mapa e não encadeia mapas, mesmo quando o modelo descreve intenções diferentes. Diagramas e gráficos viram explicações Remotion sobre vídeo real; títulos abstratos também passam pela busca de mídia.
- A busca tenta outra fonte quando o arquivo escolhido é grande demais. Se a cena continuar sem material, a produção pausa antes da animação. Para vídeos com pelo menos 30 s e cinco cenas, o fluxo exige 80% de mídia real e 75% de vídeo, medidos antes de programar o Remotion.
- O código de cena com vídeo/foto selecionado deve exibir essa mídia. Nomes de países no mapa e no código só aparecem como destaque quando falados na cena; marcador de capítulo não narrado é rejeitado. A direção visual pede um foco por vez e preserva a liberdade de composição.
- Permanecem: `reasoning_effort: low`, diagnóstico de timeout/validação, reparo de aspas simples no TSX, retomada de cenas de reserva, fotos sempre animadas e efeitos sobre dados narrados.

## Validação e próximo passo
- 105/105 testes locais aprovados e TypeScript do renderizador aprovado. Teste de regressão reproduz a sequência problemática de nove cenas e verifica mapa único, explicações sobre vídeo e rótulos sincronizados com a fala.
- Próximo passo: atualizar o VPS com esta versão após confirmar que não há produção ativa; gerar um novo vídeo de teste para verificar editorialmente a nova proporção de filmagem e os efeitos. O MP4 já concluído não foi alterado e ainda mostra o plano antigo.