# Atlas Studio — estado atual

Atualizado em 29/09/2026, aproximadamente 17:42 (America/Bahia).

## Último trabalho
- **Validação e Configuração Completa do Facebook (Meta Graph API)**:
  - Usuário forneceu novo token de acesso.
  - Conexão testada via chamada oficial à Graph API: identificada a Página oficial **Atlas Unbound** (ID `1339165152613050`), com permissões completas de gerenciamento e publicação (`CREATE_CONTENT`, `MANAGE_LEADS`, `MODERATE`, `MESSAGING`, `ADVERTISE`, `MANAGE`).
  - Endpoint de vídeos da página (`/{page_id}/videos`) testado com sucesso (HTTP 200).
  - Nó `Facebook - Vídeos & Reels` no workflow n8n (`CXeQ7kICnWCazhzy`) atualizado com o Page Access Token correspondente e n8n reiniciado.
- **Validação Completa do YouTube**:
  - Canal **Atlas Unbound** (`@atlasunbounddocs`, ID `UCZeu2tVZ2G8Xj0xMjrteq7Q`) autenticado e validado com todas as permissões (`youtube.upload`, `youtube.force-ssl`, `youtube`, `youtubepartner`).
- **Otimização de Rota Interna e Downloads no n8n**:
  - `Roteador de Canal` operando em modo de expressão determinística.
  - Downloads locais via `http://atlas-studio:3000` validados em 0,5 segundo para o arquivo de 1,5 GB.
- **Testes automatizados**:
  - 168 testes passando com 100% de sucesso (`npm test`).

## Estado verificado
- **YouTube e Facebook Multiplataforma**:
  - Ambos os canais 100% autenticados, validados e aptos para publicação e agendamento automático.
- **Pacote do Japão (`4aa56f3c-6a61-4e8d-bbb7-001aa343826d`)**:
  - Vídeo longo de 14m18s íntegro (1,5 GB).
  - 5 Shorts verticais 1080x1920 prontos e validados.
  - Capa oficial 16:9 antissísmica vinculada.
  - Legendas WebVTT geradas e sincronizadas.
  - Agendado para 30/09 e 01/10 em modo público.
- **Infraestrutura**:
  - Servidor, container `atlas-studio`, `n8n` e conexões internas 100% saudáveis.

## Erros ou limitações que continuam abertos
- Nenhum erro de credencial ou roteamento pendente.

## Próximo passo recomendado
- Daniel autorizar o acionamento do gatilho de publicação para disparar o upload e agendamento dos vídeos no YouTube e no Facebook.
