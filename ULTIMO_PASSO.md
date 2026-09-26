# Atlas Studio — Benchmark de Modelos e Produção Noturna
**Atualizado em:** 26/09/2026, aproximadamente 12:44 (America/Bahia).

## Versões
- V1 funcional: tag `atlas-visual-v1-checkpoint-2026-09-24`, commit `78b60db`; imagem preservada no VPS.
- V2: branch `codex/atlas-visual-v2`. Reversão em `CHECKPOINTS.md`.

## Estado relevante
- A produção agendada da madrugada (*Why 90% of Australia Is Completely Empty*) foi disparada pontualmente e finalizou com sucesso total: vídeo longo de 5 minutos (555 MB MP4), narração completa e capa em alta resolução (2.1 MB) disponíveis em modo de revisão sem publicação automática.
- Realizado o benchmark dos modelos do plano OpenCode Go em pasta isolada (`testes_benchmark/`) sem alterar o robô de produção.
- Avaliados roteiros e cenas do Remotion entre GPT-6 Luna, DeepSeek-V4 Flash e GLM-5.3-Flash.
- A composição `Benchmark-GPT-6-Luna` foi integrada ao Remotion Root (`renderer/src/Root.tsx`) permitindo visualização ao vivo no navegador sem necessidade de renderizar MP4.

## Experimento separado
- `PROXIMO_PASSO.md` registra o futuro teste de segundo modelo (Kimi K3 após três falhas do GLM, até duas tentativas; template limitado a cerca de 5%). Nada disso foi ativado no robô.
- Um piloto isolado de 28 segundos sobre poeira do Saara e Amazônia foi gerado com as APIs já configuradas. O MP4 e mídias estão em `scratch/personality-pilot/`, ignorados pelo Git. O usuário não percebeu identidade própria na narração nem diferenciação visual. A proposta de personalidade permanece em discussão e foi retirada de `PROXIMO_PASSO.md`. A primeira versão do código visual exigiu reparo sintático no experimento.

## Validação e próximo passo
- 114/114 testes locais aprovados (`npm test`).
- Renderizados quadros da cena gerada pelo GPT-6 Luna demonstrando obediência total ao layout, mapa vetorial SVG animado e safe zone.
- Próximo passo: Daniel avaliará os roteiros gerados e a cena do Remotion para decidirmos juntos sobre a adoção oficial do GPT-6 Luna ou DeepSeek para a esteira principal.
