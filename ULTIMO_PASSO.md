# Atlas Studio — estado atual
**Atualizado em:** 28/09/2026, aproximadamente 07:47 (America/Bahia).

## Correção da abertura do primeiro teste
- Teste local “The Bridge That Disappears Into the Sea”, run `f3001db5-2577-40f7-b033-19aa8679379d`, pausou porque a primeira cena planejada como footage não recebeu `openingVideoRequired`; a recuperação aceitava foto e a validação seguinte a rejeitava.
- Abertura agora recebe obrigatoriamente `openingVideoRequired` e `videoOnly`, também ao retomar direções antigas. `lib/opening-recovery.mjs` tenta até três consultas do mesmo assunto, incluindo nome simplificado e grafia ASCII; não muda narração, lugar ou duração. Recuperação genérica não gera foto/ilustração para essa abertura.
- Cada cena recuperada é salva imediatamente em `resolved.json`; retomadas preservam reparos concluídos antes de outra cena falhar.
- Validação: 158 testes aprovados, incluindo recuperação da abertura, rejeição de imagem como vídeo e reaproveitamento de abertura válida. Servidor local reiniciado ocioso e painel respondeu HTTP 200. Nenhuma nova produção/render foi iniciada; fontes reais do teste ainda precisam ser exercitadas na retomada pelo usuário. VPS não alterada.
- Limitação: se as buscas revisadas não encontrarem vídeo pertinente, ainda há pausa explícita com trabalho preservado; a correção não autoriza ponte genérica como Øresund. Próximo passo: retomar o mesmo teste no painel local e conferir a mídia de abertura antes de avaliar qualidade final.

## O que foi alterado (Seção 0 de PROXIMO_PASSO.md)
Implementação concluída de todos os pilares técnicos e editoriais da Seção 0 no pipeline V3:

1. **Etapa A (Roteiro Narrativo e Acessibilidade — 0.4):**
   - Atualizados os prompts de redação em `lib/providers.mjs` com a voz editorial V3: enigma inicial concreto, impacto humano tangível, contexto geográfico e social claro e acessível (sem jargões ou premissas locais), mecanismo causal passo a passo e resolução satisfatória. Orçamento dinâmico de ~145 palavras por minuto (±15%).

2. **Etapa B (Função Narrativa vs. Tratamento Visual — 0.5):**
   - Em `lib/auto-plan.mjs`, `lib/v3-direction.mjs` e `lib/motion-author.mjs`, adicionados os campos explícitos `narrativeRole` (`evidence` | `context`), `visualPurpose`, `requiredSubject` e `contextIntent`.
   - B-roll contextual não se disfarça mais de evidência direta de incidente. O validador de motion preserva rótulos geográficos discretos de orientação (`isLocationLabel`) sem admitir manchetes de texto não narradas.

3. **Etapa C (Variedade Criativa na Apresentação de Fotos — 0.6):**
   - Atualizado o prompt do autor de motion (`lib/motion-author.mjs`) para proibir a fórmula monótona e repetitiva de pan/zoom padrão com legenda em fotos documentais. Introduzidos tratamentos cinematográficos e analíticos: recortes focados em detalhes relevantes, composições comparativas, diagramas conectados e anotações explicativas no visual, respeitando as restrições de renderização segura em CPU.

4. **Etapa D (Identidade de Mídia e Continuidade de Segmentos — 0.7):**
   - Atribuído `sourceId` estável a todos os ativos em `lib/auto-media.mjs`.
   - Em `lib/visual-continuity.mjs`, bloqueada a reutilização de filmagem ou tomada idêntica em cenas consecutivas (`consecutiveReuse`).
   - Evitado o travamento silencioso de cortes: fim do arquivo é detectado explicitamente (`detectExhaustedSegments` / `segmentExhausted`). O intervalo de reutilização de mesma fonte passa a exigir distância mínima de 120 s.

5. **Etapa E (Revisão Editorial em Duas Passagens e Exceções Fundamentadas — 0.8):**
   - Criado `lib/editorial-review.mjs` com Pass 1 pré-motion (`reviewMediaPlan` validando mídias consecutivas, segmentos esgotados e disparidades de evidência) e Pass 2 pós-motion (`reviewAuthoredBlocks` auditando sequências de 3+ fotos para impedir monotonia visual de pan/zoom).
   - Integrado em `lib/automatic.mjs`. Substituídas paradas automáticas rígidas por exceções editoriais documentadas (`j.auto.mediaExceptions`) quando fotos específicas autênticas forem preservadas.

6. **Alinhamento de Transcrição e Entidades (0.9):**
   - Atualizado `audioSlots` em `lib/auto-plan.mjs` para alinhar as palavras da cena com o roteiro original aprovado, corrigindo grafias e nomes próprios que Whisper porventura transcreva com variações fonéticas.

## Validação e Resultados
- Suíte de testes `npm test`: **158 testes executados e 158 aprovados após a correção da abertura**.
- Adicionada suíte de testes unitários dedicada em `tests/editorial-review.test.mjs` cobrindo detecção de filmagem repetida consecutiva, esgotamento de segmento, marcação de continuidade, revisão pré-motion, revisão pré-render, validação de direcionamento narrativo e alinhamento script-áudio.

## Erros ou Limitações Abertos
- Por restrição expressa do usuário ("você vai só fazer isso e depois não precisa testar. Você volta aqui que a gente irá testar, que eu mesmo vou testar"), **nenhuma renderização de vídeo foi disparada**. A validação foi restrita ao nível de código e testes de unidade.
- A avaliação estética e narrativa do novo modelo V3 precisa ser exercitada diretamente em um render de teste gerado pelo usuário.

## Próximo Passo Recomendado
- O usuário realizar o teste prático de geração de vídeo no Atlas Studio (amostra curta horizontal de 60 a 90 segundos) para validar o novo arco narrativo, a continuidade das filmagens e a variedade de animação nas fotografias.
