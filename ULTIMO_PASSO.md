# Estado atual do Atlas Studio no VPS

**Atualizado em:** 20/09/2026, aproximadamente 11:20 (America/Bahia)

## Acesso e Ambiente

- VPS: `ubuntu@137.131.171.144`
- Chave SSH local: `C:\Users\da338\OneDrive\Desktop\vpss\ssh-key-2026-02-13.key`
- Atalho 1-clique criado na Área de Trabalho: `Conectar Atlas Studio VPS.cmd` (abre túnel seguro e o navegador em `http://localhost:4310`)
- Diretório no VPS: `/srv/atlas-studio`
- Repositório: `https://github.com/Dja-Cripto/atlas-server`, branch `main`.

## O que foi validado e executado

1. **Produção 100% no Servidor (ARM64 Ubuntu):**
   - Projeto de teste lançado no VPS: `The Secret of Point Nemo: Oceanic Pole of Inaccessibility` (ID `e0cdc95b-4d0e-489c-b2b0-d9a014777bdd`).
   - Ciclo do Vídeo Longo: Pesquisa Gemini/Vertex -> Roteiro -> Fish Audio TTS -> Whisper ARM64 -> Trilha sonora de suspense com ducking dinâmico -> GLM direção visual 4/4 cenas -> Renderização Remotion MP4 1080p Full HD **100% concluída com sucesso** (`video-d1170701-2cb0-4b5d-821e-9feed5e17478.mp4`, 21 MB).
   - Ciclo do Short Vertical: Extração de curiosidades -> Roteiro autônomo -> Narração Fish -> Whisper -> GLM programando cenas verticais (1080x1920) em andamento no servidor.

2. **Acesso do Usuário e Interface Visual:**
   - Criado script `Conectar Atlas Studio VPS.cmd` no Desktop do usuário para abrir a interface do Atlas Studio no navegador com 1 clique via túnel SSH criptografado.
   - Permite assistir aos vídeos prontos no player integrado, baixar os arquivos MP4 diretamente e solicitar novos vídeos manualmente fora do agendamento ("+ Novo Vídeo").

3. **Diagnóstico de Armazenamento e Capacidade:**
   - Tamanho médio por produção completa (Vídeo longo + Shorts + Áudio): ~150 MB a 200 MB.
   - Espaço disponível atual no VPS: ~6,1 GB a 8,0 GB (capacidade para ~45 a 55 produções simultâneas).
   - Identificados ~2,0 GB de arquivos de backup antigos em `/home/ubuntu` que podem ser arquivados/removidos se necessário ampliar a margem para ~65 produções.

## Erros ou limitações abertos

- Nenhum erro de execução no container `atlas-studio` ou no renderizador ARM64.
- A porta 4310 permanece protegida em `127.0.0.1:4310` (acesso exclusivo autenticado via túnel SSH).

## Próximo passo recomendado

- Acompanhar a finalização da renderização do Short 1 no VPS e, em seguida, plugar as automações de agendamento e publicação automática via n8n (YouTube/Instagram).
