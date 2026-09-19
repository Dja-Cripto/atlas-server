# Estado atual do Atlas Studio

**Atualizado em:** 19/09/2026, aproximadamente 16:10

## O que foi alterado

- O projeto foi limpo de produções, caches, prévias, renders e bundles antigos; código, configurações, credenciais criptografadas, dependências, modelos locais e músicas foram preservados.
- O projeto está versionado em https://github.com/Dja-Cripto/atlas-server. Mudanças significativas validadas devem gerar commit e envio à branch `main`; dados locais, segredos, dependências, modelos, músicas e mídia continuam ignorados.
- Foi implementada a disciplina editorial `clean | label | composed`: vídeos e fotografias comuns ficam limpos por padrão; identificação curta aparece somente quando há local verificável; motion completo fica reservado a mapas, gráficos e explicações relevantes.
- Cenas `clean` e `label` usam um componente cinematográfico determinístico, sem título ou legenda obrigatórios e sem chamada individual ao GLM. O GLM continua livre para programar cenas `composed`.
- O balanceamento impede cenas de mídia composta consecutivas, limita mídia composta a 25% do tempo de mídia em vídeos longos e rótulos a 20%.
- Bundles temporários de vídeos longos e Shorts são apagados após o render, inclusive quando ocorre erro.

## O que foi validado

- 56/56 testes automatizados aprovados.
- Sintaxe aprovada em `auto-plan.mjs`, `automatic.mjs`, `motion-author.mjs` e `shorts.mjs`.
- Testes garantem mídia full-bleed sem heading/caption, identificação mínima e balanceamento sem composições consecutivas.
- O snapshot inicial e a atualização editorial foram enviados ao GitHub; banco local, credenciais, músicas, modelos, mídias e renders não foram publicados.

## Erros ou limitações abertos

- A nova proporção editorial precisa ser avaliada visualmente em uma produção inédita; os testes garantem a regra, mas não substituem a revisão do ritmo final.
- Mapas, gráficos e composições continuam com chamadas individuais ao GLM e validação visual para preservar a qualidade.
- O tempo economizado dependerá da proporção de cenas com mídia encontrada; cenas sem mídia ainda exigem recuperação visual.
- O `README.md` ainda descreve uma fase antiga do produto e deverá ser atualizado depois da validação visual.

## Próximo passo recomendado

- Gerar uma produção inédita de aproximadamente três minutos e avaliar cobertura de mídia, ritmo, quantidade de texto, qualidade das cenas compostas e tempo total até a prévia.
