# Estado atual do Atlas Studio no VPS

**Atualizado em:** 20/09/2026, aproximadamente 10:55 (America/Bahia)

## Acesso e Ambiente

- VPS: `ubuntu@137.131.171.144`
- Chave SSH local: `C:\Users\da338\OneDrive\Desktop\vpss\ssh-key-2026-02-13.key`
- Comando: `ssh -i "C:\Users\da338\OneDrive\Desktop\vpss\ssh-key-2026-02-13.key" ubuntu@137.131.171.144`
- Diretório no VPS: `/srv/atlas-studio`
- Repositório: `https://github.com/Dja-Cripto/atlas-server`, branch `main`, snapshot funcional `91b9505`.

## O que foi alterado e concluído nesta etapa

1. **Restauração Completa dos Dados e Banco no VPS:**
   - O arquivo parcial corrompido em `/home/ubuntu/atlas-data.tar.gz` foi removido.
   - Foram transferidos via SCP os arquivos integrais:
     - `studio.sqlite` (2.24 MB) — SHA-256 validado (`bd561f2fcb21...`).
     - `atlas-data.tar.gz` (2.26 GB) — SHA-256 validado (`c3601182b979...`).
   - Dados descompactados em `/srv/atlas-studio/data` com a chave de criptografia `.vault-key`.
   - Permissões ajustadas para UID/GID `1000:1000` em todo o diretório de dados, músicas e pastas temporárias.
   - Container `atlas-studio` iniciado com sucesso via Docker.
   - Arquivos temporários de transporte em `/home/ubuntu/` foram removidos para liberar espaço em disco.

2. **Validação do Sistema:**
   - Container `atlas-studio` ativo e com status `healthy`.
   - Resposta HTTP 200 OK em `http://127.0.0.1:4310/`.
   - Endpoint `/api/state` verificado via cURL:
     - Versão confirmada: `0.2 • Atlas Studio`.
     - 5 projetos históricos restaurados e acessíveis.
     - Todas as chaves e credenciais descriptografadas corretamente pelo `.vault-key` (`geminiKey`, `goKey`, `fishKey`, `pexelsKey`, `pixabayKey`, `youtubeKey`, Vertex configurado).
   - Coexistência confirmada: `n8n` (HTTP 200), `cloudflared`, `portal-panel`, `media-gateway`, `instagram-publisher` e `openclaw-gateway` permanecem ativos e saudáveis.
   - Espaço em disco no VPS: 8,0 GB livres (82% de ocupação).

## Erros ou limitações abertos

- Nenhum erro na execução do container ou no banco de dados.
- O container está isolado localmente no VPS (`127.0.0.1:4310`), acessível pelo host ou túnel.

## Próximo passo recomendado

- Executar um teste de produção manual no VPS via painel (ou chamada controlada de endpoint) para validar o ciclo completo (Gemini/GLM/Fish/Remotion) na arquitetura ARM64 antes de plugar as automações de publicação com n8n.
