# Estado atual do Atlas Studio no VPS

**Atualizado em:** 24/09/2026, aproximadamente 14:20 (America/Bahia)

## Acesso e ambiente

- Painel: `https://painel.setupdja.website`; VPS: `ubuntu@137.131.171.144`.
- Código: `/srv/atlas-studio`; contêiner `atlas-studio`; dados persistentes: `/srv/robo/portal-bot/data/atlas-storage`.
- n8n, Cloudflare e painel do WhatsApp preservados. Gate de publicação automática permanece desabilitado.

## Produções validadas

- Teste de 30 s `25e8f356-46c1-490e-836b-d4315b19c609`: MP4 de 34,39 s em 1080p; render otimizado de aproximadamente 13 min.
- Teste de 1 min sem Shorts `72d29595-cb7b-4974-ba30-1db4969dc4cd` (Mar Morto): MP4 de 53,547 s em 1080p, capa e metadados prontos. Render: 23 min 04 s; fluxo completo: 44 min 36 s.
- Teste do Canal do Panamá `b031b905-e96a-4707-a299-5cb318f69125`: primeiro o MP4 principal H.264/AAC de 52,843 s em 1920×1080, capa e metadados validados; depois exatamente um Short H.264/AAC de 48,683 s em 1080×1920, 50.558.108 bytes, validado por `ffprobe`. Render principal: cerca de 19 min 36 s; render do Short: cerca de 23 min 58 s. O vídeo principal ficou pronto antes de iniciar o Short.
- A produção do Panamá tem um agendamento criado posteriormente para 25/09/2026; aparecem cinco horários de Shorts no plano, mas somente o Short 1 foi gerado. O despachante ignora itens sem MP4, e o gate de publicação está desabilitado. Esta tarefa não modificou o agendamento.

## Correções e direção audiovisual

- No primeiro teste de Short, a cena 10 falhou no componente `Freeze` e a recompilação esbarrou em um bundle temporário existente. O gerador agora salva o fallback, remove o bundle anterior, recompila e valida o quadro reparado. Uma referência ausente a `store` também foi corrigida. O mesmo Short foi retomado e chegou a MP4 válido; os arquivos do vídeo principal foram preservados.
- Para futuros documentários, a primeira e a última cena recebem papéis explícitos de abertura e conclusão e passam pela direção visual específica, mesmo quando a mídia é vídeo. A abertura deve materializar a pergunta do assunto; o fim deve retomá-la ou concluir uma consequência com um gesto visual deliberado. O modelo escolhe imagem, tipografia e movimento por assunto, sem logo, vinheta ou cartão final fixo. Shorts mantêm entrada imediata.
- O planejador de mídias passou a escolher material que suporte a pergunta inicial e o fechamento. O mapa Natural Earth, efeitos, concorrência e configuração de render permanecem iguais. As melhorias visuais não alteram os MP4s já concluídos.
- A voz inglesa configurada foi mantida. O usuário preferiu a direção R e rejeitou S/T/U por sussurro ou respiração. O roteiro agora pede contrastes expressivos pontuais com tags Fish S2 sem comandos de sussurro ou respiração. Antes de cada trecho de TTS, o gerador aplica direção de abertura, corpo, fecho ou Short e remove tags que induzem voz soprosa. Assim, cada nova chamada de até 320 caracteres recebe direção.
- O roteiro longo agora pede arco explícito: pergunta e consequências nos primeiros 2-3 takes, desenvolvimento causal com evidências, virada factual e resposta final honesta. As três primeiras cenas recebem direção visual específica; o Short continua com entrada imediata.
- O planejador visual prioriza cenas compostas quando a narração contém quantidade, comparação ou mecanismo geográfico, preservando o limite de 40% de vídeo composto em vídeos curtos e 35% nos longos e evitando composições adjacentes. A regra de balanceamento deixou de rodar duas vezes; fotos permanecem compostas e mapas seguem a geometria real.
- Nesta atualização, 81/81 testes passaram, sintaxe dos quatro módulos validada e diff sem erros. A melhora de retenção e o resultado visual ainda dependem de assistir a uma nova produção; nenhuma produção antiga foi reprocessada.
- npm test: 80/80 aprovados; verificação de sintaxe e git diff --check aprovados. providers.mjs instalado no VPS; contêiner Atlas running healthy. Um teste pelo próprio providers.voice() gerou MP3 válido de 35,135 s e 562.200 bytes com a voz atual e vários trechos. A ausência de respiração audível e a qualidade dramática ainda dependem de escuta humana. A abertura e o fecho visual de uma produção futura também precisam ser avaliados no MP4.

## Próximo passo

- Criar um novo teste curto e observar, com áudio e sem áudio, os três primeiros takes e um dado quantitativo narrado sobre vídeo. Confirmar se o gráfico aparece no momento certo, sem excesso de texto. Não habilitar publicação automática.

- Ouvir a amostra temporária de narração R gerada pelo fluxo real no VPS em /srv/robo/portal-bot/data/atlas-storage/temp/voice-tests/output-production-path/voice.mp3 e confirmar se o contraste funciona sem sussurro ou respiração audível. Se necessário, ajustar somente as tags antes de iniciar outra produção longa.
- Na próxima produção, conferir a abertura e o encerramento visual sem áudio e medir o custo extra. Manter a publicação automática desabilitada. Efeitos sonoros pontuais seguem pendentes até haver amostra aprovada.
