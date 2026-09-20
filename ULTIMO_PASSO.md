# Estado atual do Atlas Studio no VPS

**Atualizado em:** 20/09/2026, aproximadamente 18:30 (America/Bahia)

## Acesso e ambiente

- Painel: `https://painel.setupdja.website` — HTTP 200 e contêiner `atlas-studio` saudável.
- n8n: `https://n8n.setupdja.website` — HTTP 200.
- VPS: `ubuntu@137.131.171.144`.
- Projeto no VPS: `/srv/atlas-studio`, branch `main`.
- Armazenamento pesado: montado e validado em `/srv/robo/portal-bot/data/atlas-storage` (85 GB livres) para `data`, `.temp` e `auto`.

## O que foi alterado e verificado

1. **Restauração e integridade do Banco de Dados no Armazenamento de 85 GB:**
   - Detectada divergência na partição de volume: `/srv/robo/portal-bot/data/atlas-storage/data` continha um banco vazio e uma `.vault-key` recém-gerada, enquanto o banco com as 6 produções anteriores e todas as chaves de API configuradas residia em `/srv/atlas-studio/data`.
   - Realizado backup preventivo e sincronizados com segurança o `studio.sqlite` e a `.vault-key` original para `/srv/robo/portal-bot/data/atlas-storage/data/`.
   - Ajustadas permissões (`opc:opc`, 600 na chave e 644 no banco) e reiniciado o container `atlas-studio`.
   - Validada a rota interna `/api/state`: retorno 200 OK com todas as 6 produções ativas e todas as chaves de API operacionais (`geminiKey`, `fishKey`, `pexelsKey`, `pixabayKey`, `youtubeKey`).

2. **Verificação do fluxo N8N e Publicação:**
   - Workflow `CXeQ7kICnWCazhzy` confirmado como **Ativo**.
   - Execução recente 53417 no n8n inspecionada e concluída com **sucesso**: upload privado no canal **Atlas Unbound** do YouTube confirmado (Vídeo ID: `-MKQrlXN0YU`).
   - Publicação na Página do Facebook confirmada com Vídeo ID: `1416847957077810`.

3. **Banco de Pautas e Agendamento:**
   - Banco de pautas com 1 tema pronto e pendente na fila: *"2. A ferrovia mais isolada do mundo no deserto da Mauritânia"* (15 minutos + 5 Shorts).
   - Trava de publicação segura: `publishingEnabled` está confirmada como `false` (os vídeos serão produzidos normalmente, mas só serão disparados para YouTube/Facebook quando Daniel ligar a chave no painel de Agendamento).

## O que foi validado e resultado

- Suíte de testes automatizados (`npm test`): **70 testes aprovados, zero falhas**.
- Painel Web (`https://painel.setupdja.website`): HTTP 200 OK.
- API `/api/state`: HTTP 200 OK, 6 jobs carregados, 6 credenciais ativas.
- n8n (`http://127.0.0.1:5678`): HTTP 200 OK, workflow ativo.
- Armazenamento: montado e gravando na partição de 85 GB.

## Erros ou limitações abertos

- Nenhum erro de runtime. A publicação automática nas redes permanece desabilitada por design como trava de segurança até que você clique em **Ligar publicação** na tela de Agendamento.

## Próximo passo recomendado

- Produzir a próxima pauta da fila ("A ferrovia mais isolada do mundo na Mauritânia") ou revisar as produções no painel e, quando desejar que entrem no fluxo de postagem, clicar em **Ligar publicação** no Agendamento.
