# Atlas Studio — estado atual
**Atualizado em:** 26/09/2026, aproximadamente 17h (America/Bahia).

## Versões e recuperação
- V2 funcional preservada na tag `atlas-visual-v2-checkpoint-2026-09-26` (commit `d64e2ea`). Instruções de reversão em `CHECKPOINTS.md`.
- V3 desenvolvida na branch `codex/atlas-visual-v3`. Novos projetos recebem V3; projetos antigos sem versão explícita continuam no fluxo V2. Plano de produto em `PROXIMO_PASSO.md`.

## Implementado na V3
- Roteiro, revisão de duração, planejamento e autoria Remotion das cenas selecionadas usam GPT-6 Luna pelo endpoint Responses do OpenCode Go. Pesquisa factual e geração de imagens permanecem nos provedores existentes. Uso de tokens e custo estimado são registrados sem salvar prompts ou credenciais no painel.
- Direção editorial curiosa, observadora e ocasionalmente sarcástica, sem piadas obrigatórias; imagens e filmagens explicativas seguem para autoria visual, enquanto filmagens descritivas podem usar componentes locais de legenda variada ou ficar limpas. Primeiros segundos e encerramento recebem autoria; a abertura exige vídeo real relevante.
- Até três tentativas Luna e duas GLM por cena complexa. Após falha, cena local sobre a mídia selecionada, limitada a cerca de 5% das cenas; cenas concluídas são preservadas. A recuperação de validação também tenta ambos os modelos antes da reserva.
- Narração V3 é medida após síntese e, se ficar fora da faixa de aproximadamente 87% a 107% do tempo pedido, roteiro e voz podem ser revisados até duas vezes antes das cenas. Se ainda falhar, a produção pausa. A trilha é normalizada numa cópia por produção e mixada com volume V3 específico, sem alterar a música original.
- Shorts pedidos entram automaticamente após o vídeo principal e prosseguem um a um, com retomada; falha da produção automática agora aparece como erro para alertas. O painel mostra duração, roteamento visual, reservas e consumo Luna.
- Tamanho/compactação do MP4 continua adiado até medir upload real, conforme decisão de Daniel.

## Validação e limites
- `npm test`: 122/122 aprovados. Cena real gerada por Luna via OpenCode Go passou no validador Remotion; teste mínimo de autenticação e normalização de áudio também passaram.
- Ainda falta o teste de produção completa pela página inicial, que Daniel fará. A qualidade editorial, sincronização, duração final, mixagem no MP4 e Shorts automáticos precisam ser conferidos nesse teste; não declarar a V3 aprovada em produção antes disso.
- Benchmark local de modelos e materiais em `testes_benchmark/` e `renderer/src/benchmarks*/` permanecem fora desta entrega; relatório anterior identificou Qwen 3.7 Plus e DeepSeek V4.1 Flash como alternativas futuras para autoria visual. Não trocar o modelo principal antes do teste real V3.
- Fallback de roteiro Luna para Gemini não foi implementado: a revisão automática de autorização rejeitou o envio adicional do roteiro ao Gemini nessa condição. Falha do Luna nessa etapa pausa a produção com estado preservado.

## Próximo passo recomendado
Daniel inicia uma nova produção V3 pela página inicial e verifica abertura em vídeo real, duração da voz, legibilidade/ritmo das cenas, música e geração automática dos Shorts. Corrigir no gerador qualquer falha observada antes de promover V3 para produção estável.
