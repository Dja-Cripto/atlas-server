# Estado atual do Atlas Studio no VPS

**Atualizado em:** 20/09/2026, aproximadamente 15:05 (America/Bahia)

## Acesso e Ambiente

- Domínio público oficial ativo: `https://painel.setupdja.website` (Cloudflare Tunnel roteado para `portal-panel:3000` na rede `n8n-network`).
- Acesso local no host VPS: `http://127.0.0.1:4310`
- VPS: `ubuntu@137.131.171.144`
- Diretório no VPS: `/srv/atlas-studio`
- Repositório: `https://github.com/Dja-Cripto/atlas-server`, branch `main`.
- Armazenamento pesado: montado na partição `/srv/robo/portal-bot/data/atlas-storage` (85 GB livres) para `data`, `.temp` e `auto`.

## O que foi alterado e concluído

1. **Validação e Conexão da Página do Facebook (Atlas Unbound):**
   - Resolvido o Token de Página do Facebook através do User Token do Daniel, identificando a página oficial **Atlas Unbound** (ID: `1339165152613050`).
   - Rota de download de vídeos `/outputs/` e `/shorts/` liberada de autenticação por cookie no `server.mjs`, permitindo que os servidores de ingestão de mídia do Facebook baixem e processem os arquivos MP4 diretamente via Cloudflare Tunnel.

2. **Publicação de Vídeo Testada com Sucesso no Facebook:**
   - Realizado teste de publicação direta via Facebook Graph API: vídeo publicado com sucesso (ID `1416847957077810`). Status: `video_status: ready` e `publish_status: published`.
   - Workflow do n8n `CXeQ7kICnWCazhzy` configurado e acionado via webhook com `channels.facebook: true`, retornando HTTP 200.

3. **Status no Hub Central do Atlas Studio:**
   - Atualizado em `public/app.js` e `server.mjs` o status do canal Facebook para `✓ Conectado (Atlas Unbound)`.

4. **Integração e teste completo do YouTube:**
   - A credencial nova `YouTube account` (`d6O8y7GyYFGpLz7q`) foi associada ao nó `YouTube - Vídeo Longo` do workflow ativo `CXeQ7kICnWCazhzy`.
   - Foi incluído o nó `Baixar MP4 para YouTube`, que baixa a mídia como binário `data` antes do upload. O formatador também passou a aceitar payload direto e payload recebido em `body`.
   - O nó do YouTube está habilitado com categoria 27, notificações desativadas e privacidade fixa em `private` durante esta fase. Facebook foi preservado e TikTok permaneceu desabilitado.
   - O teste ponta a ponta via webhook enviou e processou com sucesso o vídeo privado `TESTE PRIVADO — Atlas Unbound — Integração n8n` (ID `-MKQrlXN0YU`) no canal **Atlas Unbound**.
   - A API confirmou o canal `UCZeu2tVZ2G8Xj0xMjrteq7Q` (`@atlasunbounddocs`), `privacyStatus: private`, `uploadStatus: processed` e `processingStatus: succeeded`.
   - O modelo versionado `deploy/n8n-atlas-publisher.json` foi atualizado com o formatador compatível, download binário e configuração privada do YouTube, sem credenciais.
   - O backup anterior ao teste está no VPS em `/home/ubuntu/atlas-workflow-backups/CXeQ7kICnWCazhzy-before-youtube-test-20260920.json`.

## O que foi validado e resultado

- Publicação direta na página do Facebook: 100% funcional (vídeo ID `1416847957077810`).
- Download do arquivo MP4 pelo Graph API: HTTP 200.
- Disparo do webhook n8n: HTTP 200.
- Nova credencial YouTube: operacional; canal confirmado como **Atlas Unbound** (`@atlasunbounddocs`).
- Workflow do YouTube: execução n8n `53417` concluída com `success` em aproximadamente 17 segundos.
- Upload e processamento do vídeo de teste: concluídos. Vídeo privado ID `-MKQrlXN0YU`.
- Arquivo temporário com a credencial descriptografada: apagado imediatamente após a validação.
- Modelo JSON do workflow: estrutura e configuração privada validadas localmente.

## Erros ou limitações abertos

- O YouTube está funcional, mas permanece configurado para publicar como `private`. A mudança para público ou agendado deve ocorrer somente depois da conferência manual no YouTube Studio.
- TikTok continua aguardando credencial e aprovação da API.

## Próximo passo recomendado

- Conferir o vídeo privado `-MKQrlXN0YU` no YouTube Studio. Depois, definir a regra de produção desejada (`public` imediato ou `private` com agendamento) e executar um teste final com um vídeo real. TikTok pode continuar fora do fluxo.
