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
