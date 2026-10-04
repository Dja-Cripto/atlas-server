# Atlas Studio — continuidade

Atualizado em 04/10/2026 (America/Bahia).

## Alterações implantadas
- Pré-pesquisa usa aliases curtos e consultas sem termos editoriais; distribui candidatos entre fontes e formatos. Aprofunda consultas/páginas dos blocos fracos e revisa mais vídeos quando faltam segundos.
- Aprovação exige todos os blocos e assuntos essenciais visivelmente cobertos, abertura em vídeo e pelo menos300s conservadores de filmagens para10min. Fontes não avaliadas não entram na duração. Amostra por quadros não comprova todo o conteúdo dos clipes.
- Resultados inconclusivos não afirmam inexistência de mídia. Auditoria registra falhas por fonte. Inventário aprovado e plano são transferidos da pré-pesquisa para a fila/gerador, com nova revisão por cena.
- Revisão visual indisponível não aprova por tags. Shorts não escolhem qualquer mídia do acervo quando a pertinente já foi usada.
- Antes das animações, principal e Shorts recuperam alternativas para fontes consecutivas, recortes esgotados e concentração excessiva; se não houver alternativa comprovada, preservam o trabalho e não renderizam repetição. Fontes podem reaparecer com trechos inéditos e espaçados.
- Principal exige50% de filmagem real também após a alocação final; a antiga exceção percentual não libera animações. Na retomada, código visual antigo é comparado às fontes/recortes atuais; só cenas afetadas são reprogramadas e a prévia é invalidada.
- Teste local por scripts/test-media-search.mjs e Testar Busca de Midia.cmd; relatórios/miniaturas ficam emdata/relatorios, fora do Git. Auditoria futura salva todos os registros, sem truncar160.

## Validação
-200 testes passaram, incluindo recortes esgotados, variedade nos Shorts, capacidade sem projeção, assuntos essenciais e código visual obsoleto na retomada. Sintaxe e diff conferidos.
- Teste real Panamá:968 mídias distintas,146 Wikimedia,941 Full HD;422 avaliações por bloco;69 distintas aprovadas(31 vídeos/38 fotos);420s conservadores de filmagem. Resultado inconclusivo: piloto conduzindo navio e nível do Lago Gatún na seca não comprovados. Busca melhorou; não autoriza afirmar falta real de conteúdo nem liberar este plano.
- Library of Congress retorna403;15 buscas falharam no teste final. Estimativa do códigoUS$0,073893 não confirma faturamento.
- Relatório: data/relatorios/teste-busca-2026-10-02T18-06-04-195Z.html. Esta execução ainda truncou detalhes em160; resumo íntegro emdata/relatorios/resultado-panama-corrigido.md. Próximas execuções guardam tudo.

- Teste local Suíça: 1.156 mídias, 76 distintas aprovadas (35 vídeos/41 fotos), 465s conservadores. Inconclusivo por máquina Herrenknecht, controle Pollegio e entrada Ceneri não comprovados; não significa inexistência de conteúdo.
- VPS: 32 testes específicos passaram. Suíte atual: 199/200; teste HTTP do painel pressupõe acesso sem login, mas o VPS exige autenticação (401 em vez de 400). Saúde e pausa publishingEnabled=false confirmadas após reinício; três projetos e seus estados preservados.

## Limitações e preservação
- Implantado no VPS /srv/atlas-studio o commit 4b23fa5, via avanço do histórico e reinício somente de atlas-studio; container saudável. Correções anteriores do VPS conferidas e preservadas em stash atlas-pre-deploy-2026-10-02. Nenhum render de ponta a ponta realizado com esta versão; qualidade final ainda exige teste visual de principal e Shorts.
- Panamá162c93b7-724a-45a5-8761-5f91b7521c2b e seus Shorts antigos foram rejeitados pelo usuário por qualidade; arquivos preservados, não reutilizar como aprovados.
- Publicação reativada por pedido do usuário: publishingEnabled=true, YouTube/Facebook habilitados, YouTube em modo agendado. Pausa antiga de Singapura removida somente após 24h e confirmação dos vídeos existentes na API. Nenhuma publicação existente foi reenviada; Panamá rejeitado permanece em review e sem agendamento.
- Regras mantidas: produções automáticas10–15min, manuais respeitam duração solicitada,5 Shorts, execução sequencial; descrições sem URLs e textos das capas em inglês.

## Estado das publicações verificado — 04/10, aproximadamente 10h45 Bahia
- Japão e Singapura: principal e cinco Shorts de cada confirmados publicados nas APIs YouTube/Facebook. Nenhum upload antigo pendente desses projetos.
- Oceano b320ac34-0c03-4bf8-80de-a84d609100e3: principal Rxl6MXA3ZWg já existia no YouTube, processado e agendado, apesar de fetch failed no Atlas. Registro reconciliado com o ID existente e pausa incerta removida somente após confirmação; principal não reenviado. Miniatura existente enviada e aceita pela API thumbnails.set.
- Cinco Shorts enviados sequencialmente/confirmados na API e persistidos: OddiAwgi4lE, ojt5C01qyAE, VPyD8BNlrrg, kuJytkPTTX8, ELqS6MtGDsM. Primeiros quatro processados; quinto recebido e processando na consulta. Facebook principal e cinco Shorts confirmados ready/scheduled, preservados sem reenvio.
- Horários Bahia, ambas as plataformas: principal 05/10 14h; Shorts 1–3 em 05/10 16h, 18h30 e 21h; Shorts 4–5 em 06/10 10h e 13h. Canal usa America/New_York, diferente do horário Bahia.
- Publicação automática habilitada para YouTube/Facebook, modo agendado; envio YouTube permanece um por execução e protegido por trava de concorrência. IDs já aceitos não são reenviados.
- Fila automática habilitada às 00:00 America/Bahia, faixa 10–15min, cinco Shorts. Próxima data calculada para produção que concluir após a meia-noite de 05/10 é 06/10, com Shorts distribuídos entre 06 e 07. Essa produção ainda não foi concluída nem enviada: não há garantia de vídeo diário se pesquisa/render falhar.
- Sem alteração de código neste ajuste. Reconciliação de resposta perdida foi manual; erro incerto futuro continua pausando por segurança e exige conferência. Universo continua error e Panamá rejeitado continua review, ambos fora dos agendamentos.
## Banco de pautas
- A pedido do usuário, seis pautas cadastradas no VPS via API autenticada e relidas: todas pending, 15min de referência automática (faixa 10–15), cinco Shorts. Sem disparo manual de produção ou alteração da configuração/agendamentos.
- Seleção pela API oficial YouTube: RealLifeLore (7,94M inscritos) e The B1M (4,08M); três vídeos principais com mais visualizações de cada, ordenados por viewCount, excluindo Shorts. Consulta em 03/10/2026.
- Referências RealLifeLore: GE-lAftuQgc (50.478.200), Iy7NzjCmUf0 (33.274.902), hOFRbjjjwCE (25.752.646). Pautas: profundidade do oceano; escala do universo; mudanças possíveis até 2050.
- Referências The B1M: Wehsz38P74g (20.413.389), QiYvXKQksgI (15.337.347), a_-BrHqQwXI (10.761.313). Pautas: Billionaires’ Row em Nova York; túnel Fehmarnbelt; barragem etíope e Nilo.
- Briefings exigem roteiro próprio, pesquisa atual, evidência visual e pré-pesquisa antes de produção; previsões antigas não entram como fatos. A pauta do universo amplia o tema do canal, mantida por ser o segundo vídeo mais visto do canal escolhido.

## Disparo da fila e resultado do oceano
- Corrigido dailyTopicTick: dispara apenas no minuto configurado, sem recuperar meia-noite perdida durante a tarde. Produção manual permanece disponível e trabalho ativo não é interrompido. Teste de horário/worker passou (3 testes de production-readiness); sintaxe conferida.
- Inconclusivos agora preservam mediaSummary e gaps: painel não deve mostrar zero por ausência desses campos. Auditoria oceano: 1.285 mídias, 53 distintas aprovadas (28 vídeos/25 fotos), 359s conservadores; lacunas Alvin e Deepsea Challenger, 14 falhas de fonte (Library of Congress 403). Não comprova escassez do tema.
- Universo de7c14ad-1c54-479c-a804-f73e85b60c85 em execução, preservado. Atualização de código será ativada por reinício somente após worker livre; disparos automáticos temporariamente suspensos e restaurados para 00:00 America/Bahia após ativação. Postagens não alteradas neste ajuste.

## Ajuste do planejador de mídia
- Pré-pesquisa distingue assuntos essenciais de exemplos opcionais. Nomes/instrumentos escolhidos pelo planejador não são obrigatórios em temas gerais; requisitos explícitos do criador e evidência factual continuam exigidos. Conceitos físicos podem ser explicados por gráficos corretos sobre mídia pertinente, sem exigir foto de instrumento.
- Esquema usa essentialSubjects e optionalSubjects, com blocos guiados pela pergunta central, sem impor história/instrumentos/infraestrutura como tangentes obrigatórias. Plano visual comprovado é passado ao roteiro para evitar depender de exemplos sem mídia.
- 200 testes locais passaram após implementação; 13 testes da revisão/pre-pesquisa passaram após refinamento final do prompt. Teste real intermediário de oceano mostrou que trocar nomes não bastava: blocos 1/2 passaram, mas o plano ainda inventou manômetro/ROV/cabo como requisitos. Teste intermediário interrompido após o prompt ser substituído; versão final ainda aguarda pré-pesquisa real.
- Pauta oceano volta a pending para reavaliação à meia-noite; auditoria anterior preservada no arquivo de pré-pesquisa, sem aprovação forçada. Sem disparo de produção adicional. Universo ativo preservado; ativação aguardará worker livre.

## Falha técnica do universo
- Universo de7c14ad-1c54-479c-a804-f73e85b60c85 falhou na seleção/recuperação com URI malformed, não com escassez comprovada. hasLocation decodificava título, URL e evidência juntos; percentuais literais ou escapes inválidos lançavam exceção e bloqueavam o restante das cenas.
- Corrigida a função geral: decodifica apenas grupos percent-encoded válidos e preserva grupos inválidos sem lançar. Testes de localização com percentual, URL válida e escape inválido passaram; não aprova automaticamente locais irrelevantes. Código/roteiro/voz e mídias da produção preservados, sem render ou retomada manual nesta ação.
- Ativação anterior concluiu: produção automática habilitada para 00:00; oceano informado concluído no painel. Esta conclusão não comprova qualidade visual final.

## Próximo passo
- Verificar as próximas produções no VPS: avaliar principal e cinco Shorts com mídia efetivamente alocada, antes de considerá-los aprovados. Adequar plano/pesquisa às lacunas específicas sem substituições enganosas. Publicação está habilitada; preservar envio sequencial, confirmação de ID externo e pausas em erro incerto/limite.

## Alertas de postagem — 04/10, aproximadamente 11h Bahia
- Hub Central mostra falhas e horários vencidos por vídeo/Short e plataforma (YouTube/Facebook). Alertas são derivados das pendências atuais, persistem até resolução e desaparecem após aceitação; não disparam reenvios.
- Seis testes de publicação/alertas passaram; sintaxe do servidor e interface conferida. Universo ainda aguardava retomada na verificação anterior; nenhum worker ativo antes da implantação.
