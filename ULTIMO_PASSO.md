# Atlas Studio — estado da geração visual
**Atualizado em:** 25/09/2026, aproximadamente 17:35 (America/Bahia).

## Versões
- V1 funcional: tag `atlas-visual-v1-checkpoint-2026-09-24`, commit `78b60db`; imagem correspondente preservada no VPS.
- V2: branch `codex/atlas-visual-v2`. Reversão descrita em `CHECKPOINTS.md`.
- Painel: https://painel.setupdja.website; checkout do VPS: `/srv/atlas-studio`.

## Diagnóstico atual
- Produção `1c2c6f09-0d31-4f33-9822-0e5575fafad6`, *How Mongolia’s Nomadic Herders Follow the Seasons*, run `bc96184f-1b5d-473c-8bea-1ce1841b7db9`: 42 cenas planejadas, sem reparos de mídia pendentes. A busca cobriu 238,73 s de 252,6 s (94,5%) com vídeos ou fotografias reais; vídeos sozinhos cobriram 168,44 s (66,7%). Há 28 cenas de vídeo, 12 com fotografia e 2 mapas. A produção parou porque a meta rígida de 75% de vídeo foi tratada como erro, apesar de todas as cenas terem representação.
- A busca já faz alternativas com material contextual e fotografia real quando a filmagem específica não serve. Essas fotos recebem efeito Remotion; não há necessidade de gerar imagens por IA nesta produção. Um assunto ou pessoa específica não deve ser representado falsamente por material apenas contextual.

## Alterações
- A avaliação de cobertura agora distingue meta editorial de falha real. Proporção de vídeo abaixo de 75% ou mídia real abaixo de 80% gera aviso e métricas, não pausa automática. Cenas sem vídeo, foto, mapa ou gráfico válido continuam bloqueadas para reparo pontual.
- O andamento registra quantos vídeos, fotografias e mapas foram selecionados e a cobertura temporal. Pesquisa, narração, plano e mídias salvos da produção atual são preservados para retomada.
- Permanece a correção anterior do gerador para remover `endAt` de vídeos Remotion, que podia cortar o clipe em menos de um segundo. Essa correção foi validada em teste local, mas ainda precisa da próxima implantação no VPS.

## Validação, limites e próximo passo
- 108/108 testes locais aprovados; TypeScript do renderizador aprovado. Testes cobrem mistura real de vídeo/foto/mapa e bloqueio de cena efetivamente vazia.
- Próximo passo: publicar esta correção e a de `endAt` no VPS, confirmar saúde do serviço e retomar a mesma produção. A qualidade editorial das 42 cenas ainda deve ser avaliada após programação e renderização.
