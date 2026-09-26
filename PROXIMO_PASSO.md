# Atlas Visual V3 — próximos passos aprovados
**Atualizado em:** 26/09/2026 (America/Bahia).

Este arquivo registra o plano aprovado para a V3. O checkpoint funcional da V2 é `atlas-visual-v2-checkpoint-2026-09-26` (commit `d64e2ea`). Nenhuma decisão abaixo está ativa no gerador principal antes da implementação e validação. Consulte `ULTIMO_PASSO.md` para o estado implementado; preserve produções em andamento.

## 1. Recuperação de cenas e proteção da produção na V3

- O modelo principal para cenas que exigem autoria visual passa a ser **GPT-6 Luna**. Manter até **3 tentativas por cena**, com validação e feedback específico do erro; não recriar cenas já aprovadas ao retomar.
- Se as três tentativas falharem, testar até **2 tentativas com um segundo modelo** capaz de gerar código Remotion (candidato inicial: GLM-5.3-Flash; avaliar Qwen 3.7 Plus e outros pelos testes). A escolha final depende de taxa de compilação, qualidade e custo no fluxo real. Esse segundo modelo é recuperação, não uma chamada obrigatória para cenas simples.
- Depois de falha dos dois modelos, usar um componente local seguro sobre a mídia real já selecionada, com texto curto coerente com a narração e animação discreta. Não usar tela vazia, fotografia parada ou gráfico escuro genérico. Registrar a causa, a cena e o recurso de reserva no painel.
- Limitar cenas de reserva a aproximadamente **5% do total do vídeo** e evitar falhas consecutivas. Definir arredondamento e regra adequada para vídeos curtos antes de ativar. Ao ultrapassar o limite, pausar com contagem e motivo visíveis; preservar tudo que já foi concluído.
- Distinguir erros do modelo, validação de código, falta de mídia e renderização. Corrigir a causa recorrente no gerador; a reserva impede que uma falha isolada interrompa uma produção longa.

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
- Validar a **duração da própria narração**, não apenas contar palavras nem medir o MP4 pronto: depois do TTS, medir o arquivo de voz e comparar com `j.minutes`. Registrar pedido, roteiro (palavras), duração da voz e diferença percentual no painel/log. Para 15 minutos, aceitar como meta **13–15 minutos**; abaixo de 13 minutos (mais de 13,3% abaixo) é insuficiente. Esta validação é uma condição para avançar à busca de mídia, ao planejamento e à renderização.
- Se a voz ficar curta, voltar ao **roteiro e à narração**: ampliar o texto com fatos verificados, explicações e transições que acrescentem conteúdo, gerar a voz novamente, medir o novo áudio e repetir a validação. Se a voz ficar longa demais, editar o texto e sintetizar outra vez. Não resolver a diferença esticando cenas, diminuindo a velocidade artificialmente, repetindo imagens ou inserindo silêncio. O vídeo deve acompanhar a duração da narração já aprovada.
- Limitar as revisões para não criar loop; se a voz continuar fora da faixa, pausar com motivo explícito e opção de revisão, preservando pesquisa, versões do roteiro e áudio para diagnóstico. Não produzir o vídeo principal com uma narração que falhou nessa etapa.
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

### MP4 menor com qualidade preservada — adiado

- Diagnóstico no código: o MP4 principal é H.264 1080p com `x264Preset:'ultrafast'` e `crf:24` em `lib/automatic.mjs`. Esse preset privilegia velocidade e pode exigir mais bits para qualidade semelhante. Aproximadamente 1,5 GB em 10 minutos equivale a cerca de **20 Mb/s**; o tamanho não impede necessariamente o upload ao YouTube, mas aumenta tempo de envio e armazenamento. Confirmar tamanho, duração e bitrate do arquivo real antes de concluir a causa.
- Depois de medir um upload real para o YouTube, se o tamanho se mostrar um problema, fazer um benchmark com trechos representativos de vídeo real, fotos animadas e gráficos, comparando preset mais eficiente e parâmetros de qualidade/bitrate. Medir tamanho, tempo de render, nitidez, artefatos em movimento e legibilidade de texto em 1080p. Escolher um perfil que reduza tamanho sem piora visível relevante; não baixar resolução nem comprimir às cegas. Se o custo de render crescer demais, avaliar uma segunda passagem de compressão após o render e manter o arquivo final validado para reprodução.
- Mostrar tamanho estimado e tamanho final no painel; testar upload/download e retomada de render. Não definir um limite rígido de MB apenas pela duração: movimento e detalhe da imagem mudam a taxa necessária.

### Ordem de trabalho e aceite

1. Corrigir primeiro a duração antes da busca de mídia, pois ela determina roteiro, áudio e número de cenas.
2. Corrigir seleção/validação da abertura e mixagem de áudio; conferir amostras renderizadas do início, meio e fim.
3. Corrigir o encadeamento dos Shorts e a retomada após falhas.
4. Medir o tempo de upload do MP4 atual; só alterar a exportação se houver necessidade demonstrada, conforme combinado com Daniel.
5. Validar tudo numa **nova produção de teste**, sem alterar o vídeo de 10 minutos já aprovado para uso. Critérios: duração dentro da faixa, abertura em vídeo real convincente, música perceptível com voz clara, Shorts iniciados automaticamente quando marcados; medir tamanho e tempo de upload sem exigir compressão nesta etapa. Registrar medidas e atualizar `ULTIMO_PASSO.md` quando implementado.

## 4. V3 — GPT-6 Luna, direção visual e componentes prontos

### Decisão e fronteira da migração

- Migrar **roteiro e revisão textual** para GPT-6 Luna no OpenCode Go. **Pesquisa factual e geração de imagens** continuam no Gemini/Vertex por enquanto; fatos devem vir da pesquisa e ser verificados antes de narrar. Preservar a personalidade editorial da seção 2, sem piadas obrigatórias.
- Usar **GPT-6 Luna como autor visual principal** das cenas selecionadas para programação Remotion. A V3 não precisa pedir código ao modelo para cada tomada. Remotion continua sendo o renderizador das cenas, inclusive das que usam componentes locais.
- Integrar o Luna pelo endpoint **Responses** do Go, separado do Chat Completions usado pelo GLM. Validar autenticação, formato da resposta, limite de tokens, timeout, retorno de uso, erros e retomada. Não resolver a migração apenas trocando o nome do modelo.
- Salvar por cena: tipo de mídia, motivo da escolha de Luna ou componente, versão de direção, modelo, tentativas, validação, tokens, custo reportado, resultado e duração. Mostrar agregados por produção e confrontá-los com o painel OpenCode. O benchmark 3×3 estimou incorretamente o custo do Luna: três chamadas reais custaram aproximadamente US$ 0,0031, US$ 0,0033 e US$ 0,0031. Recalcular pelos logs reais, inclusive roteiros e correções; respeitar as janelas de uso do Go e manter alternativa se a cota acabar.
- O plano Go é voltado a tráfego de agentes de código. Conferir que o uso do gerador, em especial roteiro textual, é aceito pelo serviço antes de depender dele para produção autônoma contínua. Se uma etapa não puder usar Go, manter provedor compatível como alternativa e registrar o motivo.

### Roteamento editorial por cena

1. **Abertura:** a primeira cena deve usar vídeo real relevante, com Luna criando um gancho visual forte e claro. Dar prioridade de direção às primeiras cenas, aproximadamente os primeiros 30 segundos, sem impor efeitos grandes em todas. Verificar início com e sem som, legibilidade e sincronização com a fala.
2. **Fotografia ou outra imagem fixa:** enviar ao Luna por padrão, com narração, pesquisa, origem/contexto e posição da cena. Ele escolhe apresentação específica para o conteúdo: fotografia de arquivo, revelação de detalhe, composição com outra imagem, recorte, profundidade, movimento ou anotação contextual. Uma apresentação pode ser contida; imagem parada com zoom genérico não deve ser a solução automática. A cena continua com mídia real como base. Se o Luna falhar, a reserva local ainda precisa dar tratamento visual à imagem, sem deixá-la estática.
3. **Filmagem descritiva/contemplativa:** preservar vídeo limpo quando a tomada já comunica o que a voz diz. Se houver local, nome ou transição que ajude o espectador, aplicar no máximo uma legenda/título simples por componente local; às vezes nenhum texto. Evitar mandar essa cena ao Luna só para preencher a tela.
4. **Filmagem com dado ou mecanismo a explicar:** enviar ao Luna quando a narração trouxer data, número, comparação, mudança temporal, relação espacial, causa e efeito ou processo que se beneficie de demonstração visual. Exemplos: nível de água nas eclusas, rotas, profundidade, proporção, antes/depois. O efeito deve explicar a ideia sobre a filmagem ou foto, mantendo a mídia relevante e um foco legível por vez; evitar tela escura abstrata por padrão.
5. **Ritmo do corpo:** avaliar sequências de cenas, não uma cena isolada. Se tomadas limpas e legendas simples começarem a perder impulso, procurar a próxima ideia real que mereça uma demonstração Luna. Não inserir gráfico ou humor a cada intervalo fixo. Alternar explicação e respiro, variar enquadramento e posição das legendas, sem excesso simultâneo.
6. **Encerramento:** dar ao Luna intenção explícita de concluir visualmente o raciocínio, em mídia real adequada, com saída/fade coerente após a última frase. Não terminar apenas com uma legenda padrão nem cortar na última sílaba.
7. A decisão fica no planejamento, mas pode ser revista após a mídia chegar: uma foto inesperada, vídeo pouco expressivo ou oportunidade explicativa pode mudar o roteamento. Registrar a justificativa e validar quadros, duração, sobreposição e relação com a narração. Não transformar as regras acima em cota rígida de efeitos, mapas ou chamadas Luna.

### Ferramentas locais a criar para cenas simples

- **Legenda discreta**: local/nome/fato curto em canto ou margem segura; variantes inferior, lateral e superior, com entradas e saídas suaves.
- **Título de assunto e mudança de lugar**: composição central breve ou lateral, uma informação por vez, tipografia consistente, fundo/contraste adaptado à filmagem.
- **Identificação documental**: data, lugar, fonte ou personagem quando útil; tamanho e tempo de leitura proporcionais à importância.
- **Ênfase curta**: uma palavra, número ou expressão sincronizada à fala, sem empilhar elementos.
- **Transições de entrada/saída e respiro**: corte, fade e pequenas mudanças de escala/posição para vídeo; componentes reutilizáveis não devem resultar em animação repetida em todas as cenas.
- Cada componente deve receber texto, posição, tempo, intensidade e acessibilidade/contraste como dados. Escolher entre variantes pelo contexto e pela sequência anterior, evitando sempre o mesmo canto. Validar área segura horizontal/vertical, legibilidade sobre mídias claras/escuras, tempo de entrada e ausência de conflito com legendas de narração.
- Pode-se usar o Luna **uma vez durante o desenvolvimento** para desenhar/implementar esses componentes e seus exemplos; na produção, o robô apenas instancia os componentes, sem chamada ao Luna para legendas básicas. Testar os componentes no Remotion com filmagens reais. Não criar um catálogo tão grande que prenda a composição.

### Sequência de implementação e validação

1. Preservar a V2 pela tag registrada em CHECKPOINTS.md; desenvolver a V3 somente na branch codex/atlas-visual-v3. Não implantar mudanças parciais sobre uma produção ativa.
2. Medir em uma produção existente a proporção de filmagem, imagem, componentes prontos e cenas com código gerado; as categorias de mídia e composição podem se sobrepor. Usar essa medição como baseline de custo e ritmo.
3. Integrar Luna ao roteiro, manter checagem factual e o controle de duração da seção 3; comparar o resultado com o roteiro V2 em temas diferentes. Não aprovar só pela eloquência: duração real da narração, precisão e identidade editorial importam.
4. Construir os componentes de legenda/título e o roteamento; integrar Luna para imagem, abertura, encerramento e explicações. Manter a recuperação da seção 1, validação sintática e visual, mídia real e retomada sem repetir cenas prontas.
5. Testar primeiro cenas representativas isoladas e depois **um documentário completo com Shorts**. Registrar taxa de primeira aprovação, falhas, tempo, custo por etapa e total, distribuição de cenas, visual da abertura e do final, pausas, duração, mixagem e início automático dos Shorts. Comparar com V2 e com os limites de 5 horas/semana/mês do OpenCode.
6. Só considerar a V3 pronta quando Daniel aprovar a qualidade visual e narrativa do vídeo completo e a execução autônoma conseguir finalizar ou recuperar falhas isoladas sem perder trabalho. Manter a V2 disponível para retorno. A otimização do tamanho do MP4 permanece adiada até medir um upload real.
