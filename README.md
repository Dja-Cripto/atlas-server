# Atlas Studio — primeira fase

Painel local de pré-produção de vídeos em inglês, criado do zero. Requer Node.js 24 ou superior. Usa SQLite nativo do Node e music-metadata para medir a narração.

Atualização: instale as dependências com `npm.cmd install`. A biblioteca `music-metadata` mede a duração dos arquivos de narração.

## Planos de edição e versões de capa

- Na aba Plano de cenas, **Criar plano detalhado** distribui planos de aproximadamente 5 segundos pela duração medida do MP3 (ou por estimativa de 150 palavras/minuto quando não há áudio). O texto é preservado integralmente e os tempos são proporcionais à contagem de palavras, não alinhamentos reais da voz.
- As 6–16 cenas originais são blocos temáticos. O plano detalhado tem consultas concretas de filmagens por trecho, além de indicações de mapas/gráficos a construir na etapa de montagem.
- **Buscar para todos os planos** consulta o Pexels por cada termo distinto de filmagem, acumula arquivos únicos, registra progresso/falhas e associa resultados aos planos. Resultados não equivalem a aprovação editorial, geográfica ou de licença. Buscas antigas são arquivadas no projeto.
- Em Filmagens, filtre um plano e abra a origem. Depois de revisar, informe entrada e saída dentro do arquivo e atribua o trecho. O backend valida duração e revisão explícita. A seleção ainda não renderiza o vídeo. Referências do YouTube não podem ser atribuídas como arquivos de montagem.
- Em Capa, **Gerar outra capa** aceita uma direção opcional e preserva todas as versões. A versão principal só muda quando o usuário escolhe **Usar esta capa**. Cada geração pode consumir créditos.
- Alterações no plano guardam o plano e atribuições anteriores no histórico; as atribuições atuais são reiniciadas porque os tempos podem mudar.

## Executar

```powershell
npm.cmd start
```

Abra http://127.0.0.1:4310. Em Integrações, cadastre as chaves (não envie pelo chat). Clique em Nova produção, informe título e duração e inicie cada etapa. Salvar uma chave não verifica sua validade. Cada botão Iniciar faz uma chamada real que pode consumir créditos; não há tentativas automáticas nem troca silenciosa de provedor.

## Gemini pelo Vertex AI

O backend padrão é Vertex AI. Importe em Integrações o JSON de uma conta de serviço. O servidor valida o arquivo, guarda somente os campos necessários na configuração criptografada e renova os tokens OAuth do Google automaticamente. A pesquisa, o roteiro, o plano de cenas e as imagens usam o projeto e a região configurados. Não há fallback automático para AI Studio.

Também é possível importar localmente: `node scripts/import-vertex.mjs "caminho/conta-de-servico.json"`. O arquivo não é servido pela aplicação. O projeto precisa de faturamento e API Vertex AI ativos; a conta de serviço precisa da permissão `aiplatform.endpoints.predict`, incluída em `roles/aiplatform.user` (Vertex AI User). A região inicial é `global`; disponibilidade de modelos depende do projeto e da região. Alterações de IAM não são feitas pelo aplicativo.

## Disponível

- Projetos persistidos em SQLite, etapas, erros, retomada de etapas interrompidas e histórico real.
- Gemini: pesquisa com Google Search, fontes retornadas pela busca e roteiro.
- Gemini ou OpenCode Go: configuração JSON de cenas, validada e nunca executada como código. Go usa chat/completions e destina-se a tarefas de programação; não está habilitado como substituto de pesquisa factual.
- Gemini Interactions API: geração de capa com modelo configurável.
- Pexels API: busca de vídeos, autor, origem e seleção de referências.
- YouTube Data API: busca com filtro Creative Commons e links de origem, sem download. Seleção não equivale a autorização de uso.
- Fish Audio: geração MP3 com modelo e referência de voz configuráveis. Disponibilidade gratuita e direitos devem ser confirmados para a conta/voz escolhida.
- Biblioteca de MP3 e imagens e exportação do pacote de pré-produção em JSON.
- Revisão manual de roteiro antes de gerar cenas/voz; versões posteriores exigem novo projeto para preservar consistência.

## Ainda não disponível

Renderização final Remotion, download e corte de filmagens, mapas/gráficos, alinhamento da voz, montagem automática, QA audiovisual, OAuth/upload/agendamento do YouTube e custos calculados por provedor. O painel identifica essas etapas como futuras; não simula vídeos concluídos. Nesta fase os resultados precisam de revisão factual e editorial.

## Armazenamento e segurança

O servidor escuta somente em 127.0.0.1. As chaves ficam criptografadas (AES-256-GCM) no SQLite em data, nunca são devolvidas à interface e ficam fora do Git. A chave de criptografia também está em data: a criptografia não protege contra acesso completo à pasta. Não exponha o servidor à rede; proteja o usuário Windows e os backups. O aplicativo valida Host/Origin, exige JSON em mutações e restringe rotas de arquivos. Não possui autenticação para uso remoto.

## Verificar

```powershell
npm.cmd test
```

Integrações externas precisam das chaves e de teste real antes de considerar o sistema pronto para produção. Este projeto não inclui chaves, pesquisas inventadas ou projetos de demonstração persistidos.

## Documentação das integrações

- https://ai.google.dev/gemini-api/docs/google-search
- https://ai.google.dev/gemini-api/docs/image-generation
- https://opencode.ai/docs/go
- https://docs.fish.audio/api-reference/endpoint/openapi-v1/text-to-speech
- https://fish.audio/developers/
- https://www.pexels.com/api/documentation/
- https://developers.google.com/youtube/v3/docs/search/list
- https://developers.google.com/youtube/terms/developer-policies

Remotion não exige chave de API para execução local. Sua licença e versão serão fixadas ao implementar a montagem. O arquivo de cenas desta fase é um contrato de dados, não um editor pronto.
