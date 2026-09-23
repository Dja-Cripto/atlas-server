# Estado atual do Atlas Studio no VPS

**Atualizado em:** 23/09/2026, aproximadamente 14:15 (America/Bahia)

## Acesso e ambiente

- Painel: `https://painel.setupdja.website`; VPS `ubuntu@137.131.171.144`.
- Projeto no VPS: `/srv/atlas-studio`; serviço Docker Compose `atlas`, contêiner `atlas-studio`.
- Publicação automática desligada. n8n, Cloudflare e painel do WhatsApp preservados.

## Pipeline e otimizações de renderização

- **Preset e codec Remotion**: `x264Preset` ajustado para `ultrafast` e `crf: 24` em `automatic.mjs` e `shorts.mjs`, reduzindo o tempo de codificação de quadros na CPU ARM64 sem perda visível.
- **Cache de vídeo em RAM**: `offthreadVideoCacheSizeInBytes` elevado para 2 GB (`2147483648`), evitando recarregamento repetido de buffers de mídia.
- **Recursos totais do VPS**: `deploy/compose.yaml` atualizado para `cpus: 4`, `mem_limit: 20g`, `memswap_limit: 24g`, `shm_size: 4g` e `ATLAS_RENDER_CONCURRENCY: 4`.
- **Chromium otimizado**: `lib/render-runtime.mjs` configurado com `--num-raster-threads=4` e flags para eliminar background throttling e sobrecargas desnecessárias.
- **Transcodificação de B-roll**: `lib/auto-media.mjs` agora impõe 30 FPS e GOP 30 (`-g 30 -keyint_min 30`) em vídeos baixados, impedindo que o Chromium processe fluxos brutos pesados de 60 FPS com seeks lentos.

## Produção em andamento

- Produção `54204f15-86ce-4fd5-8de6-b4d43c671a7a` (“Why Europe and Africa Still Have No Fixed Link”) mantém 100% de seus arquivos intactos (pesquisa, roteiro, áudio `voice.mp3`, 104 cenas TSX validadas e mídias em disco persistente).
- O render lento anterior (~45% após 18h) foi interrompido com segurança para aplicação das otimizações.
- As mídias B-roll da produção passam por transcodificação local para 30 FPS / GOP 30 antes do início da nova renderização.

## Validação e próximo passo

- Sintaxe e testes automatizados: 77/77 testes aprovados no `npm test`.
- Deploy das otimizações no VPS, transcodificação em lote dos vídeos da produção e retomada do render MP4 do vídeo principal com 4 workers paralelos.
- Acompanhar progresso e validar o MP4 final 1080p por ffprobe antes da liberação dos Shorts.
