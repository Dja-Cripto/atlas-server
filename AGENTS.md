# Continuidade do projeto

Antes de alterar este projeto, leia `ULTIMO_PASSO.md`.

Depois de qualquer alteração no código, configuração, interface ou fluxo de produção, atualize `ULTIMO_PASSO.md` no mesmo trabalho. O registro deve informar, de forma curta e objetiva:

- data e hora aproximada da atualização;
- o que foi alterado;
- o que foi validado e o resultado;
- erros ou limitações que continuam abertos;
- qual é o próximo passo recomendado.

Registre somente o estado final relevante. Substitua informações que ficaram obsoletas, em vez de acumular um diário longo. Nunca coloque chaves de API, credenciais, tokens ou outros segredos no arquivo.

Depois de uma alteração significativa validada, crie um commit descritivo e envie-o ao repositório GitHub configurado. Não versione credenciais, banco local, dependências, modelos baixados, músicas, caches, mídias de produção, prévias ou renders. Alterações intermediárias incompletas não devem substituir o último snapshot funcional.

Toda correção solicitada para um vídeo de teste deve ser implementada no gerador do robô, para beneficiar as próximas produções. Não trate apenas os arquivos de uma produção já gerada, salvo quando o usuário pedir isso explicitamente.
