# Atlas Studio — Otimização de Teste e Extração de Capa sem Custo de IA
**Atualizado em:** 25/09/2026, aproximadamente 15:40 (America/Bahia).

## Versões
- V1 funcional: tag `atlas-visual-v1-checkpoint-2026-09-24`, commit `78b60db`; imagem `atlas-studio:visual-v1-checkpoint-2026-09-24` preservada no VPS.
- V2: branch `codex/atlas-visual-v2`. Procedimento de reversão em `CHECKPOINTS.md`.

## Alterações
- **Economia de créditos na geração de capas**:
  - Em `lib/automatic.mjs`, adicionado suporte a `j.skipThumbnail` e variável `ATLAS_SKIP_THUMBNAIL`.
  - Quando habilitado, o robô extrai um quadro Full HD diretamente do próprio MP4 renderizado através do FFmpeg (`-vframes 1 -q:v 2`), cumprindo todas as validações de tamanho de capa do pacote principal em 0.2s sem realizar nenhuma chamada paga à API de geração de imagens por IA (Imagen).
- **Ajuste no script de testes rápidos**:
  - `scripts/run_production_test.mjs` configurado com `skipThumbnail: true` por padrão para testes do usuário e opção de gerar exclusivamente o vídeo principal de 1 minuto sem disparar Shorts adicionais.
- **Mantidas todas as melhorias documentais V2**:
  - Mínimo de 80% de mídia real/vídeo no roteiro; teto rígido de no máximo 1 mapa para vídeos curtos sem mapas consecutivos; diagramas sobrepostos a filmagens; proibição de textos/países não pronunciados no áudio.

## Validação e próximo passo
- 105/105 testes automatizados aprovados no Node.js (`npm test`).
- Atualizar VPS (`/srv/atlas-studio`) e iniciar a execução da nova produção de teste sobre o tema selecionado: *"The Coldest Inhabited Place on Earth: Oymyakon"* (~55s, 1 minuto).