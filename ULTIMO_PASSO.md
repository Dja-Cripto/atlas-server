# Estado atual do Atlas Studio no VPS

**Atualizado em:** 21/09/2026, aproximadamente 13:08 (America/Bahia)

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
   - **Duração do Documentário:** 958 segundos (**16.0 minutos** completos).
   - **Pesquisa, Roteiro e Narração BBC:** 100% concluídos.
   - **Programação Visual das 156 Cenas:** **100% concluída com sucesso pelo GLM Flash**.
   - **Trilha Sonora:** Integrada com ducking dinâmico ("Two Face - Causmic").
   - **Etapa Atual:** `render` — **Renderização do arquivo MP4 final em 1080p em andamento no Remotion**.
   - **Próximas etapas:** Conclusão do MP4 1080p -> Extração e geração dos 5 Shorts verticais derivados -> Disparo para agendamento no YouTube e Facebook.

## Próximo passo

- Acompanhar a conclusão da renderização do MP4 do documentário de 16 min e a geração automática dos 5 Shorts verticais.
