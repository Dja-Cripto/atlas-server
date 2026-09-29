# Atlas Studio — estado atual

Atualizado em 29/09/2026, aproximadamente 18:45 (America/Bahia).

## Último trabalho
- **Correção da Lógica de Agendamento no YouTube (n8n `CXeQ7kICnWCazhzy`)**:
  - Identificado que o parâmetro `youtubeMode: 'public'` fazia o nó `Formatar Publicação` enviar `privacyStatus: 'public'` sem `publishAt`, publicando os vídeos de teste imediatamente em vez de deixá-los como **Agendados**.
  - No YouTube Data API v3, para um vídeo ficar como **Agendado** e estrear automaticamente como Público na data certa, a API exige obrigatoriamente `privacyStatus: 'private'` acompanhado de `publishAt` com a data futura.
  - Atualizado o código do nó `Formatar Publicação` para que qualquer publicação com horário futuro receba automaticamente `privacyStatus: 'private'` e `publishAt: p.publishAt`.
  - n8n reiniciado e sincronizado com `workflow_history`.
- **Tratamento Imediato das Duplicatas no YouTube**:
  - As 6 cópias duplicadas geradas durante os testes de integração foram imediatamente alteradas via API para **Privado** (IDs: `RRqQK1X38eo`, `VAfDs5YNwio`, `j8MyuWhmKBw`, `axhlmD-q-Tk`, `TLgaReeHE_A`, `gM4FlndQSW4`), tornando-as invisíveis para qualquer espectador.
  - Prontas para exclusão permanente via API caso o usuário deseje.
- **Estado do Facebook (Meta Graph API)**:
  - 100% íntegro e agendado: o vídeo longo e todos os 5 Shorts estão programados para 30/09 e 01/10 na Página **Atlas Unbound** com `published: false` e `scheduled_publish_time`.

## Estado verificado
- Roteador Switch e agendador corrigidos no n8n.
- Vídeos duplicados no YouTube colocados em privado.
- Grade no Facebook confirmada como agendada.

## Erros ou limitações que continuam abertos
- Cota diária do YouTube: o canal atingiu o limite de envios em janela de 24h estabelecido pelo Google para canais novos. Shorts 4 e 5 no YouTube aguardam o reset dessa janela para envio.

## Próximo passo recomendado
- Daniel confirmar se deseja que as 6 duplicatas em privado sejam excluídas definitivamente do YouTube via API, e se prefere manter os 3 shorts originais ativos ou colocá-los também em privado até amanhã.
