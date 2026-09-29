# Atlas Studio — estado atual

Atualizado em 29/09/2026, aproximadamente 15:45 (America/Bahia).

## Último trabalho
- **Correção da validação de outputRange do Remotion no gerador de Shorts (`lib/motion-author.mjs`, `lib/shorts.mjs`)**:
  - Diagnosticada e corrigida a causa raiz da falha na Cena 5 do Short 5 (`outputRange must contain only numbers, numeric tuples, or supported scale, translate, and rotate strings`).
  - O parser de `interpolate` tratava o 4º argumento de opções `{ extrapolateLeft: 'clamp', ... }` como segundo item de `outputRange`, empacotando-o em `[output, { options }]`.
  - Atualizado `normalizeMotionCode` para rejeitar objetos de opções em `args[3]`, desembalar `[output, { options }]` caso ocorra e validar na AST a ausência de objetos em `outputRange`.
  - Adicionado fallback secundário com `generateFallbackSceneCode` em `lib/shorts.mjs` caso a prévia ainda aponte falha, impedindo travamento de lotes.
- **Implementação da faixa de duração (10 a 15 minutos) para produções automáticas (`lib/automatic.mjs`, `lib/providers.mjs`, `lib/topics.mjs`, `public/app.js`)**:
  - Separado o comportamento entre pedidos manuais (duração exata alvo ±15%) e pautas automáticas da esteira do banco de temas.
  - Para pautas automáticas (`isAutoTopic`, `durationMode === 'range'`, `topicId`), o sistema agora aceita a faixa configurável de 10 a 15 minutos (com margem de 5%, ~9.5 a 15.75 minutos). Documentários como o da Holanda (12.4 min) passam diretamente sem rejeição.
  - O gerador de roteiro (`script`) agora calcula o orçamento de palavras baseado no ponto médio e faixa de `[minMinutes, maxMinutes]`.
  - Interface do estúdio atualizada com controles de `minMinutes` e `maxMinutes` nas configurações de montagem.
- **Testes automatizados (`tests/shorts-render.test.mjs`)**:
  - Testes unitários para validação de `interpolate` com opções e aprovação da faixa de duração automática (10 a 15 min).
  - Executados 168 testes com 100% de aprovação.

## Estado verificado
- **168 testes automatizados passando com 100% de sucesso (`npm test`)**.
- **VPS (`4aa56f3c-6a61-4e8d-bbb7-001aa343826d`)**:
  - Vídeo longo de 14.3 minutos finalizado e íntegro (1.5 GB).
  - Shorts 1, 2, 3 e 4 renderizados com sucesso em 1080x1920 (9:16 vertical).
  - Short 5 teve a cena `Scene4.tsx` corrompida pelo bug de `outputRange` agora resolvido no gerador do robô.
- **VPS (`11720f5a-0831-4379-8770-3979b8a4a3ce` - Holanda)**:
  - Pausou na validação antiga de 15 min com 12.4 min (746s). Com a nova regra de 10 a 15 minutos, está plenamente elegível para montagem.

## Erros ou limitações que continuam abertos
- Cooldown de reutilização de ativos dentro do mesmo Short pode ser reforçado para evitar repetições pontuais como as do Short 4 (cenas 6 e 8).
- Publicação automática permanece desligada conforme solicitado.

## Próximo passo recomendado
- Realizar deploy na VPS (`git push` e `git pull`), aplicar a correção no `Scene4.tsx` do Short 5 e finalizar sua renderização para completar os 5 Shorts de Terremoto no Japão.
