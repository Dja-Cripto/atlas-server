# Estado atual do Atlas Studio no VPS

**Atualizado em:** 24/09/2026, aproximadamente 17:00 (America/Bahia)

## Acesso e ambiente

- Painel: `https://painel.setupdja.website`; VPS: `ubuntu@137.131.171.144`.
- Código: `/srv/atlas-studio`; contêiner `atlas-studio`; dados persistentes: `/srv/robo/portal-bot/data/atlas-storage`.
- n8n, Cloudflare e painel do WhatsApp preservados. Gate de publicação automática permanece desabilitado.

## Produções validadas

- Teste de 30 s `25e8f356-46c1-490e-836b-d4315b19c609`: MP4 de 34,39 s em 1080p; render otimizado de aproximadamente 13 min.
- Teste de 1 min sem Shorts `72d29595-cb7b-4974-ba30-1db4969dc4cd` (Mar Morto): MP4 de 53,547 s em 1080p, capa e metadados prontos. Render: 23 min 04 s; fluxo completo: 44 min 36 s.
- Teste do Canal do Panamá `b031b905-e96a-4707-a299-5cb318f69125`: primeiro o MP4 principal H.264/AAC de 52,843 s em 1920×1080, capa e metadados validados; depois exatamente um Short H.264/AAC de 48,683 s em 1080×1920, 50.558.108 bytes, validado por `ffprobe`. Render principal: cerca de 19 min 36 s; render do Short: cerca de 23 min 58 s. O vídeo principal ficou pronto antes de iniciar o Short.
- A produção do Panamá tem um agendamento criado posteriormente para 25/09/2026; aparecem cinco horários de Shorts no plano, mas somente o Short 1 foi gerado. O despachante ignora itens sem MP4, e o gate de publicação está desabilitado. Esta tarefa não modificou o agendamento.

- Teste recente do Estreito de Gibraltar, execução 89ab9b4a-3d09-41fa-a5d3-aff8d1beb1f6: o MP4 foi concluído, mas o usuário identificou abertura/fecho pouco distintos, excesso de água genérica e uma cena de 1366×720 perto de 48 s. A inspeção confirmou 13 cenas em 75,31 s, vídeo de 1366×720 na cena 8, fotos abaixo de 1920×1080 nas cenas 3, 7 e 12 e fallback simples na cena 3. A maior parte das mídias era contextual, não filmagem exata do estreito. O MP4 existente não foi alterado.

- Teste da Torre Eiffel, execução 5b30eb69-088a-44cd-9206-d8138833f0ba: 32,50 s e cinco cenas. As duas cenas de diagrama caíram em fallback genérico com textos de planejamento na tela; uma cena de vídeo usou o mesmo clipe duas vezes (tela cheia e inset). O usuário rejeitou o resultado; o MP4 existente não foi alterado e não deve ser publicado.

## Correções e direção audiovisual

- Correção da Torre Eiffel: o normalizador deixou de quebrar forEach em for Each; o validador aceita limites constantes seguros como COLS - 1. Reaplicando essas regras às duas tentativas originais, ambas passaram. Vídeos de até 45 s agora usam no máximo um diagrama; diagramas não herdam foto/vídeo borrado da cena anterior. O fallback de calor/frio anima um esquema de átomos sem exibir heading/caption técnico; se um diagrama desconhecido não puder ser animado, o processo falha visivelmente em vez de concluir com cartão de planejamento. Um único take não pode decodificar o mesmo vídeo duas vezes.
- Validação da correção: 90/90 testes; no contêiner VPS as tentativas reais das cenas 2 e 4 foram aceitas, o plano de 32,50 s manteve somente a cena 2 como diagrama, nenhum diagrama herdou fundo, a duplicação foi barrada, e o fallback térmico não contém texto de planejamento. Atlas running healthy. O novo MP4 ainda não foi gerado nem avaliado visualmente.
- Para próximas produções, assuntos de mecanismo invisível, como correntes opostas, recebem duas cenas explicativas em Remotion, posicionadas perto da pergunta e da resposta; o caso de Gibraltar seleciona as cenas 2 e 8 e preserva a foto real da cena 3. O planejamento distingue mídia exata (pode respirar limpa) de mídia contextual (deve explicar a fala, sem fingir ser o lugar). O fallback das correntes também anima duas camadas opostas.
- A direção visual exige abertura identificável sem áudio, fecho com resposta e pausa final e fotos com revelação/anotação factual em vez de somente zoom e legenda. A inspeção do vídeo anterior mostrou que uma foto havia caído no fallback simples; a nova direção não corrige o arquivo já renderizado.
- Downloads futuros só são aceitos depois de o ffprobe medir pelo menos 1920×1080 no arquivo; candidato abaixo do limite é descartado e substituído. Metadados dos provedores filtram opções insuficientes antes do download. A imagem de 1366×720 do teste falha no novo critério.
- Validação anterior: 85/85 testes, sintaxe dos módulos e git diff --check aprovados. No contêiner do VPS, o mesmo plano do Gibraltar selecionou as cenas explicativas 2 e 8; critério Full HD rejeitou 1366×720 e aceitou 1920×1080; Atlas running healthy. A qualidade artística final exige nova renderização e avaliação humana.
- No primeiro teste de Short, a cena 10 falhou no componente `Freeze` e a recompilação esbarrou em um bundle temporário existente. O gerador agora salva o fallback, remove o bundle anterior, recompila e valida o quadro reparado. Uma referência ausente a `store` também foi corrigida. O mesmo Short foi retomado e chegou a MP4 válido; os arquivos do vídeo principal foram preservados.
- Para futuros documentários, a primeira e a última cena recebem papéis explícitos de abertura e conclusão e passam pela direção visual específica, mesmo quando a mídia é vídeo. A abertura deve materializar a pergunta do assunto; o fim deve retomá-la ou concluir uma consequência com um gesto visual deliberado. O modelo escolhe imagem, tipografia e movimento por assunto, sem logo, vinheta ou cartão final fixo. Shorts mantêm entrada imediata.
- O planejador de mídias passou a escolher material que suporte a pergunta inicial e o fechamento. O mapa Natural Earth, efeitos, concorrência e configuração de render permanecem iguais. As melhorias visuais não alteram os MP4s já concluídos.
- A voz inglesa configurada foi mantida. O usuário preferiu a direção R e rejeitou S/T/U por sussurro ou respiração. O roteiro agora pede contrastes expressivos pontuais com tags Fish S2 sem comandos de sussurro ou respiração. Antes de cada trecho de TTS, o gerador aplica direção de abertura, corpo, fecho ou Short e remove tags que induzem voz soprosa. Assim, cada nova chamada de até 320 caracteres recebe direção.
- O roteiro longo agora pede arco explícito: pergunta e consequências nos primeiros 2-3 takes, desenvolvimento causal com evidências, virada factual e resposta final honesta. As três primeiras cenas recebem direção visual específica; o Short continua com entrada imediata.
- O planejador visual prioriza cenas compostas quando a narração contém quantidade, comparação ou mecanismo geográfico, preservando o limite de 40% de vídeo composto em vídeos curtos e 35% nos longos e evitando composições adjacentes. A regra de balanceamento deixou de rodar duas vezes; fotos permanecem compostas e mapas seguem a geometria real.
- Nesta atualização, 81/81 testes passaram, sintaxe dos quatro módulos validada e diff sem erros. A melhora de retenção e o resultado visual ainda dependem de assistir a uma nova produção; nenhuma produção antiga foi reprocessada.
- Um teste anterior pelo providers.voice() gerou MP3 válido de 35,135 s com a voz atual; a ausência de respiração audível ainda depende de escuta humana.

## Próximo passo

- Gerar somente um novo teste curto no front-end depois desta correção e assistir sem áudio às cenas de explicação; confirmar que não aparece texto de planejamento, vídeo duplicado nem fundo borrado. Não publicar o MP4 da Torre Eiffel já concluído.
- O teste da Torre Eiffel durou 32,50 s apesar do pedido de no máximo 30 s; a calibração da duração ainda está aberta. A narração menciona "several inches", enquanto a fonte oficial da Torre Eiffel descreve variação de alguns milímetros; conferir/revisar a afirmação antes de publicar qualquer versão desse tema.
- Manter a publicação automática desabilitada. n8n, Cloudflare e painel WhatsApp não foram alterados.
