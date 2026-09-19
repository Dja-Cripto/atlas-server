# Estado atual do Atlas Studio

**Atualizado em:** 19/09/2026, aproximadamente 20:00

## O que foi alterado

- O projeto está versionado em https://github.com/Dja-Cripto/atlas-server. Dados locais, segredos, dependências, modelos, músicas e mídia continuam ignorados.
- Vídeos usam `clean | label | composed`; fotografias continuam obrigatoriamente compostas pelo GLM.
- Foram criadas cinco variações determinísticas e reutilizáveis de identificação para vídeos, com posições e tipografias diferentes. Elas não exigem chamada adicional ao GLM.
- O validador agora rejeita modos luminosos `screen`, `color-dodge` e `plus-lighter`, além de opacidade numérica acima de 1. Isso impede clarões que apagam os detalhes da fotografia.
- O prompt também proíbe flash branco de tela inteira e lavagens de exposição em fotografias.
- Em vídeos longos, a primeira cena é convertida para vídeo de estabelecimento identificado quando o plano tentaria começar com mapa, gráfico, título ou fotografia. Mapas e dados ficam para depois da introdução.
- Cenas permanecem próximas de no máximo sete segundos e a trilha repete pela duração real do arquivo.

## O que foi validado

- A cena defeituosa foi auditada: ela usava `mixBlendMode: screen` com uma variável de opacidade que chegava a 1,5.
- 63/63 testes automatizados aprovados.
- Os testes cobrem bloqueio de clarão, cinco variações possíveis, abertura visual de vídeos longos, fotografias compostas, duração das cenas e continuidade musical.
- Nenhum vídeo novo foi gerado e nenhuma API externa foi consumida nesta correção.

## Erros ou limitações abertos

- As novas variações precisam ser avaliadas visualmente numa produção inédita.
- Vídeos curtos de aproximadamente um minuto ainda podem começar diretamente com mapa quando a narrativa exige localização imediata; a proteção de introdução gradual foi aplicada aos vídeos longos.
- Caso o GLM falhe três vezes numa fotografia, a contingência segura continua mais simples.
- O `README.md` ainda descreve uma fase antiga do produto.

## Próximo passo recomendado

- Reiniciar o Atlas Studio e gerar um teste inédito. Verificar ausência de clarões, variedade dos identificadores em vídeo e abertura por filmagem nos vídeos longos.
