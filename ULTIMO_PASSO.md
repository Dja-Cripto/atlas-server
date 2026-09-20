# Estado atual do Atlas Studio no VPS

**Atualizado em:** 20/09/2026, aproximadamente 14:30 (America/Bahia)

## Acesso e Ambiente

- Domínio público oficial ativo: `https://painel.setupdja.website` (Cloudflare Tunnel roteado para `portal-panel:3000` na rede `n8n-network`).
- Acesso local no host VPS: `http://127.0.0.1:4310`
- VPS: `ubuntu@137.131.171.144`
- Diretório no VPS: `/srv/atlas-studio`
- Repositório: `https://github.com/Dja-Cripto/atlas-server`, branch `main`.
- Armazenamento pesado: montado na partição `/srv/robo/portal-bot/data/atlas-storage` (85 GB livres) para `data`, `.temp` e `auto`.

## O que foi alterado e concluído

1. **Validação e Conexão da Página do Facebook (Atlas Unbound):**
   - Resolvido o Token de Página do Facebook (`access_token`) através do User Token do Daniel, identificando a página oficial **Atlas Unbound** (ID: `1339165152613050`).
   - Rota de download de vídeos `/outputs/` e `/shorts/` liberada de autenticação por cookie no `server.mjs`, permitindo que os servidores de ingestão de mídia do Facebook (CDN) baixem e processem os arquivos MP4 diretamente via Cloudflare Tunnel (`https://painel.setupdja.website`).

2. **Publicação de Vídeo Testada com Sucesso no Facebook:**
   - Realizado teste de publicação direta via Facebook Graph API: vídeo publicado com sucesso (ID do vídeo: `1416847957077810`). Status no Facebook: `video_status: ready` e `publish_status: published`.
   - Workflow do N8N (`CXeQ7kICnWCazhzy`) configurado e acionado via webhook com `channels.facebook: true`, retornando status 200 OK ("Workflow was started").

3. **Status no Hub Central do Atlas Studio:**
   - Atualizado em `public/app.js` e `server.mjs` o status do canal Facebook para `✓ Conectado (Atlas Unbound)`.

4. **Auditoria da integração do YouTube:**
   - O workflow antigo `Robô Portal do Investidor - Agenda Semanal IA (TESTE)` contém o nó `Publicar no YouTube Shorts` ligado à credencial `YouTube account` (`LQiHdUFn3UGRHuGQ`).
   - O workflow novo `Atlas Studio - Publicação Multiplataforma` está ativo, mas seu nó `YouTube - Vídeo Longo` continua desabilitado e sem credencial associada.
   - Existe somente uma credencial YouTube no n8n. Ela possui escopo `youtube.upload`, access token e refresh token, mas o Google recusou a renovação com `invalid_grant`.
   - Nenhum vídeo foi publicado ou alterado durante a auditoria. O arquivo temporário com a credencial descriptografada foi apagado imediatamente dentro do container.

## O que foi validado e resultado

- Publicação direta na página do Facebook: 100% funcional (Vídeo ID `1416847957077810` publicado na página Atlas Unbound).
- Download do arquivo MP4 pelo Graph API: HTTP 200 OK.
- Disparo do webhook N8N: HTTP 200 OK.
- Sintaxe JS dos arquivos modificados: aprovada sem erros.
- A credencial antiga do YouTube não está operacional; por isso não foi possível consultar ou confirmar o canal secundário `Atlas` pela API.

## Erros ou limitações abertos

- O YouTube precisa ser reconectado no n8n usando o mesmo Gmail e selecionando explicitamente o canal secundário `Atlas` durante o consentimento. Reutilizar apenas o registro antigo não funciona porque o refresh token está inválido.
- O nó do YouTube no workflow novo deve permanecer desligado até a reconexão e um teste privado/não listado.
- TikTok continua aguardando credencial e aprovação da API.

## Próximo passo recomendado

- No n8n, abrir a credencial `YouTube account`, executar `Reconnect` e escolher o canal `Atlas` no seletor de canal/Brand Account do Google. Depois validar com upload privado ou não listado antes de associar essa credencial ao nó `YouTube - Vídeo Longo` do workflow novo.
