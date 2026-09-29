# Atlas Studio — estado atual

Atualizado em 29/09/2026, aproximadamente 16:40 (America/Bahia).

## Último trabalho
- **Finalização dos 5 Shorts em MP4 vertical 1080x1920 na VPS (`4aa56f3c-6a61-4e8d-bbb7-001aa343826d`)**:
  - Short 5 renderizado com sucesso (1.723 quadros em 57s, 53 MB) após a correção no gerador de `outputRange`.
  - Pacote de 5 Shorts 100% concluído na VPS.
- **Geração de Capa Oficial (Thumbnail) via Vertex AI / Gemini 3.1 Flash Image**:
  - Capa 16:9 gerada com sucesso (`thumbnail-8f4d3a72-...png`, 2.1 MB) exibindo corte transversal de fundações antissísmicas, amortecedores de base e metrópole costeira japonesa.
  - Registrada no projeto como capa ativa para publicação.
- **Agendamento Completo e Configuração no Modo Público**:
  - Projeto colocado em `status: scheduled` para amanhã (30/09/2026).
  - Horários oficiais alocados: Vídeo longo às 13:00 (EST) / 14:00 (BRT); Shorts 1 a 5 distribuídos no ciclo de 24h.
  - Configurações de publicação atualizadas para modo `public` (`youtubeMode: "public"`, `enabled: true`).
  - Legendas WebVTT geradas e sincronizadas a partir dos `transcript.json` para todos os 6 vídeos (1 longo + 5 shorts).
- **Proteção da Fila de Publicação e Otimização de Disco na VPS (`lib/publishing.mjs`)**:
  - Implementado teto de tentativas (máximo 3) e intervalo de espera de 15 minutos em falhas para evitar re-downloads de 1.5 GB em loop.
  - Liberados mais de 5,8 GB de espaço livre na VPS com limpeza de cache de build e dados de execução temporários do n8n.
- **Testes automatizados**:
  - 168 testes passando com 100% de sucesso (`npm test`).

## Estado verificado
- **Projeto do Japão (`4aa56f3c-6a61-4e8d-bbb7-001aa343826d`)**:
  - Vídeo longo de 14m18s em MP4 íntegro (1.5 GB).
  - 5 Shorts verticais em MP4 íntegros (`short_1.mp4` a `short_5.mp4`).
  - Capa oficial 16:9 gerada e gravada.
  - Títulos SEO, timestamps de capítulos, tags e legendas WebVTT vinculados.
  - Agendado para 30/09/2026.
- **Disco da VPS**:
  - 5,8 GB de espaço livre disponível, container `atlas-studio` e `n8n` operando normalmente.

## Erros ou limitações que continuam abertos
- A conexão OAuth do canal do YouTube no n8n reportou credencial expirada (`EAUTH`); a reconexão da conta no n8n é necessária para o webhook completar o upload automático externo, caso o usuário não queira fazer o upload pelo YouTube Studio.

## Próximo passo recomendado
- Daniel revisar a capa gerada e confirmar se prefere que o upload seja disparado via n8n (após renovar o login do YouTube no n8n) ou baixado diretamente para publicação manual.
