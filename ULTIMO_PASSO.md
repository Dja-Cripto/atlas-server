# Atlas Studio — recuperação da geração visual
**Atualizado em:** 25/09/2026, aproximadamente 14:20 (America/Bahia).

## Versões
- V1 funcional: tag `atlas-visual-v1-checkpoint-2026-09-24`, commit `78b60db`, publicada no GitHub; imagem `atlas-studio:visual-v1-checkpoint-2026-09-24` preservada no VPS.
- V2: branch `codex/atlas-visual-v2`. Reversão documentada em `CHECKPOINTS.md`.

## Estado
- A produção de teste França–Brasil apresentou falhas na etapa de autoria visual do `GLM-5.3-Flash`, antes do Remotion. O painel da OpenCode também mostrou `inference_failed` em uma chamada longa. Não há evidência de cota esgotada; a causa exata da falha interna do provedor não foi exposta.
- O gerador agora reconhece erros de inferência no stream mesmo com HTTP 200, aplica limite de tempo durante a leitura, registra motivo/duração por tentativa e refaz pedidos com contexto compacto no mesmo modelo configurado.
- Cenas válidas só são retomadas da mesma produção. Eliminada a reutilização indevida de cenas de outras execuções com igual índice.
- Uma falha isolada usa composição segura; fotografia ganha revelação animada além do movimento de câmera. Falhas consecutivas ou acima do limite param cedo, preservando as cenas anteriores para retomada. Vídeo descritivo continua podendo ficar limpo.

## Validação
- 100/100 testes locais aprovados; compilação TypeScript do renderizador e compilação TSX da fotografia de reserva aprovadas.
- Testes simulam timeout recuperado, falha isolada, falha recorrente e evento `inference_failed`.
- Não foi gerado novo vídeo de produção nem comparada a qualidade visual de outro modelo com material real.

## Limitações e próximo passo
- A qualidade editorial da reserva e a taxa de sucesso do modelo com o pedido compacto ainda precisam de um novo vídeo curto de validação.
- Enviar a V2 ao GitHub, atualizar o VPS sem produção ativa e testar nova geração de 30 segundos. Se persistir falha do provedor, comparar modelos com um roteiro sintético antes de alterar o padrão.
