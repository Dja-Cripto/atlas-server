# Estado atual do Atlas Studio

**Atualizado em:** 19/09/2026, aproximadamente 18:00

## O que foi alterado

- O projeto está versionado em https://github.com/Dja-Cripto/atlas-server. Dados locais, segredos, dependências, modelos, músicas e mídia continuam ignorados.
- A direção editorial agora decide por função narrativa: vídeo de apoio pode ficar limpo; abertura, primeira identificação e toda fotografia recebem um rótulo curto; estatísticas, comparações, mapas e explicações abstratas podem usar composição motion.
- Cada cena possui somente uma mensagem focal. Identificação, estatística e cartão adicional não devem ser empilhados.
- Fotografias recebem movimento de câmera e uma identificação animada; o rótulo editorial explícito tem prioridade sobre textos técnicos de planejamento.
- Cenas compostas continuam limitadas e nunca ficam consecutivas. Depois de uma composição, o vídeo de apoio seguinte volta a respirar.
- Cenas `clean` e `label` usam componente determinístico, evitando chamadas desnecessárias ao GLM. O GLM programa as cenas `composed`.
- Bundles temporários de vídeos longos e Shorts são apagados após o render, inclusive quando ocorre erro.

## O que foi validado

- 58/58 testes automatizados aprovados.
- Sintaxe aprovada em `auto-plan.mjs`, `automatic.mjs` e `motion-author.mjs`.
- Os testes garantem abertura identificada, toda imagem estática com identificação curta, vídeo de apoio limpo, rótulo animado e ausência de composições consecutivas.
- Nenhum vídeo foi gerado e nenhuma API externa foi consumida nesta alteração.

## Erros ou limitações abertos

- O equilíbrio precisa ser avaliado visualmente em uma produção inédita; os testes validam a regra do gerador, mas não substituem a revisão do ritmo.
- Mapas, gráficos e composições ainda usam chamadas individuais ao GLM.
- O tempo final continua dependente da busca de mídia e da quantidade de cenas compostas.
- O `README.md` ainda descreve uma fase antiga do produto.

## Próximo passo recomendado

- Gerar um teste inédito de um minuto e verificar se a abertura e as fotografias estão identificadas, se os vídeos de apoio respiram e se cada cena mostra apenas uma informação principal.
