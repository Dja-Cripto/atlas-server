# Atlas Studio — estado atual

Atualizado em 29/09/2026, aproximadamente 19:45 (America/Bahia).

## O que foi alterado
- Publicação futura no YouTube usa modo agendado; o robô recusa modo público e horários vencidos ou próximos demais. Erros de upload incertos não são reenviados às cegas. Limite de uploads conhecido permite nova tentativa após 24 horas.
- Descrições enviadas pelo Atlas removem links HTTP/HTTPS e www, preservando nomes dos sites. O painel agora distingue a data do YouTube da data do Facebook e mostra se o envio ao YouTube ainda está pendente.
- O YouTube envia no máximo um item por ciclo do publicador. Se houver falha de resultado incerto, os próximos uploads desse projeto param para revisão em vez de gerar duplicatas; o painel indica essa pausa.
- Após o usuário excluir os vídeos antigos do YouTube, os seis itens da produção `4aa56f3c-6a61-4e8d-bbb7-001aa343826d` foram rearmados para tentativa automática a partir de 30/09, cerca de 19:12 (Bahia), devido ao limite de uploads da conta. Datas pretendidas no YouTube: vídeo longo e Shorts 1–3 em 01/10; Shorts 4–5 em 02/10, nos horários configurados para Nova York. Ainda não há novos IDs: **não estão agendados na plataforma até o upload ser aceito**.
- Os seis agendamentos corretos do Facebook foram preservados, sem reenvio. Os três envios extras foram removidos da plataforma após autorização do usuário. Novos envios ao Facebook continuam desligados; a publicação automática segue ligada apenas para YouTube.

## O que foi validado
- Nove testes de publicação passaram; sintaxe local e no servidor válida; contêiner Atlas saudável. Execução de conferência no servidor fez zero chamadas antes da hora de nova tentativa.
- Os quatro IDs antigos conhecidos do YouTube não aparecem mais na consulta da API. Nova tentativa do vídeo principal recebeu erro real do YouTube: `The user has exceeded the number of videos they may upload`; nenhum novo vídeo foi criado nessa tentativa.
- Os seis arquivos de vídeo estão acessíveis e suas descrições planejadas não têm links. O histórico do n8n confirma seis envios aceitos ao Facebook com horários futuros e descrições sem links.
- A API do Facebook confirmou os seis vídeos corretos ainda não publicados, com datas entre 30/09 e 01/10; confirmou também que os três IDs extras não estão mais acessíveis. O token novo fornecido pelo usuário é válido, com permissões de Página, mas o próprio token da Página derivado dele expira em 30/09 às 00:00 UTC (29/09 às 21:00 Bahia).

## Limitações abertas
- Não é possível concluir o reenvio ao YouTube antes de a conta voltar a aceitar uploads. Conferir os seis IDs, estado `private` e `publishAt` depois da tentativa automática; se houver novo erro, investigar antes de reenviar para evitar duplicatas.
- O Facebook usa um token literal no fluxo n8n, sem renovação automática. O token temporário recém-testado não foi instalado no fluxo: ele e o token de Página correspondente expiram ainda hoje. Obter autorização duradoura da Página, guardá-la em credencial segura no n8n e retirar o literal do fluxo antes de reativar novos envios.
- Os seis posts aceitos estão agendados no Facebook, mas sua publicação final ainda depende da plataforma nas datas previstas. O histórico antigo em `publications` registra aceitação, não publicação final.

## Próximo passo recomendado
1. Obter token de Página de longa duração por fluxo oficial da Meta, armazená-lo como credencial protegida no n8n, substituir o Bearer literal do fluxo e validar uma chamada real antes de reativar novos envios do Facebook. Não reutilizar o token temporário enviado no chat.
2. Após o limite do YouTube liberar, conferir os seis novos IDs e horários reais no YouTube Studio/API. Manter o Facebook desligado no Atlas até a reconexão ser validada.
