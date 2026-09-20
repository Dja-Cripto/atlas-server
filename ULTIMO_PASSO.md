# Estado atual do Atlas Studio no VPS

**Atualizado em:** 20/09/2026, aproximadamente 13:10 (America/Bahia)

## Acesso e Ambiente

- Domínio público oficial ativo: `https://painel.setupdja.website` (Cloudflare Tunnel roteado para `portal-panel:3000` na rede `n8n-network`).
- Acesso local no host VPS: `http://127.0.0.1:4310`
- VPS: `ubuntu@137.131.171.144`
- Diretório no VPS: `/srv/atlas-studio`
- Repositório: `https://github.com/Dja-Cripto/atlas-server`, branch `main`.
- Armazenamento pesado: montado na partição `/srv/robo/portal-bot/data/atlas-storage` (85 GB livres) para `data`, `.temp` e `auto`.

## O que foi alterado e concluído

1. **Hub Central do Daniel (`/`):**
   - Painel de controle integrado com resumo do dia (vídeo principal e status dos 5 Shorts verticais).
   - Indicadores de canais de publicação (YouTube, Facebook, TikTok) integrados ao N8N.
   - Central de avisos editoriais e conselhos do robô para Daniel.

2. **Banco de Pautas & Fila Automática 24/7 (`/topics`):**
   - Módulo `lib/topics.mjs` com persistência em `data/topics.json`.
   - Cadastro individual ou em lote (colar lista de temas).
   - Agendador noturno autônomo rodando diariamente à 00:00 (America/Bahia).

3. **Mecanismo Anti-Duplicidade com Auto-Skip:**
   - O robô avalia novas pautas contra todo o histórico do canal via Gemini / heurística (>65% similaridade).
   - Se duplicado: emite um conselho personalizado com soluções para Daniel (*"Daniel, o tema está repetido... Aconselho você a..."*) e **pula automaticamente para o próximo tema da fila**, garantindo que o canal nunca fique sem vídeo.

4. **Workflow Multiplataforma N8N (`deploy/n8n-atlas-publisher.json`):**
   - Webhook `atlas-publish-video` recebendo título, descrição, tags, URL do vídeo longo e dos 5 Shorts.
   - Roteador e nós para YouTube, Facebook e TikTok prontos com linhas desativadas, aguardando Daniel inserir as credenciais.

5. **Armazenamento e Limpeza Automática:**
   - `deploy/compose.yaml` atualizado para usar o volume de 85 GB.
   - Limpeza automática de arquivos intermediários do `.temp` após cada renderização em MP4.

## O que foi validado e resultado

- Verificação de sintaxe de todos os arquivos JS (`node --check public/app.js`, `node --check server.mjs`, `node --check lib/topics.mjs`): aprovada com 0 erros.
- Rotas de API `/api/hub`, `/api/topics`, `/api/topics/run-next` e `/api/hub/alerts/:id/dismiss` implementadas.
- Modal de temas com abas "Tema Único" e "Colar em Lote" testado e integrado aos eventos.

## Erros ou limitações abertos

- Canais de redes sociais no workflow N8N estão com as conexões desativadas até Daniel preencher as credenciais de API do YouTube, Facebook e TikTok.

## Próximo passo recomendado

- Subir as alterações no repositório GitHub (`main`), fazer o deploy no VPS `/srv/atlas-studio` e importar o workflow no N8N.
