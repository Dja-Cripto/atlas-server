# Atlas Studio no VPS

O Atlas roda no container `atlas-studio`, escutando apenas em `127.0.0.1:4310` do VPS. Isso mantém o painel fora da internet enquanto ele não possui autenticação remota.

Para acessar a partir do Windows, abra um túnel SSH:

```powershell
ssh -i "C:\Users\da338\OneDrive\Desktop\vpss\ssh-key-2026-02-13.key" -L 4310:127.0.0.1:4310 ubuntu@137.131.171.144
```

Enquanto essa janela permanecer aberta, acesse `http://127.0.0.1:4310` no navegador.

O painel do WhatsApp (OpenClaw) continua local no VPS, na porta `18789`. Ele pode ser incluído no mesmo túnel adicionando `-L 18789:127.0.0.1:18789` e acessado em `http://127.0.0.1:18789`.

## Operação

No VPS, a instalação fica em `/srv/atlas-studio`:

```bash
cd /srv/atlas-studio
docker compose -f deploy/compose.yaml ps
docker compose -f deploy/compose.yaml logs --tail=100 atlas
docker compose -f deploy/compose.yaml restart atlas
```

Os diretórios persistentes ficam fora da imagem: `data`, `Musicas`, `.temp`, `renderer/public/auto`, `renderer/public/audio`, `renderer/src/generated` e `renderer/.models`.

Antes de iniciar o container após restaurar dados, esses diretórios precisam pertencer ao UID/GID `1000:1000`, usado pelo usuário restrito da imagem.
