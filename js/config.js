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
    id: "yinyang",
    name: "El Yin y el Yang",
    icon: "☀️🌙",
    rarity: 0.40,
    color: "#e8c87a",
    desc: "Un sol y una luna danzan eternamente en el cielo de este mundo. Los ciclos son predecibles, la vida es equilibrada y diversa.",
    skyDesc: "El cielo alterna entre el oro del sol y la plata de la luna en ciclos regulares.",
    biomeEffect: "La vida aquí sigue ritmos conocidos. Florecen todas las formas de existencia."
  },
  {
    id: "twin_suns",
    name: "El Ardiente",
    icon: "☀️☀️",
    rarity: 0.25,
    color: "#ff9944",
    desc: "Dos soles cruzan el cielo. Casi no hay noche. Las sombras son dobles y difusas.",
    skyDesc: "Dos astros ardientes recorren el firmamento. El crepúsculo apenas dura minutos.",
    biomeEffect: "Los desiertos dominan el interior. Los bosques crecen densos en los polos. La vida es resistente y de colores oscuros para absorber menos calor."
  },
  {
    id: "twin_moons",
    name: "El Plateado",
    icon: "🌙🌙",
    rarity: 0.20,
    color: "#a0c8e8",
    desc: "Dos lunas bañan este mundo en una luz fría y plateada. El día es tenue; la noche, casi tan brillante como el crepúsculo.",
    skyDesc: "Las dos lunas crean mareas dobles y su luz plateada tiñe todo de azul y plata.",
    biomeEffect: "La vida es principalmente nocturna. Las plantas tienen hojas translúcidas o plateadas. Los animales tienen ojos enormes y sentidos agudizados."
  },
  {
    id: "no_sun",
    name: "El Sin Sol",
    icon: "🌙✨",
    rarity: 0.12,
    color: "#6680cc",
    desc: "No hay sol. Las lunas de este mundo emiten su propia luz fría y constante. Es un mundo de penumbra eterna y silencio.",
    skyDesc: "Un cielo de penumbra perpetua iluminado por lunas que brillan con luz propia como pequeñas estrellas.",
    biomeEffect: "La vida es bioluminiscente. No existen plantas fotosintéticas; todo depende de energía geotérmica o química. Los seres son pálidos, ciegos o con sentidos alternativos."
  },
  {
    id: "impossible",
    name: "El Imposible",
    icon: "🌀⚡",
    rarity: 0.03,
    color: "#cc44ff",
    desc: "Las reglas de este cielo desafían la comprensión. Un eclipse eterno, anillos que cruzan el firmamento, o astros que orbitan sin sentido aparente.",
    skyDesc: "El cielo de este mundo sigue reglas propias que ningún cartógrafo ha podido explicar del todo.",
    biomeEffect: "La vida aquí es completamente ajena a cualquier otra. Los visitantes feéricos reportan desorientación y pérdida del sentido del tiempo."
  }
];
