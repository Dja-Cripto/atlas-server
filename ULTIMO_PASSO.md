# Atlas Studio — continuidade

Atualizado em 02/10/2026, aproximadamente 15h35 (America/Bahia).

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
- Não houve upload, alteração de agendamento externo, limpeza de projetos ou mudança de publishingEnabled. Manter a pausa de novos envios solicitada pelo usuário; publicações já aceitas nas plataformas não foram alteradas. Pendências anteriores YouTube/Facebook exigem consulta atual antes de qualquer ação.
- Regras mantidas: produções automáticas10–15min, manuais respeitam duração solicitada,5 Shorts, execução sequencial; descrições sem URLs e textos das capas em inglês.

## Próximo passo
- Verificar as próximas produções no VPS: avaliar principal e cinco Shorts com mídia efetivamente alocada, antes de considerá-los aprovados. Adequar plano/pesquisa às lacunas específicas sem substituições enganosas. Novos envios às plataformas continuam pausados.
