# Estado atual do Atlas Studio no VPS

**Atualizado em:** 21/09/2026, aproximadamente 20:07 (America/Bahia)

## Acesso e ambiente

- Painel: `https://painel.setupdja.website` — VPS `ubuntu@137.131.171.144`.
- Projeto no VPS: `/srv/atlas-studio`, branch `main`.
- Armazenamento de alta capacidade: `/srv/robo/portal-bot/data/atlas-storage` (67 GB livres).
- Espaço em disco raiz `/`: 14.2 GB livres (recuperado após limpeza).

## O que foi alterado e implementado

1. **Resolução Definitiva do Erro `ENOSPC: no space left on device`:**
   - Diagnosticada a causa-raiz: o diretório de componentes gerados (`/app/renderer/src/generated`) e a pasta temporária de perfis do Chromium/Puppeteer (`/tmp`) gravavam na partição raiz de 45 GB (`/dev/sda1`), que atingiu 100% de uso.
   - Realizada a limpeza de 13.8 GB de temporários antigos no contêiner, restaurando 14.2 GB livres no disco raiz.
   - Migrados com 100% de integridade todos os 156 componentes TSX de cenas, visual bibles e Shorts 0, 1 e 2 para a partição dedicada de 67 GB em `/srv/robo/portal-bot/data/atlas-storage/generated`.
   - Atualizado `deploy/compose.yaml` para mapear tanto `/app/renderer/src/generated` quanto `/tmp` diretamente para o disco de armazenamento de 67 GB (`/srv/robo/portal-bot/data/atlas-storage/generated` e `/srv/robo/portal-bot/data/atlas-storage/tmp`).

2. **Gerenciamento e Descarte de Bundles Temporários do Remotion:**
   - Adicionado `outDir` dedicado com remoção garantida em bloco `finally` nas validações de prévias em `lib/shorts.mjs` e `lib/automatic.mjs`, impedindo o acúmulo de artefatos de build do Webpack em disco.

3. **Recuperação Automática de Shorts em Disco:**
   - Implementada verificação em `lib/shorts.mjs` para restaurar e validar do disco Shorts que já tiveram roteiro, áudio e código gerados em execuções anteriores, evitando retrabalho.

## Validação e Resultados

- Suíte de testes automatizados (`npm test`): **71 de 71 testes aprovados com sucesso (100%)**.
- Integridade de todos os 465 arquivos da produção da Suíça (`c1118afe-1b7a-49fb-bf87-15b3cb1fe9e0`) confirmada no novo diretório de armazenamento persistente.

## Próximo passo recomendado

- Subir as alterações no VPS, inicializar o contêiner `atlas-studio` com os novos volumes montados e executar a retomada do job `3677be46-ea60-4ea1-aee9-adab207b5235` até a entrega dos arquivos MP4.
