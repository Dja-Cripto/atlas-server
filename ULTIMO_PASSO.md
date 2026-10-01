# Atlas Studio — estado atual

Atualizado em 30/09/2026, aproximadamente 13:10 (America/Bahia).

## O que foi alterado
- **Remoção de Links nas Descrições do YouTube (`lib/providers.mjs`)**:
  - `generatePublishingMetadata` atualizado para extrair e formatar apenas nomes de entidades e publicações oficiais (ex: *PUB Singapore National Water Agency*, *Ministry of Sustainability*), eliminando links `http://` e `https://` nas descrições geradas para proteger canais novos sem verificação avançada.
  - Sanitização via regex aplicada como garantia de segurança para que nenhuma URL bruta vaze para o YouTube.
  - Descrições dos pacotes de Singapura e Japão no banco de dados (`studio.sqlite`) limpas e atualizadas com nomes formais de fontes.
- **Auditoria de Qualidade da Nova Produção ("Where Singapore Gets Its Water")**:
  - Extração e análise visual direta de frames do vídeo longo (15s, 90s, 240s, 400s, 600s) e de cada um dos 5 Shorts verticais (15s).
  - Validação técnica de resolução, codecs, taxa de bits, sincronismo de áudio e zonas seguras móveis.

## O que foi validado
- **Vídeo Longo de Singapura (`5ac7c206-304c-4ba8-9b55-f59d7850dac5`)**:
  - Duração: 11 minutos e 25 segundos (685.18s), perfeitamente dentro da faixa obrigatória de 10 a 15 minutos para pautas automáticas.
  - Formato: 1920x1080 @ 30fps H.264 (High Profile, ~16 Mbps), áudio estéreo AAC 48 kHz.
  - Composição: filmagens 100% autênticas de Singapura (canais de drenagem urbana, Marina Bay, Jardins da Baía, Merlion e bacia de Kallang), layout split-screen V3 e trilha sonora instrumental suave (*Liquid Time*) com ducking de -18 LUFS.
- **5 Shorts Verticais de Singapura**:
  - Todos em 1080x1920 @ 30fps H.264 vertical nativo, durações entre 43s e 64s.
  - Short 1 (56.2s): tomada aérea de Marina Bay com badge infográfico ("17 reservoirs").
  - Short 2 (53.7s): mapa coroplético animado destacando a fronteira internacional da Malásia e o Rio Johor.
  - Short 3 (64.6s): tomada de reservatório natural com legendagem minimalista de tratamento de água.
  - Short 4 (54.3s): esquema conceitual de fluxo por gravidade e tubulações profundas a 60m.
  - Short 5 (43.6s): cartões de comparação de salinidade e consumo de energia (água de reservatório vs água do mar).
  - Todos com tipografia dentro da safe area (sem sobreposição com a interface do YouTube Shorts/Reels/TikTok).
- **Testes automatizados**:
  - 173 testes passando com 100% de sucesso (`npm test`).

## Limitações abertas
- Cota de upload do canal no YouTube: canal recém-criado aguarda o encerramento da janela de 24 horas de segurança do Google (prevista para liberação a partir das 19h12 de 30/09) para envio dos itens pendentes sem colisão de horário. No Facebook, todos os 12 conteúdos (6 de Singapura e 6 do Japão) continuam 100% agendados e confirmados pela Meta.

## Próximo passo recomendado
- Acompanhar a liberação da janela de 24h do YouTube às 19h12 para prosseguir com a fila controlada de agendamentos no canal, garantindo espaçamento entre os vídeos de Singapura e Japão.

## Correção de recuperação — 01/10/2026
- Panamá pausou em quatro cenas após materialização falhada e teto de 22 ilustrações. Propostas da IA não são mídia real.
- Recuperação agora tenta buscas originais, substituições e contexto regional antes de ilustrar; mantém cenas de contexto sem exigência de sujeito exato. Assets sugeridos pelo modelo são descartados e apenas resultados reais do buscador são usados.
- Busca explícita de recuperação não é bloqueada pela existência de ilustração em cache. Limites editoriais mantidos.
- Sete testes de visual-repair passaram, incluindo recuperação real com limite de ilustrações esgotado. Arquivos implantados no servidor, serviço reiniciado. Produção preservada; conclusão do novo processamento ainda deve ser acompanhada.
- Próximo passo: confirmar recuperação das cenas 101/103/109/111 e qualidade antes da publicação. Pendências de publicação descritas acima continuam abertas.

## Envio controlado YouTube — 01/10/2026
- Tentativa de 30/09 às 19h12 falhou antes do YouTube: EACCES no armazenamento n8n. Diretório migrado tinha UID/GID 1001; corrigido para 1000 do serviço. Gravação validada dentro do container.
- Iniciado somente envio do principal Japão pelo webhook normal (execução 53536); Shorts e demais projetos continuam pausados. Não reenviar enquanto sending. Data de publicação desta tentativa calculada para duas horas após início, em modo scheduled.
- Resultado externo ainda em acompanhamento; não assumir liberação da cota sem ID confirmado. Arquivo principal preservado.
- Resultado confirmado pela API YouTube: principal Japão pOlv3tqZnOU, uploadStatus uploaded, processingStatus processing, privado com publishAt 01/10/2026 18:55:37Z (15h55 Bahia). Atlas reconciliado como accepted com ID externo; não reenviar. A conexão do webhook falhou, mas o upload efetivamente chegou ao YouTube. Shorts continuam pausados conforme pedido de enviar somente o principal. Execução n8n 53536 ainda running na consulta; verificar término e publicação final.
- Miniatura Japão: arquivo existente localizado (2.122.904 bytes). Envio separado a thumbnails.set rejeitado HTTP 403 forbidden: usuário autenticado sem permissão para miniaturas personalizadas. Não reenviar vídeo. Execução original 53536 terminou success. Próximo passo: conferir elegibilidade/verificação do canal para miniaturas e reenviar somente capa após habilitação; verificar tamanho máximo e comprimir se necessário.
- Atualização miniatura 01/10: nova tentativa após habilitação aceita pela API thumbnails.set para pOlv3tqZnOU. Capa original preservada; cópia convertida em memória de PNG 2.122.904 bytes para JPEG 567.570 bytes, sem alterar desenho. YouTube retornou miniaturas até 1280x720. Bloqueio 403 resolvido nesta tentativa; não reenviar vídeo. Próximo passo: adaptar preparação automática das capas para limite de tamanho nos próximos uploads.

## Embalagem editorial — 01/10/2026
- Gerador de metadados usa roteiro completo (até 22 mil caracteres), três títulos distintos com curiosidade/contraste/mecanismo, sem promessas absolutas ou fatos inventados. Descrição em inglês com gancho, exemplos, pergunta e convite breve; sem timestamps parciais, transcrição cortada ou URLs; 3-5 hashtags relevantes. Fontes apenas por nome.
- Capa deixa de ser fundo sem texto: miniatura completa em inglês, 2-4 palavras grandes, contraste forte, comparação diagonal ou mecanismo destacado/inset ou sujeito único conforme tema. Referências visuais do usuário orientam composição, sem reproduzir português, desastre fictício ou engenharia apresentada como prova documental.
- Finalização automática voltou a criar uma única capa se ausente, após metadados, preservando capas existentes. Falha de imagem vira aviso e não bloqueia Shorts. Sem geração ilimitada ou uma capa por Short.
- Imagens acima de 2 MiB são convertidas para JPEG 1280x720 com ffmpeg; upload rejeitado localmente se ainda exceder limite. Imagens menores preservadas.
- 174 testes passaram, sintaxe válida. providers.mjs e automatic.mjs implantados, Atlas reiniciado. Não alterados títulos/capas/descrições já publicados. Qualidade visual da próxima capa ainda requer avaliação humana; prompts não garantem CTR.
- Próximo passo: avaliar pacote de nova produção e confirmar miniatura aplicada pela plataforma. Panamá estava novamente em error/visual-review antes deste reinício; recuperação ainda pendente, não declarar produção concluída.

## Shorts Japão e fila sequencial — 01/10/2026
- Cinco Shorts enviados individualmente pela rede interna n8n. Antes de cada próximo envio, API videos.list confirmou ID, uploadStatus uploaded/processed e publishAt. Não exigido término da transcodificação. Facebook preservado.
- IDs YouTube: Short1 o9yGL8RzS9U; Short2 4hNKBvn53zw; Short3 m4f4KYCSovY; Short4 x4mqYeQR57I; Short5 O4ihSX8t1HI. Horários Bahia: 01/10 18h30 e 21h; 02/10 10h, 13h e 16h. Atlas sincronizado com os horários aceitos; pausa Japão removida após todos confirmados. Principal pOlv3tqZnOU preservado.
- Publicador automático agora tem trava contra chamadas concorrentes, bloqueia novo YouTube enquanto qualquer projeto tem sending e limita uma tentativa YouTube por ciclo em toda a fila (antes era por projeto). Só resposta com ID externo marca accepted; erro incerto exige reconciliação, sem reenviar cegamente.
- Onze testes de publicação passaram, incluindo concorrência e sending entre projetos; publishing.mjs implantado e servidor reiniciado antes do envio. Nenhum novo envio simultâneo ao YouTube.
- Primeira chamada pública ao webhook retornou 403 antes do fluxo; usada rede interna com sucesso. Token temporário removido. A falha original era EACCES, não demonstradamente simultaneidade. Não garantir ausência de cota futura.
- Próximo passo: confirmar publicações nos horários e resolver Singapura/Holanda e Panamá separadamente; este trabalho enviou apenas Shorts do Japão.

## Capa simplificada Singapura — 01/10/2026
- Gerador de capas atualizado permanentemente: um assunto dominante, espaço negativo, iluminação/contraste marcantes e pergunta curta em inglês (2-3 palavras). Retiradas colagens, split-screen, insets, diagramas, setas, estatísticas e múltiplas etiquetas das instruções de capa. Metadados orientam o mesmo conceito simples. Sem mudar cenas do vídeo.
- Nova capa gerada pela API configurada do próprio Atlas e selecionada: thumbnail-84fa1c99-681d-4d7e-a889-38b1548c4a03.png, 1.756.085 bytes; orientação Singapore skyline in rain / NOT ENOUGH?. Capa anterior preservada no histórico.
- YouTube thumbnails.set confirmou aplicação ao vídeo tqvPdpR5a6o. API confirmou uploadStatus uploaded, privado/agendado 02/10 17:00Z (14h Bahia). Atlas reconciliado com ID; não reenviar principal. Resposta do webhook falhou, mas upload chegou.
- Horários YouTube reservados Singapura: principal 02/10 14h; Shorts 02/10 18h30 e 21h, 03/10 10h, 13h, 16h (Bahia). Shorts ainda não confirmados no YouTube, pausa mantida para verificar término n8n 53542 (running na última consulta). Facebook já tinha agendamentos externos; preservados.
- 176 testes passaram; providers.mjs implantado e Atlas reiniciado após terminar a chamada de upload. Nova capa precisa de aprovação visual do usuário; confirmação API não avalia qualidade visual.
- Próximo passo: confirmar visual da capa e término de 53542, enviar cinco Shorts Singapura sequencialmente. Pendência Panamá permanece.

## Shorts Singapura — 01/10/2026
- Enviados sequencialmente e confirmados pela API: Short1 3dXvz_Bf4P0 para 02/10 18h30 Bahia; Short2 OU6iNsY1gU8 para 02/10 21h; Short3 dmFtTxlFrNk para 03/10 10h. Short2 teve atraso de disponibilidade na consulta API; reconciliado pelo ID da execução 53544, sem reupload.
- Short4 rejeitado na execução 53546, nó YouTube Publicar Vídeo: The user has exceeded the number of videos they may upload. Short5 não enviado. Não confundir erro com simultaneidade: todos enviados um por vez. Pausa YouTube mantida para Singapura, erro do Short4 normalizado; aguardar pelo menos 24h da attemptedAt antes de nova tentativa, sem garantia de liberação.
- Principal tqvPdpR5a6o e capa simplificada preservados, agendado 02/10 14h. Facebook preservado. Nenhuma mídia apagada.
- Próximo passo: liberar pausa e retomar somente Shorts4/5 após janela da cota; horários reservados 03/10 13h e 16h Bahia. API confirmou os três anteriores; não reenviar.

## Limite observado de uploads — 01/10/2026
- Usuário pediu preservar a referência prática de aproximadamente 10 uploads YouTube por 24 horas, somando vídeos principais e Shorts. É hipótese observada neste canal, não limite oficial confirmado nem garantia de reset à meia-noite. Não afirmar que houve exclusão de vídeo por esta sessão; nenhuma exclusão YouTube foi feita neste trabalho.
- Planejar um pacote diário de 1 principal + 5 Shorts (6 uploads), evitar acumular pacotes e tentativas extras na mesma janela. Contar uploads/envios, inclusive agendados, não somente publicações públicas do dia. Esta anotação não implementa contador ou limitador novo no código.
- Pendências preservadas: Singapura Shorts4 e 5, reservados para 03/10 às 13h e 16h Bahia. Nova tentativa somente após 02/10 às 15h13 Bahia (24h desde rejeição), conferir liberação antes de avançar. Retomada ainda exige execução; não há monitor/agendamento adicional criado neste registro.

## Recuperação Panamá — 01/10/2026, tarde (Bahia)
- Investigado erro nas cenas109/111: busca da alternativa não materializou mídia; limite de22 ilustrações já atingido. Recuperação usava instruções editoriais inteiras como consulta e mantinha localização muito específica mesmo para cenas de contexto.
- Gerador passa a usar consultas curtas e alternativas regionais somente em cenas contextuais, preservando país e distinguindo apoio visual de evidência do evento/pessoa exatos. Cenas factuais específicas não são ampliadas. Exclusions dos vizinhos continuam preservadas.
- Retomada de cenas já salvas sem mídia pula busca inicial esgotada e segue para revisão/recuperação. Roteiro, narração, assets e demais cenas preservados.
-178 testes passaram, incluindo recuperação regional com rejeição de país errado. auto-media.mjs e automatic.mjs implantados e Atlas reiniciado. Produção162c93b7-724a-45a5-8761-5f91b7521c2b retomada via API202, mesmo runae373b13-d11f-42ed-ac7e-c00f956fc65e.
- Atualização posterior, 01/10 tarde:111 recuperada;109 persistia porque sourceScene encerrava ao atingir8 identificadores excluídos (vizinhos e mídia anterior), confundindo prevenção de repetição com8 downloads falhos. Contador separado failedDownloads agora limita somente tentativas falhas, preservando exclusões. Recuperação também revisa candidatos ainda não usados do banco já descoberto, ordenados por assunto, incluindo fotos e vídeos.
-178 testes passaram após correção. Implantados auto-media.mjs/automatic.mjs. Confirmado em produção:109 ganhou9538b8c5985513f4fa06.jpg (Wikimedia Commons82643323, Agua Clara Locks,3000x2000), sem missingVisual;111 já tinha asset. Última consulta running/visual-review sem erro ativo. Roteiro, narração e demais cenas preservados; nenhum upload/agendamento alterado.
- Próximo passo: acompanhar revisão editorial e animações/render. A falta de mídia109/111 foi recuperada; render completo ainda não confirmado. Não declarar Panamá concluído antes disso.

## Período de observação — 01/10/2026, tarde
- A pedido do usuário, novos uploads automáticos temporariamente pausados no servidor (publishingEnabled=false), sem reiniciar produção e sem cancelar agendamentos já aceitos no YouTube/Facebook. Pendências ainda não enviadas também aguardam liberação; não reativar automaticamente durante segurança.
- Panamá permanece running/visual-review. Banco confirmado com uma única pauta pendente, Mongólia; produção automática habilitada00:00 Bahia, faixa10-15min e5Shorts. Não adicionar pautas.
- Configuração gravada e relida: publishingEnabled=false. Aguardar estabilização das duas produções; publicações externas aceitas continuam normalmente. Retomar uploads pendentes somente após revisar cota/estado e decisão do usuário.
- Git local apresentou índice corrompido e remoto avançado no trabalho anterior; commit/push da última correção ainda pendente. Preservar alterações e não sobrescrever remoto.

## Aproveitamento de filmagens — 01/10/2026, tarde
- Corrigido auto-media: recuperação videoOnly revisa o banco completo de vídeos compatíveis, não apenas mesma consulta; URLs usadas de vídeo não são bloqueadas globalmente, mas vizinhos continuam excluídos. Orçamento por fonte considera segundos já alocados e descarta fontes sem saldo para a cena. Preparação conserva até300s da fonte em vez de reduzir Pexels/Pixabay ao tamanho da primeira cena; cache v3 distingue arquivos ampliados.
- repairVideoCoverage informa segundos consumidos por fonte e atualiza preparações curtas anteriores quando encontra arquivo ampliado da mesma origem. composeContinuity continua distribuindo trechos distintos e sinalizando esgotamento; não autoriza repetir o mesmo take.
- Pré-pesquisa exige estimativa mínima300s para10min/50% vídeo,360s para12min,450s para15min. Estimativa conservadora até15s por fonte; não comprova relevância/download. Quando contagem/breadth passam mas duração não, classificação inconclusive impede iniciar produção, sem afirmar inexistência de conteúdo. Insufficient existente permanece separado no banco de pautas; Panamá não foi reclassificado como escassez comprovada.
-179 testes passaram, incluindo expansão de preparação antiga e orçamento de uso. auto-media.mjs, video-coverage-repair.mjs e topic-presearch.mjs implantados; Atlas reiniciado, Panamá retomado via API202 com arquivos preservados. Uploads continuam desativados.
- Resultado de cobertura ainda não confirmado: última observação antes do reinício16 cenas/88.52s de vídeo, recuperação running. Não declarar meta50% alcançada. Próximo passo: verificar incremento de vídeo e término da avaliação antes das animações; registrar motivos de descarte se continuar insuficiente. Commit/push ainda bloqueados por índice Git corrompido/remoto avançado; não sobrescrever trabalho remoto.

## Causa comprovada da exclusão e diversidade — 01/10/2026, noite
- Inspecionados quadros reais do vídeo Commons50243662: eclusas, navegação e infraestrutura do Canal. Filtro candidatePool descartava-o por encontrar Costa Rica/Colômbia no itinerário mesmo com evidência explícita de Panamá no título/descrição. Corrigido: país secundário não invalida evidência do país solicitado; material sem evidência continua rejeitado. Teste específico cobre ambos os casos.
- Avaliação visual passou de18 para até48 candidatos, em lotes6, com registro review-shot*.json de opções efetivamente mostradas, seleção e motivo; IDs numéricos/string normalizados. Ranking prioriza assunto e fontes menos utilizadas. Recuperação exclui fontes das cenas vizinhas reais, sem depender de prevSourceId antigo.
- Diversidade tem orçamento proporcional:15% da duração total por fonte, piso30s e teto120s, limitado também aos segundos reais disponíveis. Não usa obrigatoriamente2min nem usa vídeo inteiro para cumprir meta. Continuidade mantém recortes distintos. Preferência editorial não valida trecho irrelevante.
-180 testes passaram; auto-media e video-coverage-repair implantados. Panamá retomado API202, mesmas cenas/áudio e uploads desativados. Meta50% e render ainda não confirmados; não declarar produção finalizada. Pré-pesquisa permanece preliminar, não prova escassez real.
- Índice Git corrompido preservado em.git/index.corrupt-preserved e reconstruído; fetch confirmou que avanço remoto caa2e84 é o snapshot deste próprio trabalho, não alteração desconhecida. Sincronizar snapshot final sem mídias/credenciais.
- Validação no servidor após implantação: vídeo50243662 passou à avaliação, foi escolhido para shot64 (rebocador/canal estreito), salvo em resolved; produção avançou29%→31%,32→34 cenas de vídeo. review-shot86 rejeitou corretamente skyline urbano para narração de floresta/bacia. statusrunning, sem erro ativo, uploadsfalse. Correção sincronizada GitHub84c622c; render/meta50% ainda pendentes.
