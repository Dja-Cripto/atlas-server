# Atlas Studio — Diagnóstico Visual e Correção Definitiva no Gerador
**Atualizado em:** 25/09/2026, aproximadamente 16:15 (America/Bahia).

## Versões
- V1 funcional: tag `atlas-visual-v1-checkpoint-2026-09-24`, commit `78b60db`; imagem `atlas-studio:visual-v1-checkpoint-2026-09-24` preservada no VPS.
- V2: branch `codex/atlas-visual-v2`. Procedimento de reversão em `CHECKPOINTS.md`.
- Painel: https://painel.setupdja.website; código do servidor: /srv/atlas-studio.

## O que foi alterado e diagnosticado
- **Avaliação quadro a quadro do vídeo de 1 min (*"Oymyakon"*, Job `bb9abbe3-1aa6-4da0-b3e2-15f340a4446c`)**:
  - **Cena 0 (0:00 - 0:06.8)**: Drone real sobre o vale nevado com pergunta de abertura perfeitamente enquadrada.
  - **Cena 1 (0:06.8 - 0:13.6)**: Movimento vertical mostrando a cordilheira, indicador discreto de altitude e a palavra *"Temperature"*.
  - **Cena 2 (0:13.6 - 0:20.5) — O erro apontado pelo usuário**:
    - O vídeo selecionado para o fundo (`ac1289e255c77a87712d.mp4`, 19.2 MB) era uma filmagem aérea impressionante de neblina e montanhas da Sibéria.
    - O modelo GLM gerou `<OffthreadVideo ... endAt={Math.min(8, (DUR / fps) + 0.5)} />`. Como a cena tinha 204 quadros a 30 fps, a expressão resultou em `7.3`. No Remotion, a propriedade `endAt` é em **quadros**, e não em segundos. Com isso, o vídeo cortou abruptamente no quadro 7 (0,23s de cena), tornando-se transparente e expondo o fundo sólido `#142d32` com a animação vetorial do relevo por cima.
  - **Cena 3 (0:20.5 - 0:26.5)**: Filmagem limpa de nevasca florestal em alta definição, respiro documental perfeito.
  - **Cena 4 (0:26.5 - 0:33.5)**: Fotografia histórica de 6 de fevereiro de 1933 com efeito máquina de escrever e `-67°C` tipográfico sutil.
  - **Cena 5 (0:33.5 - 0:40.4)**: Filmagem aérea em alta definição de toda a vila de Oymyakon, animando `-67.7°C` e o recorde histórico com transição perfeitamente contínua da cena anterior.
  - **Cena 6 (0:40.4 - 0:44.9)**: Filmagem limpa em Full HD da vila siberiana em dia gelado.
  - **Cena 7 (0:44.9 - 0:51.8)**: Filmagem documental com iluminação dourada e neve profunda.
  - **Cena 8 (0:51.8 - 0:56.5)**: Crianças de trenó na neve com métrica suave de fechamento escolar aos `-52°C`.
- **Correção definitiva implementada no gerador (`lib/motion-author.mjs`)**:
  - `normalizeSceneCode` agora remove qualquer atributo `endAt` em `<OffthreadVideo>` e `<Video>`, pois o container `<Sequence>` do Remotion já controla com precisão a duração de cada cena.
  - Atualização dos contratos/prompts (`sceneContract` e `shortsSceneContract`) proibindo expressamente o uso de `endAt`.
  - Adicionado teste unitário cobrindo a remoção automática de `endAt`.

## Validação e Resultados
- 106/106 testes unitários passando (`npm test`).
- Diagnóstico comprovado pela extração direta dos quadros do vídeo final e inspeção do ativo de vídeo no servidor.

## Próximo passo recomendado
- Realizar deploy das alterações para o servidor e gerar nova produção de validação para conferir a persistência contínua do vídeo na Cena 2.