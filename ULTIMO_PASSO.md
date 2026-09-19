# Estado atual do Atlas Studio

**Atualizado em:** 19/09/2026, aproximadamente 21:10

## O que foi alterado

- O projeto está versionado em https://github.com/Dja-Cripto/atlas-server. Dados locais, segredos, dependências, modelos, músicas e mídia continuam ignorados.
- Foi corrigido um defeito central no normalizador de código Remotion: ele alterava todos os arrays numéricos para ordem crescente, inclusive valores visuais de saída.
- O normalizador agora corrige somente o intervalo temporal de entrada de `interpolate` e `interpolateColors`.
- Fades como `[0.55, 0]`, deslocamentos como `[34, 0]` e máscaras como `[100, 0]` são preservados. Antes eles viravam `[0.55, 1.55]`, `[34, 35]` e `[100, 101]`, causando tela preta e texto cortado.
- O validador também detecta variáveis de opacidade geradas por `interpolate` e rejeita valores máximos acima de 1 antes da renderização.
- A biblioteca de vídeos permanece com 24 combinações editoriais. Fotografias continuam sendo compostas pelo GLM.
- Vídeos longos continuam iniciando com filmagem de estabelecimento, cenas ficam próximas de sete segundos e a trilha repete pela duração real.

## O que foi validado

- A abertura defeituosa foi auditada: uma cobertura preta deveria desaparecer de 0,55 para 0, mas o normalizador a transformou em crescimento até 1,55.
- A tipografia sobreposta tinha movimentos que deveriam terminar em zero, mas eram transformados em valores ainda maiores.
- 66/66 testes automatizados aprovados.
- Há testes específicos garantindo que somente intervalos temporais sejam reparados, que saídas decrescentes sejam preservadas e que opacidade animada acima de 1 seja recusada.
- Nenhum vídeo novo foi gerado e nenhuma API externa foi consumida nesta correção.

## Erros ou limitações abertos

- Produções criadas antes desta correção continuam com o código antigo salvo; a correção beneficia novas produções.
- Caso o GLM falhe três vezes numa fotografia, a contingência segura continua mais simples.
- O `README.md` ainda descreve uma fase antiga do produto.

## Próximo passo recomendado

- Gerar uma produção inédita e verificar a abertura, fades de fotografia e movimentos tipográficos. Não reutilizar a produção anterior, pois seus componentes já foram salvos com os valores incorretos.
