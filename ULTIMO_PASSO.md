# Estado atual do Atlas Studio no VPS

**Atualizado em:** 21/09/2026, aproximadamente 12:21 (America/Bahia)

## Acesso e ambiente

- Painel: `https://painel.setupdja.website` — HTTP 200 e contêiner `atlas-studio` saudável.
- n8n: `https://n8n.setupdja.website` — HTTP 200.
- VPS: `ubuntu@137.131.171.144` (autônomo 24/7).
- Projeto no VPS: `/srv/atlas-studio`, branch `main`.
- Armazenamento pesado: montado e validado em `/srv/robo/portal-bot/data/atlas-storage` (78 GB livres).
- Espaço em disco raiz `/`: 6.1 GB livres.

## O que foi verificado e status da produção

1. **Produção Completa de 16 Minutos (Suíça):**
   - **Título:** *Why Switzerland Built Underground Bunkers for 100% of Its Population* (ID: `3677be46-ea60-4ea1-aee9-adab207b5235`).
   - **Duração do Áudio Oficial (Fish Audio BBC):** 958 segundos (**16.0 minutos** completos).
   - **Pesquisa, Roteiro e Transcrição:** 100% concluídos e sincronizados.
   - **Direção e Coleta de Mídia:** 156 cenas planejadas e coletadas em alta definição.
   - **Etapa Atual:** `motion-code` (81% concluído). O modelo GLM Flash está programando o código Remotion das cenas (cena 120 de 156 em andamento).
   - **Próximas etapas:** Validação de prévia -> Renderização do MP4 final em 1080p -> Geração e renderização dos 5 Shorts verticais -> Disparo para agendamento.

## Próximo passo

- Concluir as 36 cenas restantes de programação Remotion, renderizar o MP4 do documentário e dos 5 Shorts e validar o agendamento no n8n.
