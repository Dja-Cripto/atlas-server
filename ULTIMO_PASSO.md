# Estado atual do Atlas Studio no VPS

**Atualizado em:** 20/09/2026, aproximadamente 11:50 (America/Bahia)

## Acesso e Ambiente

- Domínio público oficial ativo: `https://painel.setupdja.website` (Cloudflare Tunnel roteado para `portal-panel:3000` na rede `n8n-network`, atendido pelo Atlas Studio).
- Acesso local no host: `http://127.0.0.1:4310` (porta mapeada no host VPS).
- VPS: `ubuntu@137.131.171.144`
- Diretório no VPS: `/srv/atlas-studio`
- Repositório: `https://github.com/Dja-Cripto/atlas-server`, branch `main`.

## O que foi alterado e concluído

1. **Substituição Concluída do Painel Antigo por Atlas Studio:**
   - Container legado `portal-panel` completamente desativado e removido.
   - `atlas-studio` integrado à rede Docker `n8n-network` com alias `portal-panel` na porta 3000 interna e mapeamento `127.0.0.1:4310:3000` no host.
   - Segredos de autenticação existentes (`/srv/robo/portal-bot/secrets/panel`) montados e permissões corrigidas para leitura do usuário `node`.
   - `server.mjs` atualizado com permissão de `Host` e `Origin` para `painel.setupdja.website`.

2. **Nova Tela Clean Editorial "Olá, Sr. Daniel":**
   - Redesenho completo da interface de boas-vindas e login no padrão minimalista/editorial do Atlas Studio (ardósia profunda, monograma "D", tipografia sóbria, badge `ATLAS STUDIO • AUTOMATION OS`).
   - Autenticação por HMAC SHA-256 (`atlas_session`) com validade de 30 dias para manter conectado no celular e computador.
   - Proteção de rotas `/api/`, `/outputs/` e `/shorts/` contra acessos não autenticados.
   - Opção de encerramento seguro de sessão ("Sair ⎋").

3. **Correção e Resiliência no Motor de Shorts:**
   - Validação no AST de `interpolate()` para paridade entre `inputRange` e `outputRange`.
   - Auto-recuperação em `lib/shorts.mjs` com `generateFallbackSceneCode(scene, true)` caso qualquer cena apresente erro de execução no `renderStill`, prevenindo quebras no renderizador MP4.

## O que foi validado e resultado

- Resposta HTTP 200 OK confirmada em `https://painel.setupdja.website/` via internet pública.
- HTML renderizando a nova tela clean **"Olá, Sr. Daniel"**.
- Endpoint `/api/auth/me` respondendo `authRequired: true` para requisições externas sem autenticação.
- Login verificado com 100% de sucesso usando a senha existente salva no servidor (`AUTH RESULT: 200`, emissão de cookie `atlas_session` e liberação para o painel).
- Container `atlas-studio` ativo e com status `healthy`.

## Erros ou limitações abertos

- Nenhum. O sistema está estável, seguro e acessível publicamente com o novo visual solicitado.

## Próximo passo recomendado

- Avançar para a integração de publicação direta no YouTube e Instagram através do n8n que já roda no mesmo servidor.
