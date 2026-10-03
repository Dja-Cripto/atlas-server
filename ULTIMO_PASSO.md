# Atlas Studio — continuidade

Atualizado em 03/10/2026, aproximadamente 16h25 (America/Bahia).

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

## Estado das publicações verificado
- Facebook: Japão e Singapura, vídeo principal e cinco Shorts de cada, confirmados publicados/ready pela API; nada pendente de upload.
- YouTube: Japão completo publicado; Singapura principal e Short 1 publicados, Shorts 2 e 3 processados e agendados. Shorts 4 e 5 enviados pelo endpoint do painel um por vez, ambos aceitos pelo workflow e confirmados na API; ainda processando na última consulta.
- Singapura Short 4: UMZb1HjftbM, 03/10 às 13h Bahia (16:00Z); Short 5: Vu5C7m-MkE4, 03/10 às 16h Bahia (19:00Z). IDs e estados persistidos no banco do servidor; estados antigos publicados reconciliados no painel.
- Nenhuma alteração de código neste trabalho; fluxo real do painel validado com dois envios sem falha. Limite diário do canal não é garantido; manter proteção e não reenviar IDs existentes.

## Banco de pautas
- A pedido do usuário, seis pautas cadastradas no VPS via API autenticada e relidas: todas pending, 15min de referência automática (faixa 10–15), cinco Shorts. Sem disparo manual de produção ou alteração da configuração/agendamentos.
- Seleção pela API oficial YouTube: RealLifeLore (7,94M inscritos) e The B1M (4,08M); três vídeos principais com mais visualizações de cada, ordenados por viewCount, excluindo Shorts. Consulta em 03/10/2026.
- Referências RealLifeLore: GE-lAftuQgc (50.478.200), Iy7NzjCmUf0 (33.274.902), hOFRbjjjwCE (25.752.646). Pautas: profundidade do oceano; escala do universo; mudanças possíveis até 2050.
- Referências The B1M: Wehsz38P74g (20.413.389), QiYvXKQksgI (15.337.347), a_-BrHqQwXI (10.761.313). Pautas: Billionaires’ Row em Nova York; túnel Fehmarnbelt; barragem etíope e Nilo.
- Briefings exigem roteiro próprio, pesquisa atual, evidência visual e pré-pesquisa antes de produção; previsões antigas não entram como fatos. A pauta do universo amplia o tema do canal, mantida por ser o segundo vídeo mais visto do canal escolhido.

## Próximo passo
- Verificar as próximas produções no VPS: avaliar principal e cinco Shorts com mídia efetivamente alocada, antes de considerá-los aprovados. Adequar plano/pesquisa às lacunas específicas sem substituições enganosas. Publicação está habilitada; preservar envio sequencial, confirmação de ID externo e pausas em erro incerto/limite.
