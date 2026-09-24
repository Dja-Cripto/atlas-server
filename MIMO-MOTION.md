# Direção e animações — Atlas Visual V2
O planejador prepara cenas sincronizadas com a narração. O modelo de motion configurado em Integrações (padrão do código: glm-5.3-flash) recebe direção global, contexto e cenas vizinhas e programa uma cena por vez em React/Remotion.

## Regra editorial
- Vídeo descritivo: pode tocar limpo, sem zoom artificial; identificação breve é opcional.
- Fotografia: sempre movimento ou efeito. A IA escolhe pan, zoom, revelação, detalhe, máscara ou composição; não existe obrigação de efeito complexo.
- Dados, datas, idade, dimensões e explicações narradas: animação pertinente ao fato falado, inclusive em cenas consecutivas.
- As cotas decorativas são sugestões. O diretor pode justificar exceções com editorialReason; mapas com mapIntent distinto podem continuar a explicação.
- Restrições factuais e de execução permanecem. A IA não inventa números, rotas, países, fontes ou arquivos.

## Mapas
Longos e Shorts compartilham Natural Earth e enquadramento responsivo. A ligação exige routes, routeFrom, routeTo e routeEvidence presente na narração/pesquisa; o caminho é uma conexão esquemática entre centros de países, identificado como tal, não uma rota navegável. A IA compõe overlays sem redesenhar a geografia.

## Validação e recuperação
São renderizados começo, meio e fim de cada cena. Isso verifica execução, não prova qualidade editorial ou correspondência perfeita com a fala. Uma falha permite reparo específico da cena; depois usa alternativa conservadora quando disponível, registrando revisão. Diagramas sem alternativa factual válida permanecem pendentes. Pausas naturais em vídeos não acionam bloqueio por falta de movimento.

Cenas, respostas e direção ficam em renderer/src/generated/<runId>. Produções antigas não são regeneradas automaticamente. A preparação de mídia reutiliza trechos transcodificados e registra duração real; tempos de etapas ficam no estado da produção.

## Verificar e reverter
- npm test
- node renderer/node_modules/typescript/bin/tsc -p renderer/tsconfig.json
- node scripts/check-visual-v2.mjs — integração real com amostras sintéticas, sem APIs pagas; saídas ignoradas em .temp.
- CHECKPOINTS.md explica como restaurar Atlas Visual V1. ULTIMO_PASSO.md registra a versão ativa.
