# Atlas Studio — estado atual

Atualizado em 30/09/2026, aproximadamente 13:00 (America/Bahia).

## O que foi alterado
- Duração automática: pautas identificadas por topicId/isAutoTopic/durationMode aceitam de 10 a 15 minutos, sem margem adicional; produção manual mantém tolerância existente de 15% sobre o pedido. O erro de 12,4 minutos era um registro da regra antiga. Limites e modo agora ficam no diagnóstico de narração.
- Servidor atualizado e reiniciado. A produção falhada Netherlands Makes Room for Water foi retirada do painel e seu alerta removido; pauta marcada como pulada. Registro de recuperação em data/recovery/cleanup-20260930, sem apagar áudio ou roteiro. Três produções renderizadas preservadas (duas agendadas e uma em revisão).
- O Facebook voltou a receber novos agendamentos. O fluxo n8n usa a credencial protegida `Atlas Facebook Page`; o token literal antigo foi removido. A credencial da Página foi validada por consulta real, sem guardar segredo no projeto.
- Os arquivos binários do n8n foram copiados e movidos para o disco de dados `/srv/robo`, com montagem persistente. O serviço voltou saudável; o disco do sistema passou de 100% para 77% de uso. As cópias antigas só foram retiradas após comparar os 37 arquivos e validar a nova montagem.
- Os seis itens de “Where Singapore Gets Its Water” foram enviados uma única vez ao Facebook e receberam IDs distintos. Os seis agendamentos anteriores de “How Japan Builds Cities That Live with Earthquakes” foram preservados.
- O publicador do YouTube continua em modo agendado, com no máximo um upload por ciclo e sem repetir automaticamente falhas de resultado incerto.

## O que foi validado
- Sintaxe de automatic.mjs válida; seis testes de shorts-render passaram, incluindo aprovação de 12,4 minutos para pauta automática. Limpeza confirmada no banco do servidor: nenhuma produção com status error, três renderizadas mantidas. Agendamentos externos não foram modificados nesta limpeza.
- A Meta confirmou os 12 IDs das duas produções como existentes, `published=false` e com horários futuros: Japão em 30/09 às 14h, 16h, 18h30 e 21h, mais 01/10 às 10h e 13h; Singapura em 01/10 às 14h, 16h, 18h30 e 21h, mais 02/10 às 10h e 13h (Bahia). A publicação final ainda depende da Meta executar esses horários.
- O único vídeo público recente retornado pela listagem da Página foi `Test Short 1`, um teste separado; não é um dos cinco Shorts agendados do Japão.
- A consulta autenticada ao canal YouTube Atlas Unbound retornou zero uploads. Os seis itens do Japão ainda têm erro `uploadLimitExceeded`; a próxima tentativa controlada está prevista para 30/09 por volta de 19h12 (Bahia).
- O vídeo principal e cinco Shorts de Singapura estão renderizados. Seu primeiro envio ao YouTube falhou antes do upload por `ENOSPC` no nó “Baixar Vídeo” do n8n; o Atlas pausou as tentativas seguintes para evitar duplicatas. Não foi criado vídeo no YouTube nessa tentativa.
- n8n respondeu HTTP 200 após a migração; os 37 arquivos estavam visíveis no disco novo. A nova credencial do Facebook agendou seis itens com sucesso.

## Limitações abertas
- O YouTube ainda não aceitou nenhum dos 12 itens. Seu limite diário de uploads é do canal, separado da cota da API; o número exato permitido para esta conta não foi informado pelo YouTube. A liberação só pode ser confirmada numa tentativa real após 24 horas.
- A falha de Singapura por falta de espaço está diagnosticada e o espaço corrigido, mas o estado `publicationPause.youtube` permanece até reconciliação e reagendamento seguros. O horário base de Singapura no YouTube (01/10 às 14h Bahia) colidiria com o vídeo do Japão, caso ambos fossem enviados sem ajuste.
- O disco de dados tem cerca de 49 GB livres. Os binários de execuções do n8n ainda acumulam; configurar retenção/prune antes de muitas novas produções.
- O token de Página não tem expiração definida no campo do token; o prazo separado de acesso a dados informado pela Meta é 28/12/2026. A conexão deve ser monitorada, pois permissões podem ser revogadas.

## Próximo passo recomendado
1. Após 19h12 de 30/09, observar a primeira tentativa do Japão no YouTube e confirmar o ID, privacidade e `publishAt` na plataforma. Se o limite persistir, manter fila segura sem uploads repetidos.
2. Depois de confirmar a capacidade real, reconciliar a pausa de Singapura e atribuir horários próprios no YouTube, sem colisão com Japão nem excesso de uploads no mesmo período.
3. Ajustar a retenção dos binários de execução no n8n e verificar a publicação final dos 12 agendamentos do Facebook nos horários previstos.

