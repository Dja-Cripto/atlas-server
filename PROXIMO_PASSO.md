# Atlas Visual V3 — próximo passo aprovado

Atualizado em 28/09/2026, aproximadamente 12:20 (America/Bahia).

## Estado e prioridade

Este é o plano vigente aprovado por Daniel. Substitui o antigo plano de implementação e todas as instruções conflitantes de tela cheia obrigatória, proibição de cartões/tela dividida e Ken Burns obrigatório. As funcionalidades já implementadas não são uma lista para executar novamente. Neste trabalho somente a documentação foi atualizada: as correções abaixo AINDA NÃO estão implementadas.

Objetivo: vídeos factuais envolventes para público internacional, com contexto reconhecível, personalidade e variedade. O Luna recebe intenção, narração, mídias e contexto e decide como desenvolver a composição. As regras protegem verdade, legibilidade e variedade; não determinam um layout.

Antes de implementar: ler AGENTS.md, ULTIMO_PASSO.md e CHECKPOINTS.md; conferir Git, trabalhos ativos e diferenças locais. Preservar o checkpoint V2 existente, sem mover sua tag. Não descartar alterações de outro executor nem incluir benchmarks, credenciais, banco ou mídias nos commits. Corrigir o gerador, não somente uma produção pronta.

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

- NÃO usar a mesma imagem ou a mesma fonte de vídeo em cenas consecutivas. Aplicar na busca, cache, reparo e montagem; usar sourceId/URL canônica e indícios de duplicação, não somente caminho local.
- Reuso posterior é permitido com separação e, para vídeo, outro trecho útil quando disponível. Medir uso na timeline real, não quantidade de entradas no cache. Preferência de cerca de 120 s em vídeos longos não vira bloqueio arbitrário em vídeos curtos.
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
