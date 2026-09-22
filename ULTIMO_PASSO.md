# Estado atual do Atlas Studio no VPS

**Atualizado em:** 22/09/2026, aproximadamente 14:50 (America/Bahia)

## Acesso e ambiente

- Painel: `https://painel.setupdja.website` — VPS `ubuntu@137.131.171.144`.
- Projeto no VPS: `/srv/atlas-studio`, branch `main`.
- Produção em recuperação: `3677be46-ea60-4ea1-aee9-adab207b5235` (“Why Switzerland Built Underground Bunkers for 100% of Its Population”).
- Publicação automática permanece desligada.

## Estado confirmado

- O banco dizia que o vídeo principal e cinco Shorts estavam concluídos, mas não havia nenhum MP4 no disco; existiam apenas áudios, manifestos e código de cenas.
- A renderização do vídeo principal falhou em 25% com `(0, react.useCurrentFrame) is not a function`.
- Pesquisa, roteiro, narração, mídias e 156 cenas do vídeo principal foram preservados.

## Correções implementadas

- A pré-validação passou de uma amostra de 30 para todas as cenas do vídeo principal.
- Falha de validação agora bloqueia o render; não é mais convertida em aviso de sucesso.
- Código de cena que importa `useCurrentFrame` do React é rejeitado e reparado antes do render.
- Vídeo principal e Shorts são renderizados em arquivo `.partial`; o nome final e o estado “concluído” só são gravados após tamanho mínimo de integridade.
- Shorts exigem que o MP4 principal exista e esteja íntegro.
- Cada Short só é marcado concluído depois do próprio MP4 íntegro; erros interrompem a sequência.
- Corrigido o uso de `stat()` sem importação no módulo de Shorts.
- A interface não chama prévia Remotion de “pronto para assistir” e não conta Shorts sem MP4.
- O botão de render manual processa apenas o vídeo principal, sem disparar Shorts antigos fora da ordem.

## Validação

- `node --check` aprovado em `lib/automatic.mjs`, `lib/shorts.mjs` e `server.mjs`.
- `npm test`: **73 de 73 testes aprovados**.
- Teste novo confirma rejeição de `useCurrentFrame` importado do React.

## Correção adicional do ciclo de reprogramação

- Diagnosticado que uma falha na validação chamava novamente o GLM para o conjunto de 156 cenas.
- A retomada agora reutiliza o `index.tsx` existente e nunca chama programação em lote dentro do ciclo de validação.
- Somente a cena identificada como inválida é substituída por composição segura; depois a validação prossegue.
- Processo repetitivo interrompido sem apagar materiais. Suíte atual: **73 de 73 testes aprovados**.

## Limitação aberta e próximo passo

- Revisão `dd8804f` instalada no VPS; contêiner saudável e produção retomada em segundo plano. Confirmado nos eventos: “Código visual existente reutilizado; nenhuma cena será reprogramada em lote”. Estado observado: `running`, etapa `preview-validation`.
- A renderização 1080p de 15 minutos pode levar várias horas no VPS. Acompanhar até o MP4 principal aparecer no painel; só então o robô poderá iniciar o Short 1.
