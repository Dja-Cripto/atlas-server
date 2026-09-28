# Atlas Studio — estado atual
**Atualizado em:** 28/09/2026, aproximadamente 09:35 (America/Bahia).

## Retomada e conclusão do projeto "The Bridge That Disappears Into the Sea"
- **Projeto recuperado:** ID `60e7fea6-c3ec-4104-a031-02bd6a50b031`, run `f3001db5-2577-40f7-b033-19aa8679379d`.
- **Pesquisa e narração preservadas:** a pesquisa factual foi integralmente mantida. O roteiro salvo (298 palavras) e a narração oficial (102,4 s / ~1,7 min) foram auditados contra as regras de duração: para 2 minutos pedidos (120 s), a tolerância de ±15% aceita de 102 s a 138 s e de 247 a 334 palavras. Roteiro e áudio estavam perfeitamente dentro da faixa e foram preservados sem desperdício de tokens.
- **Abertura autêntica obrigatória:** corrigida a seleção da cena 1 no gerador para consultas progressivas preservando local e assunto (`Øresund Bridge`, `Oresund Bridge`, `Øresund Strait`, `Oresund Strait`, `Oresund`). A abertura capturou filmagem real em alta definição da ponte (`Pexels:16016738`, papel `exact-location`, `openingVideoRequired: true`, `videoOnly: true`). Nenhuma fotografia ou filmagem genérica fora de contexto foi aceita.
- **Continuidade e seleção de mídia:** `lib/auto-media.mjs` atualizado para não permitir que mídias em cache de cenas posteriores bloqueiem o candidato legítimo da abertura. As 18 cenas foram coletadas (50% vídeo real HD, 50% fotos/ilustrações com autoria) respeitando avanço de tomada e sem repetição consecutiva de filmagens.
- **Autoria Remotion Luna:** todas as 18 cenas foram dirigidas e programadas pelo GPT-6 Luna sob a voz narrativa e os requisitos da Seção 0, obtendo 100% de compilação na primeira tentativa.
- **Renderização e entrega:** o MP4 final em 1080p foi renderizado com sucesso (177,99 MB, 102,48 s), a capa oficial foi gerada e o projeto avançou para o status final `review`.

## O que foi alterado no gerador (permanente para as próximas produções)
1. `lib/opening-recovery.mjs`: consultas de recuperação da abertura geram variantes com o nome do monumento/marco em grafia original e ASCII antes de recuar para o acidente geográfico mais amplo, mantendo estritamente o assunto e o local.
2. `lib/auto-media.mjs`: `usedUrls` não exclui candidatos quando `scene.openingVideoRequired` estiver ativo, garantindo prioridade máxima de busca para a abertura.
3. `lib/automatic.mjs`: tanto o plano quanto a lista resolvida aplicam `requireOpeningVideo` nas retomadas, impedindo que cenas de abertura vazias ou não conformes sejam puladas; atualização idempotente de cenas por `id` em `resolved.json`.

## Validação e Resultados
- **158 testes unitários aprovados (`npm test`)** cobrindo recuperação da abertura, continuidade visual, alinhamento de transcrição e regras editoriais da Seção 0.
- **Produção ponta a ponta concluída:** o vídeo do projeto de teste foi renderizado em `data/long_videos/60e7fea6-c3ec-4104-a031-02bd6a50b031/video-f3001db5-2577-40f7-b033-19aa8679379d.mp4` e está acessível para reprodução e revisão no painel local (porta 4310).

## Erros ou Limitações Abertos
- Nenhum erro de pipeline em aberto no gerador ou no projeto em teste.
- Resta a avaliação humana do vídeo pronto pelo usuário no painel para conferir o ritmo e a estética visual da nova versão.

## Próximo Passo Recomendado
- O usuário assistir ao vídeo gerado no painel do Atlas Studio para avaliar a abertura com a Ponte de Øresund e o tratamento visual das cenas.
