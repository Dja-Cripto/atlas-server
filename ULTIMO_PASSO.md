# Estado atual do Atlas Studio no VPS

**Atualizado em:** 21/09/2026, aproximadamente 09:30 (America/Bahia)

## Acesso e ambiente

- Painel: `https://painel.setupdja.website` — HTTP 200 e contêiner `atlas-studio` saudável.
- n8n: `https://n8n.setupdja.website` — HTTP 200.
- VPS: `ubuntu@137.131.171.144` (autônomo 24/7).
- Projeto no VPS: `/srv/atlas-studio`, branch `main`.
- Armazenamento pesado: montado e validado em `/srv/robo/portal-bot/data/atlas-storage` (78 GB livres).
- Espaço em disco raiz `/`: 6.1 GB livres.

## O que foi verificado e status da produção

1. **Produção Completa de 15 Minutos em Andamento:**
   - **Título:** *Why Switzerland Built Underground Bunkers for 100% of Its Population* (ID: `3677be46-ea60-4ea1-aee9-adab207b5235`).
   - **Pesquisa Factual com Google Grounding:** Concluída e salva com sucesso.
   - **Roteiro Documental Completo (15 min):** Redigido com capítulos temáticos, pausas dramáticas de respiração e ganchos de alta retenção.
   - **Narração e Áudio:** Em processamento via Fish Audio TTS (voz oficial BBC).
   - **Próximas etapas:** Sincronização de legendas, seleção de mídias/filmagens em alta definição, geração de animações Remotion, renderização do MP4 1080p, derivação dos 5 Shorts verticais e disparo para agendamento.

## Próximo passo

- Acompanhar a conclusão da produção do vídeo principal de 15 minutos e dos 5 Shorts verticais no VPS e validar o agendamento no n8n.
