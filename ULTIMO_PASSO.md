# Atlas Studio — estado atual

Atualizado em 29/09/2026, aproximadamente 17:20 (America/Bahia).

## Último trabalho
- **Diagnóstico e Correção da Publicação Multiplataforma no n8n (`CXeQ7kICnWCazhzy`)**:
  - Identificada a causa da falha no YouTube: token OAuth expirado no n8n (`EAUTH / invalid or expired token`).
  - Identificada a causa da falha no Facebook: token de página expirado em 20/09/2026 (`OAuthException 190, session expired`).
  - Corrigido o nó de roteamento `Roteador de Canal` (Switch) no n8n para modo de expressão determinística (`$json.channel === "facebook" ? 1 : 0`), eliminando o desvio incorreto de payloads do Facebook para o fluxo do YouTube.
  - Corrigidos os nós `Baixar Vídeo` e `Baixar Capa` no n8n para baixar internamente via `http://atlas-studio:3000` em velocidade de rede local Docker, eliminando timeouts de 120s da Cloudflare (HTTP 524).
- **Liberação de Host Interno Docker (`server.mjs`)**:
  - Adicionado `atlas-studio` e `atlas-studio:3000` à lista de hosts permitidos (`allowedHosts`). Validada a resposta HTTP 200 direta para o arquivo de 1,5 GB.
  - Alteração commitada (`f5441d3`), enviada ao GitHub e aplicada na VPS com restart do container.
- **Testes automatizados**:
  - 168 testes passando com 100% de sucesso (`npm test`).

## Estado verificado
- **Vídeos e Metadados do Japão (`4aa56f3c-6a61-4e8d-bbb7-001aa343826d`)**:
  - Vídeo longo de 14m18s íntegro (1,5 GB).
  - 5 Shorts verticais 1080x1920 prontos e validados.
  - Capa 16:9 antissísmica vinculada.
  - Legendas WebVTT e horários de agendamento em modo público configurados para 30/09 e 01/10.
- **Infraestrutura**:
  - n8n operando normalmente com rota interna otimizada e sem timeout de download.
  - Disco da VPS com mais de 5,8 GB livres.

## Erros ou limitações que continuam abertos
- **YouTube**: A credencial `youTubeOAuth2Api` (`YouTube account`) precisa de reconexão/login com Google pelo painel do n8n para renovar o OAuth token.
- **Facebook**: O token de acesso da página no nó `Facebook - Vídeos & Reels` expirou e necessita de um novo Bearer Token para permitir postagem automática pela Graph API.

## Próximo passo recomendado
- Daniel efetuar a reconexão da conta do YouTube no n8n (basta clicar em Reconectar na credencial `YouTube account`) e, se desejar o Facebook ativo, atualizar o token da página no nó do Facebook.
