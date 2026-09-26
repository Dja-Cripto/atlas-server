# Próximo passo — ideias aprovadas para experimentar
**Atualizado em:** 26/09/2026 (America/Bahia).

Este arquivo guarda decisões para testes futuros. Ele não altera a configuração do robô em produção. O estado já implementado continua em `ULTIMO_PASSO.md`.

## 1. Recuperação de cenas por segundo modelo
- Fluxo proposto: até 3 tentativas com GLM-5.3-Flash; se a cena ainda falhar, até 2 tentativas com um segundo modelo; só então usar o template visual seguro já existente.
- Primeiro candidato para o teste comparativo: **Kimi K3**, disponível no OpenCode Go. Comparar em cenas reais que falharam no GLM; medir aprovação técnica, qualidade visual, tempo e consumo. **Kimi K2.7 Code** é alternativa de menor custo, não escolha definitiva.
- Limite proposto para templates: até **5% das cenas do vídeo**, calculado pelo total de cenas; acima disso, pausar com motivo e contagem visíveis no painel. Avaliar também uma sequência excessiva de reservas. Os números exatos para vídeos muito curtos dependem do teste.
- Nada deste fluxo foi ativado no gerador principal.

## 2. Personalidade editorial do canal
- Direção provisória aprovada para experimento: um narrador curioso que desconfia de explicações simples demais, procura o detalhe físico ou humano que muda a história e admite ironia leve quando nasce do assunto.
- A identidade deve ser audível na escolha das perguntas, no ritmo e nas observações; visível no que a direção decide revelar com filmagem, mapa, detalhe e animação.
- Sem bordão, piada, símbolo, abertura ou efeito obrigatório. Preservar seriedade factual e respeito por pessoas reais. Humor não é uma quota: pode estar ausente quando o assunto pedir.
- Validar em roteiro e vídeo curtos isolados antes de considerar mudanças no robô. Julgar se voz e visual parecem escolhas do mesmo autor sem repetir um template.

## Resultado do piloto isolado (26/09/2026)
- Tema: como poeira do Saara pode repor parte do fósforo perdido nos solos da Amazônia. Fatos verificados em fonte da NASA: https://science.nasa.gov/earth/earth-observatory/thick-dust-plumes-obscure-africas-coast-85423/ .
- APIs usadas com configuração já existente: Gemini Vertex para roteiro e revisão, Fish Audio para voz, OpenCode Go/GLM para TSX Remotion e Pexels para duas filmagens. O robô principal não foi alterado nem interrompido.
- Primeiro roteiro: correto, mas genérico. Segunda versão: linguagem dramática e afirmações fortes demais; rejeitada. Terceira versão: factual e natural, porém a personalidade ainda ficou sutil. Isso demonstra que um prompt de personalidade, isoladamente, não garante identidade reconhecível.
- Vídeo MP4 de 28 segundos renderizado e amostrado visualmente. O código TSX do GLM precisou de uma correção sintática local antes do render. Há filmagens reais do Saara e da Amazônia, uma relação gráfica ilustrativa e uma informação animada sobre fósforo. O tratamento visual é coerente, mas ainda parece mais um documentário genérico que uma assinatura autoral forte.
- Arquivos locais de avaliação: `scratch/personality-pilot/narration.txt`, `scratch/personality-pilot/plan.json`, `scratch/personality-pilot/pilot.mp4` e `scratch/personality-pilot/contact.jpg`. A pasta é ignorada pelo Git; mídias e renders não são versionados. O vídeo precisa de avaliação do usuário antes de qualquer aprovação de estilo.
- Próximo teste recomendado: comparar 2–3 temas diferentes, com revisão editorial que avalie voz e visual juntos; medir reconhecimento da identidade sem bordões ou elementos obrigatórios. Não incorporar a personalidade ao gerador até essa validação.

Nenhum ajuste de segundo modelo ou personalidade foi ativado no gerador principal.
