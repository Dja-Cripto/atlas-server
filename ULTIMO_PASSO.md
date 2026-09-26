# Atlas Studio — estado atual
**Atualizado em:** 26/09/2026, aproximadamente 19:25 (America/Bahia).

## Versões
- V2 funcional preservada na tag `atlas-visual-v2-checkpoint-2026-09-26` (commit `d64e2ea`); reversão em `CHECKPOINTS.md`.
- V3 na branch `codex/atlas-visual-v3`. Novos projetos usam V3; projetos anteriores seguem V2.

## Último vídeo V3 e correção
- O teste de 1 minuto sobre o Canal do Panamá renderizou em Full HD: 52,7 s, MP4 `video-448d6c5f-64e7-47ec-a9e6-f7de9e7cc6d9.mp4`, 103,4 MB. A primeira cena usa filmagem real do canal; a narração mostrou a personalidade editorial desejada.
- Daniel relatou que a trilha competiu com a voz e que a abertura visual ficou fraca. Inspeção do arquivo confirmou: voz média -20 dB, trilha normalizada média -18 dB antes da mixagem; no gerador V3 a música tocava a 28% pelos primeiros 75 quadros (2,5 s), mesmo com a fala já iniciada. O primeiro quadro útil mostrou uma tomada ampla com “85 FEET” pequeno à esquerda e pouca evolução nos segundos seguintes.
- O gerador V3 agora mistura a trilha normalizada a 7,5% sob a voz, com início breve a 11% e redução progressiva nos primeiros 24 quadros; dados usam 5%. Shorts V3 também passam a 7,5%. A música original e o vídeo já renderizado não foram alterados.
- A direção V3 e o contrato de autoria da primeira cena agora pedem filmagem real ativa, um foco legível e evolução visual nos primeiros 2–3 s, rejeitando conceitualmente tomada ampla quase imóvel com mero número lateral. Não impõem título ou layout fixo. O primeiro quadro continua obrigado a ser vídeo real relevante.

## Validação e limites
- `npm test`: 122/122 aprovados após a correção; sintaxe e `git diff --check` aprovados. A nova mixagem e o novo gancho ainda precisam ser ouvidos/vistos num próximo render completo.
- O teste de duração de 60 s produziu 52,7 s, dentro da faixa V3 atual de ±15%. Qualidade de abertura e clareza do áudio dependem de revisão humana; não declarar aprovação final só pelo teste automatizado.
- Resultados locais de benchmark e alterações paralelas em `.gitignore`, arquivos de inicialização, `lib/automatic.mjs`, `lib/providers.mjs`, interface e `renderer/src/Root.tsx` não integram esta correção; preservar sem descartá-los.
- Fallback de roteiro Luna para Gemini segue não implementado após rejeição pela revisão automática de autorização; falha do Luna nessa etapa pausa a produção com estado salvo.

## Próximo passo recomendado
Gerar outro vídeo curto pela página inicial com o código atualizado e verificar, com áudio ligado e desligado, a força dos 3 primeiros segundos e a inteligibilidade da voz no início, meio e fim. Ajustar novamente somente se a mixagem ou a abertura ainda competir com o conteúdo.
