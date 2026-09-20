# Estado atual do Atlas Studio

**Atualizado em:** 20/09/2026, aproximadamente 10:00

## O que foi alterado

- O VPS ARM64 recebeu a imagem isolada `atlas-studio:local` e o container `atlas-studio`, limitado a 2 CPUs, 8 GB de memória e duas renderizações concorrentes.
- O Atlas escuta somente em `127.0.0.1:4310`; o acesso previsto é por túnel SSH enquanto o painel não possui autenticação remota.
- O gerador agora aceita `ATLAS_BROWSER_EXECUTABLE` e `ATLAS_RENDER_CONCURRENCY`, permitindo usar o Chromium ARM64 do container sem alterar o comportamento local.
- Foram adicionados Dockerfile, Compose, limites de logs e instruções de operação em `deploy/`.
- O cache de build, snapshots e imagens antigas do Docker foram limpos. Os containers aposentados `portal-video` e `portal-carousel` foram removidos após backup.
- Os dois workflows ativos do projeto antigo foram despublicados no n8n. O n8n e seus dados foram mantidos.
- Cloudflare, `portal-panel`, `media-gateway`, `instagram-publisher` e o painel do WhatsApp/OpenClaw foram preservados.
- Existe um backup privado e ignorado pelo Git em `scratch/vps-migration-20260920/rollback.tar.gz`, com banco n8n íntegro e configurações anteriores.

## O que foi validado

- 66/66 testes automatizados locais aprovados.
- O container Atlas está saudável e o painel responde HTTP 200 no VPS.
- Remotion com Chromium nativo ARM64 gerou uma imagem e um MP4 de teste de um segundo sem consumir APIs externas.
- n8n e painel do WhatsApp/OpenClaw respondem HTTP 200 depois da limpeza; o serviço OpenClaw está ativo.
- O disco do VPS passou de 100% ocupado para aproximadamente 80%, com cerca de 8,9 GB livres após remover os geradores antigos.
- O backup do n8n retornou `PRAGMA integrity_check: ok` e seu SHA-256 foi conferido após a cópia local.

## Erros ou limitações abertos

- O container no VPS ainda está com banco vazio: o pacote local de aproximadamente 2,2 GB contém banco, chaves criptografadas e mídias privadas, e sua transferência exige autorização explícita do usuário pela revisão automática.
- O domínio do Cloudflare ainda não aponta para o Atlas. O painel permanece acessível com segurança por túnel SSH.
- `portal-panel` e `media-gateway` continuam ativos para não interromper rotas antigas ainda preservadas.

## Próximo passo recomendado

- Com autorização explícita, transferir `atlas-data.tar.gz` e o snapshot consistente `studio.sqlite` para `/srv/atlas-studio`, ajustar a propriedade para UID/GID 1000, reiniciar o Atlas e validar que projetos, integrações e mídias foram restaurados.
