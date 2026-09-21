# Estado atual do Atlas Studio no VPS

**Atualizado em:** 21/09/2026, aproximadamente 09:20 (America/Bahia)

## Acesso e ambiente

- Painel: `https://painel.setupdja.website` — HTTP 200 e contêiner `atlas-studio` saudável.
- n8n: `https://n8n.setupdja.website` — HTTP 200.
- VPS: `ubuntu@137.131.171.144` (autônomo 24/7).
- Projeto no VPS: `/srv/atlas-studio`, branch `main`.
- Armazenamento pesado: montado e validado em `/srv/robo/portal-bot/data/atlas-storage` (78 GB livres).
- Espaço em disco raiz `/`: 6.1 GB livres.

## O que foi verificado e status da produção

1. **Limpeza e Reset Completo do Sistema (Zero):**
   - Todos os 7 projetos e testes anteriores foram excluídos da base de dados SQLite (`records`).
   - Grade de agendamento e publicações anteriores foram limpas.
   - Fila do Banco de Pautas (`topics.json`) e alertas foram reiniciados do zero.
   - Pastas temporárias, pastas de projetos legados, caches de renderização e arquivos de prévia foram removidos.
   - **Todas as integrações e chaves de API (Gemini, Fish Audio, Pexels, Pixabay, YouTube, OpenCode Go, senhas e configurações de publicação) foram 100% preservadas e continuam ativas.**

2. **Calibração de Duração para Produções do Canal:**
   - Duração padrão ajustada para **12 a 15 minutos** nos formulários de criação e banco de pautas (1.500 a 2.200 palavras por documentário longo + 5 Shorts verticais de 50 a 60s).

## Próximo passo

- Iniciar o novo teste do zero com a pauta escolhida por Daniel.
