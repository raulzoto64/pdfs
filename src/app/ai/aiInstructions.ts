/**
 * ============================================
 * CEREBRO DE LA IA - INSTRUCCIONES CENTRALIZADAS
 * ============================================
 * 
 * Este archivo contiene TODAS las instrucciones, prompts y configuraciones
 * de la IA. Modifica este archivo para cambiar el comportamiento de la IA
 * sin tocar la logica del servicio.
 * 
 * ESTRUCTURA:
 * - SYSTEM_PROMPTS: Prompts base del sistema
 * - TEMPLATES: Plantillas de prompts por tipo de accion
 * - CONFIG: Configuracion del modelo
 * - VALIDATORS: Validadores de respuestas
 * - COLOR_PALETTES: Paletas de colores predefinidas
 * - STYLE_PRESETS: Estilos predefinidos
 */

// ============================================
// CONFIGURACION DEL MODELO
// ============================================
export const AI_CONFIG = {
  model: 'gemini-pro',
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.9,
  topK: 40,
  
  // Timeouts
  requestTimeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  
  // Feature flags
  enableFallback: true,
  enableCaching: true,
  cacheExpiration: 300000, // 5 minutos
};

// ============================================
// PROMPTS DEL SISTEMA
// ============================================
export const SYSTEM_PROMPTS = {
  // Prompt base para todas las interacciones
  base: `Eres un asistente experto en diseno de documentos PDF profesionales. 
Tu objetivo es ayudar a crear contenido visual atractivo y bien estructurado.
Responde siempre en formato JSON valido.
Usa un tono profesional pero accesible.
Prioriza la claridad y el impacto visual.`,

  // Prompt para generacion de secciones
  sectionGenerator: `Eres un disenador experto de secciones de documentos.
Genera contenido que sea:
- Visualmente atractivo
- Profesional y corporativo
- Facil de leer y escanear
- Adaptable a diferentes contextos

Responde SIEMPRE en formato JSON con la estructura especificada.`,

  // Prompt para generacion de texto
  textGenerator: `Eres un copywriter profesional especializado en contenido corporativo.
Genera texto que sea:
- Conciso y directo
- Impactante y memorable
- Adaptado al contexto de negocio
- Libre de errores gramaticales

Usa un tono profesional pero accesible.`,

  // Prompt para sugerencia de colores
  colorAdvisor: `Eres un experto en teoria del color y diseno visual.
Sugiere paletas de colores que:
- Sean armoniosas y profesionales
- Transmitan la emocion deseada
- Tengan buen contraste y accesibilidad
- Funcionen bien en impresion y digital

Responde con codigos HEX validos.`,

  // Prompt para layouts
  layoutDesigner: `Eres un experto en diseno de layouts y composicion visual.
Sugiere estructuras que:
- Sean equilibradas y armoniosas
- Guien la vista del lector
- Maximicen la legibilidad
- Se adapten al tipo de contenido`,

  // Prompt para imagenes
  imageAdvisor: `Eres un director de arte experto en seleccion de imagenes.
Sugiere imagenes que:
- Complementen el mensaje
- Sean profesionales y de alta calidad
- Tengan coherencia visual con el documento
- Eviten cliches y stock obvio`,
};

// ============================================
// PLANTILLAS DE PROMPTS
// ============================================
export const PROMPT_TEMPLATES = {
  // Generar seccion completa
  generateSection: (params: {
    type: string;
    context: string;
    style?: string;
  }) => `
${SYSTEM_PROMPTS.sectionGenerator}

Genera una seccion de tipo "${params.type}" con el siguiente contexto:
${params.context}

${params.style ? `Estilo deseado: ${params.style}` : ''}

Responde en JSON con esta estructura:
{
  "title": "string",
  "subtitle": "string (opcional)",
  "description": "string",
  "content": {
    "items": ["array de contenido relevante"],
    "highlights": ["puntos clave a resaltar"]
  },
  "style": {
    "primaryColor": "#hexcolor",
    "secondaryColor": "#hexcolor",
    "layout": "grid | list | cards | centered"
  }
}`,

  // Mejorar texto existente
  improveText: (params: {
    originalText: string;
    instruction: string;
    tone?: string;
  }) => `
${SYSTEM_PROMPTS.textGenerator}

Texto original:
"${params.originalText}"

Instruccion: ${params.instruction}
${params.tone ? `Tono deseado: ${params.tone}` : ''}

Responde en JSON:
{
  "improvedText": "string",
  "alternatives": ["array de versiones alternativas"],
  "changes": ["lista de cambios realizados"]
}`,

  // Sugerir paleta de colores
  suggestColors: (params: {
    theme: string;
    mood?: string;
    baseColor?: string;
  }) => `
${SYSTEM_PROMPTS.colorAdvisor}

Tema: ${params.theme}
${params.mood ? `Emocion/mood: ${params.mood}` : ''}
${params.baseColor ? `Color base a partir de: ${params.baseColor}` : ''}

Responde en JSON:
{
  "palette": {
    "primary": "#hexcolor",
    "secondary": "#hexcolor",
    "accent": "#hexcolor",
    "background": "#hexcolor",
    "text": "#hexcolor"
  },
  "variations": [
    {
      "name": "nombre de variacion",
      "colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"]
    }
  ],
  "reasoning": "explicacion de por que esta paleta funciona"
}`,

  // Generar titulo impactante
  generateTitle: (params: {
    context: string;
    type: string;
    keywords?: string[];
  }) => `
${SYSTEM_PROMPTS.textGenerator}

Genera un titulo impactante para: ${params.context}
Tipo de seccion: ${params.type}
${params.keywords ? `Palabras clave a incluir: ${params.keywords.join(', ')}` : ''}

Responde en JSON:
{
  "title": "string - titulo principal",
  "alternatives": ["3-5 alternativas"],
  "subtitle": "string - subtitulo sugerido (opcional)"
}`,

  // Sugerir layout
  suggestLayout: (params: {
    contentType: string;
    items: number;
    purpose: string;
  }) => `
${SYSTEM_PROMPTS.layoutDesigner}

Tipo de contenido: ${params.contentType}
Numero de elementos: ${params.items}
Proposito: ${params.purpose}

Responde en JSON:
{
  "layout": "grid | list | cards | masonry | centered | split",
  "columns": number,
  "spacing": "compact | normal | spacious",
  "alignment": "left | center | right",
  "recommendations": ["sugerencias adicionales"]
}`,

  // Analizar y mejorar seccion
  analyzeSection: (params: {
    sectionData: object;
  }) => `
${SYSTEM_PROMPTS.base}

Analiza esta seccion y sugiere mejoras:
${JSON.stringify(params.sectionData, null, 2)}

Responde en JSON:
{
  "score": number (1-10),
  "strengths": ["puntos fuertes"],
  "improvements": ["mejoras sugeridas"],
  "suggestedChanges": {
    "content": {},
    "style": {},
    "layout": {}
  }
}`,

  // Generar contenido para cards
  generateCards: (params: {
    topic: string;
    count: number;
    style: string;
  }) => `
${SYSTEM_PROMPTS.sectionGenerator}

Genera ${params.count} cards sobre: ${params.topic}
Estilo: ${params.style}

Responde en JSON:
{
  "cards": [
    {
      "title": "string",
      "description": "string",
      "icon": "nombre de icono sugerido",
      "color": "#hexcolor"
    }
  ]
}`,

  // Generar descripcion de imagen
  describeImage: (params: {
    context: string;
    style: string;
  }) => `
${SYSTEM_PROMPTS.imageAdvisor}

Contexto: ${params.context}
Estilo visual: ${params.style}

Sugiere una imagen que encaje. Responde en JSON:
{
  "description": "descripcion detallada de la imagen ideal",
  "keywords": ["palabras clave para busqueda"],
  "style": "fotografia | ilustracion | abstracto | iconico",
  "mood": "descripcion del mood visual",
  "avoidTerms": ["terminos a evitar en la busqueda"]
}`,
};

// ============================================
// PALETAS DE COLORES PREDEFINIDAS
// ============================================
export const COLOR_PALETTES = {
  corporativo: {
    name: 'Corporativo',
    description: 'Profesional y confiable',
    colors: {
      primary: '#1a365d',
      secondary: '#2c5282',
      accent: '#3182ce',
      background: '#f7fafc',
      text: '#1a202c',
    },
  },
  
  moderno: {
    name: 'Moderno',
    description: 'Limpio y contemporaneo',
    colors: {
      primary: '#0f172a',
      secondary: '#334155',
      accent: '#6366f1',
      background: '#f8fafc',
      text: '#1e293b',
    },
  },
  
  tecnologico: {
    name: 'Tecnologico',
    description: 'Innovador y digital',
    colors: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      accent: '#38bdf8',
      background: '#0f172a',
      text: '#f1f5f9',
    },
  },
  
  naturaleza: {
    name: 'Naturaleza',
    description: 'Organico y sostenible',
    colors: {
      primary: '#166534',
      secondary: '#15803d',
      accent: '#22c55e',
      background: '#f0fdf4',
      text: '#14532d',
    },
  },
  
  elegante: {
    name: 'Elegante',
    description: 'Sofisticado y premium',
    colors: {
      primary: '#1c1917',
      secondary: '#44403c',
      accent: '#d4af37',
      background: '#fafaf9',
      text: '#292524',
    },
  },
  
  vibrante: {
    name: 'Vibrante',
    description: 'Energico y llamativo',
    colors: {
      primary: '#dc2626',
      secondary: '#ea580c',
      accent: '#f59e0b',
      background: '#fffbeb',
      text: '#1c1917',
    },
  },
  
  minimalista: {
    name: 'Minimalista',
    description: 'Simple y enfocado',
    colors: {
      primary: '#18181b',
      secondary: '#3f3f46',
      accent: '#71717a',
      background: '#ffffff',
      text: '#09090b',
    },
  },
  
  creativo: {
    name: 'Creativo',
    description: 'Artistico y expresivo',
    colors: {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      accent: '#ec4899',
      background: '#fdf4ff',
      text: '#1e1b4b',
    },
  },
  
  salud: {
    name: 'Salud',
    description: 'Bienestar y cuidado',
    colors: {
      primary: '#0d9488',
      secondary: '#14b8a6',
      accent: '#2dd4bf',
      background: '#f0fdfa',
      text: '#134e4a',
    },
  },
  
  financiero: {
    name: 'Financiero',
    description: 'Confianza y estabilidad',
    colors: {
      primary: '#1e3a5f',
      secondary: '#0369a1',
      accent: '#0891b2',
      background: '#f0f9ff',
      text: '#0c4a6e',
    },
  },
};

// ============================================
// ESTILOS PREDEFINIDOS
// ============================================
export const STYLE_PRESETS = {
  // Estilos de tipografia
  typography: {
    modern: {
      fontFamily: 'Inter, sans-serif',
      headingWeight: 700,
      bodyWeight: 400,
      letterSpacing: '-0.02em',
    },
    classic: {
      fontFamily: 'Georgia, serif',
      headingWeight: 600,
      bodyWeight: 400,
      letterSpacing: '0',
    },
    bold: {
      fontFamily: 'Montserrat, sans-serif',
      headingWeight: 800,
      bodyWeight: 500,
      letterSpacing: '-0.03em',
    },
    elegant: {
      fontFamily: 'Playfair Display, serif',
      headingWeight: 600,
      bodyWeight: 400,
      letterSpacing: '0.02em',
    },
  },
  
  // Estilos de sombras
  shadows: {
    none: 'none',
    subtle: '0 1px 3px rgba(0,0,0,0.12)',
    medium: '0 4px 6px rgba(0,0,0,0.1)',
    strong: '0 10px 25px rgba(0,0,0,0.15)',
    glow: '0 0 20px rgba(99,102,241,0.3)',
  },
  
  // Estilos de bordes
  borders: {
    none: { radius: 0, width: 0 },
    subtle: { radius: 4, width: 1 },
    rounded: { radius: 8, width: 1 },
    pill: { radius: 9999, width: 1 },
    bold: { radius: 12, width: 2 },
  },
  
  // Espaciado
  spacing: {
    compact: { padding: 16, gap: 8 },
    normal: { padding: 24, gap: 16 },
    spacious: { padding: 32, gap: 24 },
    dramatic: { padding: 48, gap: 32 },
  },
};

// ============================================
// VALIDADORES DE RESPUESTAS
// ============================================
export const VALIDATORS = {
  // Validar que sea JSON valido
  isValidJSON: (response: string): boolean => {
    try {
      JSON.parse(response);
      return true;
    } catch {
      return false;
    }
  },
  
  // Validar codigo de color HEX
  isValidHexColor: (color: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  },
  
  // Validar respuesta de seccion
  isValidSectionResponse: (response: object): boolean => {
    const required = ['title', 'description'];
    return required.every(key => key in response);
  },
  
  // Validar respuesta de paleta
  isValidPaletteResponse: (response: object): boolean => {
    const r = response as Record<string, unknown>;
    if (!r.palette || typeof r.palette !== 'object') return false;
    const palette = r.palette as Record<string, unknown>;
    const required = ['primary', 'secondary', 'accent'];
    return required.every(key => 
      key in palette && 
      VALIDATORS.isValidHexColor(palette[key] as string)
    );
  },
  
  // Validar respuesta de texto
  isValidTextResponse: (response: object): boolean => {
    const r = response as Record<string, unknown>;
    return typeof r.improvedText === 'string' && (r.improvedText as string).length > 0;
  },
  
  // Validar respuesta de layout
  isValidLayoutResponse: (response: object): boolean => {
    const r = response as Record<string, unknown>;
    const validLayouts = ['grid', 'list', 'cards', 'masonry', 'centered', 'split'];
    return typeof r.layout === 'string' && validLayouts.includes(r.layout as string);
  },
};

// ============================================
// MENSAJES DE ERROR
// ============================================
export const ERROR_MESSAGES = {
  emptyPrompt: 'El prompt no puede estar vacio',
  invalidResponse: 'La respuesta de la IA no tiene el formato esperado',
  networkError: 'Error de conexion. Verifica tu internet e intenta de nuevo',
  timeout: 'La solicitud tardo demasiado. Intenta con un prompt mas corto',
  rateLimited: 'Demasiadas solicitudes. Espera un momento e intenta de nuevo',
  serverError: 'Error del servidor. Intenta de nuevo mas tarde',
  invalidColor: 'El color generado no es valido',
  invalidJSON: 'La respuesta no es JSON valido',
  fallbackUsed: 'Se uso contenido predeterminado debido a un error de IA',
};

// ============================================
// CONTENIDO DE FALLBACK
// ============================================
export const FALLBACK_CONTENT = {
  section: {
    title: 'Titulo de Seccion',
    subtitle: 'Subtitulo descriptivo',
    description: 'Descripcion del contenido de esta seccion. Edita este texto para personalizarlo.',
    style: {
      primaryColor: '#1a365d',
      secondaryColor: '#4a5568',
      layout: 'centered',
    },
  },
  
  colors: {
    palette: COLOR_PALETTES.corporativo.colors,
  },
  
  text: {
    improvedText: 'Texto mejorado por defecto',
    alternatives: [],
  },
  
  cards: [
    { title: 'Card 1', description: 'Descripcion de la card', icon: 'star', color: '#3182ce' },
    { title: 'Card 2', description: 'Descripcion de la card', icon: 'heart', color: '#38a169' },
    { title: 'Card 3', description: 'Descripcion de la card', icon: 'bolt', color: '#d69e2e' },
  ],
};

// ============================================
// EXPORTACION POR DEFECTO
// ============================================
export const AI_INSTRUCTIONS = {
  config: AI_CONFIG,
  systemPrompts: SYSTEM_PROMPTS,
  templates: PROMPT_TEMPLATES,
  colorPalettes: COLOR_PALETTES,
  stylePresets: STYLE_PRESETS,
  validators: VALIDATORS,
  errorMessages: ERROR_MESSAGES,
  fallbackContent: FALLBACK_CONTENT,
};

export default AI_INSTRUCTIONS;
