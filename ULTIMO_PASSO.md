# Estado atual do Atlas Studio no VPS

**Atualizado em:** 24/09/2026, aproximadamente 17:55 (America/Bahia)

## Acesso e ambiente

- Painel: `https://painel.setupdja.website`; VPS: `ubuntu@137.131.171.144`.
- Código: `/srv/atlas-studio`; contêiner `atlas-studio`; dados persistentes: `/srv/robo/portal-bot/data/atlas-storage`.
- n8n, Cloudflare e painel do WhatsApp preservados. Gate de publicação automática permanece desabilitado.

## Correção e exclusão de músicas de Rock / Guitarras

- **Trilha identificada**: no vídeo recente da Torre Eiffel (`f033c7d8-c5ea-434c-9d6b-475423dbb5a8`), o robô selecionou `Fire_Breather.mp3` (Silent Partner), cujo gênero oficial na YouTube Audio Library é Rock, com abertura agressiva de guitarras elétricas distorcidas.
- **Faixas removidas fisicamente**: excluídas tanto do repositório local quanto do servidor VPS (`/srv/atlas-studio/Musicas` e contêiner Docker) todas as faixas de rock, metal, punk e guitarras elétricas:
  - `Fire_Breather.mp3` (Silent Partner - Rock);
  - `Demilitarized_Zone.mp3` (Ethan Meixsell - Rock / Heavy Metal com solos de guitarra);
  - `Loitering.mp3` (Riot - Rock com guitarras distorcidas);
  - `Tidal_Wave.mp3` (Silent Partner - Punk / Rock alternativo);
  - `2nd Mix -.mp3` (J-Rock com guitarras elétricas);
  - `Sugar_Zone.mp3` (Silent Partner - Rock).
- **Aperfeiçoamento do catálogo no robô (`lib/music-catalog.mjs`)**:
  - Inclusão de todas as faixas identificadas na blacklist `EXCLUDED_BEAT_TRACKS`;
  - Filtro por regex na indexação (`getAllTracks`) que classifica automaticamente como `beatHeavy: true` e `documentarySuitable: false` qualquer arquivo com menções a rock, metal, punk, guitar ou artistas de rock;
  - Restrição estrita no seletor de trilhas (`selectBestMusic`): nenhuma faixa marcada como `beatHeavy` pode entrar no pool de seleção, nem mesmo em fallbacks.

## Validação

- 90/90 testes unitários aprovados no `npm test`, incluindo nova validação garantindo que vídeos sobre monumentos ou curiosidades nunca selecionam faixas de rock ou guitarras.
- Verificação direta no sistema de arquivos do VPS confirmando a remoção definitiva das músicas.

## Próximo passo recomendado

- Gerar um novo teste pelo painel para validar a nova trilha sonora adequada ao documentário (atmosfera cinematográfica, de curiosidade ou geopolítica, sem guitarras ou baterias agressivas).
