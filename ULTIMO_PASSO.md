# Atlas Studio — estado atual
**Atualizado em:** 26/09/2026, aproximadamente 20:15 (America/Bahia).

## Versões
- V2 funcional preservada na tag `atlas-visual-v2-checkpoint-2026-09-26` (commit `d64e2ea`); reversão em `CHECKPOINTS.md`.
- V3 na branch `codex/atlas-visual-v3`; correções deste registro valem para novas renderizações.

## Diagnóstico confirmado do vídeo sobre terremotos no Japão
- Projeto `5672d344-f644-48c2-b5a1-a36211d89a23`, MP4 `video-bd57beff-5c8d-40e9-8ed3-1c3848b00345.mp4`.
- O código de renderização efetivamente usado continha a mistura antiga: música em 28% nos primeiros 75 quadros e 24% durante a fala. O servidor local que atendeu ao teste havia sido iniciado antes das duas correções de volume e não recarregou os arquivos. A redução para 2,5% não chegou a esse MP4. O processo precisa ser reiniciado e o próximo vídeo deve ser conferido no código gerado.
- O seletor classificou `Deep Horrors - Kevin MacLeod.mp3` como `curiosity_flow` porque a faixa sem perfil específico estava numa pasta genérica. A escolha por índice rotativo não conferia adequação do som ao assunto.

## Correção aplicada no gerador
- Documentários e Shorts comuns escolhem apenas faixas instrumentais explicitamente revisadas para narração. A escolha usa o assunto e o perfil da faixa, sem índice aleatório; o tema de terremotos agora escolhe `Liquid Time`. Trilha de horror exige categoria futura `mystery_dark` escolhida explicitamente. Se não houver faixa adequada, a V3 segue com voz limpa, sem recorrer ao arquivo ambiente antigo.
- A curva V3 permanece com música normalizada a 2,5% sob a voz, entrada breve de até 6% e redução nos primeiros 24 quadros. A correção principal deste teste foi garantir que o processo local novo realmente use essa curva.
- Permanecem as correções anteriores de mapas com localização específica e gráficos que preservam a filmagem visível.

## Validação e limites
- `npm test`: 125/125 aprovados. Testes verificam a seleção sem horror para temas documentais e a categoria de horror apenas quando explícita.
- O MP4 já pronto conserva som alto e faixa errada. O próximo render após reiniciar o servidor deve ser ouvido para confirmar a mixagem e a adequação da trilha; não inferir qualidade final apenas pelos números.
- Arquivos locais de benchmark e demais alterações paralelas não foram incluídos nesta correção.
- Fallback de roteiro Luna para Gemini segue não implementado após rejeição pela revisão automática de autorização; falha do Luna nessa etapa pausa a produção com estado salvo.

## Próximo passo recomendado
Confirmar servidor local reiniciado; gerar ou reprocessar uma amostra curta V3 e conferir no arquivo de renderização que a curva de volume nova entrou e que a trilha escolhida vem da lista revisada, antes de julgar outro vídeo inteiro.
