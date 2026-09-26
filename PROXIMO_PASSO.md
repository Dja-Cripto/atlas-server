# Próximos passos aprovados — recuperação de cenas e personalidade editorial
**Atualizado em:** 26/09/2026 (America/Bahia).

Este arquivo registra decisões para implementação futura. Nenhum dos fluxos abaixo está ativo no gerador principal. Consulte `ULTIMO_PASSO.md` para o estado implementado e preserve a produção em andamento.

## 1. Recuperação de cenas por segundo modelo

- Manter até **3 tentativas com GLM-5.3-Flash** por cena. Se falharem, tentar até **2 vezes com um segundo modelo**; só depois recorrer ao template visual seguro já existente. As tentativas são por cena, sem reiniciar cenas aprovadas.
- Primeiro candidato para comparação: **Kimi K3**, disponível no OpenCode Go. Testar em cenas reais que falharam no GLM e medir aprovação técnica, qualidade visual, tempo e consumo. **Kimi K2.7 Code** é alternativa de menor custo, não escolha definitiva.
- Limitar o uso do template a **5% das cenas do vídeo**, conforme o total de cenas; acima disso, pausar com motivo e contagem visíveis no painel. Avaliar também falhas de reserva consecutivas. Definir arredondamento e regra para vídeos curtos após os testes.
- Implementar e validar separadamente da personalidade editorial abaixo. Não trocar o modelo principal apenas com base neste plano.

## 2. Personalidade editorial reconhecível

### Intenção aprovada

O canal deve soar e parecer escrito por uma pessoa curiosa, observadora e um pouco sarcástica. Ela percebe contradições, questiona explicações fáceis e às vezes reage com humor seco. Pode haver um exagero expressivo quando ele torna uma ideia memorável, **nunca exagero nos fatos**. A seriedade documental, o respeito por pessoas reais e a precisão continuam prioritários. Em temas delicados, ou quando o momento pede contemplação, não fazer piada.

Essa identidade é um **ponto de vista consistente**, não um conjunto de bordões, piadas obrigatórias ou efeitos repetidos. Nem todo capítulo, cena ou vídeo precisa ter humor. Variar intensidade, ritmo e recursos visuais conforme o assunto. A referência do piloto aprovado é a reação breve **“YES, THE DESERT.”** no vídeo sobre o Saara e a Amazônia: a surpresa nasce da informação e aparece no instante certo. **Não reutilizar a frase nem transformar seu desenho em template.**

### Implementação no gerador

1. Criar uma orientação editorial curta, central e versionada, compartilhada pelas etapas. Ela deve descrever voz, limites factuais, humor e tratamento visual sem prescrever frases ou layouts. Registrar sua versão e as decisões editoriais específicas de cada produção no estado persistido para que retomadas não mudem de personalidade no meio do vídeo.
2. Aplicar a orientação à geração e revisão do roteiro em `lib/providers.mjs`, mantendo a pesquisa como fonte dos fatos. O roteiro deve ter pensamento próprio, transições naturais e oportunidades de surpresa que venham do conteúdo. Fazer uma revisão editorial para remover texto genérico, sarcasmo forçado, repetição de recursos, ataques a pessoas e afirmações sem sustentação. Não impor uma cota de piadas nem alongar o vídeo só para mostrar personalidade.
3. Levar a intenção do texto à direção de narração em `lib/providers.mjs`: interpretação e pontuação devem permitir ironia sutil, surpresa ou silêncio conforme o trecho. Pausas curtas apenas quando o raciocínio termina ou a reação precisa respirar; não inserir silêncio longo no meio da explicação. Evitar uma instrução de voz fixa e excessivamente enérgica para todos os trechos.
4. Depois de obter a narração e seus tempos reais, identificar somente os momentos editoriais que merecem resposta visual. Propagar essas intenções para o planejamento em `lib/auto-plan.mjs`/`lib/automatic.mjs` e para a autoria Remotion em `lib/motion-author.mjs`. O robô pode escolher livremente enquadramento, texto, composição e movimento. Manter filmagem ou fotografia real como base; destacar uma informação ou uma reação por vez, sem sobrepor gráficos por obrigação. Uma cena pode permanecer limpa.
5. Sincronizar cada destaque ao trecho efetivamente falado, usando a transcrição com tempos por palavra, e verificar amostras de quadros antes de aprovar a cena. Conferir que o elemento surge quando a ideia é revelada, que está legível e que não oculta a mídia. Revisar o uso do frame local em componentes dentro de `Sequence`, pois o piloto mostrou que uma animação pode renderizar sem aparecer no tempo esperado se usar o frame global. A validação deve detectar falhas de timing, não exigir humor ou efeito em toda cena.
6. Testar isoladamente antes de ligar no robô principal: comparar versões atual e nova de roteiros, voz e vídeos curtos em assuntos diferentes, incluindo um tema sério em que o humor deva recuar. Avaliar com Daniel se a personalidade é audível e visível, se parece natural, se os fatos permanecem corretos e se áudio e imagem coincidem. Só então integrar, testar a retomada de produção, registrar checkpoint e liberar gradualmente para novas produções.

### Critério de aceitação

Após alguns vídeos, um espectador deve reconhecer o mesmo olhar editorial sem ouvir a mesma piada ou ver o mesmo efeito toda vez. Se a identidade só aparecer em instruções internas, mas não na narração e na montagem, a implementação ainda não terminou. Se o humor prejudicar precisão, respeito ou clareza, reduzir sua intensidade naquela passagem.

## Referência do teste isolado

O piloto local está em `scratch/personality-pilot-v2/` (roteiro, narração, transcrição e prévia). Ele é referência de tom e sincronização, não material a copiar para o gerador nem arquivo de produção a versionar.

## 3. Ajustes identificados no documentário longo de 15 minutos

**Relato de Daniel:** o vídeo pedido para 15 minutos terminou com cerca de 10 minutos; a trilha da categoria “canal dark sem copy” ficou quase inaudível; a abertura começou com imagem e pouco impacto; a opção de gerar Shorts estava marcada, mas eles não começaram após o vídeo principal; o MP4 de aproximadamente 10 minutos ficou perto de 1,5 GB. O vídeo atual pode ser usado. Corrigir o **gerador para as próximas produções**, sem refazer esta produção automaticamente.

### Duração fiel ao pedido

- Diagnóstico no código: `lib/providers.mjs` pede 125 palavras por minuto para vídeos longos e aceita até 18% abaixo dessa meta; `lib/automatic.mjs` usa a duração final do áudio como duração do vídeo. Não há uma verificação obrigatória entre a duração pedida e a narração sintetizada antes de avançar.
- Medir o resultado real após TTS, comparar com `j.minutes` e registrar pedido, roteiro (palavras), voz e diferença percentual no painel/log. Para 15 minutos, aceitar como meta **13–15 minutos**; tratar abaixo de 13 minutos (mais de 13,3% abaixo) como insuficiente. Não esticar cenas nem inserir silêncio para bater a meta.
- Quando a narração ficar curta, ampliar o roteiro com fatos verificados e desenvolvimento relevante, gerar nova voz e reavaliar **antes** de buscar mídias e programar cenas. Limitar revisões para não criar loop; se continuar abaixo do mínimo, pausar com motivo explícito e opção de revisão, preservando pesquisa e roteiro. Verificar também limites superiores para evitar vídeo muito maior que o pedido.
- Testar 5, 15 e 30 minutos, inclusive retomada de produção, e confirmar que a duração final corresponde à voz validada e que a qualidade narrativa não foi inflada artificialmente.

### Trilha audível sem encobrir a narração

- Diagnóstico no código: o catálogo fornece volume padrão de cerca de 6%; `lib/motion-author.mjs` reduz a 3% em cenas de gráfico. Esse multiplicador ignora o volume original de cada arquivo; uma trilha já baixa pode desaparecer. Não concluir que o problema foi apenas a categoria musical sem medir o áudio da faixa e do MP4.
- Medir a intensidade percebida da trilha selecionada e da voz; normalizar ou compensar a trilha **por arquivo**, depois aplicar ducking em relação à voz. Manter a fala clara e a música perceptível em trechos normais e de respiro, sem saltos bruscos ou distorção. Registrar os níveis/ganho aplicados e permitir ouvir amostras do início, meio e fim antes da aprovação.
- Validar especificamente a faixa usada neste vídeo e outras faixas de volumes diferentes; comparar o MP4 final, não só o MP3 original. Evitar aumentar indiscriminadamente todas as músicas com um número fixo.

### Abertura com vídeo real e impacto imediato

- Diagnóstico no código: a direção atual recomenda abertura forte, mas `lib/auto-plan.mjs` e o fluxo de mídia ainda podem deixar fotografia na primeira cena. A abertura em imagem observada por Daniel mostra que o requisito precisa ser verificado no resultado, não apenas escrito no prompt.
- Tornar **vídeo real relevante** a primeira preferência e condição da abertura: buscar alternativas de vídeo para os primeiros segundos, inclusive mídia contextual honesta quando a imagem exata não existir. Fotografia pode aparecer depois, com efeito adequado, mas não deve ser a primeira impressão do documentário longo. Se nenhuma filmagem legítima servir, pausar para revisão da abertura em vez de substituí-la silenciosamente por foto ou vídeo fora de contexto.
- Avaliar os primeiros 5–10 segundos com som e sem som: assunto reconhecível imediatamente, um foco central forte, movimento perceptível e gancho coerente com a fala; sem poluição de títulos. Preservar liberdade de composição no Remotion, sem impor uma animação fixa.

### Shorts automáticos quando solicitados

- Diagnóstico no código: `server.mjs` grava `generateShorts` e `shortsCount`, porém o ramo `automatic` finaliza o vídeo principal e coloca o projeto em revisão; a geração de Shorts só começa no ramo separado `shorts`. `lib/shorts.mjs` também aguarda ação humana entre Shorts. Isso explica o comportamento observado.
- Quando `generateShorts=true`, depois da validação/finalização do vídeo principal, iniciar automaticamente a etapa de Shorts e produzir os Shorts selecionados, um por vez, com estado persistido e retomada idempotente. Não recriar um Short já concluído. Se um Short falhar, registrar qual falhou e permitir retomada sem perder o vídeo principal nem os demais; exibir no painel que o principal está pronto e os Shorts ainda estão trabalhando.
- Quando a opção estiver desligada, encerrar após o principal. Testar os dois fluxos, falha intermediária, reinício do processo e geração completa sem clique adicional.

### MP4 menor com qualidade preservada

- Diagnóstico no código: o MP4 principal é H.264 1080p com `x264Preset:'ultrafast'` e `crf:24` em `lib/automatic.mjs`. Esse preset privilegia velocidade e pode exigir mais bits para qualidade semelhante. Aproximadamente 1,5 GB em 10 minutos equivale a cerca de **20 Mb/s**; o tamanho não impede necessariamente o upload ao YouTube, mas aumenta tempo de envio e armazenamento. Confirmar tamanho, duração e bitrate do arquivo real antes de concluir a causa.
- Fazer um benchmark com trechos representativos de vídeo real, fotos animadas e gráficos, comparando preset mais eficiente e parâmetros de qualidade/bitrate. Medir tamanho, tempo de render, nitidez, artefatos em movimento e legibilidade de texto em 1080p. Escolher um perfil que reduza tamanho sem piora visível relevante; não baixar resolução nem comprimir às cegas. Se o custo de render crescer demais, avaliar uma segunda passagem de compressão após o render e manter o arquivo final validado para reprodução.
- Mostrar tamanho estimado e tamanho final no painel; testar upload/download e retomada de render. Não definir um limite rígido de MB apenas pela duração: movimento e detalhe da imagem mudam a taxa necessária.

### Ordem de trabalho e aceite

1. Corrigir primeiro a duração antes da busca de mídia, pois ela determina roteiro, áudio e número de cenas.
2. Corrigir seleção/validação da abertura e mixagem de áudio; conferir amostras renderizadas do início, meio e fim.
3. Corrigir o encadeamento dos Shorts e a retomada após falhas.
4. Comparar exportações e escolher a configuração de MP4 com melhor equilíbrio de qualidade, tamanho e tempo.
5. Validar tudo numa **nova produção de teste**, sem alterar o vídeo de 10 minutos já aprovado para uso. Critérios: duração dentro da faixa, abertura em vídeo real convincente, música perceptível com voz clara, Shorts iniciados automaticamente quando marcados e arquivo menor sem perda visual relevante. Registrar medidas e atualizar `ULTIMO_PASSO.md` quando implementado.
