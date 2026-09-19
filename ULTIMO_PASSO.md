# Estado atual do Atlas Studio

**Atualizado em:** 19/09/2026, aproximadamente 18:40

## O que foi alterado

- O projeto está versionado em https://github.com/Dja-Cripto/atlas-server. Dados locais, segredos, dependências, modelos, músicas e mídia continuam ignorados.
- A direção editorial usa `clean | label | composed`: vídeo de apoio pode respirar limpo; abertura e fotografias sempre recebem identificação animada; dados, mapas e explicações podem usar composição motion.
- Fotografias agora devem identificar a pessoa, evento, objeto ou período retratado. Uma localização genérica não basta para uma imagem histórica.
- Mídia contextual recebe um título honesto sobre o conceito mostrado e não pode afirmar que representa exatamente um lugar ou uma pessoa.
- Não podem existir três vídeos limpos consecutivos: o terceiro recebe uma identificação editorial curta.
- Cada cena mantém somente uma mensagem focal, sem empilhar localização, estatística e cartão adicional.
- A geometria completa de países com territórios separados foi preservada nos mapas; o recorte anterior removia regiões como o Alasca do contorno dos Estados Unidos.
- Cenas `clean` e `label` continuam determinísticas e sem chamada individual ao GLM; o GLM programa cenas `composed`.

## O que foi validado

- O vídeo de teste anterior foi auditado pelo manifesto. Ele foi criado por um processo antigo ainda carregado em memória: a abertura e uma fotografia saíram como `clean`, contrariando o código já salvo.
- 59/59 testes automatizados aprovados.
- Sintaxe aprovada em `auto-plan.mjs` e `automatic.mjs`.
- Os testes cobrem abertura identificada, fotografias contextualizadas, rótulo animado, ausência de três vídeos limpos seguidos e ausência de composições consecutivas.
- Nenhum vídeo novo foi gerado e nenhuma API externa foi consumida nesta correção.

## Erros ou limitações abertos

- O novo equilíbrio precisa de um teste visual após reiniciar o servidor.
- Mapas multinacionais ainda dependem da direção do GLM para a hierarquia visual, embora a geometria territorial agora esteja completa.
- O `README.md` ainda descreve uma fase antiga do produto.

## Próximo passo recomendado

- Reiniciar o Atlas Studio e gerar um teste inédito de um minuto. Confirmar identificação na abertura, contexto em todas as fotografias, no máximo dois vídeos limpos seguidos e presença correta de territórios separados no mapa.
