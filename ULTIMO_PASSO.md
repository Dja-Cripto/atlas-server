# Handoff da migração do Atlas Studio para o VPS

**Atualizado em:** 20/09/2026, aproximadamente 10:40 (America/Bahia)

## Acesso

- VPS: `ubuntu@137.131.171.144`
- Chave SSH local: `C:\Users\da338\OneDrive\Desktop\vpss\ssh-key-2026-02-13.key`
- Comando: `ssh -i "C:\Users\da338\OneDrive\Desktop\vpss\ssh-key-2026-02-13.key" ubuntu@137.131.171.144`
- Projeto no VPS: `/srv/atlas-studio`
- Repositório: `https://github.com/Dja-Cripto/atlas-server`, branch `main`, snapshot funcional `91b9505`.

## Estado confirmado

- A imagem ARM64 `atlas-studio:local` foi construída e validada. Chromium/Remotion renderizou uma imagem e um MP4 de teste de um segundo.
- O container `atlas-studio` está **parado intencionalmente**. Não iniciar antes de restaurar completamente banco e chave de criptografia.
- `n8n`, `cloudflared`, `portal-panel`, `media-gateway` e `instagram-publisher` estão ativos. n8n responde HTTP 200.
- O painel WhatsApp/OpenClaw está ativo via `openclaw-gateway.service` e responde HTTP 200 em `127.0.0.1:18789`.
- Os containers antigos `portal-video` e `portal-carousel` foram removidos após backup.
- Os dois workflows antigos ativos foram despublicados no n8n; dados e credenciais do n8n foram preservados.
- Disco do VPS: aproximadamente 8,3 GB livres (82% ocupado) na última verificação.
- 66/66 testes locais passaram antes da implantação.

## Backups privados locais

Todos estão ignorados pelo Git em `scratch/vps-migration-20260920/`:

- `rollback.tar.gz` — 537.050.453 bytes — SHA-256 `7560FBA36314AF06802A476D18ADCACFF429A7B29BCC77B428A8064BC477F1B7`
- `atlas-data.tar.gz` — 2.260.512.213 bytes — SHA-256 `C3601182B979893A7AB875E07F31D75495DD1E69CE6BFD6C062968886266D3D0`
- `studio.sqlite` — 2.248.704 bytes — SHA-256 `BD561F2FCB217E088464FC0EBBB12BC2044873931222F585CB6F9EA9C307AFBC`

O `rollback.tar.gz` contém o banco n8n validado com `PRAGMA integrity_check: ok`, configurações Docker e dados de recuperação. Não versionar nem expor esses arquivos.

## Ponto exato da interrupção

- A primeira extração do pacote falhou por permissões e não restaurou os dados corretamente.
- As permissões persistentes foram corrigidas e uma segunda transferência começou, mas foi interrompida a pedido do usuário.
- Existe uma cópia **parcial e inválida** de `/home/ubuntu/atlas-data.tar.gz` com cerca de 914 MB. Remover antes da nova transferência.
- `/srv/atlas-studio/Musicas` tem aproximadamente 1,1 GB copiados; `/srv/atlas-studio/data` tem apenas cerca de 72 KB e não é restauração válida; `renderer/public/auto` está vazio.
- O snapshot `studio.sqlite` completo não chegou na segunda tentativa. A fonte válida permanece no computador local.

## Retomada obrigatória

1. Manter `atlas-studio` parado e remover somente `/home/ubuntu/atlas-data.tar.gz` e `/home/ubuntu/studio.sqlite`.
2. Reenviar do Windows `atlas-data.tar.gz` e `studio.sqlite` da pasta local acima para `/home/ubuntu/` via SCP.
3. Conferir os SHA-256 no VPS contra os valores acima. Não extrair se houver divergência.
4. Executar no VPS:

```bash
docker stop atlas-studio 2>/dev/null || true
sudo tar --overwrite -xzf /home/ubuntu/atlas-data.tar.gz -C /srv/atlas-studio
sudo install -o 1000 -g 1000 -m 600 /home/ubuntu/studio.sqlite /srv/atlas-studio/data/studio.sqlite
sudo rm -f -- /srv/atlas-studio/data/studio.sqlite-shm /srv/atlas-studio/data/studio.sqlite-wal
sudo chown -R 1000:1000 /srv/atlas-studio/data /srv/atlas-studio/Musicas /srv/atlas-studio/.temp /srv/atlas-studio/renderer/public/auto /srv/atlas-studio/renderer/public/audio /srv/atlas-studio/renderer/src/generated /srv/atlas-studio/renderer/.models
docker start atlas-studio
```

5. Validar estado saudável, HTTP 200 em `127.0.0.1:4310` e presença dos projetos antes de apagar os arquivos de transporte em `/home/ubuntu`.

## Trabalho ainda pendente

- Executar uma produção manual inédita completa no VPS. Não publicar em redes sociais nesse teste.
- Corrigir o pacote dos Shorts para apontar ao MP4, não ao `voice.mp3`.
- Implementar Atlas → n8n, download privado das mídias, idempotência, tentativas, callbacks e executor real da fila. O agendamento atual apenas grava datas no banco.
- Criar workflows para YouTube, Shorts, Instagram/Facebook e TikTok, desligados até as contas serem conectadas.
- Depois do teste manual, conectar contas, fazer uma publicação privada/não listada e ativar a automação.

## Preservar

Não remover nem recriar `n8n`, `cloudflared`, `portal-panel`, `media-gateway`, `instagram-publisher`, `/home/ubuntu/.n8n`, OpenClaw ou suas credenciais. Não publicar antes da validação manual solicitada.
