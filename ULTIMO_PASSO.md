# Estado atual do Atlas Studio no VPS

**Atualizado em:** 22/09/2026, aproximadamente 17:00 (America/Bahia)

## Acesso e ambiente

- Painel: `https://painel.setupdja.website`; VPS `ubuntu@137.131.171.144`.
- Projeto no VPS: `/srv/atlas-studio`; serviço Docker Compose `atlas`, contêiner `atlas-studio`.
- Publicação automática desligada. n8n, Cloudflare e painel do WhatsApp preservados.

## Fluxo de produção

- A produção de teste antiga `3677be46-ea60-4ea1-aee9-adab207b5235` foi removida do banco e dos diretórios específicos no VPS.
- A validação das cenas do vídeo principal retoma da última cena confirmada sem reprogramar o lote inteiro.
- Shorts só são liberados após MP4 principal 1080p validado por ffprobe, capa, título e descrição. A produção para para revisão na aba Final & Publicação.
- Cada acionamento gera no máximo um Short, valida o MP4 vertical por ffprobe e volta para revisão; os cinco só são marcados concluídos após todos os MP4s.
- Nova produção tem um campo curto e opcional de direção editorial (até 400 caracteres), salvo na produção e usado na pesquisa e no roteiro. O Banco de Pautas já possui um campo de descrição; o fluxo da fila não foi alterado nesta revisão.

## Validação e próximo passo

- Sintaxe verificada e `npm test`: 73/73 testes aprovados. O teste de API cobre gravação e limite da direção editorial.
- Revisão anterior `854366e` instalada e saudável no VPS; painel HTTP 200. Teste sintético confirmou um Short por chamada e bloqueio sem pacote principal.
- Próximo passo: instalar esta revisão no serviço Atlas, conferir o campo no painel e então iniciar uma produção curta de teste. Uma produção longa completa ainda não foi executada com o fluxo novo. Falhas externas podem ocorrer e devem bloquear o avanço preservando o progresso.