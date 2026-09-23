# Estado atual do Atlas Studio no VPS

**Atualizado em:** 23/09/2026, aproximadamente 15:18 (America/Bahia)

## Acesso e ambiente

- Painel: `https://painel.setupdja.website`; VPS `ubuntu@137.131.171.144`.
- Projeto no VPS: `/srv/atlas-studio`; serviço Docker Compose `atlas`, contêiner `atlas-studio`.
- Publicação automática desligada. n8n, Cloudflare e painel do WhatsApp preservados.

## Log e indicador de progresso em tempo real

- **Indicador dinâmico de progresso**: implementada barra de status ao vivo no cabeçalho do registro de atividades (`eventsCard`) e no painel final (`finalPanel`). Mostra a ação exata, percentual, contagem de quadros em tempo real (`X/Y quadros · 4 núcleos`) e barra animada com gradiente.
- **Limpeza automática**: a linha dinâmica é exibida exclusivamente enquanto o robô está trabalhando e desaparece de forma limpa ao término da etapa, preservando o histórico de eventos sem poluir o registro permanente.
- **Persistência desacelerada (throttling)**: o estado no backend (`lib/automatic.mjs` e `lib/shorts.mjs`) agora atualiza `j.auto.liveStatus`, `renderedFrames` e `renderProgress` a cada ~2 segundos no banco SQLite (`store.put(j)`), enquanto marcos permanentes de 5% e 100% são registrados no log.
- **Polling inteligente no frontend**: `public/app.js` agora faz pooling a cada 2 segundos quando há processamento ativo ou renderização, 3.5 segundos na tela de detalhes e 8 segundos quando ocioso.

## Pipeline e renderização

- Preset Remotion: `x264Preset: 'ultrafast'`, `crf: 24`, cache de vídeo em RAM de 2 GB e 4 núcleos ARM64 dedicados no VPS.
- Transcodificação prévia de B-rolls para 30 FPS / GOP 30 ativa.

## Produção em andamento

- Produção `54204f15-86ce-4fd5-8de6-b4d43c671a7a` (“Why Europe and Africa Still Have No Fixed Link”) mantém 100% dos arquivos e cenas salvos no disco persistente.
- Processo de renderização ativo na máquina remota com consumo balanceado entre os 4 núcleos.

## Validação e próximo passo

- Testes automatizados: 77/77 testes aprovados no `npm test`.
- Próximo passo: sincronizar código com o VPS (`git pull`), reiniciar o serviço web e acompanhar a finalização do MP4 1080p do vídeo principal.
