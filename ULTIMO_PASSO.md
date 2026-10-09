# Atlas Studio — continuidade

Atualizado em 09/10/2026, aproximadamente 20h20 (America/Bahia).

## Estado e causa do bloqueio
- Produção 780dd40b-3288-4f88-b5be-7504b22a0abc, "What Could Change Before 2050?", interrompida em 06/10 por HTTP429 durante programação do quinto Short. Trabalho e cenas salvas preservados. Não está concluída nem publicada.
- Registro parcial do Luna:158 chamadas,3.813.409 tokens de entrada e592.662 de saída. Não inclui todo o consumo visual e não permite atribuir a franquia mensal inteira ao Atlas. Prompts por cena repetiam a linha do tempo inteira e todas as diretivas, com entradas próximas de44mil tokens em várias chamadas.
- As outras três pautas (Nova York, Fehmarnbelt, Etiópia) ficaram inconclusivas por429 do planejador, antes das buscas; não significa falta de acervo. Não apagar nem aprovar à força.

## Rebalanceamento implementado
- Código visual do principal e Shorts recebe direção global compacta, diretiva da cena atual e cenas vizinhas, eliminando reenvio da linha do tempo inteira por cena. Diretor global mantém visão geral. Modelos atuais preservados: não há evidência de custo/qualidade para troca adicional neste trabalho.
- Revisão visual OpenCode agora persiste avaliações válidas em data/visual-review-cache. Reaproveita somente mesma mídia, contexto e modelo; alteração de imagem/quadros/contexto exige nova revisão. Falhas não são cacheadas como reprovação. Não há fallback para revisão Gemini.
- Todas as chamadas HTTP OpenCode passam por controle persistente em data/opencode-control/usage.json: teto conservador de80 chamadas textuais e120 visuais por dia UTC, com reserva antes do envio;429 bloqueia novas chamadas por pelo menos24h (ou Retry-After maior). Arquivo ilegível bloqueia consumo. São limites de chamadas, não orçamento financeiro nem garantia de duração mensal.
- Limite interrompe direção/programação imediatamente, sem tentar outros modelos ou gerar contingência para contornar franquia esgotada. Etapas prontas permanecem salvas.
- À meia-noite, fila verifica pausa antes de novas pesquisas e prioriza retomar a MESMA produção automática cujo erro identifique limite OpenCode; trava/renovação de lease impede concorrência. Outros erros e produções rejeitadas não são retomados por esta regra. Não recupera disparo perdido durante a tarde.
- Produção2050 terá erro antigo classificado explicitamente como limite OpenCode, mantendo mensagem original e backup do registro. Pausa inicial conservadora de24h a partir da implantação porque usuário informou franquia esgotada; não prova que o saldo retorna nesse prazo. Nova429 renova pausa. Não prometido reset na segunda-feira.

## Validação
-208 testes locais passaram, inclusive cache persistente após limpar memória, invalidação por mídia alterada, bloqueio persistente429, teto diário e retomada do mesmo projeto antes de outra pauta. Sem chamadas pagas nesta execução. Sintaxe/diff conferidos.
- Implantação: enviar commit desta alteração ao GitHub e avançar /srv/atlas-studio somente com worker livre; reiniciar apenas atlas-studio. Não incorporar scripts avulsos não versionados no VPS. Confirmar saúde/configuração após ativação.

## Regras preservadas
- Fila automática habilitada para00:00 America/Bahia, produções10–15min e cinco Shorts; manual respeita duração pedida. Uma produção por vez.
- Publicação YouTube/Facebook habilitada, modo agendado e envio sequencial com confirmação de IDs; nenhuma postagem/agendamento foi alterado neste rebalanceamento. Última produção publicada conhecida: Oceano, principal05/10 e Shorts05–06/10. Consultar plataformas antes de afirmar novos posts.
- Panamá162c93b7-724a-45a5-8761-5f91b7521c2b e seus Shorts antigos foram rejeitados por qualidade: não publicar. Universo de7c14ad-1c54-479c-a804-f73e85b60c85 continua interrompido, sem aprovação.
- Revisão visual, planejamento e código usam OpenCode. Pesquisa factual com fontes e geração de capa/ilustrações continuam Google na configuração acordada anteriormente. Não alegar que Google foi inteiramente removido. Descrições sem URLs; texto de capas em inglês.
- Pré-pesquisa exige cobertura visual de blocos/assuntos essenciais e duração conservadora; mídia sem revisão não conta. Mantidos filtros de relevância, recortes inéditos e diversidade; não liberar repetição para economizar.

## Limitações e próximo passo
- Ainda não há medição global financeira confiável incluindo tokens de raciocínio, revisão e Google. Estimativas antigas não comprovam cobrança; teto de chamadas contém consumo mas não garante um vídeo/dia ou um mês no planoUS$10.
- Após liberação real da franquia, observar retomada2050 à meia-noite e revisar principal/cinco Shorts antes de afirmar qualidade. Medir consumo real de uma produção completa com contexto reduzido para recalibrar tetos. Nenhum render pago de ponta a ponta executado agora.
