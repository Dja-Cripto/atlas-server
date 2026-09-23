# Estado atual do Atlas Studio no VPS

**Atualizado em:** 23/09/2026, aproximadamente 19:40 (America/Bahia)

## Acesso e ambiente

- Painel: `https://painel.setupdja.website`; VPS: `ubuntu@137.131.171.144`.
- Código no VPS: `/srv/atlas-studio`; serviço Docker Compose `atlas`, contêiner `atlas-studio`.
- Dados persistentes: `/srv/robo/portal-bot/data/atlas-storage`.
- n8n, Cloudflare e painel do WhatsApp preservados. Publicação automática não foi ativada.

## Produções de teste

- Teste de 30 segundos `25e8f356-46c1-490e-836b-d4315b19c609` (“Why the Dead Sea Is So Salty”): MP4 final de 34,39 s em 1080p, capa e metadados prontos, status `review`. O render otimizado levou aproximadamente 13 min; nenhum Short foi gerado.
- Teste solicitado de 1 minuto `72d29595-cb7b-4974-ba30-1db4969dc4cd`, mesmo tema, sem Shorts: finalizado em `review`. MP4 H.264/AAC de 53,547 s, 1920×1080, 61.466.627 bytes, capa e metadados confirmados por `ffprobe` e pelo estado `finalization.ready`. Vídeo: `/outputs/72d29595-cb7b-4974-ba30-1db4969dc4cd/video-3017aa34-745e-4139-915b-903c4131420c.mp4` no painel.
- Teste de 1 minuto criado às 21:53:00 UTC e pronto para revisão às 22:37:36 UTC: aproximadamente 44 min 36 s no fluxo completo. Render de 1.605 quadros iniciado às 22:14:09 UTC e finalizado às 22:37:13 UTC: aproximadamente 23 min 04 s, média de 1,16 quadro/s. A etapa de programação visual demorou cerca de 17 minutos por correções e esperas do GLM; o vídeo não travou.

## Configuração e validação

- O mapa permanece como aprovado pelo usuário: fundo Natural Earth 1:50m com países próximos; países destacados usam contornos 1:10m. Vídeo final 1080p. Nenhum código, efeito, mapa ou concorrência de renderização foi alterado durante o teste de 1 minuto.
- Benchmark anterior do mapa: 95 s para 8 quadros na versão original, 16,5 s após otimização. Retirar o desfoque da foto produziu ganho pequeno e foi revertido para preservar o visual.
- No teste de 1 minuto, a taxa por cena oscilou: primeira filmagem e mapa ficaram por momentos abaixo de 1 quadro/s; outras cenas avançaram mais rápido. A média do render completo superou 1 quadro/s. Picos instantâneos não representam a média.
- `npm test` na última alteração de código: 77/77 aprovados. Lint geral do renderizador ainda mostra erros preexistentes em cenas geradas antigas.

## Próximo passo

- Usuário pode assistir ao teste de 1 minuto no painel e avaliar qualidade. Para otimização futura, medir render por tipo de cena e testar mudanças isoladas em fotos/vídeos; manter a versão atual até demonstrar ganho sem perda visual. Não gerar Shorts nem publicar este teste sem novo pedido.
