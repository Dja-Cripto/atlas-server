# Estado atual do Atlas Studio

**Atualizado em:** 19/09/2026, aproximadamente 16:00

## O que foi alterado

- Foi concluída uma auditoria técnica e editorial do gerador, sem reorganizar a arquitetura nem mudar os contratos de produção.
- Foram removidos somente resíduos recriáveis e arquivos soltos de diagnóstico: `.temp/`, `renderer/build/`, o MP4 de teste na raiz, `test_pcm_voice.mp3`, `test_pcm_transcript.json` e `scratch_job.json`.
- A limpeza liberou aproximadamente 46 GB. Produções salvas, banco SQLite, cache de mídia, código gerado, músicas e configurações foram preservados.
- Após confirmação explícita do usuário, as quatro produções de teste restantes e seus materiais derivados foram removidos: registros de produção, mídia em cache, vídeos longos, Shorts, prévias Remotion, renders, exports CapCut, benchmarks e pastas experimentais. Configurações, credenciais criptografadas, código, dependências, modelos locais e músicas foram preservados.
- Foi definida a política de versionamento: mudanças significativas validadas devem gerar commit e envio ao GitHub, mantendo arquivos locais pesados e segredos fora do repositório.
- O projeto foi inicializado como repositório Git, conectado a https://github.com/Dja-Cripto/atlas-server e publicado na branch main. O código do enderer foi incorporado ao repositório principal; seu Git aninhado antigo foi removido para evitar um ponteiro de submódulo incompleto.

- Foi implementada a disciplina editorial `clean | label | composed`: vídeos e fotografias comuns agora ficam limpos por padrão; identificação curta só aparece quando há local verificável; motion completo fica reservado a mapas, gráficos e explicações relevantes.
- Cenas de mídia limpa e identificada usam um componente cinematográfico determinístico, sem título ou legenda obrigatórios e sem chamada individual ao GLM. O GLM continua com liberdade para programar cenas compostas.
- O balanceamento impede cenas de mídia composta consecutivas, limita mídia composta a 25% do tempo de mídia em vídeos longos e rótulos a 20%.
- Bundles temporários de vídeos longos e Shorts agora são apagados depois do render, inclusive quando ocorre erro.
## O que foi validado

- A suíte automatizada está com 56/56 testes aprovados após a disciplina de mídia limpa e a limpeza automática de bundles.
- Os diretórios e arquivos removidos deixaram de existir após a operação.
- O banco ficou com zero produções e manteve o registro de configurações.
- Foi confirmado que `.temp/` continha bundles antigos de renderização de 2,6 a 5,7 GB cada; a renderização de cinco Shorts duplicava o bundle completo para cada Short.
- Foi identificado que o plano inicial já pede mídia limpa, mas o contrato entregue ao GLM ainda programa cada trecho como uma cena completa de motion. Embora o contrato peça 40% de cenas limpas, `heading`, `caption` e desenvolvimento visual continuam presentes em praticamente todas as atribuições, favorecendo texto e efeitos excessivos.
- O snapshot inicial contém apenas código e documentação. Banco local, credenciais, dependências, modelos, músicas, caches, mídias, prévias e renders permanecem fora do GitHub por regras do .gitignore.

## Erros ou limitações abertos

- A nova proporção editorial precisa ser avaliada visualmente em uma produção inédita; os testes garantem a regra, mas não substituem a revisão do ritmo final.
- Mapas, gráficos e composições continuam com chamadas individuais ao GLM e validação visual; são o custo necessário para preservar a qualidade dessas cenas.
- O tempo real economizado dependerá da proporção de cenas com mídia encontrada; cenas sem mídia ainda exigem recuperação visual.
- A documentação principal está desatualizada e a pasta ainda não possui repositório Git ativo.

## Próximo passo recomendado

- Antes de reorganizar os módulos, implementar um modo editorial de mídia limpa: vídeos e fotos devem tocar sem texto por padrão; um rótulo curto de localização só aparece quando necessário; motion completo fica reservado a dados, mapas, explicações sem mídia e momentos realmente importantes.
- Em seguida, reduzir chamadas do GLM agrupando cenas simples e reutilizando implementações determinísticas para mídia limpa, além de apagar bundles temporários automaticamente após renderizações.


