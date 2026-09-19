# Estado atual do Atlas Studio

**Atualizado em:** 19/09/2026, aproximadamente 20:30

## O que foi alterado

- O projeto está versionado em https://github.com/Dja-Cripto/atlas-server. Dados locais, segredos, dependências, modelos, músicas e mídia continuam ignorados.
- Vídeos usam `clean | label | composed`; fotografias continuam obrigatoriamente compostas pelo GLM.
- A biblioteca de identificação para vídeos passou de cinco estilos para 24 combinações reutilizáveis: seis tons (`documentary`, `historical`, `geopolitical`, `curiosity`, `dramatic`, `minimal`) multiplicados por quatro composições.
- O diretor também escolhe a função do texto: `title`, `caption`, `identity` ou `date`. Isso ajusta hierarquia e tamanho sem programar uma cena pelo GLM.
- As quatro composições incluem rodapé editorial, marca superior, título central e selo lateral. Tons alteram tipografia, peso, espaçamento, cor e acabamento.
- O validador continua bloqueando clarões, modos de mesclagem luminosos e opacidade acima de 1.
- Vídeos longos começam com filmagem de estabelecimento quando o plano tentaria abrir com mapa, gráfico, título ou fotografia.
- Cenas permanecem próximas de no máximo sete segundos e a trilha repete pela duração real do arquivo.

## O que foi validado

- 64/64 testes automatizados aprovados.
- As 24 combinações geram código Remotion válido e resultados distintos.
- Os testes também cobrem bloqueio de clarão, abertura longa, fotografias compostas, duração das cenas e continuidade musical.
- Nenhum vídeo novo foi gerado e nenhuma API externa foi consumida nesta alteração.

## Erros ou limitações abertos

- A seleção de tom depende da direção do modelo e precisa ser observada em produções reais.
- Caso o GLM falhe três vezes numa fotografia, a contingência segura continua mais simples.
- O `README.md` ainda descreve uma fase antiga do produto.

## Próximo passo recomendado

- Gerar um teste inédito e observar se títulos, legendas, identidades e datas variam de acordo com o tom sem deixar o vídeo visualmente inconsistente.
