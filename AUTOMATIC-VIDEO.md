# Montagem automática

**Atualização:** a exportação agora utiliza código de motion escrito pelo MiMo, em vez de apenas composições fixas. Veja `MIMO-MOTION.md` para o fluxo atual. A descrição abaixo da montagem por JSON registra a versão anterior; pesquisa, mídia, narração e créditos continuam sendo utilizados.

Abra uma produção no painel e clique em **Gerar vídeo automaticamente**. Para o projeto já existente, a pesquisa, o roteiro, a voz e a capa são reaproveitados. Para um projeto novo, são produzidos antes da montagem. O servidor precisa permanecer aberto.

O provedor escolhido em Integrações (Gemini ou OpenCode Go) dirige as cenas em JSON, sem executar código recebido do modelo. Gemini faz a seleção visual. Remotion compõe textos, imagens animadas, mapas de países e gráficos com os componentes locais. O modelo decide quais componentes usar, seus conteúdos e layouts; não é o piloto fixo de Luxemburgo.

1. Pesquisa e roteiro, caso estejam ausentes.
2. Narração Fish Audio, caso esteja ausente, e transcrição local com tempos por palavra.
3. Direção de cenas de aproximadamente cinco segundos, considerando a narração completa.
4. Vídeos Pexels; na falta deles, fotografias do Wikimedia Commons com licença compatível e créditos. Locais específicos precisam constar nos metadados. Gemini examina prévias; isso reduz erros, mas não prova a autenticidade de uma localização.
5. Mapas com polígonos Natural Earth (região principal, sem territórios ultramarinos), setas esquemáticas e gráficos cujos números e fontes precisam constar na pesquisa. Não há mapas de bairros ou rotas medidas nesta versão.
6. Capa se necessária e exportação local em 1080p/30fps. MP4 e arquivo de créditos ficam no painel. A publicação no YouTube não é automática.

Se não houver mídia adequada, uma cena textual é registrada como alternativa. Mais de 10% dessas cenas bloqueia a renderização para evitar uma apresentação predominantemente textual. Erros deixam arquivos e cenas selecionadas em cache para retomar; versões de MP4 concluídas são preservadas. As escolhas manuais antigas permanecem intactas; a montagem automática mantém um plano separado e faz sua própria seleção.

Fotografias entram como cartões com borda, sombra e movimento discreto. Quando a composição imediatamente anterior trata do mesmo local/país e não é uma filmagem, seu último quadro permanece desfocado ao fundo. Sem relação geográfica, usa-se fundo neutro; mapas não são inventados como decoração. Filmagens ocupam a tela com identificação breve do local, sem título obrigatório. Reutilizações de vídeo avançam o trecho dentro da duração disponível. O diretor recebe essas orientações nas novas gerações; MP4s já exportados permanecem inalterados.

Pré-requisitos: dependências npm de `renderer`, Python com faster-whisper em `renderer/.python`, modelo local em `renderer/.models`, Chrome do Remotion e integrações cadastradas. `ATLAS_PYTHON` permite definir outro executável. Execute `node scripts/check-auto-ready.mjs` para conferir sem chamadas de produção.

Verificação desta implementação: testes locais e compilação TypeScript, sem gerar vídeo nem chamar APIs de produção a pedido do usuário. O primeiro teste completo e a avaliação editorial cabem ao usuário no painel; qualidade equivalente ao piloto não é garantida só pela compilação.
