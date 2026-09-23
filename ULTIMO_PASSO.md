# Estado atual do Atlas Studio no VPS

**Atualizado em:** 23/09/2026, aproximadamente 19:54 (America/Bahia)

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
- Refinamento instalado no VPS para futuras produções: roteiro longo abre uma pergunta concreta e a resolve com explicação gradual; Shorts mantêm ritmo breve e focado. A redação favorece variação natural de frases e ênfase pontual da voz. O planejador impede que pausas longas estendam um clipe planejado além de cerca de 8 s; o autor visual exige movimento perceptível e contínuo nas fotos. Mapa, renderizador, efeitos e concorrência permanecem iguais.
- Sound design: música com redução de volume sob a fala já existe; não foram adicionados efeitos pontuais porque ainda faltam marcações de eventos e uma biblioteca aprovada, e sons genéricos seriam repetitivos.
- Validação: `npm test` 78/78 aprovados, sintaxe dos três módulos aprovada no contêiner e Atlas `running healthy` após reinício isolado. Qualidade subjetiva da nova voz e tempo de vídeo longo + 5 Shorts ainda precisam de produção real. Lint geral do renderizador ainda mostra erros preexistentes em cenas geradas antigas.

## Próximo passo

- Na próxima produção, ouvir a voz, conferir o gancho e a movimentação das fotos e medir o tempo total do vídeo longo com 5 Shorts antes de afirmar que cabe em 10 horas. Teste de 1 minuto continua sem Shorts nem publicação. Somente considerar efeitos sonoros após definir pistas pontuais verificáveis e ouvir uma amostra.
