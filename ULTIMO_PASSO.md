# Estado atual do Atlas Studio no VPS

**Atualizado em:** 23/09/2026, aproximadamente 15:30 (America/Bahia)

## Acesso e ambiente

- Painel: `https://painel.setupdja.website`; VPS `ubuntu@137.131.171.144`.
- Projeto no VPS: `/srv/atlas-studio`; serviço Docker Compose `atlas`, contêiner `atlas-studio`.
- Publicação automática desligada. n8n, Cloudflare e painel do WhatsApp preservados.

## Monitoramento frame a frame em tempo real

- **Widget de progresso ao vivo (`liveProgressWidget`)**: painel dinâmico implementado tanto no topo do registro de atividades quanto no painel de finalização.
- **Métricas ao vivo exibidas**:
  - Contagem exata de quadros processados (`X / Y quadros`);
  - Percentual com precisão decimal;
  - Velocidade em quadros por segundo (`X.X quadros/s`);
  - Tempo restante estimado dinâmico (`~Xh Ym` / `~X min`);
  - Barra animada de alta visibilidade com efeito neon/gradiente.
- **Otimização de decodificação no Remotion (`SceneBackdrop.tsx`)**: eliminado o carregamento duplicado de `<OffthreadVideo>` no fundo das cenas com vídeo em primeiro plano, aliviando o uso de CPU e evitando bloqueios de IPC.
- **Persistência frequente**: status salvo a cada 1,5 segundos no SQLite e polling a cada 2 segundos no navegador.

## Produção em andamento

- Produção `54204f15-86ce-4fd5-8de6-b4d43c671a7a` (“Why Europe and Africa Still Have No Fixed Link”) mantém 100% dos dados e 104 cenas intactos.
- Retomada limpa da renderização MP4 1080p no VPS com métricas ao vivo ativas.

## Validação

- 77/77 testes aprovados no `npm test`.
- Teste real de renderização executado e validado em 60 quadros a 0.9 fps no servidor.
