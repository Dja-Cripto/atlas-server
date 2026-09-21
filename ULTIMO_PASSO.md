# Estado atual do Atlas Studio no VPS

**Atualizado em:** 21/09/2026, aproximadamente 09:15 (America/Bahia)

## Acesso e ambiente

- Painel: `https://painel.setupdja.website` — HTTP 200 e contêiner `atlas-studio` saudável.
- n8n: `https://n8n.setupdja.website` — HTTP 200.
- VPS: `ubuntu@137.131.171.144` (autônomo 24/7).
- Projeto no VPS: `/srv/atlas-studio`, branch `main`.
- Armazenamento pesado: montado e validado em `/srv/robo/portal-bot/data/atlas-storage` (78 GB livres).
- Espaço em disco raiz `/`: 6.1 GB livres.

## O que foi verificado e status da produção

1. **Duração do Vídeo Principal e Calibração:**
   - O vídeo de teste anterior foi gerado com `minutes: 2` para validação rápida de fluxo (~230 palavras / 1m15s).
   - O modal de criação de novas produções manuais foi ajustado para duração padrão de 12 minutos e os tópicos do Banco de Pautas estão configurados para documentários completos de 15 minutos (1.500 a 2.200 palavras).

2. **Cancelamento da Renderização dos Shorts de Teste:**
   - Conforme solicitado pelo usuário, a renderização pesada dos arquivos MP4 dos Shorts foi interrompida para economizar processamento.
   - Todos os processos do Chromium e render CLI foram finalizados com sucesso no VPS. O servidor permanece operando leve e saudável.
   - Os materiais gerados (roteiros, narrações oficiais Fish Audio, trilhas sonoras e composições Remotion) continuam preservados no banco e armazenamento.

3. **Automação e Agendador 24/7:**
   - O robô autônomo e o publicador de background estão ativos e prontos para processar as próximas pautas do canal.

## Próximo passo

- Definir a próxima pauta/produção real no canal para geração completa com duração documental (12 a 15 min) e seus 5 Shorts correspondentes.
