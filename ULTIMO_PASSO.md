# Estado atual do Atlas Studio no VPS

**Atualizado em:** 21/09/2026, aproximadamente 20:20 (America/Bahia)

## Acesso e ambiente

- Painel: `https://painel.setupdja.website` — VPS `ubuntu@137.131.171.144`.
- Projeto no VPS: `/srv/atlas-studio`, branch `main`.
- Armazenamento de alta capacidade: `/srv/robo/portal-bot/data/atlas-storage` (67 GB livres).
- Espaço em disco raiz `/`: 14.2 GB livres.

## O que foi alterado e implementado

1. **Pipeline de Renderização Sequencial e Finalização Estrita Ponta a Ponta:**
   - **Vídeo Principal:** O documentário longo é processado e agora é **imediatamente renderizado em MP4 final em 1080p**. Uma vez que o arquivo `video-{runId}.mp4` existe íntegro no disco, o vídeo principal é marcado como 100% concluído e blindado contra revalidações desnecessárias.
   - **Shorts Sequenciais:** Cada um dos 5 Shorts verticais agora é executado e **imediatamente renderizado em MP4 vertical** antes de iniciar o próximo Short:
     - Short 1: roteiro → voz → cenas → validação → **renderização do MP4 `short_1.mp4`**.
     - Short 2: só inicia após `short_1.mp4` estar salvo e validado no disco.
     - Short 3: só inicia após `short_2.mp4` estar salvo e validado no disco.
     - Short 4: só inicia após `short_3.mp4` estar salvo e validado no disco.
     - Short 5: só inicia após `short_4.mp4` estar salvo e validado no disco.
   - **Verificação Atômica em Disco:** Em caso de interrupção ou retomada, o gerador inspeciona os arquivos MP4 já gerados em `data/long_videos/` e `data/shorts/`. Itens já renderizados são restaurados instantaneamente sem gastar chamadas de IA ou tempo de CPU.

2. **Sincronização de Código e Execução no Servidor:**
   - Atualizados [`lib/automatic.mjs`](file:///d:/Documents/portal%20do%20investidor/novo%20teste/lib/automatic.mjs), [`lib/shorts.mjs`](file:///d:/Documents/portal%20do%20investidor/novo%20teste/lib/shorts.mjs), [`server.mjs`](file:///d:/Documents/portal%20do%20investidor/novo%20teste/server.mjs) e [`scripts/resume_job.mjs`](file:///d:/Documents/portal%20do%20investidor/novo%20teste/scripts/resume_job.mjs).

## Validação e Resultados

- Suíte de testes automatizados (`npm test`): **71 de 71 testes aprovados com sucesso (100%)**.
- Volumes mapeados no VPS garantindo 67 GB livres para geração de vídeo e temporários.

## Próximo passo recomendado

- Acompanhar a conclusão da renderização do MP4 do vídeo principal e a renderização sequencial de cada um dos 5 Shorts verticais no VPS.
