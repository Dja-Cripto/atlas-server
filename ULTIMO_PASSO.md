# Atlas Studio — Suporte Geográfico à Guiana Francesa e Territórios
**Atualizado em:** 25/09/2026, aproximadamente 13:10 (America/Bahia).

## Checkpoint e versão
- V1 estável: tag `atlas-visual-v1-checkpoint-2026-09-24`, commit `78b60db`, enviada ao GitHub.
- Imagem V1 preservada no VPS: `atlas-studio:visual-v1-checkpoint-2026-09-24`.
- V2: branch `codex/atlas-visual-v2` e `main`. Procedimento de reversão em `CHECKPOINTS.md`.
- Painel: https://painel.setupdja.website; código do servidor: /srv/atlas-studio.

## Alterações
- **Suporte a Guiana Francesa e territórios ultramarinos**:
  - Em `lib/geography.mjs`, resolvido o erro `País não reconhecido na base geográfica: French Guiana`.
  - A base cartográfica Natural Earth (`admin_0_countries`) agrupa a Guiana Francesa como o polígono 0 do MultiPolygon da França soberana. O resolvedor agora extrai cirurgicamente esse polígono sul-americano quando `French Guiana`, `Guiana Francesa` ou `Guyane` é solicitada, atribuindo propriedades próprias e centróide correto na América do Sul.
  - Quando a cena aborda `Metropolitan France` ou quando `France` e `French Guiana` são solicitadas juntas (cena transatlântica), a França utiliza o polígono europeu continental, permitindo enquadramento e conexões continentais precisas entre Europa e América do Sul.
  - Ampliada a cobertura de sinônimos e nomes multilíngues (suportando propriedades `NAME_EN`, `NAME_PT`, `NAME_ES`, Reino Unido e suas nações constituintes).
- **Testes automatizados**:
  - Adicionado teste específico em `tests/visual-v2.test.mjs` validando a materialização cartográfica de `French Guiana` e `Brazil`.

## Validação e resultados
- 97/97 testes automatizados aprovados no Node.js (`npm test`).
- Testada e validada a extração das coordenadas exatas (487 pontos costeiros/fronteiriços ao longo do Rio Oiapoque) com centróide em [-53.3°, 3.74°].
- Erro de país não reconhecido 100% eliminado.

## Próximo passo
Sincronizar o repositório no VPS (`/srv/atlas-studio`) e gerar a produção do teste de 30 segundos sobre França & Brasil pelo painel.
