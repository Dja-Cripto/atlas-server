# Atlas Studio — estado atual
**Atualizado em:** 27/09/2026, aproximadamente 13:30 (America/Bahia).

## Versões
- V2 funcional preservada na tag `atlas-visual-v2-checkpoint-2026-09-26` (commit `d64e2ea`); procedimento de retorno em `CHECKPOINTS.md`.
- V3 em `codex/atlas-visual-v3`. Alterações atuais beneficiam novas produções.
- V3 publicada na VPS `/srv/atlas-studio` a partir do commit `b483252` em 27/09/2026. O serviço Docker `atlas-studio` está saudável e o painel público respondeu HTTP 200. A imagem anterior foi marcada `atlas-studio:v2-checkpoint-2026-09-27`.
- Indicadores da interface atualizados para “V3” no logotipo, cabeçalho e rodapé lateral; o rótulo antigo “V0.2” foi removido. Validado por comparação do HTML: somente esses marcadores mudaram.
- Por solicitação do usuário, os 17 projetos antigos da VPS foram excluídos com renders, arquivos temporários e cache de mídia. Verificação final: zero projetos no banco e zero pastas de projeto com UUID. Configurações, credenciais, músicas, modelos e checkpoint de código foram preservados. No volume de produção restaram 85 GB livres (uso de 10%).

## Correção da produção longa na VPS
- Projeto “How the Netherlands Keeps the Sea Out” (13 min): pesquisa, roteiro e narração preservados; 128 direções de cena e 68 mídias em cache. A revisão parou porque a validação Full HD quebrava ao receber `null` antes de tentar gerar qualquer ilustração. A busca inicial deixou 61 cenas sem mídia em 128; isso exige revisão de cobertura para não trocar metade do documentário por ilustrações.
- Corrigida a validação de dimensões nulas e adicionada busca de apoio pelo assunto e país, sem afrouxar a exigência de identidade geográfica. Suíte de 138 testes aprovada. O projeto deve ser retomado reaproveitando roteiro, voz, plano e mídias já salvos; a cobertura final e a qualidade visual ainda precisam ser verificadas na VPS.

## Estado validado da V3
- Vídeo de teste “Why Does Tokyo Have So Many Vending Machines?”: 52 segundos, Full HD, 9 cenas de vídeo real, narração e trilha equilibradas, sem tela vazia. Um clipe de loja indiana apareceu numa cena contextual de Tóquio; o filtro agora rejeita mídia explicitamente identificada como outro país. O Short vertical concluiu: 51 segundos, 1080×1920, 11 cenas, áudio normalizado e sem pausas longas. A inspeção encontrou um consultório usado como loja e pouca presença da máquina no conjunto; a busca agora herda o tema quando vier vazia e rejeita mídia médica em cenas sobre comércio. O MP4 existente foi preservado.
- Música documental e de Shorts usa lista revisada, sem rock/horror por padrão. Faixas são normalizadas antes da mistura; se a normalização falhar, a cópia é descartada para manter voz limpa, nunca uma trilha desequilibrada.
- Projetos marcados para cinco Shorts agora executam os cinco em sequência também ao iniciar a etapa Shorts manualmente. Um projeto criado sem essa opção continua gerando apenas um Short por ação manual.
- Agendador do Banco de Pautas usa dia/hora da Bahia, recupera a execução quando passa do minuto configurado, persiste a data após iniciar e aguarda a produção ativa terminar. Pautas adicionadas depois do horário ainda podem iniciar no mesmo dia se nenhuma começou. Agendamento de publicação exige MP4 principal e, quando cinco Shorts foram solicitados, todos os cinco MP4s prontos.

## Ritmo exclusivo dos Shorts
- Shorts V3 agora recebem direção visual própria e não herdam o respiro do documentário longo. Foi removido o atalho que transformava vídeo descritivo em take quase limpo com legenda local. O Luna programa também essas cenas, alternando movimentos leves e explicações mais elaboradas; código de cena sem desenvolvimento quadro a quadro é recusado e corrigido.
- O planejamento pode usar fotografia real quando ela representar melhor o assunto, sempre com composição animada. Um diagrama independente sobre fundo discreto é permitido para explicar um mecanismo invisível, somente com fatos narrados/verificados e quando fizer sentido; não é uma quota. O vídeo longo conserva cenas contemplativas.
- O Short de Tóquio já renderizado foi preservado. Duas de suas 11 cenas seriam consideradas estáticas pela nova validação. O próximo Short precisa de avaliação visual para confirmar o ganho de dinamismo e o tempo/custo adicional de autoria.

## Validação e limites
- Suíte `npm test`: testes de regressão aprovados. Testes específicos cobrem sequência, horário diário, música sem normalização, mídia de país errado/consultório e agendamento incompleto.
- Projeto de teste de Tóquio está configurado com `generateShorts=false` e `shortsCount=0`; por isso o Short manual é 1/1. O Banco de Pautas está ativo mas sem pautas pendentes. Publicação automática está desligada; o agendamento só prepara a fila e não envia ao YouTube até a integração e a chave de publicação estarem prontas.
- O Short teve revisão técnica e visual; a avaliação criativa final do usuário ainda é necessária. Uma produção marcada para cinco Shorts completos ainda não foi exercitada de ponta a ponta. A V3 foi verificada na VPS quanto a inicialização, saúde do serviço e resposta HTTP; uma produção completa no servidor ainda precisa ser exercitada. Fallback do roteiro Luna para Gemini continua não implementado após rejeição anterior da revisão automática de autorização.
- Arquivos de benchmark e alterações paralelas fora desta revisão não foram incorporados ao snapshot.

## Próximo passo recomendado
Retomar a produção holandesa na VPS após o deploy desta correção, verificar a cobertura real e aprovar a qualidade antes da renderização. Depois validar o ritmo do Short e uma produção marcada para cinco Shorts.
