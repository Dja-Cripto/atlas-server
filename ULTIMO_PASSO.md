# Atlas Studio — estado atual
**Atualizado em:** 26/09/2026, aproximadamente 19:55 (America/Bahia).

## Versões
- V2 funcional preservada na tag `atlas-visual-v2-checkpoint-2026-09-26` (commit `d64e2ea`); reversão em `CHECKPOINTS.md`.
- V3 na branch `codex/atlas-visual-v3`. Projetos existentes seguem sua versão; correções deste registro beneficiam as próximas produções V3.

## Último feedback e correções no gerador V3
- Daniel aprovou a melhora da narração, mas relatou música ainda alta, mapa do Brasil sem apontar a ilha narrada e algumas explicações gráficas cobrindo demais o vídeo. Os exemplos de gráfico dividido com filmagem permanecem a referência positiva.
- Trilha normalizada: volume base sob a voz reduzido de 7,5% para 2,5%; introdução começa brevemente em até 6% e recua nos primeiros 24 quadros. Cenas de dados usam 1,8%; Shorts V3 usam 2,5%. Música continua normalizada numa cópia por produção; o vídeo já renderizado não foi alterado.
- Mapas de ilhas e outros lugares pequenos exigem localização específica. A Ilha da Queimada Grande, São Paulo, recebe ponto e legenda sobre o mapa com coordenadas aproximadas do plano de manejo do ICMBio (centro dos limites: 24,4611° S, 46,6868° O). Se um lugar pequeno não tem ponto verificado, a cena passa a buscar filmagem/fotografia do assunto, em vez de mostrar somente o país.
- A direção e o contrato Remotion V3 agora pedem explicações compactas ao lado, acima ou abaixo do assunto em vídeo, preservando a filmagem legível. Explicações complexas podem usar composição própria ou fotografia suavizada/escurecida; evitar desfoque CSS de tela inteira, custoso no renderizador. Não há template fixo para todos os gráficos.

## Validação e limitações
- `npm test`: 124/124 aprovados; teste específico cobre mapa com ponto, alternativa sem ponto e teto de música V3. O componente cartográfico alterado passou na checagem de tipos isolada.
- A checagem de tipos completa do renderer ainda encontra erros em arquivos locais de benchmark paralelos, não relacionados ao mapa. Esses arquivos e outras alterações paralelas permanecem fora desta correção.
- A qualidade visual da nova sobreposição e a inteligibilidade do novo mix precisam ser verificadas em um vídeo gerado após reiniciar o servidor. O último vídeo pronto não contém essas correções.
- Fallback de roteiro Luna para Gemini segue não implementado após rejeição pela revisão automática de autorização; falha do Luna nessa etapa pausa a produção com estado salvo.

## Próximo passo recomendado
Gerar um novo vídeo V3 pela página inicial e ouvir início, meio e fim com volume normal de reprodução; conferir se a música é discreta, se mapas localizam o lugar mencionado e se gráficos sobre vídeo preservam o assunto visível.
