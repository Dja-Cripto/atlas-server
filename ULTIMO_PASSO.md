# Estado atual do Atlas Studio no VPS

**Atualizado em:** 20/09/2026, aproximadamente 11:45 (America/Bahia)

## Acesso e Ambiente

- Domínio público oficial: `https://painel.setupdja.website` (Cloudflare Tunnel via rede `n8n-network`, alias `portal-panel` na porta 3000).
- Acesso local alternativo: `http://127.0.0.1:4310` (porta mapeada no host para scripts e túnel).
- VPS: `ubuntu@137.131.171.144`
- Diretório no VPS: `/srv/atlas-studio`
- Repositório: `https://github.com/Dja-Cripto/atlas-server`, branch `main`.

## O que foi alterado e concluído

1. **Substituição do Painel Antigo por Atlas Studio em `painel.setupdja.website`:**
   - Desativação do container legado `portal-panel`.
   - `deploy/compose.yaml` atualizado para conectar o `atlas-studio` à rede Docker `n8n-network` com o alias `portal-panel` escutando na porta 3000 interna e mapeando `127.0.0.1:4310:3000` no host.
   - Montagem segura de leitura dos segredos existentes (`/srv/robo/portal-bot/secrets/panel`).
   - Flexibilização de `Host` e `Origin` em `server.mjs` para aceitar `painel.setupdja.website`.

2. **Nova Tela Clean Editorial "Olá, Sr. Daniel":**
   - Redesenho completo da interface de boas-vindas e login no padrão minimalista do Atlas Studio (ardósia profunda, monograma "D", tipografia sóbria, badge `ATLAS STUDIO • AUTOMATION OS`).
   - Autenticação por HMAC SHA-256 (`atlas_session`) com validade de 30 dias para permanência conectada no celular e computador.
   - Proteção de rotas `/api/`, `/outputs/` e `/shorts/` contra acessos não autenticados.
   - Opção de encerramento seguro de sessão ("Sair ⎋").

3. **Correção no Motor de Renderização de Shorts:**
   - Adicionada validação estrita no AST (`lib/motion-author.mjs`) para garantir paridade exata de arrays entre `inputRange` e `outputRange` em todas as chamadas `interpolate()`.
   - Evita falhas de renderização em tempo de execução no Remotion.

## O que foi validado e resultado

- Testes de autenticação e proteção de rotas validados com sucesso (401 para requisições não autenticadas, emissão de cookie de sessão em login válido e liberação de APIs).
- Testes unitários do estúdio executados com 100% de aprovação (`node --test tests/studio.test.mjs`).
- Validação de cabeçalho `Host: painel.setupdja.website` respondendo 200 OK.

## Erros ou limitações abertos

- Nenhum erro funcional em aberto.

## Próximo passo recomendado

- Subir a atualização para o VPS, reconstruir a camada de código do container `atlas-studio`, desativar o container antigo `portal-panel` e validar o acesso em `https://painel.setupdja.website`.
