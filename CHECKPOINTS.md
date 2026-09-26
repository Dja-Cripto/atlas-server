# Versões do Atlas Studio

## Atlas Visual V1 — checkpoint estável

- Criado em 24/09/2026, antes das melhorias de mapas e animações.
- Tag Git imutável: `atlas-visual-v1-checkpoint-2026-09-24`.
- Commit: `78b60db` (baseline com 90 testes locais aprovados).
- Checkpoint enviado ao GitHub: `Dja-Cripto/atlas-server`.
- Código do VPS conferido no mesmo commit, sem alterações locais.

## Atlas Visual V2 — liberdade visual

- Checkpoint funcional criado em 26/09/2026: tag atlas-visual-v2-checkpoint-2026-09-26, commit d64e2eaa0bbbc9751e9d9d9196ded0234e463c5f, enviado ao GitHub.
- Desenvolvimento original na branch codex/atlas-visual-v2; a V3 parte desse checkpoint. Benchmarks locais ainda não consolidados não fazem parte da tag.
- Preservar liberdade de composição, vídeos descritivos limpos e pausas intencionais; fotografias sempre animadas. Não exigir efeitos em todas as cenas.
- Correções devem valer para novas produções; não reescrever projetos ou renders antigos.
- Consulte `ULTIMO_PASSO.md` para validação e estado da implantação.

## Atlas Visual V3 — planejamento

- Branch de trabalho: codex/atlas-visual-v3, criada a partir do checkpoint V2.
- Escopo aprovado e ordem de implementação em PROXIMO_PASSO.md.
- Antes de liberar a V3, validar uma produção completa, incluindo roteiro, cenas, áudio, Shorts e custo real do GPT-6 Luna. A V2 permanece disponível pela tag, independentemente dos resultados da V3.

## Como retornar à V2

1. Preservar o estado e os dados das produções; não usar reset destrutivo nem apagar arquivos de produção.
2. Selecionar a tag atlas-visual-v2-checkpoint-2026-09-26 em checkout ou worktree separado, localmente e no servidor.
3. Recriar/reiniciar apenas o serviço do gerador com esse código; conferir os mounts do código e a saúde do painel. Banco, credenciais, mídias e vídeos permanecem intactos.
4. Registrar no ULTIMO_PASSO.md qual versão ficou ativa após a reversão.
## Como retornar à V1

1. Não interromper uma produção em execução. Guardar o estado atual em commit/branch antes de trocar de versão.
2. Buscar as tags e selecionar `atlas-visual-v1-checkpoint-2026-09-24` no código local ou em `/srv/atlas-studio` no VPS. Não usar `git reset --hard` nem apagar dados para reverter.
3. No VPS, recriar somente o serviço `atlas` com o código da V1 e sua imagem preservada `atlas-studio:visual-v1-checkpoint-2026-09-24` (ou reconstruir a imagem a partir da tag). Os mounts de `lib`, `public`, `scripts` e `server.mjs` exigem restaurar o checkout também, não somente a imagem.
4. Preservar banco, credenciais, músicas, modelos, mídia, código gerado e vídeos. A reversão é do gerador; não da biblioteca de produções.
5. Conferir a saúde do painel e atualizar `ULTIMO_PASSO.md` informando a versão ativa.

Não remover a tag ou a imagem V1 até a aprovação editorial da V2.
