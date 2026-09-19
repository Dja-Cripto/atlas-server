# Estado atual do Atlas Studio

**Atualizado em:** 19/09/2026, aproximadamente 19:20

## O que foi alterado

- O projeto está versionado em https://github.com/Dja-Cripto/atlas-server. Dados locais, segredos, dependências, modelos, músicas e mídia continuam ignorados.
- Vídeos usam `clean | label | composed`: podem respirar limpos, receber identificação curta ou ganhar motion quando apresentam dados e explicações.
- Toda fotografia agora é obrigatoriamente `composed` e segue para o GLM. O componente determinístico de zoom e legenda ficou restrito a vídeos.
- O prompt proíbe fotografia resolvida apenas com zoom e rodapé. O GLM deve movimentar a composição, revelar detalhes relevantes e usar somente o texto necessário para explicar pessoa, evento, objeto ou período.
- Cenas longas passaram de teto aproximado de 8,5 segundos para 6,8 segundos, preservando cortes naturais sempre que possível.
- A abertura em vídeo continua identificada e não podem existir três vídeos limpos consecutivos.
- A trilha sonora agora repete usando a duração real do arquivo. O loop continua durante vídeos longos sem cortar automaticamente a música a cada 60 segundos.
- A geometria completa dos países permanece preservada nos mapas.

## O que foi validado

- 60/60 testes automatizados aprovados.
- Sintaxe aprovada em `auto-plan.mjs`, `automatic.mjs` e `motion-author.mjs`.
- Testes garantem fotografias compostas, vídeos simples determinísticos, cenas próximas de no máximo sete segundos e cobertura integral da narração.
- Nenhum vídeo novo foi gerado e nenhuma API externa foi consumida nesta correção.

## Erros ou limitações abertos

- A criatividade das fotografias compostas precisa ser avaliada em uma produção inédita.
- Caso o GLM falhe três vezes numa fotografia, a contingência segura ainda é mais simples que a composição desejada.
- Mapas multinacionais continuam dependendo da direção do GLM para hierarquia e enquadramento editorial.
- O `README.md` ainda descreve uma fase antiga do produto.

## Próximo passo recomendado

- Reiniciar o Atlas Studio e gerar um teste inédito de um minuto. Avaliar principalmente a variedade das fotografias compostas, a duração dos takes e a continuidade musical.
