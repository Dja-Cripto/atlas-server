# Atlas Studio — estado atual

Atualizado em 29/09/2026, aproximadamente 17:35 (America/Bahia).

## Último trabalho
- **Validação Completa da Autenticação do YouTube**:
  - Usuário reconectou a conta Google no n8n com sucesso.
  - Credencial `YouTube account` (`youTubeOAuth2Api`) testada via chamada oficial à API do YouTube: canal **Atlas Unbound** (`@atlasunbounddocs`, ID `UCZeu2tVZ2G8Xj0xMjrteq7Q`) autenticado e respondendo normalmente com todas as permissões (`youtube.upload`, `youtube.force-ssl`, `youtube`, `youtubepartner`).
  - Nenhum vídeo foi publicado no teste; apenas a autorização e conectividade com a API foram validadas.
- **Roteamento e Downloads Internos no n8n (`CXeQ7kICnWCazhzy`)**:
  - Nó `Roteador de Canal` operando em modo de expressão determinística.
  - Nós `Baixar Vídeo` e `Baixar Capa` apontando para a rota interna local (`http://atlas-studio:3000`), com teste de download do vídeo de 1,5 GB concluído com sucesso em 0,5 segundo (HTTP 200).
- **Testes automatizados**:
  - 168 testes passando com 100% de sucesso (`npm test`).

## Estado verificado
- **YouTube**:
  - 100% pronto, autenticado e apto para upload do vídeo longo e dos 5 Shorts verticais assim que o gatilho for acionado.
- **Pacote do Japão (`4aa56f3c-6a61-4e8d-bbb7-001aa343826d`)**:
  - Vídeo longo de 14m18s íntegro (1,5 GB).
  - 5 Shorts verticais 1080x1920 finalizados.
  - Capa 16:9 oficial antissísmica vinculada.
  - Legendas WebVTT e horários de agendamento em modo público configurados para 30/09 e 01/10.

## Erros ou limitações que continuam abertos
- **Facebook**: O token de acesso da página no nó `Facebook - Vídeos & Reels` expirou em 20/09 e necessita de um novo Bearer Token caso o usuário deseje publicar simultaneamente no Facebook.

## Próximo passo recomendado
- Definir com Daniel se ele deseja publicar somente no YouTube agora ou se aguarda o token do Facebook para subir nos dois ao mesmo tempo.
