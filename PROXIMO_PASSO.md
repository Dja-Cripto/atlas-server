# Atlas Visual V3 — próximo passo aprovado

Atualizado em 28/09/2026. Escopo aprovado: pré-pesquisa de viabilidade, banco de ideias, fila única manual/agendada, cinco Shorts e implantação após atualização. Neste trabalho SOMENTE documentação; não inserir registros no banco ativo nem criar agendamento externo ao robô.

## 1. Estado e escopo

Daniel aprovou o novo resultado curto e quer preservar narração, efeitos, modelos, música e busca já corrigida. O plano antigo de reconstrução editorial/busca deixa de ser uma lista a reexecutar. Conferir ULTIMO_PASSO.md e o código antes de reaplicar qualquer correção. Não concluir que todo tema hiperlocal é inviável por definição: a nova pré-pesquisa deve medir cada caso.

Ler AGENTS.md, ULTIMO_PASSO.md e CHECKPOINTS.md. Preservar checkpoint V2 e alterações existentes. Este plano autoriza o próximo executor a implementar o escopo e, após validação, atualizar o servidor. Não iniciar produção, publicar ou implantar neste trabalho documental.

## 2. Fluxo aprovado

Todos os dias à 00:00, no fuso explícito America/Bahia, o agendador interno cria uma solicitação para escolher o próximo tema elegível do banco, na ordem cadastrada. Não criar automação do Codex/cron separado duplicando o agendador do produto.

Uma solicitação diária procura UM tema viável: pré-avalia ideia 1; se comprovadamente insuficiente, marca para revisão, notifica e examina a próxima. Quando encontra tema aprovado, gera um vídeo principal de 10 a 15 minutos e DEPOIS os cinco Shorts, sequencialmente. Não gerar toda a lista na mesma noite. Não prometer que tudo ficará pronto à meia-noite: esse é o horário de início.

Não postar automaticamente. Guardar produções concluídas para Daniel avaliar durante pelo menos dois dias de teste. Passar dois dias NÃO autoriza ativação de postagem: dependerá de instrução posterior. Capas permanecem desativadas, inclusive geração manual e extração automática de quadro; sua ausência não pode travar vídeo, Shorts ou conclusão.

## 3. Pré-pesquisa econômica antes da produção

- Antes de roteiro completo, voz ou Remotion, elaborar esboço curto de blocos narrativos: pergunta, contexto, explicações e sujeitos que exigem mídia específica.
- Usar a busca atual para montar inventário compartilhado e persistido. Metadados/deduplicação primeiro, revisão seletiva de miniaturas e quadros depois. Não analisar integralmente centenas de vídeos nem chamar programação de cenas nesta fase.
- Medir material REALMENTE aproveitável: fontes únicas, fotos distintas, arquivos acessíveis, intervalos úteis não sobrepostos de vídeo, adequação aos blocos, abertura em filmagem relevante e diversidade. Não contar 1.000 URLs como 1.000 opções distintas ou duração bruta de arquivo como duração utilizável.
- Avaliar sustentação factual/narrativa de pelo menos 600 segundos, além do acervo visual. Não esticar poucas fotos, repetir takes ou adicionar silêncio para fabricar viabilidade. Não exigir 600 segundos de filmagem exclusiva: fotos autoradas, mapas e explicações pertinentes também compõem, mantendo prioridade de filmagem conforme política atual.
- Retornar estado estruturado: aprovado, insuficiente ou inconclusivo; duração recomendada entre 600 e 900 s quando aprovado; evidências por bloco, fontes/trechos, lacunas e custo estimado/observado. Aprovação é estimativa fundamentada, não garantia infalível.
- Falha de API, limite de orçamento, quota esgotada ou fonte fora do ar gera inconclusivo, não “tema sem conteúdo”. Fazer recuperação limitada e registrar motivo. Tema insuficiente somente após busca representativa concluída.
- Reaproveitar inventário, buscas e análises na produção para não pagar tudo novamente. Revalidar disponibilidade quando necessário. Mudança relevante de pauta invalida somente avaliação dependente.

## 4. Custo controlado

Orçamento inicial proposto/aprovado na conversa: teto de US$ 0,10 por tema para a pré-avaliação, somando IA e buscadores cobrados. Implementar como configuração explícita e verificar preços/modelos reais antes de usar; não apresentar essa cifra como média já medida. Não inclui produção completa, licenciamento de mídia ou custo fixo de servidor.

Registrar usage real (entrada, saída e raciocínio quando disponível), consultas pagas e estimativa por serviço. Reservar custo estimado antes de nova chamada e reconciliar depois; limitar respostas/retries. Se custo não puder ser conhecido, informar estimativa/limitação e não declarar teto garantido. Preço de outro modelo não pode ser aplicado ao modelo ativo.

No ciclo automático, limitar exploração a 10 temas e orçamento agregado inicial de US$ 1 por solicitação diária, considerando avaliações já feitas; não rodar indefinidamente numa lista reabastecida. Atingido limite, avisar avaliação pendente e encerrar ciclo. Não comprar créditos ou licenças automaticamente.

## 5. Duração principal e Shorts

- Planejar duração entre 10 e 15 minutos conforme material e história. Critério de entrada é sustentar NO MÍNIMO 10 minutos.
- Depois do TTS, medir a narração; a faixa anterior que permitia ficar 15% abaixo não pode aprovar 8,5 minutos neste fluxo. Ajustar roteiro e ressintetizar quando necessário, com revisões limitadas; não completar duração com silêncio ou fala artificialmente lenta. Resultado principal entre 600 e 900 s, considerando pequena saída final dentro do teto.
- Após validar principal, gerar exatamente cinco Shorts em sequência, mantendo edição dinâmica já existente e reutilizando acervo/trechos pertinentes. Preservar principal se um Short falhar; retomar apenas pendências, sem refazer concluídos.
- O pacote ocupa a fila até terminar ou registrar falha/pausa recuperável; nunca rodar outro principal enquanto seus Shorts continuam. Não depender de capa ou upload para concluir o pacote.

## 6. Fila única, persistente e manual

- Reusar banco de pautas/agendamento existente, evitando criar banco paralelo. Persistir tema, descrição, ordem, estado, assessment/version/custo, tentativas, job associado e origem da solicitação.
- Estados claros: aguardando, pré-avaliando, aprovado, produzindo, shorts, concluído, insuficiente, inconclusivo e falha. Transições atômicas; não apagar tema insuficiente. Reativação após ajuste ou solicitação explícita.
- Um único worker para pré-pesquisa/produção pesada, por servidor, com trava persistida/lease e recuperação de reinício. Não depender só de variável em memória. Renovação e proteção contra worker antigo continuar após perder trava.
- Botão manual enfileira; se há trabalho em andamento, não interrompe nem inicia outro. Pedidos manuais entram a seguir, em ordem entre si, antes de novos automáticos ainda não iniciados. Mostrar posição/estado.
- Agendamento é idempotente por data local e canal: reiniciar servidor ou verificar horário várias vezes não duplica solicitação. Se servidor cair, recuperar no máximo uma solicitação diária pendente; não disparar vários dias históricos de uma vez. Se produção atravessa meia-noite, a nova solicitação aguarda.
- Mesma ideia não pode ser reservada simultaneamente por pedido manual e automático. Selecionar tema disponível atomicamente; cliques repetidos usam chave de idempotência.
- Tratar fila vazia com aviso, sem gerar pauta inventada. Insuficiente segue para próximo; inconclusivo recebe retentativa limitada e pode ser colocado pendente para analisar outro, com motivo correto. Falha técnica de produção preserva artefatos e não inicia loops de regeneração.

## 7. Dashboard e visibilidade

Aviso persistente e deduplicado: “Daniel, o tema [título] não teve conteúdo suficiente para um vídeo de 10 minutos.” Acrescentar lacunas concretas, link para avaliação e ações de editar/reavaliar. Não usar essa mensagem para erro de serviço ou teto de custo.

Exibir também: tema ativo, etapa, origem manual/agendada, fila, próxima execução com fuso, custo da pré-pesquisa, principal pronto e Shorts X/5. Avisar inconclusivo, limite, fila vazia e falha recuperável separadamente. Reconhecer aviso não apaga diagnóstico.

## 8. Cinco ideias iniciais para semear o banco na implementação

Títulos e descrições em inglês. São sugestões editoriais, NÃO temas já aprovados por pesquisa. Inserir uma vez, nesta ordem, com seedId estável; não duplicar ao reiniciar/deploy. Aplicar exatamente a mesma pré-avaliação de dez minutos a todos.

1. seedId: v3-japan-earthquake-design
   Title: How Japan Builds Cities That Live with Earthquakes
   Description: Explore how buildings, transport systems, public drills and everyday design help Japanese cities prepare for earthquakes. Connect visible city life with clear explanations of engineering and its limits.
   Direções de busca: cidades japonesas verificadas, edifícios, infraestrutura, treinamento e mecanismos; distinguir demonstrações de cenas de desastres específicos.
2. seedId: v3-netherlands-water-life
   Title: How the Netherlands Makes Room for Water
   Description: Follow the relationship between Dutch cities, rivers and flood defenses, showing how infrastructure and daily life adapt to water instead of treating it only as an enemy.
   Direções de busca: rios, cidades, diques, comportas, projetos identificados e moradores; confirmar que não repete produção já existente antes de semear.
3. seedId: v3-singapore-water
   Title: Where Singapore Gets Its Water
   Description: Trace the different ways Singapore collects, treats and supplies water, linking reservoirs and urban life to the engineering behind a densely populated island city.
   Direções de busca: cidade, reservatórios, tratamento e fontes institucionais; pesquisar fatos antes de definir números.
4. seedId: v3-panama-canal-journey
   Title: How Ships Cross the Panama Canal
   Description: Follow a ship's journey through the canal and explain how locks, water and navigation make the crossing possible, with a clear visual account of the mechanism and the people operating it.
   Direções de busca: travessias, eclusas, navios e operação; intervalos distintos da mesma fonte são permitidos, não repetir frames.
5. seedId: v3-mongolia-seasons
   Title: How Mongolia’s Nomadic Herders Follow the Seasons
   Description: Follow the seasonal decisions of herding families, from moving camp to caring for animals, connecting the Mongolian landscape with everyday work and changes in modern life.
   Direções de busca: famílias/pastoreio/estepes verificadas, estações, acampamentos e transporte. Não atribuir identidade ou história inventada a pessoas filmadas.

Alguns assuntos já foram usados em testes. Antes de inserir, conferir banco e produções; evitar duplicação automática e marcar teste anterior quando aplicável. Acervo presumivelmente amplo não equivale a aprovação: confirmar no fluxo novo.

## 9. Implementação, validação e servidor

Inspecionar primeiro lib/topics.mjs, agendamento existente, server.mjs, persistência, lib/automatic.mjs, lib/shorts.mjs e dashboard; descobrir nomes reais dos módulos. Integrar pré-avaliação com lib/auto-media.mjs sem reescrever o sistema visual.

Ordem: persistência/estados e trava única; avaliador e orçamento; integração principal/Shorts; dashboard e banco inicial; validação; implantação. Validar concorrência manual/meia-noite, cliques duplicados, reinício, avaliação insuficiente vs inconclusiva, limites de custo, cinco Shorts, ausência de capa e postagem desligada. Usar dublês para testes de fila; não gastar gerações completas para testar relógio. Registrar resultados e limitações antes de dizer pronto.

Após validação, checkpoint da versão funcional, commit/push somente arquivos pertinentes conforme AGENTS e permissões disponíveis, atualizar servidor preservando banco/mídias e trabalhos ativos. Confirmar fuso, worker único, fila persistida, capas desligadas e publicação realmente desligada inclusive worker separado. Usar os controles existentes para pausar uploads, sem apagar credenciais ou pedidos anteriores. Não publicar automaticamente durante os dois dias de teste nem ativar por cronômetro.

Pronto significa fluxo validado e versão do servidor identificável, não apenas documentação ou configuração salva. Atualizar ULTIMO_PASSO.md com o que de fato foi implementado, validado e implantado.
