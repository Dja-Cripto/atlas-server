# Estado atual do Atlas Studio no VPS

**Atualizado em:** 22/09/2026, aproximadamente 20:30 (America/Bahia)

## Acesso e ambiente

- Painel: `https://painel.setupdja.website`; VPS `ubuntu@137.131.171.144`.
- Projeto no VPS: `/srv/atlas-studio`; serviço Docker Compose `atlas`, contêiner `atlas-studio`.
- Publicação automática desligada. n8n, Cloudflare e painel do WhatsApp preservados.

## Fluxo de produção

- A produção de teste antiga `3677be46-ea60-4ea1-aee9-adab207b5235` foi removida do banco e dos diretórios específicos no VPS.
- A validação das cenas do vídeo principal retoma da última cena confirmada sem reprogramar o lote inteiro.
- Shorts só são liberados após MP4 principal 1080p validado por ffprobe, capa, título e descrição. A produção para para revisão na aba Final & Publicação.
- Cada acionamento gera no máximo um Short, valida o MP4 vertical por ffprobe e volta para revisão; os cinco só são marcados concluídos após todos os MP4s.
- Nova produção tem um campo curto e opcional de direção editorial (até 400 caracteres), salvo na produção e usado na pesquisa e no roteiro. O Banco de Pautas já possui um campo de descrição; o fluxo da fila não foi alterado nesta revisão.

## Produção em andamento

- Produção `54204f15-86ce-4fd5-8de6-b4d43c671a7a` (“Why Europe and Africa Still Have No Fixed Link”) preserva pesquisa, roteiro e mídias. Parou em `motion-code` quando o GLM devolveu direção global fora do formato esperado, mas foi retomada após a correção.
- A direção global agora usa uma amostra de no máximo 12 cenas, completa as demais instruções localmente e usa uma direção segura quando o provedor falha. Nesta produção, as falhas já registradas evitam uma nova chamada global demorada.

- As 104 cenas foram validadas. O erro `tempBundleDir is not defined` ocultava a causa real: o Remotion exige que o arquivo de saída H.264/AAC termine em `.mp4`; o temporário terminava em `.partial`. Vídeo principal e Shorts agora usam `.partial.mp4` e só renomeiam após validar o arquivo. A retomada reutiliza a validação integral do mesmo run. A produção foi retomada no VPS em 22/09 às 20:17 (Bahia) e está renderizando quadros do vídeo principal; ainda não há MP4 final.

## Validação e próximo passo

- Sintaxe verificada e `npm test`: 77/77 testes aprovados. O teste de API cobre gravação e limite da direção editorial.
- Revisão anterior `854366e` instalada e saudável no VPS; painel HTTP 200. Teste sintético confirmou um Short por chamada e bloqueio sem pacote principal.
- Revisões `f23c8ac`, `0f7a229` e `ee73e17` instaladas no VPS; contêiner saudável. O job retomou sem reprogramar ou revalidar as 104 cenas. O Chromium está ativo e quadros JPEG temporários estão sendo criados, mas o painel ainda marca 0% e o MP4 não foi concluído. Próximo passo: acompanhar o render até obter MP4 verificável por ffprobe e disponível em Final & Publicação; se os quadros pararem de avançar, diagnosticar a cena e corrigir o gerador antes de outra produção. Falhas externas devem bloquear o avanço preservando o progresso.
