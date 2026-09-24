import path from 'node:path';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

/**
 * Atlas Studio - Curated Music Catalog & Intelligent Selector
 * Maps 212 royalty-free audio tracks into high-relevance documentary categories.
 */

export const MUSIC_CATEGORIES = {
  geopolitics: {
    id: 'geopolitics',
    name: 'Geopolítica, Poder & Estratégia',
    description: 'Frieza estratégica, movimentações de capital, portos, rotas comerciais, soberania e poderio global.',
    tags: ['portos', 'china', 'eua', 'guerra fria', 'comercio', 'rotas', 'maritimo', 'potencias', 'estrategia', 'capital', 'infraestrutura', 'ferrovias', 'petroleo', 'canal'],
    defaultVolume: 0.06
  },
  mystery_dark: {
    id: 'mystery_dark',
    name: 'Mistério, Segredos & Canal Dark',
    description: 'Suspense investigativo, arquivos confidenciais, lugares proibidos, corrupção, operações secretas e mistérios globais.',
    tags: ['misterio', 'segredo', 'proibido', 'bizarro', 'dark', 'conspiracao', 'crime', 'ilhas', 'abismo', 'nuclear', 'desaparecido', 'oculto', 'deserto'],
    defaultVolume: 0.06
  },
  curiosity_flow: {
    id: 'curiosity_flow',
    name: 'Curiosidade & Documentário Dinâmico (Estilo Vox / Johnny Harris)',
    description: 'Ritmo moderno, fluidez analítica, gráficos em movimento, contrastes territoriais e explicações inteligentes.',
    tags: ['curiosidade', 'geografia', 'fronteiras', 'populacao', 'cidades', 'economia', 'moeda', 'pib', 'riqueza', 'tecnologia', 'mapas', 'dados', 'luxemburgo', 'singapura'],
    defaultVolume: 0.06
  },
  epic_monumental: {
    id: 'epic_monumental',
    name: 'Épica, Monumentos & Megaconstruções',
    description: 'Grandiosidade histórica, impérios antigos, engenharia monumental, batalhas decisivas e conquistas milenares.',
    tags: ['imperio', 'historia', 'antigo', 'monumento', 'cristo redentor', 'piramides', 'muralha', 'megaestrutura', 'guerra', 'batalha', 'conquista', 'ouro'],
    defaultVolume: 0.06
  },
  emotional_drama: {
    id: 'emotional_drama',
    name: 'Emotiva, Quedas & Reflexão Humana',
    description: 'Piano contemplativo, colapsos econômicos, tragédias históricas, crises humanitárias e passagens de tempo.',
    tags: ['emocao', 'tragedia', 'colapso', 'crise', 'abandono', 'cidade fantasma', 'pobreza', 'fome', 'passado', 'memoria', 'humano', 'refletir'],
    defaultVolume: 0.06
  },
  shorts_viral: {
    id: 'shorts_viral',
    name: 'Shorts Verticais & Curiosidade Rápida',
    description: 'Trilhas dinâmicas, limpas e sutis para vídeos verticais (Shorts/TikTok), mantendo a voz em primeiro plano sem baterias agressivas.',
    tags: ['shorts', 'viral', 'rapido', 'curto', 'ritmo', 'gancho', 'curiosidade rapida', 'fatos'],
    defaultVolume: 0.06
  },
  funny_quirky: {
    id: 'funny_quirky',
    name: 'Cômica, Leis Bizarras & Situações Inusitadas',
    description: 'Ironia, situações absurdas, leis ridículas, erros históricos engraçados e bizarrices diplomáticas.',
    tags: ['engracado', 'bizarro', 'absurdo', 'leis', 'comico', 'ironico', 'humor', 'curiosidade engracada'],
    defaultVolume: 0.07
  }
};

/**
 * Blacklist of tracks with aggressive drum beats, 808 bass, trap, rock,
 * or comedic elements that compete with documentary narration.
 */
export const EXCLUDED_BEAT_TRACKS = new Set([
  'Warzone - Anno Domini Beats.mp3',
  'Champ - Gunnar Olsen.mp3',
  'Drop - Anno Domini Beats.mp3',
  'Anxiety - NEFFEX.mp3',
  'Free Me (Instrumental) - NEFFEX.mp3',
  'The Itch (Instrumental) - NEFFEX.mp3',
  '(Algrow Backround Music)Flute_Trap_Beat_.mp3',
  'Algrow Background Music (ravi).mp3',
  'mixkit-lil-haiti-beat-298.mp3',
  'mixkit-purple-js-453.mp3',
  'mixkit-zay-zay-309.mp3',
  'LONDON VIEW REMIX BASS BOOSTED NCS .mp3',
  'Trap Unboxing(MP3_160K).mp3',
  'Crazy.mp3',
  'Dirtyxan - Pain.mp3',
  'ROYALTY NCS MUSIC.mp3',
  'mixkit-we-own-the-night-roll-out-320.mp3',
  'mixkit-driving-ambition-32.mp3',
  'Cutting It Close - DJ Freedem.mp3',
  'Tropic Fuse - French Fuse.mp3',
  // Rock / Metal / Punk / Distorted Guitar tracks (strictly incompatible with documentary narration)
  'Fire_Breather.mp3',
  'Demilitarized_Zone.mp3',
  'Loitering.mp3',
  'Tidal_Wave.mp3',
  '2nd Mix -.mp3',
  'Sugar_Zone.mp3',
  'Mission Start - The Brothers Records.mp3',
  'Audio Hertz - World War Outerspace(MP3_128K).mp3',
  'Bucket_List.mp3',
  'Spookster.mp3'
]);

/**
 * Detailed metadata profile for tracks in Musicas de Fundo & músicas canal dark sem copy
 */
export const TRACK_CLASSIFICATIONS = {
  // === MÚSICAS CANAL DARK SEM COPY ===
  'Warzone - Anno Domini Beats.mp3': {
    category: 'geopolitics',
    mood: 'Tensão Bélica & Poderio Militar',
    energy: 'high',
    instruments: ['808 Bass', 'Synth Brass', 'Drums'],
    bestFor: 'Vídeos de expansão militar, frotas navais, guerras comerciais, potências mundiais e conflitos territoriais.',
    tags: ['guerra', 'militar', 'exercito', 'navios', 'china', 'eua', 'russia', 'armas', 'defesa', 'tensao']
  },
  'Icelandic Arpeggios - DivKid.mp3': {
    category: 'geopolitics',
    mood: 'Frieza Estratégica & Análise Silenciosa',
    energy: 'medium',
    instruments: ['Analog Synth Arpeggios', 'Pads'],
    bestFor: 'Acordos nos bastidores, negociações secretas, rotas do Ártico, canais marítimos e geopolítica do petróleo.',
    tags: ['artico', 'estrategia', 'acordos', 'portos', 'infraestrutura', 'frio', 'calculo', 'diplomacia']
  },
  'Beyond - Patrick Patrikios.mp3': {
    category: 'geopolitics',
    mood: 'Documentário Sóbrio & Investigação Contínua',
    energy: 'medium',
    instruments: ['Sub Bass', 'Minimal Percussion', 'Cinematic Ambient'],
    bestFor: 'Documentários de 15 minutos sobre redes de comércio global, ferrovias internacionais e monopólios.',
    tags: ['comercio', 'globalizacao', 'portos', 'monopolio', 'industria', 'mineracao', 'investigacao']
  },
  'Glacier - Patrick Patrikios.mp3': {
    category: 'geopolitics',
    mood: 'Contemplação Geográfica & Grandeza Territorial',
    energy: 'low',
    instruments: ['Ambient Drones', 'Soft Synths'],
    bestFor: 'Fronteiras disputadas, vastidões territoriais, reservas minerais e projetos de infraestrutura isolados.',
    tags: ['glaciar', 'fronteira', 'territorio', 'antartida', 'siberia', 'minerios', 'espacial']
  },
  'State Drive - VYEN.mp3': {
    category: 'geopolitics',
    mood: 'Fluxo Econômico & Movimentação Financeira',
    energy: 'medium',
    instruments: ['Bassline', 'Electric Beat', 'Subtle Synths'],
    bestFor: 'Bancos centrais, compra de títulos de dívida, megainvestimentos e rotas de transporte.',
    tags: ['financas', 'divida', 'investimento', 'bancos', 'bilhoes', 'dinheiro', 'economia']
  },
  'Faultlines - Asher Fulero.mp3': {
    category: 'geopolitics',
    mood: 'Ruptura Geopolítica & Instabilidade',
    energy: 'medium',
    instruments: ['Low Strings', 'Atmospheric Pads'],
    bestFor: 'Crises diplomáticas, países em colapso institucional, sanções econômicas e tensões de fronteira.',
    tags: ['crise', 'fronteira', 'sancoes', 'instabilidade', 'ruptura', 'disputa']
  },
  'Sinister Cathedral - Asher Fulero.mp3': {
    category: 'mystery_dark',
    mood: 'Mistério Sombrio & Segredos Ocultos',
    energy: 'low',
    instruments: ['Cathedral Organ', 'Dark Drones', 'Choral Pads'],
    bestFor: 'Lugares proibidos pelo governo, instalações secretas, ilhas abandonadas e conspirações.',
    tags: ['proibido', 'segredo', 'dark', 'governo', 'bunker', 'misterio', 'oculto']
  },
  'Devil_s Organ - Jimena Contreras.mp3': {
    category: 'mystery_dark',
    mood: 'Terror Psicológico & Anomalias Bizarrices',
    energy: 'high',
    instruments: ['Distorted Organ', 'Heavy Cinematic Hits'],
    bestFor: 'Desastres inexplicáveis, zonas de exclusão, anomalias geográficas e cidades fantasmas.',
    tags: ['bizarro', 'anomalia', 'desastre', 'chernobyl', 'zona proibida', 'assustador']
  },
  'Frightmare - Jimena Contreras.mp3': {
    category: 'mystery_dark',
    mood: 'Tensão Iminente & Perigo',
    energy: 'high',
    instruments: ['Pounding Percussion', 'Dark Synths'],
    bestFor: 'Crises urgentes, quase-guerras nucleares, incidentes submarinos e operações de resgate.',
    tags: ['nuclear', 'urgencia', 'perigo', 'submarino', 'ataque', 'alerta']
  },
  'Haunted Forest - TrackTribe.mp3': {
    category: 'mystery_dark',
    mood: 'Desolação & Territórios Desconhecidos',
    energy: 'low',
    instruments: ['Ambient Strings', 'Woodwind Textures'],
    bestFor: 'Florestas impenetráveis, tribos isoladas, selvas inexploradas e desertos mortais.',
    tags: ['selva', 'floresta', 'isolado', 'tribo', 'deserto', 'inexplorado']
  },
  'Future Rennaisance - Godmode.mp3': {
    category: 'curiosity_flow',
    mood: 'Inovação, Dinamismo & Engenharia',
    energy: 'medium',
    instruments: ['Modern Beat', 'Melodic Synths'],
    bestFor: 'Países hiper-desenvolvidos (Singapura, Japão, Suíça), transição energética e megaprojetos futuristas.',
    tags: ['futuro', 'tecnologia', 'singapura', 'japao', 'riqueza', 'inovacao', 'energia']
  },
  'Landing - Godmode.mp3': {
    category: 'curiosity_flow',
    mood: 'Ritmo Leve & Descoberta Curiosa',
    energy: 'medium',
    instruments: ['Electronic Drums', 'Smooth Bass'],
    bestFor: 'Curiosidades demográficas, anomalias de fronteiras, enclaves territoriais e cidades planejadas.',
    tags: ['cidades', 'populacao', 'fronteiras', 'enclave', 'curiosidades', 'mapas']
  },
  'Lazy Walk - Cheel.mp3': {
    category: 'curiosity_flow',
    mood: 'Descontraído, Curioso & Informativo',
    energy: 'low',
    instruments: ['Chill Hop Beat', 'Electric Piano'],
    bestFor: 'Vídeos estilo Vox/Johnny Harris sobre comparações de países, costumes culturais e leis peculiares.',
    tags: ['estilo vox', 'explicativo', 'leve', 'didatico', 'curiosidades', 'comparações']
  },
  'Two Moons - Bobby Richards.mp3': {
    category: 'curiosity_flow',
    mood: 'Reflexão Noturna & Curiosidades Históricas',
    energy: 'low',
    instruments: ['Mellow Bass', 'Lo-Fi Keys'],
    bestFor: 'Origem de moedas, como pequenos países ficaram ricos (Mônaco, Liechtenstein) e estratégias fiscais.',
    tags: ['monaco', 'luxemburgo', 'paraisos fiscais', 'moeda', 'ouro', 'historia']
  },
  'Auckland - VYEN.mp3': {
    category: 'curiosity_flow',
    mood: 'Exploração Oceânica & Grandes Paisagens',
    energy: 'medium',
    instruments: ['Guitars', 'Synth Pads', 'Electronic Beats'],
    bestFor: 'Ilhas remotas, rotas no Pacífico, Nova Zelândia, Austrália e geografia dos oceanos.',
    tags: ['pacifico', 'ilhas', 'oceano', 'australia', 'mar', 'rotas']
  },
  'Away - Patrick Patrikios.mp3': {
    category: 'curiosity_flow',
    mood: 'Jornada Contínua & Fatos Fascinantes',
    energy: 'medium',
    instruments: ['Ambient Synth', 'Steady Pulse'],
    bestFor: 'Narrativas com muitos dados, evolução de infraestruturas ao longo de décadas.',
    tags: ['dados', 'graficos', 'estatisticas', 'evolucao', 'decadas']
  },
  'Feels - Patrick Patrikios.mp3': {
    category: 'curiosity_flow',
    mood: 'Serenidade & Imagens Aéreas',
    energy: 'low',
    instruments: ['Warm Pads', 'Soft Percussion'],
    bestFor: 'Cenas de B-Roll calmas, paisagens de montanhas, rios gigantes e ecossistemas.',
    tags: ['natureza', 'rios', 'florestas', 'montanhas', 'paisagens', 'b-roll']
  },
  'Allégro - Emmit Fenn.mp3': {
    category: 'emotional_drama',
    mood: 'Melancolia Elegante & História',
    energy: 'low',
    instruments: ['Classical Piano', 'Cello'],
    bestFor: 'Queda de líderes históricos, cidades esquecidas pelo tempo, tratados rompidos.',
    tags: ['historia', 'passado', 'queda', 'tristeza', 'lideres', 'imperios']
  },
  'Alone - Emmit Fenn.mp3': {
    category: 'emotional_drama',
    mood: 'Solidão Profunda & Desolação',
    energy: 'low',
    instruments: ['Minimal Piano', 'Reverb Strings'],
    bestFor: 'Países isolados do mundo (Coreia do Norte), desertos inóspitos, o lugar mais remoto da Terra.',
    tags: ['isolamento', 'coreia do norte', 'remoto', 'solidao', 'deserto', 'triste']
  },
  'No.4 Piano Journey - Esther Abrami.mp3': {
    category: 'emotional_drama',
    mood: 'Sensibilidade & Beleza Poética',
    energy: 'low',
    instruments: ['Solo Piano'],
    bestFor: 'Monumentos sagrados, patrimônios da humanidade, histórias de fé e arte monumental.',
    tags: ['cristo redentor', 'vaticano', 'patrimonio', 'arte', 'monumentos', 'historia humana']
  },
  'Melancholia - Godmode.mp3': {
    category: 'emotional_drama',
    mood: 'Tristeza Reflexiva & Lições do Passado',
    energy: 'low',
    instruments: ['Ambient Piano', 'Soft Drones'],
    bestFor: 'Erros catastróficos, falências nacionais, migrações em massa e hiperinflação.',
    tags: ['hiperinflacao', 'crise', 'migracao', 'pobreza', 'colapso', 'venezuela']
  },
  'Elegy - Asher Fulero.mp3': {
    category: 'emotional_drama',
    mood: 'Lamento & Desfechos Marcantes',
    energy: 'low',
    instruments: ['Orchestral Strings', 'Piano'],
    bestFor: 'Conclusões emotivas de documentários, o legado de civilizações extintas.',
    tags: ['conclusao', 'legado', 'fim', 'civilizacao', 'epilogo']
  },
  'Drop - Anno Domini Beats.mp3': {
    category: 'shorts_viral',
    mood: 'Trap Instrumental Dinâmico',
    energy: 'high',
    instruments: ['Hip Hop Drums', '808 Bass', 'Piano Riff'],
    bestFor: 'Shorts de curiosidades de alto impacto, números impressionantes e ganchos fortes.',
    tags: ['shorts', 'gancho', 'impacto', 'fatos', 'dinamico']
  },
  'Anxiety - NEFFEX.mp3': {
    category: 'shorts_viral',
    mood: 'Urgência & Eletricidade',
    energy: 'high',
    instruments: ['Guitar Riff', 'Rock/Trap Drums'],
    bestFor: 'Shorts sobre confrontos militares rápidos, desastres naturais iminentes e corrida tecnológica.',
    tags: ['shorts', 'acao', 'urgencia', 'corrida', 'confronto']
  },

  // === MUSICAS DE FUNDO (PASTA GERAL) ===
  '(Algrow Backround Music)Flute_Trap_Beat_.mp3': {
    category: 'shorts_viral',
    mood: 'Flauta Envolvente & Trap de Alta Retenção',
    energy: 'high',
    instruments: ['Oriental Flute', 'Trap 808', 'Hi-Hats'],
    bestFor: 'Shorts do canal de curiosidades com 100% de retenção (estilo Algrow/Magnates).',
    tags: ['shorts', 'retencao', 'viral', 'algrow', 'flauta', 'trap', 'curiosidades']
  },
  'Algrow Background Music (ravi).mp3': {
    category: 'shorts_viral',
    mood: 'Ritmo Misterioso & Hipnótico',
    energy: 'medium',
    instruments: ['Plucked Strings', 'Trap Beat'],
    bestFor: 'Shorts de fatos surpreendentes ("Você sabia que existe um país onde...").',
    tags: ['shorts', 'voce sabia', 'misterio', 'algrow', 'fatos']
  },
  'mixkit-lil-haiti-beat-298.mp3': {
    category: 'shorts_viral',
    mood: 'Batida Urbana & Curiosidades Modernas',
    energy: 'high',
    instruments: ['Urban Trap Beat', 'Bells'],
    bestFor: 'Shorts sobre cidades mais ricas, países com mais bilionários, segredos de marcas globais.',
    tags: ['shorts', 'bilionarios', 'cidades', 'marcas', 'riqueza']
  },
  'mixkit-driving-ambition-32.mp3': {
    category: 'curiosity_flow',
    mood: 'Ambição Corporativa & Progresso',
    energy: 'medium',
    instruments: ['Tech Synths', 'Groove Drums'],
    bestFor: 'Como empresas gigantes dominam mercados, logística global e corrida por recursos.',
    tags: ['corporativo', 'mercados', 'logistica', 'petroleo', 'energia', 'crescimento']
  },
  'mixkit-we-own-the-night-roll-out-320.mp3': {
    category: 'geopolitics',
    mood: 'Poder Urbano & Autoridade Noturna',
    energy: 'medium',
    instruments: ['Deep Bass', 'Brass Stabs', 'Beat'],
    bestFor: 'Cidades estratégicas, capitais financeiras (Londres, Nova York, Tóquio, Xangai).',
    tags: ['capitais', 'xangai', 'toquio', 'londres', 'nova york', 'poder']
  },
  'mixkit-purple-js-453.mp3': {
    category: 'shorts_viral',
    mood: 'Groove Moderno & Curiosidades Rápidas',
    energy: 'medium',
    instruments: ['Synth Chords', 'Trap Beat'],
    bestFor: 'Shorts de 50 a 60 segundos com explicações rápidas de mapas.',
    tags: ['shorts', 'mapas', 'curiosidades', 'rapido']
  },
  'mixkit-zay-zay-309.mp3': {
    category: 'shorts_viral',
    mood: 'Intriga & Ritmo Cativante',
    energy: 'medium',
    instruments: ['Vocal Chops', 'Synth Bass', 'Drums'],
    bestFor: 'Shorts de mistérios leves, curiosidades geográficas e comparações de tamanho.',
    tags: ['shorts', 'tamanho', 'comparacao', 'curiosidades']
  },
  'The Battle of 1066 - Patrick Patrikios.mp3': {
    category: 'epic_monumental',
    mood: 'Batalha Medieval & Tronos Históricos',
    energy: 'high',
    instruments: ['Cinematic War Drums', 'Heavy Brass', 'Strings'],
    bestFor: 'Documentários de guerras medievais, formação de fronteiras europeias, castelos e reis.',
    tags: ['guerra', 'medieval', 'europa', 'fronteiras', 'castelos', 'batalha', 'historia']
  },
  'Alpha Mission - Jimena Contreras.mp3': {
    category: 'geopolitics',
    mood: 'Operação Tática & Tensão Espiã',
    energy: 'medium',
    instruments: ['Synthesizers', 'Action Percussion'],
    bestFor: 'Espionagem governamental, guerra cibernética, rotas secretas e cabos submarinos.',
    tags: ['espionagem', 'cyber', 'cabos submarinos', 'segredos', 'estrategia']
  },
  'Audio Hertz - World War Outerspace(MP3_128K).mp3': {
    category: 'mystery_dark',
    mood: 'Espaço Profundo & Corrida Espacial',
    energy: 'medium',
    instruments: ['Dark Synths', 'Space FX'],
    bestFor: 'Corrida espacial militar, satélites de espionagem, bases na Antártida e fronteiras do mundo.',
    tags: ['espaco', 'satelites', 'antartida', 'corrida espacial', 'misterio']
  },
  'Blue Dream(MP3_320K).mp3': {
    category: 'curiosity_flow',
    mood: 'Leveza Oceânica & Geografia',
    energy: 'low',
    instruments: ['Chill Beats', 'Ambient Rhodes'],
    bestFor: 'Ilhas do Caribe, rotas do Canal do Panamá, turismo e geografia dos mares.',
    tags: ['caribe', 'panama', 'mar', 'ilhas', 'oceano', 'turismo']
  },
  'Liquid Time(MP3_320K).mp3': {
    category: 'curiosity_flow',
    mood: 'Fluidez Analítica & Narração Longa',
    energy: 'low',
    instruments: ['Smooth Synths', 'Gentle Percussion'],
    bestFor: 'A música perfeita para documentários longos de 15 minutos onde a voz nunca pode ser encoberta.',
    tags: ['neutra', 'perfeita para voz', 'longa', 'documentario', 'geografia', 'fatos']
  },
  'Champ - Gunnar Olsen.mp3': {
    category: 'geopolitics',
    mood: 'Determinação & Construção de Megaprojetos',
    energy: 'high',
    instruments: ['Rock Drums', 'Heavy Bass', 'Electric Guitar'],
    bestFor: 'A corrida para construir megaportos, canais transoceânicos e ferrovias transcontinentais.',
    tags: ['construcao', 'megaprojetos', 'engenharia', 'energia', 'impacto']
  },
  'Cutting It Close - DJ Freedem.mp3': {
    category: 'curiosity_flow',
    mood: 'Tensão Dinâmica & Corrida Contra o Tempo',
    energy: 'medium',
    instruments: ['Electronic Drums', 'Synth Pulses'],
    bestFor: 'Prazos de concessões (35 a 99 anos), crises hídricas no Canal do Panamá e gargalos logísticos.',
    tags: ['canal do panama', 'gargalo', 'logistica', 'tempo', 'concessoes']
  },
  'Free Me (Instrumental) - NEFFEX.mp3': {
    category: 'shorts_viral',
    mood: 'Energia Trap / Rock & Desafio',
    energy: 'high',
    instruments: ['Guitar Lead', 'Trap Drums'],
    bestFor: 'Shorts de sobrevivência, países mais perigosos do mundo, desafios extremos de fronteira.',
    tags: ['shorts', 'perigoso', 'desafio', 'extremo', 'fronteira']
  },
  'The Itch (Instrumental) - NEFFEX.mp3': {
    category: 'shorts_viral',
    mood: 'Punch & Atitude',
    energy: 'high',
    instruments: ['Hip Hop Beat', 'Heavy 808'],
    bestFor: 'Shorts curtos de reviravoltas financeiras ("Como um homem comprou uma ilha por $1").',
    tags: ['shorts', 'reviravolta', 'dinheiro', 'compra', 'viral']
  },
  'Two Face - Causmic.mp3': {
    category: 'mystery_dark',
    mood: 'Dupla Intenção & Geopolítica Sombria',
    energy: 'low',
    instruments: ['Dark Rhodes', 'Atmospheric Bass'],
    bestFor: 'O lado oculto da ajuda internacional, dívidas soberanas, portos de uso duplo (comercial + militar).',
    tags: ['uso duplo', 'militar', 'divida', 'ajuda', 'armadilha', 'hambantota', 'portos']
  },
  'Violin_Instrumental_No_Copyright_Music_Royalty_free_violin_music_no_copyright_Free_Download(256k).mp3': {
    category: 'epic_monumental',
    mood: 'Solo de Violino & Soberania Histórica',
    energy: 'medium',
    instruments: ['Solo Violin', 'Orchestral Background'],
    bestFor: 'Histórias sobre impérios europeus, tratados que moldaram o mapa moderno e marcos históricos.',
    tags: ['violino', 'europa', 'imperios', 'monumentos', 'marcos', 'historia']
  }
};

/**
 * Intelligent Music Matcher with Rotational Variety & Thematic Pool
 * Analyzes video title, script, research and tags to pick the best music track
 * from a pool of appropriate candidates, ensuring consecutive videos vary in soundtrack.
 */
export function selectBestMusic({ title = '', script = '', research = {}, isShort = false, category = '', avoidPath = '', seed = '', root = '' }) {
  const allTracks = getAllTracks(root);
  const text = `${title} ${script.slice(0, 2000)} ${JSON.stringify(research)}`.toLowerCase();

  let targetCategory = category || '';
  let reasoning = 'Trilha dinâmica e fluida estilo Vox / Johnny Harris para manter o ritmo sem encobrir a narração.';

  if (!targetCategory) {
    // Multi-factor category scoring based on video theme
    const scores = {
      geopolitics: 0,
      mystery_dark: 0,
      epic_monumental: 0,
      emotional_drama: 0,
      funny_quirky: 0,
      curiosity_flow: 1
    };

    const geoTerms = ['port', 'ports', 'maritime', 'trade', 'shipping', 'navy', 'canal', 'gateway', 'corridor', 'infrastructure', 'beijing', 'geopolit', 'cold war', 'superpower', 'sovereignty', 'sanction', 'strait', 'chokepoint', 'malacca', 'strait of malacca'];
    for (const term of geoTerms) { if (text.includes(term)) scores.geopolitics += 3; }

    const darkTerms = ['secret', 'secrets', 'mystery', 'conspiracy', 'hidden', 'forbidden', 'bunker', 'bunkers', 'catastrophe', 'nuclear', 'island', 'disaster', 'dark', 'proibido', 'misterio', 'abismo', 'classified', 'unexplained'];
    for (const term of darkTerms) { if (text.includes(term)) scores.mystery_dark += 4; }

    const epicTerms = ['cristo', 'redeemer', 'monument', 'monuments', 'pyramid', 'pyramids', 'ancient', 'history', 'empire', 'empires', 'colossus', 'cathedral', 'statue', 'imperio', 'conquista', 'muralha', 'great wall'];
    for (const term of epicTerms) { if (text.includes(term)) scores.epic_monumental += 4; }

    const dramaTerms = ['colapso', 'collapse', 'tragedy', 'crisis', 'famine', 'poverty', 'ghost town', 'abandoned', 'solitude', 'extinction', 'hyperinflation', 'migracao', 'tragedia'];
    for (const term of dramaTerms) { if (text.includes(term)) scores.emotional_drama += 4; }

    const funnyTerms = ['bizarre', 'ridiculous', 'funny', 'absurd', 'ironic', 'weird laws', 'crazy', 'comico', 'engracad', 'bizarro'];
    for (const term of funnyTerms) { if (text.includes(term)) scores.funny_quirky += 4; }

    const flowTerms = ['how', 'why', 'country', 'population', 'economy', 'wealth', 'rich', 'border', 'enclave', 'gdp', 'switzerland', 'monaco', 'singapore', 'luxembourg'];
    for (const term of flowTerms) { if (text.includes(term)) scores.curiosity_flow += 2; }

    let highestScore = -1;
    for (const [cat, score] of Object.entries(scores)) {
      if (score > highestScore) {
        highestScore = score;
        targetCategory = cat;
      }
    }
  }

  const categoryReasonMap = {
    geopolitics: 'Trilha de autoridade, frieza analítica e graves sutis, perfeita para estratégia global, portos e comércio sem competir com a voz.',
    mystery_dark: 'Suspense investigativo sombrio com órgãos e pads atmosféricos para segredos confidenciais e conspirações.',
    epic_monumental: 'Trilha orquestral épica e grandiosa para megaconstruções, história e grandes marcos da humanidade.',
    emotional_drama: 'Piano melancólico e reflexão sensível para crises econômicas, colapsos e lições históricas.',
    funny_quirky: 'Trilha bem-humorada e descontraída para curiosidades cômicas, leis bizarras e situações inusitadas.',
    curiosity_flow: 'Trilha dinâmica e fluida estilo Vox / Johnny Harris para manter o ritmo sem encobrir a narração.',
    shorts_viral: 'Trilha dinâmica, limpa e sutil para vídeos verticais curtos, mantendo a voz em primeiro plano.'
  };
  reasoning = categoryReasonMap[targetCategory] || reasoning;

  // Filter available candidate tracks: strict exclusion of beat/trap/rock tracks for documentaries & shorts
  let pool = allTracks.filter(t => t.category === targetCategory && !t.beatHeavy && (targetCategory === 'funny_quirky' ? true : t.documentarySuitable));
  if (pool.length === 0) {
    pool = allTracks.filter(t => !t.beatHeavy && t.documentarySuitable);
  }
  if (pool.length === 0) {
    pool = allTracks.filter(t => !t.beatHeavy);
  }

  if (pool.length === 0) {
    return {
      path: 'Musicas/Trilha-sonora-principal.mp3',
      name: 'Trilha Sonora Padrão',
      category: targetCategory || 'curiosity_flow',
      categoryName: MUSIC_CATEGORIES[targetCategory]?.name || 'Trilha Padrão',
      mood: 'Adequado ao tema',
      energy: 'medium',
      defaultVolume: 0.08,
      reason: reasoning,
      alternatives: []
    };
  }

  // If avoidPath is provided, filter it out if there are other candidates in the pool
  if (avoidPath && pool.length > 1) {
    const withoutAvoid = pool.filter(t => t.relPath !== avoidPath);
    if (withoutAvoid.length > 0) pool = withoutAvoid;
  }

  // Calculate deterministic rotational index to guarantee variety across different videos
  const seedString = `${title}_${seed || script.length}_${text.length}`;
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = ((hash << 5) - hash) + seedString.charCodeAt(i);
    hash |= 0;
  }
  const selectedIndex = Math.abs(hash) % pool.length;
  const picked = pool[selectedIndex] || pool[0];

  // Alternatives from the same category for 1-click swapping
  const alternatives = pool
    .filter((_, idx) => idx !== selectedIndex)
    .slice(0, 4)
    .map(t => ({
      path: t.relPath,
      name: t.filename.replace(/\.mp3$/i, ''),
      category: t.category,
      categoryName: t.categoryName,
      mood: t.mood,
      energy: t.energy
    }));

  return {
    path: picked.relPath,
    name: picked.filename.replace(/\.mp3$/i, ''),
    category: targetCategory,
    categoryName: MUSIC_CATEGORIES[targetCategory]?.name || targetCategory,
    mood: picked.mood || 'Adequado ao tema',
    energy: picked.energy || 'low',
    defaultVolume: MUSIC_CATEGORIES[targetCategory]?.defaultVolume || 0.06,
    reason: reasoning,
    alternatives
  };
}

/**
 * Returns full list of all 212 tracks categorized and tagged
 */
export function getAllTracks(rootDir = process.cwd()) {
  const candidates = [rootDir ? path.join(rootDir, 'Musicas') : '', path.resolve('Musicas'), path.resolve('/app/Musicas'), path.resolve('../Musicas')].filter(Boolean);
  const baseDir = candidates.find(c => existsSync(c));
  if (!baseDir) return [];

  const cats = readdirSync(baseDir, { withFileTypes: true }).filter(d => d.isDirectory());
  const list = [];

  for (const cat of cats) {
    const catPath = path.join(baseDir, cat.name);
    const files = readdirSync(catPath).filter(f => f.toLowerCase().endsWith('.mp3'));
    for (const f of files) {
      const full = path.join(catPath, f);
      const meta = TRACK_CLASSIFICATIONS[f] || null;
      let targetCat = meta?.category;
      if (!targetCat) {
        if (cat.name === 'Emotiva') targetCat = 'emotional_drama';
        else if (cat.name === 'Engraçada') targetCat = 'funny_quirky';
        else if (cat.name === 'Épica e Dramática') targetCat = 'epic_monumental';
        else if (cat.name === 'Filmes de animação 3d') targetCat = 'funny_quirky';
        else targetCat = 'curiosity_flow';
      }

      const isRockOrHeavy = /fire_breather|demilitarized_zone|loitering|tidal_wave|2nd mix|sugar_zone|neffex|meixsell|guitar|rock|punk|metal/i.test(f);
      const isBeatHeavy = EXCLUDED_BEAT_TRACKS.has(f) || isRockOrHeavy;
      const isComedic = cat.name === 'Engraçada' || cat.name === 'Filmes de animação 3d' || targetCat === 'funny_quirky';
      const documentarySuitable = !isBeatHeavy && !isComedic;

      list.push({
        filename: f,
        folder: cat.name,
        relPath: `Musicas/${cat.name}/${f}`.replace(/\\/g, '/'),
        category: targetCat,
        categoryName: MUSIC_CATEGORIES[targetCat]?.name || cat.name,
        mood: meta?.mood || cat.name,
        energy: meta?.energy || 'medium',
        bestFor: meta?.bestFor || `Vídeos com atmosfera de ${cat.name}`,
        instruments: meta?.instruments || ['Instrumental'],
        tags: meta?.tags || [cat.name.toLowerCase()],
        beatHeavy: isBeatHeavy,
        documentarySuitable
      });
    }
  }

  return list;
}
