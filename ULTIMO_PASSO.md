# Estado atual do Atlas Studio no VPS

**Atualizado em:** 20/09/2026, aproximadamente 15:40 (America/Bahia)

## Acesso e ambiente

- Painel: `https://painel.setupdja.website` — HTTP 200 e contêiner `atlas-studio` saudável.
- n8n: `https://n8n.setupdja.website` — HTTP 200.
- VPS: `ubuntu@137.131.171.144`.
- Projeto no VPS: `/srv/atlas-studio`, branch `main`.
- Cloudflare Tunnel, volumes de mídia, banco e painel do WhatsApp foram preservados.
- Armazenamento pesado permanece em `/srv/robo/portal-bot/data/atlas-storage`.

## Estado funcional

1. **Trava única de publicação**
   - A tela **Agendamento** possui o botão `Ligar publicação`.
   - A configuração persistente `publishingEnabled` está confirmada como `false` no VPS.
   - Produzir e agendar projetos não chama YouTube ou Facebook enquanto essa chave estiver desligada.
   - Ao ligar, os itens completos da fila são enviados ao n8n. Itens aceitos ficam registrados por canal e não são reenviados.

2. **Agenda real**
   - Cada produção prepara um vídeo longo e até cinco Shorts.
   - O horário é convertido do fuso configurado para UTC.
   - YouTube recebe `publishAt` e mantém o vídeo privado até a hora marcada.
   - Facebook recebe os campos de publicação programada.
   - A agenda usa o título escolhido, descrição, tags e o caminho real do último MP4 renderizado.

3. **YouTube**
   - Vídeo longo privado já foi validado anteriormente no canal **Atlas Unbound**: ID `-MKQrlXN0YU`.
   - O workflow agora aceita vídeo longo e Short pelo mesmo publicador.
   - Upload de capa foi incluído para vídeo longo.
   - A transcrição local é convertida em WebVTT e enviada internamente ao n8n; não existe rota pública de legendas.
   - Título, descrição, tags, idioma, privacidade e horário são enviados.
   - Nós do vídeo, capa e legenda preservaram a credencial `YouTube account`.

4. **Facebook**
   - O publicador aceita vídeos longos e vídeos verticais.
   - Título, descrição, URL do MP4 e horário programado são enviados.
   - A autenticação existente no cabeçalho do nó foi preservada.
   - A publicação direta anterior permanece comprovada pelo vídeo ID `1416847957077810`.

5. **Shorts**
   - Novos projetos marcados para gerar Shorts recebem `shortsCount: 5`.
   - A fila inclui os cinco MP4s renderizados, com títulos, descrições, VTT e horários individuais.
   - Três Shorts ficam no primeiro dia e dois no segundo, conforme a grade configurada.

6. **Confirmação e erros**
   - O webhook do n8n responde somente após o último nó.
   - O Atlas registra cada item como `sending`, `accepted` ou `error`, com ID externo quando retornado.
   - Falhas deixam o item disponível para nova tentativa; itens aceitos não são duplicados.
   - O aviso antigo que afirmava publicação sem confirmação foi substituído por mensagem de item colocado na fila.

7. **TikTok**
   - Continua desabilitado e fora da fila, conforme solicitado.

## Validações

- Suíte local: **70 testes aprovados, zero falhas**.
- Diagnóstico de produção automática: aprovado sem chamadas externas.
- Sintaxe de `server.mjs`, `public/app.js`, módulo de publicação e JSON do workflow: aprovada.
- Workflow `CXeQ7kICnWCazhzy`: ativo, com 16 nós.
- YouTube vídeo/capa/legenda: credenciais presentes.
- Facebook: configuração de autenticação por cabeçalho preservada.
- TikTok: nó desabilitado.
- Chave global no VPS: **desligada**.
- Backup anterior do n8n: `/home/ubuntu/atlas-workflow-backups/CXeQ7kICnWCazhzy-before-full-publisher-20260920.json`.

## Limitação deliberada

- Nenhum novo vídeo, Short, capa ou legenda foi enviado nesta atualização porque a publicação automática deve permanecer desligada. A estrutura foi validada por testes, importação no n8n e inspeção das credenciais. O teste externo completo ocorrerá somente quando o botão for ligado.

## Próximo passo

- Revisar uma produção completa já agendada e clicar uma única vez em **Ligar publicação**. Acompanhar o primeiro lote no n8n e no YouTube Studio/Facebook; depois disso a fila segue automaticamente.
