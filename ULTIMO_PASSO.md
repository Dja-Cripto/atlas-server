# Atlas Studio — estado atual
**Atualizado em:** 26/09/2026, aproximadamente 20:45 (America/Bahia).

## Versões
- V2 funcional preservada na tag `atlas-visual-v2-checkpoint-2026-09-26` (commit `d64e2ea`); reversão em `CHECKPOINTS.md`.
- V3 na branch `codex/atlas-visual-v3`; correções deste registro valem para novas renderizações.

## Diagnóstico confirmado do vídeo sobre terremotos no Japão
- Projeto `5672d344-f644-48c2-b5a1-a36211d89a23`, MP4 `video-bd57beff-5c8d-40e9-8ed3-1c3848b00345.mp4`.
- O código de renderização efetivamente usado continha a mistura antiga: música em 28% nos primeiros 75 quadros e 24% durante a fala. O servidor local que atendeu ao teste havia sido iniciado antes das duas correções de volume e não recarregou os arquivos. A redução para 2,5% não chegou a esse MP4. O processo local foi reiniciado depois do commit (PID 15516, porta 4310 respondendo HTTP 200). O próximo vídeo deve ser conferido no código gerado para confirmar a curva nova.
- O seletor classificou `Deep Horrors - Kevin MacLeod.mp3` como `curiosity_flow` porque a faixa sem perfil específico estava numa pasta genérica. A escolha por índice rotativo não conferia adequação do som ao assunto.

## Correção aplicada no gerador
- Documentários e Shorts comuns escolhem apenas faixas instrumentais explicitamente revisadas para narração. A escolha usa o assunto e o perfil da faixa, sem índice aleatório; o tema de terremotos agora escolhe `Liquid Time`. Trilha de horror exige categoria futura `mystery_dark` escolhida explicitamente. Se não houver faixa adequada, a V3 segue com voz limpa, sem recorrer ao arquivo ambiente antigo.
- A curva V3 permanece com música normalizada a 2,5% sob a voz, entrada breve de até 6% e redução nos primeiros 24 quadros. A correção principal deste teste foi garantir que o processo local novo realmente use essa curva.
- Permanecem as correções anteriores de mapas com localização específica e gráficos que preservam a filmagem visível.

## Correção da seleção de mídia (Japão/terremotos)
- A direção visual deixou país/local vazios em quase todas as 9 cenas; a busca então consultou termos genéricos e aceitou praias/cidades sem evidência do Japão. A revisão por IA chegou a chamar uma costa genérica de Monte Fuji. O catálogo de fontes, porém, ofereceu vídeos identificados de Tóquio/Shibuya e fotos documentadas do terremoto de Tōhoku.
- A busca agora herda o país do título mesmo quando a direção omite o campo. Cenas de abertura e cenas que nomeiam país, lugar ou terremoto exigem evidência no título/metadados da mídia; palavras usadas apenas na busca não comprovam identidade. Lugares específicos como Sendai exigem correspondência própria. A chave de cache mudou para não reutilizar as escolhas genéricas anteriores.
- Vídeo identificado continua prioritário. Quando uma cena específica não encontra filmagem adequada, o gerador procura fotografias documentadas/licenciadas e aplica a composição animada de imagem da V3. Cenas amplas sem identidade específica ainda podem usar vídeo contextual. Busca de eventos passou a cobrir 2011 e termos de terremoto.

## Validação e limites
- `npm test`: 128/128 aprovados, incluindo regressões para abertura no Japão, terremoto de 2011, Sendai e cenas genéricas.
- O vídeo já renderizado não muda; a correção vale para novas produções. Metadados de fornecedores podem ser incompletos; se não houver mídia identificável, a recuperação do gerador continua necessária. Google Imagens não é fonte automática de licença; fotografias vêm das fontes licenciadas já configuradas.
- Fallback de roteiro Luna para Gemini segue não implementado após rejeição pela revisão automática de autorização; falha do Luna nessa etapa pausa a produção com estado salvo.

## Próximo passo recomendado
Gerar novamente um vídeo curto sobre lugar/evento específico pela interface e conferir se a abertura e as cenas de fato trazem mídia identificável; avaliar eventual ampliação das fontes licenciadas conforme os resultados.
