# Estado atual do Atlas Studio

**Atualizado em:** 19/09/2026, aproximadamente 14:30

## O que foi alterado

- Foi concluída uma auditoria técnica e editorial do gerador, sem reorganizar a arquitetura nem mudar os contratos de produção.
- Foram removidos somente resíduos recriáveis e arquivos soltos de diagnóstico: `.temp/`, `renderer/build/`, o MP4 de teste na raiz, `test_pcm_voice.mp3`, `test_pcm_transcript.json` e `scratch_job.json`.
- A limpeza liberou aproximadamente 46 GB. Produções salvas, banco SQLite, cache de mídia, código gerado, músicas e configurações foram preservados.
- Após confirmação explícita do usuário, as quatro produções de teste restantes e seus materiais derivados foram removidos: registros de produção, mídia em cache, vídeos longos, Shorts, prévias Remotion, renders, exports CapCut, benchmarks e pastas experimentais. Configurações, credenciais criptografadas, código, dependências, modelos locais e músicas foram preservados.
- Foi definida a política de versionamento: mudanças significativas validadas devem gerar commit e envio ao GitHub, mantendo arquivos locais pesados e segredos fora do repositório.

## O que foi validado

- A suíte automatizada permanece com 53/53 testes aprovados antes da limpeza.
- Os diretórios e arquivos removidos deixaram de existir após a operação.
- O banco ficou com zero produções e manteve o registro de configurações.
- Foi confirmado que `.temp/` continha bundles antigos de renderização de 2,6 a 5,7 GB cada; a renderização de cinco Shorts duplicava o bundle completo para cada Short.
- Foi identificado que o plano inicial já pede mídia limpa, mas o contrato entregue ao GLM ainda programa cada trecho como uma cena completa de motion. Embora o contrato peça 40% de cenas limpas, `heading`, `caption` e desenvolvimento visual continuam presentes em praticamente todas as atribuições, favorecendo texto e efeitos excessivos.

## Erros ou limitações abertos

- Vídeos e fotografias ainda recebem texto e motion com frequência maior que a desejada; a próxima correção deve ser feita no gerador, com cenas explicitamente classificadas como mídia limpa.
- Um vídeo longo faz uma direção global, uma chamada GLM por cena e até duas correções adicionais por cena; depois ainda compila e renderiza amostras. Esse desenho é o principal gargalo de tempo.
- Bundles temporários de renderização não são apagados automaticamente após sucesso ou falha.
- A documentação principal está desatualizada e a pasta ainda não possui repositório Git ativo.

## Próximo passo recomendado

- Antes de reorganizar os módulos, implementar um modo editorial de mídia limpa: vídeos e fotos devem tocar sem texto por padrão; um rótulo curto de localização só aparece quando necessário; motion completo fica reservado a dados, mapas, explicações sem mídia e momentos realmente importantes.
- Em seguida, reduzir chamadas do GLM agrupando cenas simples e reutilizando implementações determinísticas para mídia limpa, além de apagar bundles temporários automaticamente após renderizações.
