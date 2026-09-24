# Atlas Studio — Visual V2
**Atualizado em:** 24/09/2026, aproximadamente 18:45 (America/Bahia).

## Checkpoint e versão
- V1 estável: tag `atlas-visual-v1-checkpoint-2026-09-24`, commit `78b60db`, enviada ao GitHub.
- Imagem V1 preservada no VPS: `atlas-studio:visual-v1-checkpoint-2026-09-24`.
- V2: branch `codex/atlas-visual-v2`. Procedimento de reversão em `CHECKPOINTS.md`.
- Neste registro, V2 validada localmente; implantação no VPS é o próximo passo. Painel: https://painel.setupdja.website; código do servidor: /srv/atlas-studio.

## Alterações
- Mesma preparação geográfica para vídeos longos, Shorts e recuperação de mídia. Mapas adaptam o enquadramento a 16:9 e 9:16; ligação apenas com origem/destino explícitos e citação disponível. Ligações são identificadas como esquemáticas.
- Mapas consecutivos e efeitos consecutivos permitidos quando avançam a explicação.
- Regra do Daniel: vídeo descritivo pode ficar limpo; fotografia sempre precisa de movimento/efeito; números, datas, idade, dimensões ou fatos explicativos narrados recebem animação relevante. Sem cotas que removam explicações necessárias.
- Recuperação tenta corrigir somente a cena defeituosa; alternativas científicas dependem do mecanismo explícito da narração. Água fria não aciona diagrama de ferro.
- Validação de início/meio/fim com navegador compartilhado; pendências visuais e alternativas registradas. Pausas em vídeo não são bloqueadas por detector de congelamento.
- Preparação de trechos curtos com cache compartilhado, duração conferida, correção do reaproveitamento de seleção; tempos por etapa registrados.
- Timeout de programação ajustável por ATLAS_MOTION_TIMEOUT_MS (padrão 240 s; 60–420 s). Tentativas e continuidade preservadas.

## Validação e limites
- 96 testes locais aprovados; TypeScript aprovado.
- Integração real dos dois geradores: 18 quadros e dois MP4s técnicos curtos, com render a 50% de escala; mapas conferidos horizontal/vertical. Conversão de trecho Full HD testada com FFmpeg.
- Sem chamadas pagas de geração; sem reescrever produções antigas.
- Aprovação editorial de uma nova produção completa e medição de tempo real no VPS continuam pendentes. Países e ligações esquemáticas não representam rotas locais medidas.
- Diagramas desconhecidos sem reparo válido podem continuar pendentes para evitar explicações inventadas.
- Publicação automática deve permanecer desabilitada.

## Próximo passo
Implantar V2, conferir saúde do painel e então avaliar uma nova produção pelo painel. Se necessário, restaurar V1 conforme CHECKPOINTS.md, preservando dados e credenciais.
