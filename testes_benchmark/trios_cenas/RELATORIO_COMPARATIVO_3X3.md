# Relatório Comparativo 3x3 — Remotion Benchmark Definitivo
**Data:** 26/09/2026 | **Resolução:** 1920x1080 (Full HD, 30fps, 180 frames)

Este teste colocou os 3 principais modelos (**GLM-5.3-Flash**, **GPT-6 Luna** e **Qwen 3.7 Max**) frente a frente sob rigorosa igualdade de regras em 3 assuntos completamente distintos.

---

## 1. Tema 1: A Fossa das Marianas (Pressão e Abismo Oceânico)
**Desafio Visual:** Profundidade de 11.000m, desaparecimento da luz solar aos 1.000m e pressão esmagadora equivalente a 50 jatos Jumbo por cm².

| Modelo | Arquivo de Vídeo | Tempo de Geração | Tentativas | Tokens Usados | Custo Estimado | Tamanho MP4 |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **GLM-5.3-Flash** | [`video_1_marianas_glm.mp4`](file:///d:/Documents/portal%20do%20investidor/novo%20teste/testes_benchmark/trios_cenas/video_1_marianas_glm.mp4) | 107.3s | 2 (ajuste sintaxe) | 7.403 | $0.0013 (R$ 0,007) | 963.7 KB |
| **GPT-6 Luna** | [`video_2_marianas_luna.mp4`](file:///d:/Documents/portal%20do%20investidor/novo%20teste/testes_benchmark/trios_cenas/video_2_marianas_luna.mp4) | 35.1s | 1 (de primeira) | 6.793 | $0.0377 (R$ 0,20) | 509.9 KB |
| **Qwen 3.7 Max** | [`video_3_marianas_qwen.mp4`](file:///d:/Documents/portal%20do%20investidor/novo%20teste/testes_benchmark/trios_cenas/video_3_marianas_qwen.mp4) | 1.25s | 1 (de primeira) | 5.631 | $0.0325 (R$ 0,17) | 707.9 KB |

---

## 2. Tema 2: O Estreito de Malaca (Gargalo de Petróleo e Navios)
**Desafio Visual:** Canal crítico de 1.7 milha náutica de largura, 84.000 navios anuais e tráfego de 25% do petróleo mundial.

| Modelo | Arquivo de Vídeo | Tempo de Geração | Tentativas | Tokens Usados | Custo Estimado | Tamanho MP4 |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **GLM-5.3-Flash** | [`video_4_malacca_glm.mp4`](file:///d:/Documents/portal%20do%20investidor/novo%20teste/testes_benchmark/trios_cenas/video_4_malacca_glm.mp4) | 45.6s | 1 (de primeira) | 4.656 | $0.0008 (R$ 0,004) | 560.1 KB |
| **GPT-6 Luna** | [`video_5_malacca_luna.mp4`](file:///d:/Documents/portal%20do%20investidor/novo%20teste/testes_benchmark/trios_cenas/video_5_malacca_luna.mp4) | 45.6s | 1 (de primeira) | 7.208 | $0.0401 (R$ 0,21) | 652.8 KB |
| **Qwen 3.7 Max** | [`video_6_malacca_qwen.mp4`](file:///d:/Documents/portal%20do%20investidor/novo%20teste/testes_benchmark/trios_cenas/video_6_malacca_qwen.mp4) | 1.14s | 1 (de primeira) | 3.368 | $0.0181 (R$ 0,10) | 1.322.6 KB |

---

## 3. Tema 3: A Grande Muralha Verde (8.000 km Contra o Saara)
**Desafio Visual:** Barreira vegetal de árvores cruzando 11 países africanos para conter o avanço de 1,5 km/ano do deserto do Saara.

| Modelo | Arquivo de Vídeo | Tempo de Geração | Tentativas | Tokens Usados | Custo Estimado | Tamanho MP4 |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **GLM-5.3-Flash** | [`video_7_greenwall_glm.mp4`](file:///d:/Documents/portal%20do%20investidor/novo%20teste/testes_benchmark/trios_cenas/video_7_greenwall_glm.mp4) | 105.6s | 1 (de primeira) | 4.387 | $0.0007 (R$ 0,004) | 1.511.4 KB |
| **GPT-6 Luna** | [`video_8_greenwall_luna.mp4`](file:///d:/Documents/portal%20do%20investidor/novo%20teste/testes_benchmark/trios_cenas/video_8_greenwall_luna.mp4) | 45.5s | 1 (de primeira) | 6.846 | $0.0380 (R$ 0,20) | 448.3 KB |
| **Qwen 3.7 Max** | [`video_9_greenwall_qwen.mp4`](file:///d:/Documents/portal%20do%20investidor/novo%20teste/testes_benchmark/trios_cenas/video_9_greenwall_qwen.mp4) | 97.2s | 1 (de primeira) | 10.948 | $0.0663 (R$ 0,35) | 408.0 KB |

---

## Resumo e Veredito Técnico de Engenharia

1. **GPT-6 Luna (OpenAI):** É o modelo mais consistente de todos. Passou de primeira em **100% dos testes**, manteve uma latência rígida de **35s a 45s** em todos os cenários sem oscilar, e entrega a melhor diagramação de cena, timing visual e ausência total de bugs de sintaxe.
2. **Qwen 3.7 Max (Alibaba):** Campeão de velocidade quando não precisa de cadeia de raciocínio extensa (~1.1s a 1.2s). Quando entra em geometria continental profunda (como na África), sua latência sobe para 97s por causa do reasoning. É uma excelente alternativa de altíssima velocidade.
3. **GLM-5.3-Flash (Zhipu):** Custo praticamente nulo, mas sofreu instabilidades de streaming e exigiu correção manual de sintaxe para o render do primeiro tema.
