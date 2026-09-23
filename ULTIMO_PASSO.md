# Estado atual do Atlas Studio no VPS

**Atualizado em:** 23/09/2026, aproximadamente 16:25 (America/Bahia)

## Acesso e ambiente

- Painel: `https://painel.setupdja.website`; VPS: `ubuntu@137.131.171.144`.
- Código no VPS: `/srv/atlas-studio`; serviço Docker Compose `atlas`, contêiner `atlas-studio`.
- Dados persistentes do Atlas: `/srv/robo/portal-bot/data/atlas-storage`.
- n8n, Cloudflare e painel do WhatsApp preservados. O teste atual não cria Shorts nem publica conteúdo.

## Estado da produção

- A produção longa `54204f15-86ce-4fd5-8de6-b4d43c671a7a` foi interrompida e excluída, incluindo registro, mídias, código gerado e temporários exclusivos. Nenhum outro projeto foi removido.
- Teste curto `25e8f356-46c1-490e-836b-d4315b19c609` (“Why the Dead Sea Is So Salty”): narração de 34,3 s, cinco cenas, sem Shorts. Cenas e mídias foram preservadas para diagnóstico.
- O primeiro render do teste foi interrompido após 21/1.030 quadros por lentidão (cerca de 0,1 quadro/s). Ele foi reiniciado com a correção de mapa e segue em renderização; o MP4 final ainda não foi validado.

## Correção e validação

- O `ContextMap` agora usa uma base cartográfica de fundo Natural Earth 1:50m (~3 MB), carregada automaticamente quando necessário, em vez de desenhar a base mundial 1:10m (~13 MB). Só as fronteiras próximas ao assunto são desenhadas no fundo. Os contornos destacados continuam usando os dados detalhados 1:10m; resolução final permanece 1080p.
- Benchmark no mesmo intervalo de oito quadros do mapa: 95 s original, 52 s após limitar a região, 16,5 s com a base de fundo 1:50m. Cenas de vídeo e foto no mesmo benchmark levaram 9,5 s e 13,7 s. Retirar o desfoque da foto produziu ganho pequeno e foi revertido para preservar o visual.
- O painel permite duração de 0,5 minuto para testes. Script `scripts/benchmark_scene_windows.mjs` mede janelas de cenas reais sem renderizar o vídeo inteiro.
- `npm test`: 77/77 aprovados. `eslint src/ContextMap.tsx`: aprovado. O lint geral do renderizador ainda aponta 154 erros preexistentes, principalmente em cenas geradas antigas.

## Limites e próximo passo

- A previsão do render de 30 segundos caiu de cerca de quatro horas para aproximadamente meia hora após a correção; é uma previsão dinâmica, não o tempo final medido. Monitorar até gerar e validar o MP4 antes de extrapolar para vídeos longos.
- Não iniciar Shorts ou outra produção longa neste teste. Depois do MP4, conferir visual do mapa, duração, reprodução e tempo total; só então decidir se a velocidade atende à meta de até oito horas para o vídeo principal.