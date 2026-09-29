# Atlas Studio — estado atual

Atualizado em 29/09/2026, aproximadamente 19:30 (America/Bahia).

## O que foi alterado
- Publicação futura no YouTube usa modo agendado; o robô recusa modo público e horários vencidos ou próximos demais. Erros de upload incertos não são reenviados às cegas. Limite de uploads conhecido permite nova tentativa após 24 horas.
- Descrições enviadas pelo Atlas removem links HTTP/HTTPS e www, preservando nomes dos sites. O painel agora distingue a data do YouTube da data do Facebook e mostra se o envio ao YouTube ainda está pendente.
- O YouTube envia no máximo um item por ciclo do publicador. Se houver falha de resultado incerto, os próximos uploads desse projeto param para revisão em vez de gerar duplicatas; o painel indica essa pausa.
- Após o usuário excluir os vídeos antigos do YouTube, os seis itens da produção `4aa56f3c-6a61-4e8d-bbb7-001aa343826d` foram rearmados para tentativa automática a partir de 30/09, cerca de 19:12 (Bahia), devido ao limite de uploads da conta. Datas pretendidas no YouTube: vídeo longo e Shorts 1–3 em 01/10; Shorts 4–5 em 02/10, nos horários configurados para Nova York. Ainda não há novos IDs: **não estão agendados na plataforma até o upload ser aceito**.
- Os seis registros de Facebook aceitos anteriormente foram preservados, sem reenvio. Novos envios ao Facebook foram desligados porque a credencial do n8n expirou em 29/09. A publicação automática continua ligada apenas para YouTube.

## O que foi validado
- Nove testes de publicação passaram; sintaxe local e no servidor válida; contêiner Atlas saudável. Execução de conferência no servidor fez zero chamadas antes da hora de nova tentativa.
- Os quatro IDs antigos conhecidos do YouTube não aparecem mais na consulta da API. Nova tentativa do vídeo principal recebeu erro real do YouTube: `The user has exceeded the number of videos they may upload`; nenhum novo vídeo foi criado nessa tentativa.
- Os seis arquivos de vídeo estão acessíveis e suas descrições planejadas não têm links. O histórico do n8n confirma seis envios aceitos ao Facebook com horários futuros e descrições sem links.

## Limitações abertas
- Não é possível concluir o reenvio ao YouTube antes de a conta voltar a aceitar uploads. Conferir os seis IDs, estado `private` e `publishAt` depois da tentativa automática; se houver novo erro, investigar antes de reenviar para evitar duplicatas.
- A credencial do Facebook expirou. O histórico do n8n contém três envios extras além dos seis corretos: `1056082343858919`, `1459166459432851` e `1607829160785176`. O usuário autorizou remover os extras, mas a API recusou leitura e exclusão com a credencial expirada. O estado atual desses posts na plataforma não foi confirmado.
- O Facebook usa um token literal no fluxo n8n, sem renovação automática. Um token temporário do Graph API Explorer não resolve o uso contínuo; obter autorização duradoura da Página, guardá-la em credencial segura no n8n e retirar o literal do fluxo.
- O histórico antigo em `publications` para o Facebook registra aceitação, não prova publicação final. A conexão com o Facebook precisa ser renovada antes de verificar ou limpar posts e antes de retomar novos envios ao canal.

## Próximo passo recomendado
1. Renovar a credencial da Página Atlas Unbound no n8n, sem inserir tokens no código nem neste arquivo; confirmar via API os seis posts corretos e remover somente os três extras que ainda existirem.
2. Após o limite do YouTube liberar, conferir os seis novos IDs e horários reais no YouTube Studio/API. Manter o Facebook desligado no Atlas até a reconexão ser validada.
