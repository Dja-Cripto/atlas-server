# Programação visual pelo MiMo

Ao gerar uma nova produção automaticamente, os materiais e a narração são preparados como antes. Uma nova etapa usa OpenCode Go, modelo `mimo-v2.5` por padrão, para escrever TSX cena por cena. O campo **Modelo que programa as animações Remotion** em Integrações permite alterar esse modelo independentemente do planejador.

O contrato completo está em `lib/motion-author.mjs`. Primeiro, o modelo estuda a timeline inteira e cria uma bíblia visual compacta, separando obrigações factuais de oportunidades criativas. Depois programa uma cena por chamada, recebendo essa direção global, a timeline completa resumida, as cenas vizinhas e o estado visual entregue pela cena anterior. A IA continua decidindo movimentos, composição, tipografia e transições; continuidade é contexto, não uma obrigação de repetir layouts ou usar fades. Os componentes anteriores são ferramentas opcionais, e não templates completos.

Restrições são de execução/fatos: código React determinístico, arquivos locais, sem rede, acesso ao servidor ou instalação de pacotes; números e locais fundamentados. A validação estrutural rejeita imports/APIs não permitidos e planos com lacunas de tempo. Isso não é uma prova de qualidade editorial nem um sandbox formal para código arbitrário.

O robô tenta corrigir erros estruturais de cada cena até duas vezes. Cada resposta que chegou em JSON, inclusive uma tentativa inválida, fica preservada para diagnóstico. Erros de sintaxe retornam linha, coluna e o trecho próximo ao defeito. Uma falha de compilação/renderização, ou detecção de quadros praticamente estáticos por pelo menos 1,5 segundo, permite uma rodada de correção do código e nova renderização. Depois disso fica pendente com erro; não volta silenciosamente aos templates antigos. A detecção de movimento não comprova relevância, beleza ou ritmo: essas qualidades ainda dependem da avaliação do resultado.

Código, bíblia visual, estados de continuidade e tentativas ficam em `renderer/src/generated/<runId>/`. Versões de vídeos concluídos são preservadas. Uma falha afeta uma cena curta em vez de descartar um pacote de várias cenas.

Implementado sem executar testes, geração, chamadas de produção ou renderização, conforme pedido de Daniel. O primeiro teste completo será iniciado por ele no painel.
