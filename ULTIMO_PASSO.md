# Estado atual do Atlas Studio no VPS

**Atualizado em:** 24/09/2026, aproximadamente 13:00 (America/Bahia)

## Acesso e ambiente

- Painel: `https://painel.setupdja.website`; VPS: `ubuntu@137.131.171.144`.
- Código: `/srv/atlas-studio`; contêiner `atlas-studio`; dados persistentes: `/srv/robo/portal-bot/data/atlas-storage`.
- n8n, Cloudflare e painel do WhatsApp preservados. Gate de publicação automática permanece desabilitado.

## Produções validadas

- Teste de 30 s `25e8f356-46c1-490e-836b-d4315b19c609`: MP4 de 34,39 s em 1080p; render otimizado de aproximadamente 13 min.
- Teste de 1 min sem Shorts `72d29595-cb7b-4974-ba30-1db4969dc4cd` (Mar Morto): MP4 de 53,547 s em 1080p, capa e metadados prontos. Render: 23 min 04 s; fluxo completo: 44 min 36 s.
- Teste do Canal do Panamá `b031b905-e96a-4707-a299-5cb318f69125`: primeiro o MP4 principal H.264/AAC de 52,843 s em 1920×1080, capa e metadados validados; depois exatamente um Short H.264/AAC de 48,683 s em 1080×1920, 50.558.108 bytes, validado por `ffprobe`. Render principal: cerca de 19 min 36 s; render do Short: cerca de 23 min 58 s. O vídeo principal ficou pronto antes de iniciar o Short.
- A produção do Panamá tem um agendamento criado posteriormente para 25/09/2026; aparecem cinco horários de Shorts no plano, mas somente o Short 1 foi gerado. O despachante ignora itens sem MP4, e o gate de publicação está desabilitado. Esta tarefa não modificou o agendamento.

## Correções e direção visual

- No primeiro teste de Short, a cena 10 falhou no componente `Freeze` e a recompilação esbarrou em um bundle temporário existente. O gerador agora salva o fallback, remove o bundle anterior, recompila e valida o quadro reparado. Uma referência ausente a `store` também foi corrigida. O mesmo Short foi retomado e chegou a MP4 válido; os arquivos do vídeo principal foram preservados.
- Para futuros documentários, a primeira e a última cena recebem papéis explícitos de abertura e conclusão e passam pela direção visual específica, mesmo quando a mídia é vídeo. A abertura deve materializar a pergunta do assunto; o fim deve retomá-la ou concluir uma consequência com um gesto visual deliberado. O modelo escolhe imagem, tipografia e movimento por assunto, sem logo, vinheta ou cartão final fixo. Shorts mantêm entrada imediata.
- O planejador de mídias passou a escolher material que suporte a pergunta inicial e o fechamento. O mapa Natural Earth, efeitos, concorrência e configuração de render permanecem iguais. As melhorias visuais não alteram os MP4s já concluídos.
- `npm test`: 79/79 aprovados; módulos instalados no VPS; contêiner Atlas `running healthy`. A seleção visual e a renderização de uma produção futura com abertura/fecho novos ainda precisam ser avaliadas assistindo ao MP4.

## Próximo passo

- Na próxima produção de documentário, conferir a abertura sem áudio e os segundos finais sem áudio para avaliar se início e fim são reconhecíveis, além de medir custo adicional da direção visual. Não ativar publicação automática apenas por causa destes testes. Efeitos sonoros pontuais continuam fora do escopo até haver pistas verificáveis e uma amostra aprovada.
