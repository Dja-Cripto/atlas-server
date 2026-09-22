# Estado atual do Atlas Studio no VPS

**Atualizado em:** 22/09/2026, aproximadamente 20:00 (America/Bahia)

## Acesso e ambiente

- Painel: `https://painel.setupdja.website` — VPS `ubuntu@137.131.171.144`.
- Projeto: `/srv/atlas-studio`; serviço Docker Compose `atlas`, contêiner `atlas-studio`.
- Publicação automática permanece desligada. n8n, Cloudflare e painel do WhatsApp preservados.

## Produção cancelada

- A produção `3677be46-ea60-4ea1-aee9-adab207b5235` (“Why Switzerland Built Underground Bunkers for 100% of Its Population”) foi cancelada e removida do banco e dos diretórios específicos no VPS. O processo de retomada foi encerrado.

## Correção do fluxo

- A validação de cenas do vídeo principal grava o cursor de progresso e retoma da última cena validada; uma cena inválida é substituída sem reprogramar o lote inteiro.
- O vídeo principal só libera Shorts após MP4 1080p validado por ffprobe, capa presente, título e descrição gerados. O pacote aparece na aba Final & Publicação.
- A produção automática para após esse pacote e aguarda revisão. Cada acionamento de Shorts produz somente um Short, valida o MP4 vertical por ffprobe, registra o resultado e volta à revisão antes do próximo.
- A interface conta apenas Shorts com MP4 registrado e apresenta o botão do próximo Short. Estado de conclusão dos cinco só é gravado depois de todos.

## Validação e próximo passo

- Sintaxe dos arquivos alterados aprovada; `npm test`: 73/73 testes aprovados. ffprobe e ffmpeg confirmados no contêiner.
- Ainda é necessário confirmar o deploy desta revisão e executar um teste curto no VPS antes de iniciar uma produção longa. Não há garantia absoluta contra falhas externas de mídia, IA ou infraestrutura; qualquer falha deve bloquear o avanço e preservar o progresso.