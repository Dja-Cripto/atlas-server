# Atlas Visual V3 — próximo passo aprovado

Atualizado em 28/09/2026, aproximadamente 12:20 (America/Bahia).

## Estado e prioridade

Este é o plano vigente aprovado por Daniel. Substitui o antigo plano de implementação e todas as instruções conflitantes de tela cheia obrigatória, proibição de cartões/tela dividida e Ken Burns obrigatório. As funcionalidades já implementadas não são uma lista para executar novamente. Parte das alterações abaixo já foi executada por outro trabalho, mas o teste seguinte foi reprovado. Conferir implementação e diferenças locais: registro de implementação não significa aceite visual. A prioridade 0 abaixo é nova e ainda não foi implementada.

Objetivo: vídeos factuais envolventes para público internacional, com contexto reconhecível, personalidade e variedade. O Luna recebe intenção, narração, mídias e contexto e decide como desenvolver a composição. As regras protegem verdade, legibilidade e variedade; não determinam um layout.

Antes de implementar: ler AGENTS.md, ULTIMO_PASSO.md e CHECKPOINTS.md; conferir Git, trabalhos ativos e diferenças locais. Preservar o checkpoint V2 existente, sem mover sua tag. Não descartar alterações de outro executor nem incluir benchmarks, credenciais, banco ou mídias nos commits. Corrigir o gerador, não somente uma produção pronta.

## 0. PRIORIDADE ATUAL — reconstruir descoberta e seleção de mídia

Aprovado por Daniel em 28/09/2026, após reprovar o teste de 56,7 s da Ilha dos Faisões. A narração e os efeitos não são o foco desta etapa. A busca pode demorar mais: obter filmagens e fotos pertinentes e variadas vem antes de economizar consultas. “Mais de 100 opções” expressa amplitude, não uma quota por cena nem autorização de busca infinita. Não gerar outra produção longa antes de comprovar o novo inventário de mídia.

### 0.1 Arquitetura e pontos de integração
- Substituir a descoberta estreita de sourceScene em lib/auto-media.mjs por uma etapa de inventário por produção/bloco narrativo, reutilizável por todas as cenas. Separar descobrir URLs, obter metadados, revisar relevância, verificar disponibilidade, preparar arquivos e alocar takes na timeline.
- Implementar adaptadores com contrato comum em módulos próprios; integrar em lib/providers.mjs, lib/automatic.mjs, seleção/reparo e Shorts. Campos mínimos: fornecedor, ID original, página de origem, URL da mídia quando disponível, título, autor/crédito, situação de uso, dimensões, duração, consultas, evidência geográfica, status de download e motivo de rejeição. Persistir progresso e versão do inventário.
- Não limitar a descoberta a domínios de download atuais. Links encontrados são candidatos, não arquivos automaticamente baixáveis. Resolver página original e mídia legítima; validar destino, tipo, tamanho e redirecionamentos com segurança. Não remover proteção contra destinos locais/privados nem executar conteúdo externo.

### 0.2 Fontes e consultas amplas
- Conectar descoberta de imagens e vídeos da web por provedor/API realmente disponível. Avaliar documentação atual, credenciais, preços, paginação e condições na implementação; não pressupor que Google Imagens oferece uma API universal nem prometer integração sem verificar. Se não configurado, mostrar fonte indisponível, nunca “zero resultados”.
- Integrar YouTube à descoberta automática: a função existente não basta, pois retorna links e não arquivos utilizáveis. Resolver separadamente acesso permitido a material reutilizável, acervos próprios/licenciados e extração de takes. Não contar miniatura de YouTube como filmagem nem prometer download de todo resultado.
- Ampliar Wikimedia com paginação, categorias/arquivos relacionados e aliases; continuar Pexels/Pixabay e acervos institucionais pertinentes. Incluir páginas de turismo, municípios, arquivos e notícias na descoberta, sem banir um domínio jornalístico por padrão.
- Construir consultas por entidade e intenção, em idiomas locais: Pheasant Island, Île des Faisans, Isla de los Faisanes; Bidasoa/Bidassoa, Hendaye, Irun e assunto específico quando pertinente. Começar também pelo título e pela entidade simples. Não acrescentar automaticamente aerial/drone a tudo.
- Explorar sujeito exato, detalhes, ângulos, contexto regional verificado, vida cotidiana e documentos conforme a narração. Planejar abertura em vídeo com alternativas regionais legítimas. Não usar região aleatória por semelhança estética.
- Paginar enquanto surgirem candidatos úteis novos. Deduplicar consultas por produção para não repetir as mesmas pesquisas em 10 cenas. Consultas simplificadas devem realmente ser executadas, não ficar no fim de uma lista truncada antes do uso.

### 0.3 Descoberta não equivale a autorização nem a autenticidade
- Não excluir resultados da pesquisa só por serem BBC, agência, rede social ou outro editor. Rastrear crédito/origem: muitas páginas reproduzem o mesmo arquivo de acervo, que pode ser obtido na fonte original.
- Registrar situação de uso separadamente da relevância (confirmada, restrita, desconhecida). Ausência de aviso ou marca não comprova permissão; a presença no Google tampouco. Não afirmar que uma imagem de drone não pode gerar reivindicação. Material de uso desconhecido pode permanecer no inventário para decisão, sem fingir licença na publicação autônoma. Priorizar alternativas verificadas e permitir material cuja autorização o usuário forneça.
- Não remover marcas nem recortar créditos para disfarçar origem. Preferir original limpo disponível legitimamente. Miniaturas com texto, infográficos de terceiros, mapas e imagens sintéticas nos resultados não devem ser classificados como fotos documentais.

### 0.4 Avaliação por lotes e resolução adequada
- Retirar o teto efetivo de seis candidatos avaliados por consulta: usar lotes pequenos sucessivos e persistir quais já foram analisados. Não enviar centenas de imagens simultaneamente ao modelo. Fazer triagem barata antes da revisão visual; examinar novos lotes se o primeiro não servir.
- Avaliar relevância, evidência de local, autenticidade, nitidez, diversidade, enquadramento, duração útil e repetição. Ranking considera função evidence/context; filme regional não vira prova do objeto específico.
- Não exigir 1920x1080 de toda fonte. Saída Full HD não exige cada foto dessa dimensão. Aprovar por tamanho de exibição/crop e qualidade: uma foto menor pode ocupar parte da composição; verificar resolução após recorte para evitar pixelização. Não aumentar pixels e declarar qualidade nativa recuperada. Filmagem inferior pode ser alternativa avaliada, sem rebaixar todo vídeo automaticamente.
- Para vídeo, examinar amostras distribuídas e identificar intervalos úteis/trocas de tomada. Um arquivo pode oferecer vários takes, mantendo sua identidade de fonte, sem bloquear reutilização por essa identidade. Proibir repetição/sobreposição de trechos já usados; não contar outro recorte dos mesmos frames como material novo.

### 0.5 Diversidade de verdade e alocação
- Deduplicar por ID, URL canônica, hash de arquivo e semelhança perceptual: a mesma foto republicada em dez sites não são dez opções visuais. Manter autores/créditos e distinguir crops da mesma foto.
- Selecionar conjunto de mídias antes de atribuir cenas individualmente. Reservar opções para a abertura e sujeitos essenciais; evitar que escolhas gananciosas consumam a diversidade nas primeiras cenas.
- Medir fontes únicas, enquadramentos distintos, segundos úteis de vídeo, distribuição temporal e distância entre reutilizações. Não confundir contagem de resultados com quantidade real de conteúdo.
- Aplicar exclusões em TODOS os caminhos: cache exato, seleção persistida, busca, reaproveitamento e reparo. Revalidar a timeline após substituições. Não voltar ao primeiro arquivo só porque o modelo rejeitou o primeiro lote.
- Se faltar material: ampliar consultas/fontes, examinar novos lotes, replanejar trecho contextual sem mudar os fatos, buscar foto verdadeira pertinente ou esquema que realmente explique. Nunca preencher automaticamente com a mesma foto nem inventar “exceção aprovada”.

### 0.6 Persistência, custo e diagnóstico
- Orçamento configurável de consultas/tempo/custo por produção, com prioridade a trechos deficientes. Parada por suficiência e diversidade ou esgotamento documentado; não por primeiras cinco fotos. Mais tempo autorizado para busca não significa gasto sem teto em serviços pagos.
- Concorrência limitada por fornecedor, retries com backoff para erro transitório, continuação de paginação no reinício e cancelamento cooperativo. Provedor com erro não derruba as outras buscas.
- Cada tentativa registra fonte, consulta, página, candidatos novos, analisados, aprovados, baixados e rejeições categorizadas: irrelevância, duplicata, qualidade, indisponibilidade de revisão, direitos/acesso ou download. Não ocultar rejeições de Promise.allSettled como lista vazia.
- Painel informa “buscando”, “avaliando novos candidatos”, “fonte indisponível” e alternativas recuperadas. Mostrar galeria de candidatos e seleção com razões, sem exigir escolha manual em toda produção autônoma.
- Salvar acervo antes da programação. Mudança de asset invalida só código/preview dependentes; manter áudio e cenas prontas quando compatíveis.

### 0.7 Sequência de execução e evidência de aceite
1. Auditar credenciais e capacidades sem expor segredos; verificar APIs atuais e custos; mapear fontes operacionais versus ausentes.
2. Implementar contrato, inventário persistido, telemetria e adaptadores/paginação; conectar descoberta ao fluxo que materializa cenas, não apenas à tela de pesquisa.
3. Implementar aliases/consultas regionais, avaliação em lotes, deduplicação e resolução por composição.
4. Integrar seleção global, exclusões e recuperação direcionada, incluindo Shorts e retomada.
5. Quando autorizada a validação, comparar o mesmo tema Ilha dos Faisões antes/depois: apresentar inventário e diversidade ANTES de gerar voz/render novos. Examinar origem real dos takes de abertura; o rótulo “ilha fluvial” sozinho não comprova região.
6. Só então gerar amostra curta. Aceite exige fontes pertinentes variadas, ausência de duplicatas consecutivas e da mesma foto dominando o vídeo, abertura real contextual verificável e logs completos. Não aprovar só por compilar, terminar render ou ter muitos resultados de busca.
7. Manter a geração de capas desativada. Não reabrir alterações de narração, música ou modelo como solução para falta de mídia.

## 1. Remover ou flexibilizar restrições estéticas

Aplicar consistentemente em lib/v3-direction.mjs, directorContract/sceneContract/contrato de Shorts e validadores em lib/motion-author.mjs, normalização em lib/auto-plan.mjs e lib/editorial-review.mjs. Não basta acrescentar uma frase de liberdade ao final mantendo proibições anteriores.

- REMOVER obrigação de foto/vídeo preencher 100% da tela e objectFit cover universal. Usar bem a composição inteira não significa esticar a foto. Preservar proporções, permitir contain, recorte intencional e fundos compostos.
- REMOVER proibição geral de cartões, caixas, fotos flutuantes e tela dividida. Permitir foto entrando sobre mapa, documentos, comparação e montagem de imagens. Avaliar tamanho/legibilidade e repetição, não rejeitar a técnica pelo nome.
- REMOVER Ken Burns, escala ou movimento suave obrigatório da fotografia. A foto pode estar imóvel enquanto outros elementos desenvolvem a ideia. Exigir desenvolvimento visual significativo da cena, sem movimento incessante nem quota de efeitos. Zoom pode integrar; uma sequência inteira de zoom e legenda não basta.
- REMOVER obrigação de toda explicação ser overlay discreto/translúcido sobre mídia em tela cheia. Permitir reorganizar elementos, fundo próprio, mapa seguido de foto e diagrama ocupando a tela. Não exigir foto visível desde o primeiro frame nem o tempo todo.
- SUBSTITUIR a regra de gráficos independentes raros por adequação à explicação. Não usar gráfico como preenchimento para disfarçar mídia ausente; permitir esquema factual quando comunica melhor.
- FLEXIBILIZAR nomes falados na mesma cena: identificação geográfica verificada pode aparecer para orientar, mesmo sem pronúncia naquele segundo. Dados, eventos e afirmações continuam fundamentados e sincronizados com a ideia narrada. Evitar usar cortes de poucos segundos como fronteira semântica rígida.
- TRANSFORMAR títulos de 3–4 palavras e legendas de 6–8 em preferências. Permitir frase quando legível no tempo disponível, sem parágrafos desnecessários.
- PERMITIR entradas e saídas pela borda. Área segura protege a fase de leitura, não toda a trajetória da animação. Substituir receitas fixas de posição/largura por ajuste ao viewport e legibilidade.
- FLEXIBILIZAR proteção absoluta de foto específica: preservar documentos/eventos indispensáveis; permitir substituição por filmagem igualmente pertinente. Não trocar prova histórica por paisagem genérica.
- USAR buscas curtas como orientação, não teto de 2–4 palavras; preservar nomes próprios e qualificadores necessários.
- REMOVER limite arbitrário de um mapa por Short. Manter mapas pertinentes, legíveis e variados, sem quota obrigatória.
- REVISAR regras de um único vídeo e de exclusão mútua Img/Video: exigir uso correto dos componentes para cada asset, sem proibir composição com múltiplas mídias fornecidas. Evitar duplicação gratuita e custo excessivo. Não inventar caminhos de arquivos.
- Manter restrições de filtros pesados do servidor CPU nesta etapa. Revisão de desempenho é separada; liberar criatividade não exige retirar segurança de execução.

## 2. Abertura: vídeo real com contexto legítimo

Arquivos: lib/opening-recovery.mjs, lib/automatic.mjs, lib/visual-repair.mjs, lib/auto-media.mjs e planejamento.

- Primeira impressão deve ser filmagem real; não aceitar fotografia como fallback da abertura. Verificar mídia efetivamente renderizada, não apenas kind no planejamento.
- Não exigir filmagem do objeto exato. Exemplo: tema sobre uma torre no Rio pode abrir com filmagem verificada do Rio, contextualizando a torre, sem fingir que mostra a torre.
- Busca em camadas: sujeito exato; cidade/região pertinente e verificável; outra tomada contextual que introduza honestamente o tema. Reavaliar requiredSubject/narrativeRole da abertura ao escolher contexto; não manter exigência de prova literal e tentar contorná-la com etiqueta falsa.
- Remover fallback findPhoto para abertura e a rejeição indiscriminada de representationRole contextual. Contexto deve ser aprovado por relevância e evidência geográfica, não aceito automaticamente.
- Esgotadas alternativas limitadas, preservar trabalho e explicar a falta real de filmagem. Não usar foto silenciosamente nem vídeo de lugar errado para terminar.
- Gancho visual forte e coerente, com liberdade de composição; sem logo, título ou efeito obrigatório. Preservar saída intencional e breve respiro no fim.

## 3. Planejamento e busca: evidência e contexto

- Planejar evidence quando precisa mostrar sujeito/evento específico e context quando precisa situar lugar, vida, pessoas ou consequência. Não impor porcentagem artificial, mas revisar um plano que marcou tudo como evidence e repetiu a mesma busca.
- Propagar narrativeRole, visualPurpose, requiredSubject, contextIntent, allowedSubstitution e selectionReason por busca, recuperação, manifesto e autoria.
- Variar buscas pelo que a passagem comunica; não trocar só aerial por drone mantendo o mesmo assunto em todas. Na Ilha dos Faisões, Hendaye/Irun, rio/fronteira, barcos e tratado são possibilidades APENAS onde a narração/pesquisa sustentam.
- O choose deve avaliar adequação à função: filme de cidade verificada serve para contexto, não como prova de objeto específico. Manter rejeição de lugares errados e associações enganosas. Não remover filtro de relevância para aceitar qualquer vídeo.
- Diferenciar rejeição semântica, ausência de candidatos e indisponibilidade do avaliador; registrar motivos e recuperação. Não afirmar que todos os vídeos foram rejeitados sem logs.
- Cache nunca promove contextual para exact-location só por coincidência de consulta/local. Preservar proveniência e grau de evidência; revalidar adequação ao novo trecho.

## 4. Repetição, cobertura e ritmo

Arquivos: lib/auto-media.mjs, lib/visual-continuity.mjs, lib/video-coverage-repair.mjs e montagem em lib/automatic.mjs.

- NÃO usar a mesma imagem em cenas consecutivas. Para vídeo, a restrição é repetir o mesmo trecho/take, não reutilizar a fonte original. Aplicar na busca, cache, reparo e montagem; usar sourceId/URL canônica e indícios de duplicação, não somente caminho local.
- Fotografia pode ser reutilizada posteriormente com separação. Vídeo pode fornecer vários trechos diferentes, inclusive para cenas próximas; não exigir intervalo de 120 s nem bloquear por sourceId igual. Controlar intervalos efetivamente usados por fonte, evitando sobreposição/repetição do material.
- Não repetir silenciosamente o fim do clipe esgotado. Selecionar outra mídia ou tratamento coerente. Fonte longa é estoque de takes, não autorização de cena contínua de um minuto.
- Preservar ordem e sincronização da narração. Corrigir o asset do slot em vez de embaralhar história para afastar duplicatas.
- Priorizar vídeo em tempo de tela. Meta de 50% e alerta de 60 s sem filmagem são sinais para busca/revisão, não pausas automáticas isoladas nem garantia de qualidade.
- Sequências de fotos são permitidas quando narrativamente necessárias. Julgar duração, variedade, função e resultado; não contar fotos como proibição. Evitar longos slideshows monótonos e não inserir clipe desconexo só para zerar contador.
- Toda foto vai ao Luna por padrão. Vídeo descritivo pode ficar limpo ou usar componente simples; explicações, abertura e encerramento recebem autoria quando pertinente. Shorts preservam ritmo mais dinâmico, sem obrigar efeito idêntico em cada cena.

## 5. Autoria e revisão efetivas

- Fornecer ao Luna objetivo, narração, fatos, origem/limites da mídia, vizinhos e tratamentos recentes. Confirmar se recebe pixels; caminho local sozinho não significa que viu a foto. Usar visão suportada ou descrição visual verificada disponível.
- Permitir composição de mídias/mapas fornecidos, desenvolvimento temporal e foto entrando depois. Adaptar inventário, schema e validação se hoje só comportam um asset. Nunca pedir recursos indisponíveis silenciosamente.
- Manter uso dos assets pertinentes sem exigir que cada um apareça a cena toda. Proteger informação importante de cortes e sobreposição.
- Revisar o plano inteiro antes da autoria e blocos contíguos depois; amostra espaçada de 12 cenas não identifica toda sequência ruim.
- Passar os códigos gerados reais a reviewAuthoredBlocks; hoje a chamada sem códigos impede checagens dependentes deles. Retirar rejeição de split-screen por si só.
- Revisão deve disparar correção direcionada, não apenas escrever logs. Persistir cenas, motivo, tentativa, resultado e exceção. Limitar a revisão editorial inicialmente a uma avaliação de bloco e uma correção direcionada para não criar loop.
- Conferir frames/prévia em amostra: ter interpolate/useCurrentFrame não prova qualidade nem variedade. Distinguir monotonia estética de erro técnico.
- Mudança de mídia/instrução invalida somente código e prévia dependentes; não reutilizar entryPoint antigo sem conferir identidade/versão das entradas. Preservar voz e cenas intactas.

## 6. Proteções e decisões anteriores que permanecem

- Precisão factual, geografia correta, origem honesta e distinção entre ilustração e registro real; não inventar pessoas, eventos ou números.
- Legibilidade, hierarquia visual, proporções e sincronização; não confundir hierarquia com proibição absoluta de composição complexa.
- Código determinístico, arquivos locais fornecidos, imports permitidos, segurança, limites de execução, duração válida e ausência de cenas vazias. Manter restrições técnicas justificadas de desempenho.
- Pesquisa/geração de imagens no Gemini/Vertex; roteiro e autoria principal Luna. Não refazer migração de modelo já existente.
- Personalidade curiosa, observadora, humor seco/sarcástico quando cabe, sem bordão ou quota de piadas e sem banalizar sofrimento.
- Duração validada na narração real, correção no roteiro/TTS quando necessário, pausas curtas no fim do raciocínio. Não preencher tempo com silêncio ou repetição.
- Preservar mixagem de fundo aprovada, fala prioritária e seleção musical pertinente; não reabrir aumento generalizado de volume.
- Preservar Shorts sequenciais quando solicitados e retomada idempotente. Compressão do MP4 continua adiada até medir necessidade de upload.
- Recuperação técnica: até 3 tentativas principais, até 2 secundárias, depois reserva local limitada aproximadamente a 5%. Conferir configuração existente/modelo secundário antes de alterar; definir arredondamento explícito para curtos. Não confundir tentativas com quantidade de reservas nem relaxar falhas sistêmicas. Não aumentar essas cotas nesta revisão estética.

## 7. Ordem de implementação e aceite futuro

1. Conferir estado e snapshot; inventariar prompts, validações e rotas compartilhadas com Shorts. Não implantar sobre produção ativa.
2. Unificar orientação editorial e retirar cláusulas conflitantes; ajustar schema/validação para as composições permitidas.
3. Corrigir abertura contextual em vídeo, função narrativa, busca e evidência de cache.
4. Aplicar deduplicação temporal, cortes e recuperação de cobertura sem interromper só por número.
5. Integrar revisão real e reparo direcionado com invalidação seletiva de artefatos.
6. Na implementação, validar regras alteradas e gerar primeiro amostra de 60–90 s; não começar por produção de 15 minutos. Inspecionar também compatibilidade vertical. Daniel avalia antes de ampliar/implantar.
7. Registrar duração por tipo de mídia separadamente de autoria Luna/local/reserva, fontes únicas, reutilizações e intervalos, motivos de contexto, tentativas/custos e problemas remanescentes.

Aceite: abertura comprovadamente em vídeo pertinente; foto pode entrar sobre mapa/composição; nenhuma duplicata consecutiva; sequência de fotos pode existir sem repetir zoom/legenda; contexto reconhecível e verdadeiro; revisão recebe código e corrige problema detectado; retomada preserva trabalho. Não considerar concluído só por compilar ou alterar prompts.

Referência de regressão: produção Pheasant Island, run 246028d7-07b5-4856-a52a-449ab7332c4d, 11 cenas e 57,44 s; quatro fotos distintas e uma fonte de vídeo repetida três vezes; filmagem em 25,2% do tempo. Não atribuir todas as falhas ao modelo nem afirmar rejeição de 100% dos vídeos sem evidência.

### 0.8 Correção prioritária confirmada: identidade geográfica e candidatos invisíveis
- Conferência read-only do job df6fb0ba-7683-413f-a4df-0747ccc938e0 confirmou 1.280 registros de candidatos, 758 com arquivos de vídeo nos metadados, incluindo diversos vídeos de aves. Isso NÃO significa 758 downloads ou 758 vídeos pertinentes à região; não declarar todos rejeitados sem reconstruir decisões.
- lib/auto-plan.mjs: hasLocation aceita uma palavra isolada de cinco letras após retirar termos genéricos; “Pheasant Island” vira “pheasant”. Remover esse atalho. Resolver entidade composta, aliases verificados e tipo geográfico com evidência; nunca promover coincidência lexical isolada a exact-location. Cobrir homônimos e topônimos curtos sem uma lista de remendos específica da ilha.
- lib/auto-media.mjs: candidatePool coloca exact primeiro e corta em seis. choose não percorre automaticamente o restante desse conjunto após rejeição. Avaliar novos lotes, conservar cursor e motivos, garantir diversidade pertinente por fonte/representação quando a função permitir. Não obrigar mistura foto/documento/contexto em cenas videoOnly ou de evidência específica; lote híbrido não é uma quota universal.
- Corrigir reusableMediaCandidates: condição !candidate.files?.length desvia a contagem de usos para fotos. Medir reutilização na timeline para AMBOS os tipos e respeitar exclusões em todos os caminhos. Não confundir cache de consultas com usos na montagem.
- Preservar regra aprovada: fotos sem repetição consecutiva; vídeos podem reutilizar a mesma fonte, mas não os mesmos trechos. A sugestão externa “apagar foto após primeiro uso para sempre” NÃO substitui essa decisão. Não apagar arquivos/cache como meio de controlar seleção.
- Priorizar esses defeitos antes de ampliar tráfego/provedores: mais resultados entrando no mesmo filtro defeituoso não resolve. Aceite inclui ave não classificada como ilha, rejeição do primeiro lote seguida de avaliação do próximo e fotos repetidas detectadas mesmo via cache.

### 0.9 Esclarecimento final de Daniel — reutilização de vídeo
Esta seção prevalece sobre qualquer frase anterior ambígua sobre duplicatas/fontes. Um vídeo de um minuto pode fornecer vários trechos úteis. É permitido usar a mesma fonte em cenas próximas ou consecutivas se os trechos forem diferentes e fizerem sentido. Não repetir os mesmos dez segundos, nem apenas mudar legenda/crop/velocidade para disfarçar a repetição. Registrar intervalos de entrada/saída na fonte original e verificar sobreposição; selecionar momentos úteis, não só incrementar trimStart sem analisar conteúdo. Um plano contínuo sem mudança visual pode continuar monótono mesmo com intervalos distintos: avaliar ritmo como recomendação editorial, não proibir a fonte. Retirar de detectConsecutiveFootage/detectConsecutiveMedia, reviewMediaPlan, exclusões da busca e reparo qualquer bloqueio de vídeo baseado somente em sourceId/URL iguais. Aplicar seleção por trechos disponíveis; quando esgotados, procurar outra mídia. Preservar identificação canônica para contabilizar corretamente os trechos. A correção local que hoje bloqueia duplicatas de fonte ainda precisa ser adaptada antes de implantação. A política de fotografias não foi alterada neste esclarecimento.
