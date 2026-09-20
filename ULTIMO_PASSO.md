# Estado atual do Atlas Studio no VPS

**Atualizado em:** 20/09/2026, aproximadamente 13:30 (America/Bahia)

## Acesso e Ambiente

- Domínio público oficial ativo: `https://painel.setupdja.website` (Cloudflare Tunnel roteado para `portal-panel:3000` na rede `n8n-network`).
- Acesso local no host VPS: `http://127.0.0.1:4310`
- VPS: `ubuntu@137.131.171.144`
- Diretório no VPS: `/srv/atlas-studio`
- Repositório: `https://github.com/Dja-Cripto/atlas-server`, branch `main`.
- Armazenamento pesado: montado na partição `/srv/robo/portal-bot/data/atlas-storage` (85 GB livres) para `data`, `.temp` e `auto`.

## O que foi alterado e concluído

1. **Padronização Visual do Ícone do Banco de Pautas:**
   - Removido o emoji colorido `📋` que distorcia a fonte e o alinhamento no menu lateral.
   - Adotado o glifo geométrico monocromático `▥` (U+25E5), pertencente à mesma família tipográfica dos outros botões (`◫` Hub Central, `▤` Produções, `▧` Biblioteca, `▦` Agendamento), preservando a estética clean editorial e a cor dinâmica de seleção.

2. **Abas e Filtros no Banco de Pautas (A Fazer vs Já Feitos):**
   - Criada barra de navegação por abas:
     - **⏳ A Fazer (Na Fila):** exibe apenas os temas pendentes que o robô produzirá à meia-noite (com botão direto `▶ Produzir Agora` para cada tema).
     - **✓ Já Produzidos:** exibe os temas já finalizados com data e botão de acesso direto `🎬 Abrir Vídeo ↗` para assistir ao resultado.
     - **💡 Pulados:** exibe os temas redundantes com o conselho personalizado do robô para reformular o ângulo.
     - **Todas:** visão completa do histórico.

3. **Validação da Comunicação Atlas Studio ↔ N8N:**
   - Workflow `Atlas Studio - Publicação Multiplataforma` publicado e ativado no container `n8n`.
   - Webhook `http://n8n:5678/webhook/atlas-publish-video` testado com sucesso direto da rede interna do Docker (HTTP 200: "Workflow was started").

## O que foi validado e resultado

- Verificação de sintaxe de todos os arquivos JS (`node --check public/app.js`, `node --check server.mjs`, `node --check lib/topics.mjs`): aprovada com 0 erros.
- Comunicação do webhook N8N testada com payload real e respondendo 200 OK.
- Ícone `▥` testado em harmonia geométrica no menu lateral.
- Alternância entre abas "A Fazer" e "Já Produzidos" implementada no frontend.

## Erros ou limitações abertos

- Canais de redes sociais no workflow N8N estão com os nós de envio desativados por design, aguardando Daniel preencher as credenciais de API do YouTube, Facebook e TikTok.

## Próximo passo recomendado

- Subir as alterações no repositório GitHub (`main`), fazer o deploy no VPS `/srv/atlas-studio` e reiniciar o container para Daniel testar.
