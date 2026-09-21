# Estado atual do Atlas Studio no VPS

**Atualizado em:** 21/09/2026, aproximadamente 09:05 (America/Bahia)

## Acesso e ambiente

- Painel: `https://painel.setupdja.website` — HTTP 200 e contêiner `atlas-studio` saudável.
- n8n: `https://n8n.setupdja.website` — HTTP 200.
- VPS: `ubuntu@137.131.171.144` (autônomo 24/7).
- Projeto no VPS: `/srv/atlas-studio`, branch `main`.
- Armazenamento pesado: montado e validado em `/srv/robo/portal-bot/data/atlas-storage` (80 GB livres).
- Espaço em disco raiz `/`: 5.5 GB livres recuperados após limpeza de cache.

## O que foi verificado e status da produção

1. **Duração do Vídeo Principal:**
   - O vídeo de teste anterior foi gerado com `minutes: 2` para validação rápida de fluxo (~230 palavras / 1m15s).
   - O modal de criação de novas produções manuais foi ajustado para duração padrão de 12 minutos e os tópicos do Banco de Pautas estão configurados para documentários completos de 15 minutos (1.500 a 2.200 palavras).

2. **Renderização dos 5 Shorts em MP4 Vertical (1080x1920):**
   - Os 5 roteiros, narrações Fish Audio, trilhas sonoras e composições Remotion já estavam criados.
   - A renderização dos arquivos de vídeo `.mp4` verticais foi disparada via `render_all_shorts_cli.mjs` no servidor com aceleração de software GL (`gl: 'swangle'`) e multi-processamento habilitado.
   - Os players do painel passarão a exibir o vídeo vertical assim que os arquivos MP4 forem gerados.

3. **Publicação e Agendamento:**
   - Grade de agendamento configurada para distribuir 1 vídeo longo + 5 Shorts entre YouTube e Facebook Page via n8n.

## Próximo passo

- Acompanhar a conclusão da renderização dos 5 MP4s dos Shorts no VPS e validar a reprodução direta no painel e disparo para o n8n.
