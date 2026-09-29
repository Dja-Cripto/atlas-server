# Atlas Studio — estado atual

Atualizado em 29/09/2026, aproximadamente 18:25 (America/Bahia).

## Último trabalho
- **Roteamento e Publicação Multiplataforma no n8n (`CXeQ7kICnWCazhzy`)**:
  - Nó `Roteador de Canal` migrado para Switch v3.2 em modo `expression` determinístico (`output: ={{ $json.channel === 'facebook' ? 1 : 0 }}`), garantindo separação estrita entre fluxos de YouTube e Facebook.
  - Sincronização direta de versões entre `workflow_entity` e `workflow_history` para que execuções de webhook usem sempre a versão ativa compilada.
  - Formatação padronizada do payload do Facebook (`facebookBody`) no nó `Formatar Publicação`, tratando corretamente os parâmetros `published: false` e `scheduled_publish_time` exigidos pela Meta Graph API.
- **Agendamento Completo do Pacote do Japão (`4aa56f3c-6a61-4e8d-bbb7-001aa343826d`)**:
  - **Facebook (Página Atlas Unbound)**:
    - Vídeo longo oficial de 14m18s agendado para 30/09 às 14h00 BRT (ID: `1895716424913786`).
    - Short 1 agendado para 30/09 às 16h00 BRT (ID: `1113298161205632`).
    - Short 2 agendado para 30/09 às 18h30 BRT (ID: `1124145520294649`).
    - Short 3 agendado para 30/09 às 21h00 BRT (ID: `2107058049937029`).
    - Short 4 agendado para 01/10 às 10h00 BRT (ID: `1099661059693488`).
    - Short 5 agendado para 01/10 às 13h00 BRT (ID: `1116679417714255`).
  - **YouTube (Canal Atlas Unbound)**:
    - Vídeo longo oficial público disponível no canal (ID: `IJXCdY_vH5A`).
    - Short 1 agendado (ID: `1_Oz87xxe9I`).
    - Short 2 agendado (ID: `Rw-udFIJ2G4`).
    - Short 3 agendado (ID: `z4iUB1DKRxc`).
- **Testes automatizados**:
  - 168 testes passando com 100% de sucesso (`npm test`).

## Estado verificado
- Pipeline de publicação multiplataforma (YouTube + Facebook) operacional, validado em ponta a ponta e integrado ao banco de dados do Atlas Studio (`studio.sqlite`).
- Todo o pacote do Japão programado no Facebook e no YouTube para distribuição a partir de amanhã.

## Erros ou limitações que continuam abertos
- Cota diária do YouTube: o canal atingiu o limite de envios em janela de 24h estabelecido pelo Google para canais novos (foram enviados 10 vídeos durante os testes de integração). Os Shorts 4 e 5 no YouTube aguardam o reset dessa janela de cota diária para envio. No Facebook, todos os 6 conteúdos (longo + 5 shorts) estão agendados com sucesso.

## Próximo passo recomendado
- Acompanhar as publicações programadas que começam a ir ao ar a partir de amanhã (30/09) e, após a renovação da cota de 24h do YouTube, rodar o disparo dos Shorts 4 e 5 para o canal.
