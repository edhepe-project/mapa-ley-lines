export const CHUNK_SIZE          = 4000;
export const MAX_CACHED_CHUNKS   = 400;
export const CHUNK_BUFFER        = 2;
export const NODE_CONNECT_RADIUS = 5600;
export const NODE_MAX_LINKS      = 2;

export const FLAVOR = [
  "El flujo de maná aquí es inestable; los cartógrafos arcanos recomiendan precaución.",
  "Una resonancia antigua vibra bajo la corteza del mundo en este punto.",
  "Los pastores nómadas evitan este nodo tras la última tormenta de aurora.",
  "Se registran ecos de una civilización anterior a la última era glacial.",
  "El nodo pulsa en sincronía con las mareas del continente central.",
  "Runas de origen desconocido rodean la base de este cruce de líneas.",
  "Los exploradores reportan agujas de brújula girando sin control cerca de aquí.",
  "Una grieta dimensional menor se detecta a 40 brazas bajo el nodo."
];

export const BIOME_TYPES = [
  { id: "forest",   name: "Bosque",      color: "58,122,74",   resource: "Madera, caza y agua dulce",        tier: 2 },
  { id: "plains",   name: "Llanura",     color: "150,168,74",  resource: "Cultivos y pastoreo",               tier: 1 },
  { id: "mountain", name: "Montaña",     color: "120,108,102", resource: "Minerales y metales pesados",       tier: 3 },
  { id: "desert",   name: "Desierto",    color: "196,168,110", resource: "Cristales raros, escasa agua",      tier: 2 },
  { id: "swamp",    name: "Pantano",     color: "70,92,66",    resource: "Componentes alquímicos",            tier: 2 },
  { id: "tundra",   name: "Tundra",      color: "180,200,210", resource: "Recursos escasos, caza menor",      tier: 1 },
  { id: "volcanic", name: "Volcánico",   color: "168,66,40",   resource: "Energía geotérmica, obsidiana",     tier: 3 },
  { id: "coast",    name: "Costa",       color: "72,120,150",  resource: "Pesca y rutas comerciales",         tier: 2 }
];
export const TIER_LABEL = ["", "★☆☆ Bajo", "★★☆ Medio", "★★★ Alto"];

export const NODE_TYPES = [
  { id: "confluence", name: "Confluencia", color: "94,241,255",  desc: "un cruce estable de líneas antiguas" },
  { id: "spring",     name: "Manantial",   color: "150,255,180", desc: "un lugar de descanso donde la tierra florece" },
  { id: "fracture",   name: "Fractura",    color: "255,120,120", desc: "una zona corrompida, peligrosa de atravesar" },
  { id: "guardian",   name: "Guardián",    color: "255,207,94",  desc: "un hito antiguo tallado por los primeros seres" }
];
export const NODE_SUFFIX = ["Nexo","Sendero","Umbral","Pilar","Santuario","Ruina","Ecos","Corona"];

export const ROUTE_COLORS = [
  { hex: "#ffcf5e", rgb: "255,207,94" },
  { hex: "#5ef1ff", rgb: "94,241,255" },
  { hex: "#ff6e6e", rgb: "255,110,110" },
  { hex: "#9dff8a", rgb: "157,255,138" },
  { hex: "#c68aff", rgb: "198,138,255" }
];

export const NAME_A = ["Kor","Val","Thal","Zar","Nyx","Sel","Ith","Dra","Vel","Mor","Ash","Bryn","Fenr","Quel","Sar","Ol"];
export const NAME_B = ["an","eth","or","ia","um","yn","ath","ir","os","ael","und","esh","ora","ien"];

export const LEAGUE_UNITS = 60;
export const LEAGUES_PER_DAY = 9;

export const EARTH_TEMPLATES = [
  // South America (Ancho norte, afilado sur)
  // Ángulos: 0(E), 45(SE), 90(S), 135(SW), 180(W), 225(NW), 270(N), 315(NE)
  [0.8, 0.4, 0.2, 0.4, 0.6, 1.1, 1.2, 1.0],
  // Africa (Bulto oeste/norte, cuerno este, afilado sur)
  [0.7, 0.5, 0.4, 0.5, 0.9, 1.0, 1.0, 1.1],
  // North America (Ancho norte, cola sur)
  [0.7, 0.6, 0.3, 0.5, 0.8, 1.1, 1.2, 0.8],
  // Eurasia (Macizo, extendido este-oeste)
  [1.0, 0.9, 0.8, 0.7, 0.9, 1.0, 1.0, 1.2],
  // Australia (Redondeado, chato)
  [0.8, 0.7, 0.7, 0.7, 0.8, 0.7, 0.8, 0.9],
  // Antarctica (Ovalado horizontal)
  [1.1, 0.8, 0.4, 0.7, 1.1, 0.8, 0.4, 0.7]
];

// --- CONFIGURACIONES CELESTES ---
// Cada continente tiene su propio cielo. La rareza determina la probabilidad de aparición.
export const CELESTIAL_CONFIGS = [
  {
    id: "normal",
    name: "Normal",
    icon: "☀️🌙",
    rarity: 0.45,
    color: "#e8c87a",
    desc: "Sistemas equilibrados. Puede tener 1 sol y 1 luna, o incluso 2 soles y 2 lunas en perfecta órbita.",
    skyDesc: "El cielo alterna armónicamente entre el día y la noche. Las estaciones son estables y predecibles.",
    biomeEffect: "La vida aquí sigue ritmos conocidos. Florecen todas las formas de existencia.",
    allowedBiomes: ["forest", "plains", "mountain", "swamp", "coast"]
  },
  {
    id: "ardiente",
    name: "Ardiente",
    icon: "☀️☀️",
    rarity: 0.15,
    color: "#ff9944",
    desc: "Mundos asolados por 2 o más soles masivos. Casi no existe la noche.",
    skyDesc: "Múltiples astros ardientes recorren el firmamento. El crepúsculo apenas dura minutos.",
    biomeEffect: "Los desiertos dominan el interior. La vida es resistente y de colores oscuros para absorber menos calor.",
    allowedBiomes: ["desert", "volcanic", "mountain", "coast"]
  },
  {
    id: "nocturno",
    name: "Nocturno",
    icon: "🌙🌙",
    rarity: 0.15,
    color: "#6680cc",
    desc: "Dominado por 2 o más lunas gigantes. La luz solar es débil o muy lejana.",
    skyDesc: "Cielo de penumbra perpetua, iluminado por lunas enormes que brillan en la noche.",
    biomeEffect: "La vida es nocturna y bioluminiscente. Gran dependencia del calor del subsuelo.",
    allowedBiomes: ["tundra", "volcanic", "swamp", "mountain", "coast"]
  },
  {
    id: "anillado",
    name: "Anillado",
    icon: "🪐",
    rarity: 0.08,
    color: "#d4c5b0",
    desc: "El planeta posee anillos masivos de roca y hielo que cruzan todo el firmamento.",
    skyDesc: "Un arco gigante fragmenta el cielo. Lluvias de estrellas fugaces caen cada noche.",
    biomeEffect: "La sombra de los anillos crea inviernos perpetuos. Predominan los climas fríos y ventosos.",
    allowedBiomes: ["tundra", "mountain", "coast", "plains", "forest"]
  },
  {
    id: "nebular",
    name: "Nebular",
    icon: "🌌",
    rarity: 0.06,
    color: "#44ffaa",
    desc: "Sistema inmerso en una nebulosa planetaria. Radiación y gases coloridos llenan el espacio.",
    skyDesc: "El cielo no es negro, sino un lienzo vibrante de gases morados y esmeraldas.",
    biomeEffect: "Tormentas eléctricas constantes. La flora presenta colores neón y formas mutadas.",
    allowedBiomes: ["swamp", "forest", "mountain", "coast"]
  },
  {
    id: "agonizante",
    name: "Agonizante",
    icon: "🔴",
    rarity: 0.05,
    color: "#ff3333",
    desc: "El sol de este mundo es una Gigante Roja a punto de morir, expandida inmensamente.",
    skyDesc: "Un sol rojo y opresivo ocupa la mitad del cielo, pareciendo tragar el horizonte.",
    biomeEffect: "Luz roja y lúgubre todo el día. Tierras secas y antiguas de un mundo al borde del colapso.",
    allowedBiomes: ["desert", "volcanic", "mountain", "coast"]
  },
  {
    id: "devorado",
    name: "Devorado",
    icon: "🕳️",
    rarity: 0.03,
    color: "#a327db",
    desc: "El planeta orbita peligrosamente cerca de un agujero negro o pulsar.",
    skyDesc: "Un disco de acreción ardiente ilumina el cielo, distorsionando las estrellas lejanas.",
    biomeEffect: "Gravedad inestable. La flora crece en espirales extrañas y el flujo del tiempo se percibe alterado.",
    allowedBiomes: ["tundra", "swamp", "mountain", "volcanic"]
  },
  {
    id: "vacio",
    name: "Vacío",
    icon: "⬛",
    rarity: 0.02,
    color: "#555555",
    desc: "Un planeta errante en el espacio profundo, desvinculado de cualquier estrella.",
    skyDesc: "Un abismo negro y absoluto, salpicado tenuemente por estrellas lejanas inalcanzables.",
    biomeEffect: "La superficie es un yermo congelado. La vida solo existe refugiada en grietas geotérmicas.",
    allowedBiomes: ["tundra", "volcanic"]
  },
  {
    id: "raro",
    name: "Raro",
    icon: "🌀⚡",
    rarity: 0.009999, // ~1%
    color: "#cc44ff",
    desc: "Las reglas cósmicas desafían la comprensión. Eclipses eternos u órbitas imposibles.",
    skyDesc: "El cielo de este mundo sigue reglas propias que ningún cartógrafo ha podido explicar.",
    biomeEffect: "La vida aquí es completamente ajena y caótica. Los viajeros reportan pérdida del sentido de la realidad.",
    allowedBiomes: ["forest", "plains", "mountain", "desert", "swamp", "tundra", "volcanic", "coast"]
  },
  {
    id: "absoluto",
    name: "El Absoluto",
    icon: "👁️💠",
    rarity: 0.000001, // 1 en un millón
    color: "#ffffff",
    desc: "El origen, el fin o el centro del universo de los Primeros. Una rareza estadística insondable.",
    skyDesc: "No hay cielo. Hay un vacío blanco e infinito, una luz pura que parece observarlo todo.",
    biomeEffect: "La vida es perfecta, cristalina y eternamente inmutable. No hay decaimiento ni entropía.",
    allowedBiomes: ["mountain", "plains", "coast"]
  }
];
