# Atlas Studio — estado atual

Atualizado em 30/09/2026, aproximadamente 13:10 (America/Bahia).

## O que foi alterado
- **Remoção de Links nas Descrições do YouTube (`lib/providers.mjs`)**:
  - `generatePublishingMetadata` atualizado para extrair e formatar apenas nomes de entidades e publicações oficiais (ex: *PUB Singapore National Water Agency*, *Ministry of Sustainability*), eliminando links `http://` e `https://` nas descrições geradas para proteger canais novos sem verificação avançada.
  - Sanitização via regex aplicada como garantia de segurança para que nenhuma URL bruta vaze para o YouTube.
  - Descrições dos pacotes de Singapura e Japão no banco de dados (`studio.sqlite`) limpas e atualizadas com nomes formais de fontes.
- **Auditoria de Qualidade da Nova Produção ("Where Singapore Gets Its Water")**:
  - Extração e análise visual direta de frames do vídeo longo (15s, 90s, 240s, 400s, 600s) e de cada um dos 5 Shorts verticais (15s).
  - Validação técnica de resolução, codecs, taxa de bits, sincronismo de áudio e zonas seguras móveis.

## O que foi validado
- **Vídeo Longo de Singapura (`5ac7c206-304c-4ba8-9b55-f59d7850dac5`)**:
  - Duração: 11 minutos e 25 segundos (685.18s), perfeitamente dentro da faixa obrigatória de 10 a 15 minutos para pautas automáticas.
  - Formato: 1920x1080 @ 30fps H.264 (High Profile, ~16 Mbps), áudio estéreo AAC 48 kHz.
  - Composição: filmagens 100% autênticas de Singapura (canais de drenagem urbana, Marina Bay, Jardins da Baía, Merlion e bacia de Kallang), layout split-screen V3 e trilha sonora instrumental suave (*Liquid Time*) com ducking de -18 LUFS.
- **5 Shorts Verticais de Singapura**:
  - Todos em 1080x1920 @ 30fps H.264 vertical nativo, durações entre 43s e 64s.
  - Short 1 (56.2s): tomada aérea de Marina Bay com badge infográfico ("17 reservoirs").
  - Short 2 (53.7s): mapa coroplético animado destacando a fronteira internacional da Malásia e o Rio Johor.
  - Short 3 (64.6s): tomada de reservatório natural com legendagem minimalista de tratamento de água.
  - Short 4 (54.3s): esquema conceitual de fluxo por gravidade e tubulações profundas a 60m.
  - Short 5 (43.6s): cartões de comparação de salinidade e consumo de energia (água de reservatório vs água do mar).
  - Todos com tipografia dentro da safe area (sem sobreposição com a interface do YouTube Shorts/Reels/TikTok).
- **Testes automatizados**:
  - 173 testes passando com 100% de sucesso (`npm test`).

## Limitações abertas
- Cota de upload do canal no YouTube: canal recém-criado aguarda o encerramento da janela de 24 horas de segurança do Google (prevista para liberação a partir das 19h12 de 30/09) para envio dos itens pendentes sem colisão de horário. No Facebook, todos os 12 conteúdos (6 de Singapura e 6 do Japão) continuam 100% agendados e confirmados pela Meta.

## Próximo passo recomendado
- Acompanhar a liberação da janela de 24h do YouTube às 19h12 para prosseguir com a fila controlada de agendamentos no canal, garantindo espaçamento entre os vídeos de Singapura e Japão.

## Correção de recuperação — 01/10/2026
- Panamá pausou em quatro cenas após materialização falhada e teto de 22 ilustrações. Propostas da IA não são mídia real.
- Recuperação agora tenta buscas originais, substituições e contexto regional antes de ilustrar; mantém cenas de contexto sem exigência de sujeito exato. Assets sugeridos pelo modelo são descartados e apenas resultados reais do buscador são usados.
- Busca explícita de recuperação não é bloqueada pela existência de ilustração em cache. Limites editoriais mantidos.
- Sete testes de visual-repair passaram, incluindo recuperação real com limite de ilustrações esgotado. Arquivos implantados no servidor, serviço reiniciado. Produção preservada; conclusão do novo processamento ainda deve ser acompanhada.
- Próximo passo: confirmar recuperação das cenas 101/103/109/111 e qualidade antes da publicação. Pendências de publicação descritas acima continuam abertas.
