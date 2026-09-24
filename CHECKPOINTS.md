# Versões do Atlas Studio

## Atlas Visual V1 — checkpoint estável

- Criado em 24/09/2026, antes das melhorias de mapas e animações.
- Tag Git imutável: `atlas-visual-v1-checkpoint-2026-09-24`.
- Commit: `78b60db` (baseline com 90 testes locais aprovados).
- Checkpoint enviado ao GitHub: `Dja-Cripto/atlas-server`.
- Código do VPS conferido no mesmo commit, sem alterações locais.

## Atlas Visual V2 — liberdade visual

- Desenvolvimento na branch `codex/atlas-visual-v2`.
- Preservar liberdade de composição, vídeos descritivos limpos e pausas intencionais; fotografias sempre animadas. Não exigir efeitos em todas as cenas.
- Correções devem valer para novas produções; não reescrever projetos ou renders antigos.
- Consulte `ULTIMO_PASSO.md` para validação e estado da implantação.

## Como retornar à V1

1. Não interromper uma produção em execução. Guardar o estado atual em commit/branch antes de trocar de versão.
2. Buscar as tags e selecionar `atlas-visual-v1-checkpoint-2026-09-24` no código local ou em `/srv/atlas-studio` no VPS. Não usar `git reset --hard` nem apagar dados para reverter.
3. No VPS, recriar somente o serviço `atlas` com o código da V1 e sua imagem preservada `atlas-studio:visual-v1-checkpoint-2026-09-24` (ou reconstruir a imagem a partir da tag). Os mounts de `lib`, `public`, `scripts` e `server.mjs` exigem restaurar o checkout também, não somente a imagem.
4. Preservar banco, credenciais, músicas, modelos, mídia, código gerado e vídeos. A reversão é do gerador; não da biblioteca de produções.
5. Conferir a saúde do painel e atualizar `ULTIMO_PASSO.md` informando a versão ativa.

Não remover a tag ou a imagem V1 até a aprovação editorial da V2.
