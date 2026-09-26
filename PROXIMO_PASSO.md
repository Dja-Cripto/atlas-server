# Próximos passos aprovados — recuperação de cenas e personalidade editorial
**Atualizado em:** 26/09/2026 (America/Bahia).

Este arquivo registra decisões para implementação futura. Nenhum dos fluxos abaixo está ativo no gerador principal. Consulte `ULTIMO_PASSO.md` para o estado implementado e preserve a produção em andamento.

## 1. Recuperação de cenas por segundo modelo

- Manter até **3 tentativas com GLM-5.3-Flash** por cena. Se falharem, tentar até **2 vezes com um segundo modelo**; só depois recorrer ao template visual seguro já existente. As tentativas são por cena, sem reiniciar cenas aprovadas.
- Primeiro candidato para comparação: **Kimi K3**, disponível no OpenCode Go. Testar em cenas reais que falharam no GLM e medir aprovação técnica, qualidade visual, tempo e consumo. **Kimi K2.7 Code** é alternativa de menor custo, não escolha definitiva.
- Limitar o uso do template a **5% das cenas do vídeo**, conforme o total de cenas; acima disso, pausar com motivo e contagem visíveis no painel. Avaliar também falhas de reserva consecutivas. Definir arredondamento e regra para vídeos curtos após os testes.
- Implementar e validar separadamente da personalidade editorial abaixo. Não trocar o modelo principal apenas com base neste plano.

## 2. Personalidade editorial reconhecível

### Intenção aprovada

O canal deve soar e parecer escrito por uma pessoa curiosa, observadora e um pouco sarcástica. Ela percebe contradições, questiona explicações fáceis e às vezes reage com humor seco. Pode haver um exagero expressivo quando ele torna uma ideia memorável, **nunca exagero nos fatos**. A seriedade documental, o respeito por pessoas reais e a precisão continuam prioritários. Em temas delicados, ou quando o momento pede contemplação, não fazer piada.

Essa identidade é um **ponto de vista consistente**, não um conjunto de bordões, piadas obrigatórias ou efeitos repetidos. Nem todo capítulo, cena ou vídeo precisa ter humor. Variar intensidade, ritmo e recursos visuais conforme o assunto. A referência do piloto aprovado é a reação breve **“YES, THE DESERT.”** no vídeo sobre o Saara e a Amazônia: a surpresa nasce da informação e aparece no instante certo. **Não reutilizar a frase nem transformar seu desenho em template.**

### Implementação no gerador

1. Criar uma orientação editorial curta, central e versionada, compartilhada pelas etapas. Ela deve descrever voz, limites factuais, humor e tratamento visual sem prescrever frases ou layouts. Registrar sua versão e as decisões editoriais específicas de cada produção no estado persistido para que retomadas não mudem de personalidade no meio do vídeo.
2. Aplicar a orientação à geração e revisão do roteiro em `lib/providers.mjs`, mantendo a pesquisa como fonte dos fatos. O roteiro deve ter pensamento próprio, transições naturais e oportunidades de surpresa que venham do conteúdo. Fazer uma revisão editorial para remover texto genérico, sarcasmo forçado, repetição de recursos, ataques a pessoas e afirmações sem sustentação. Não impor uma cota de piadas nem alongar o vídeo só para mostrar personalidade.
3. Levar a intenção do texto à direção de narração em `lib/providers.mjs`: interpretação e pontuação devem permitir ironia sutil, surpresa ou silêncio conforme o trecho. Pausas curtas apenas quando o raciocínio termina ou a reação precisa respirar; não inserir silêncio longo no meio da explicação. Evitar uma instrução de voz fixa e excessivamente enérgica para todos os trechos.
4. Depois de obter a narração e seus tempos reais, identificar somente os momentos editoriais que merecem resposta visual. Propagar essas intenções para o planejamento em `lib/auto-plan.mjs`/`lib/automatic.mjs` e para a autoria Remotion em `lib/motion-author.mjs`. O robô pode escolher livremente enquadramento, texto, composição e movimento. Manter filmagem ou fotografia real como base; destacar uma informação ou uma reação por vez, sem sobrepor gráficos por obrigação. Uma cena pode permanecer limpa.
5. Sincronizar cada destaque ao trecho efetivamente falado, usando a transcrição com tempos por palavra, e verificar amostras de quadros antes de aprovar a cena. Conferir que o elemento surge quando a ideia é revelada, que está legível e que não oculta a mídia. Revisar o uso do frame local em componentes dentro de `Sequence`, pois o piloto mostrou que uma animação pode renderizar sem aparecer no tempo esperado se usar o frame global. A validação deve detectar falhas de timing, não exigir humor ou efeito em toda cena.
6. Testar isoladamente antes de ligar no robô principal: comparar versões atual e nova de roteiros, voz e vídeos curtos em assuntos diferentes, incluindo um tema sério em que o humor deva recuar. Avaliar com Daniel se a personalidade é audível e visível, se parece natural, se os fatos permanecem corretos e se áudio e imagem coincidem. Só então integrar, testar a retomada de produção, registrar checkpoint e liberar gradualmente para novas produções.

### Critério de aceitação

Após alguns vídeos, um espectador deve reconhecer o mesmo olhar editorial sem ouvir a mesma piada ou ver o mesmo efeito toda vez. Se a identidade só aparecer em instruções internas, mas não na narração e na montagem, a implementação ainda não terminou. Se o humor prejudicar precisão, respeito ou clareza, reduzir sua intensidade naquela passagem.

## Referência do teste isolado

O piloto local está em `scratch/personality-pilot-v2/` (roteiro, narração, transcrição e prévia). Ele é referência de tom e sincronização, não material a copiar para o gerador nem arquivo de produção a versionar.
