/**
 * INSTRUCCIONES DE IA PARA EL EDITOR DE PDF
 * 
 * Este archivo contiene todas las instrucciones, prompts y configuraciones
 * para la inteligencia artificial del editor. Modificar este archivo para
 * cambiar el comportamiento de la IA sin tocar el codigo del componente.
 * 
 * Estructura:
 * - SYSTEM_PROMPTS: Prompts de sistema para diferentes contextos
 * - GENERATION_TEMPLATES: Plantillas para generar contenido
 * - COLOR_INSTRUCTIONS: Instrucciones para generacion de colores
 * - TEXT_INSTRUCTIONS: Instrucciones para generacion de texto
 * - LAYOUT_INSTRUCTIONS: Instrucciones para layouts
 * - IMAGE_INSTRUCTIONS: Instrucciones para imagenes
 * - VALIDATION_RULES: Reglas de validacion de respuestas
 */

// ============================================================================
// PROMPTS DE SISTEMA
// ============================================================================

export const SYSTEM_PROMPTS = {
  // Prompt principal del asistente de edicion
  EDITOR_ASSISTANT: `Eres un asistente experto en diseno grafico y creacion de documentos PDF profesionales.
Tu objetivo es ayudar al usuario a crear contenido visual atractivo y profesional.

Reglas:
1. Siempre responde en espanol
2. Genera contenido conciso y relevante
3. Usa un tono profesional pero accesible
4. Prioriza la claridad y legibilidad
5. Considera el contexto de uso (corporativo, educativo, marketing, etc.)

Capacidades:
- Generar titulos impactantes
- Crear descripciones persuasivas
- Sugerir combinaciones de colores
- Proponer layouts efectivos
- Optimizar contenido para PDF`,

  // Prompt para generacion de texto
  TEXT_GENERATION: `Eres un copywriter experto especializado en contenido para documentos profesionales.

Instrucciones:
1. Genera texto claro, conciso y profesional
2. Adapta el tono segun el tipo de documento
3. Usa estructura jerarquica (titulos, subtitulos, cuerpo)
4. Incluye llamadas a la accion cuando sea apropiado
5. Evita jerga excesiva o lenguaje complicado

Formatos de respuesta:
- Para titulos: maximo 10 palabras, impactante
- Para subtitulos: maximo 15 palabras, descriptivo
- Para cuerpo: parrafos cortos, faciles de leer
- Para CTAs: verbos activos, urgencia moderada`,

  // Prompt para sugerencias de colores
  COLOR_SUGGESTION: `Eres un experto en teoria del color y diseno de marca.

Instrucciones:
1. Sugiere paletas de colores armonicas
2. Considera la psicologia del color
3. Asegura contraste adecuado para legibilidad
4. Proporciona colores en formato HEX
5. Incluye variantes claras y oscuras

Tipos de armonias:
- Complementaria: colores opuestos en el circulo cromatico
- Analogos: colores adyacentes
- Triadica: tres colores equidistantes
- Monocromatica: variaciones de un color`,

  // Prompt para layouts
  LAYOUT_DESIGN: `Eres un disenador UI/UX especializado en documentos impresos y digitales.

Instrucciones:
1. Propone layouts equilibrados y profesionales
2. Considera la jerarquia visual
3. Respeta margenes y espacios en blanco
4. Optimiza para lectura (patron F o Z)
5. Asegura consistencia en todo el documento

Principios:
- Alineacion: todos los elementos deben estar alineados
- Contraste: diferencia clara entre elementos
- Repeticion: consistencia en estilos
- Proximidad: agrupar elementos relacionados`,
};

// ============================================================================
// PLANTILLAS DE GENERACION
// ============================================================================

export const GENERATION_TEMPLATES = {
  // Plantilla para generar titulos
  TITLE: {
    prompt: (context: string, style: string) => `
Genera un titulo ${style} para: ${context}

Requisitos:
- Maximo 8 palabras
- Impactante y memorable
- Profesional
- Sin signos de exclamacion excesivos

Responde SOLO con el titulo, sin explicaciones.`,
    
    styles: ['corporativo', 'creativo', 'minimalista', 'llamativo', 'elegante'],
    maxLength: 80,
  },

  // Plantilla para generar subtitulos
  SUBTITLE: {
    prompt: (context: string, title: string) => `
Genera un subtitulo para complementar el titulo: "${title}"
Contexto: ${context}

Requisitos:
- Maximo 15 palabras
- Complementa el titulo sin repetir
- Agrega informacion util
- Mantiene el mismo tono

Responde SOLO con el subtitulo.`,
    
    maxLength: 120,
  },

  // Plantilla para generar parrafos
  PARAGRAPH: {
    prompt: (topic: string, tone: string, length: 'corto' | 'medio' | 'largo') => `
Genera un parrafo ${length} sobre: ${topic}
Tono: ${tone}

Longitudes:
- corto: 2-3 oraciones
- medio: 4-5 oraciones
- largo: 6-8 oraciones

Requisitos:
- Informativo y relevante
- Facil de leer
- Sin relleno innecesario

Responde SOLO con el parrafo.`,
    
    tones: ['formal', 'casual', 'tecnico', 'persuasivo', 'informativo'],
  },

  // Plantilla para CTAs (Call to Action)
  CTA: {
    prompt: (action: string, context: string) => `
Genera un CTA (llamada a la accion) para: ${action}
Contexto: ${context}

Requisitos:
- Maximo 5 palabras
- Verbo activo al inicio
- Crear urgencia sin ser agresivo
- Claro y directo

Ejemplos de formato:
- "Comienza ahora"
- "Descubre mas"
- "Solicita tu demo"

Responde SOLO con el CTA.`,
    
    maxLength: 40,
  },

  // Plantilla para listas
  LIST: {
    prompt: (topic: string, count: number, style: 'bullets' | 'numbered') => `
Genera una lista de ${count} items sobre: ${topic}
Estilo: ${style}

Requisitos:
- Cada item: maximo 10 palabras
- Items paralelos en estructura
- Comenzar con verbos o sustantivos
- Ordenados por importancia o logica

Responde con la lista, un item por linea.`,
  },
};

// ============================================================================
// INSTRUCCIONES DE COLOR
// ============================================================================

export const COLOR_INSTRUCTIONS = {
  // Generar paleta basada en industria
  BY_INDUSTRY: {
    tecnologia: {
      primary: ['#2563eb', '#3b82f6', '#0ea5e9'],
      secondary: ['#1e293b', '#334155', '#64748b'],
      accent: ['#06b6d4', '#14b8a6', '#22d3ee'],
      description: 'Azules y cianes transmiten innovacion y confianza',
    },
    salud: {
      primary: ['#059669', '#10b981', '#34d399'],
      secondary: ['#f8fafc', '#f1f5f9', '#e2e8f0'],
      accent: ['#2563eb', '#3b82f6', '#60a5fa'],
      description: 'Verdes y blancos transmiten salud y limpieza',
    },
    finanzas: {
      primary: ['#1e3a5f', '#1e40af', '#1e3a8a'],
      secondary: ['#fafafa', '#f5f5f5', '#e5e5e5'],
      accent: ['#ca8a04', '#eab308', '#facc15'],
      description: 'Azules oscuros y dorados transmiten solidez y prestigio',
    },
    educacion: {
      primary: ['#7c3aed', '#8b5cf6', '#a78bfa'],
      secondary: ['#fef3c7', '#fde68a', '#fcd34d'],
      accent: ['#f97316', '#fb923c', '#fdba74'],
      description: 'Purpuras y amarillos estimulan creatividad y aprendizaje',
    },
    alimentacion: {
      primary: ['#dc2626', '#ef4444', '#f87171'],
      secondary: ['#fef9c3', '#fef08a', '#fde047'],
      accent: ['#16a34a', '#22c55e', '#4ade80'],
      description: 'Rojos y amarillos estimulan apetito, verdes frescura',
    },
    moda: {
      primary: ['#171717', '#262626', '#404040'],
      secondary: ['#fafafa', '#f5f5f5', '#e5e5e5'],
      accent: ['#be185d', '#db2777', '#ec4899'],
      description: 'Blanco y negro elegantes con acentos vibrantes',
    },
  },

  // Reglas de armonia
  HARMONY_RULES: {
    complementary: (baseHue: number) => [(baseHue + 180) % 360],
    analogous: (baseHue: number) => [(baseHue - 30 + 360) % 360, (baseHue + 30) % 360],
    triadic: (baseHue: number) => [(baseHue + 120) % 360, (baseHue + 240) % 360],
    tetradic: (baseHue: number) => [
      (baseHue + 90) % 360,
      (baseHue + 180) % 360,
      (baseHue + 270) % 360,
    ],
    splitComplementary: (baseHue: number) => [
      (baseHue + 150) % 360,
      (baseHue + 210) % 360,
    ],
  },

  // Contraste minimo para accesibilidad
  ACCESSIBILITY: {
    normalText: 4.5, // Ratio minimo para texto normal
    largeText: 3.0, // Ratio minimo para texto grande
    uiComponents: 3.0, // Ratio minimo para componentes UI
  },

  // Prompt para sugerir colores
  SUGGESTION_PROMPT: (context: string, mood: string, existingColors: string[]) => `
Sugiere una paleta de colores para: ${context}
Mood deseado: ${mood}
Colores existentes: ${existingColors.join(', ')}

Requisitos:
1. 5 colores en formato HEX
2. Un color primario dominante
3. Un color secundario de soporte
4. Un color de acento
5. Dos neutros (claro y oscuro)

Asegura:
- Contraste WCAG AA minimo
- Armonia visual
- Coherencia con el mood

Responde en formato JSON:
{
  "primary": "#hex",
  "secondary": "#hex",
  "accent": "#hex",
  "neutral-light": "#hex",
  "neutral-dark": "#hex",
  "explanation": "breve explicacion"
}`,
};

// ============================================================================
// INSTRUCCIONES DE TEXTO
// ============================================================================

export const TEXT_INSTRUCTIONS = {
  // Estilos de escritura
  WRITING_STYLES: {
    formal: {
      rules: [
        'Usar tercera persona o usted',
        'Evitar contracciones',
        'Vocabulario profesional',
        'Oraciones completas y estructuradas',
      ],
      example: 'La empresa ofrece soluciones innovadoras para optimizar sus procesos.',
    },
    casual: {
      rules: [
        'Usar tu/ustedes',
        'Contracciones permitidas',
        'Lenguaje cotidiano',
        'Tono amigable',
      ],
      example: 'Te ayudamos a simplificar tu dia a dia con herramientas geniales.',
    },
    tecnico: {
      rules: [
        'Terminologia especializada',
        'Precision en datos',
        'Referencias cuando aplique',
        'Estructura logica',
      ],
      example: 'La API REST implementa autenticacion OAuth 2.0 con tokens JWT.',
    },
    persuasivo: {
      rules: [
        'Beneficios sobre caracteristicas',
        'Prueba social cuando aplique',
        'Llamadas a la accion claras',
        'Urgencia moderada',
      ],
      example: 'Unete a miles de empresas que ya aumentaron su productividad un 40%.',
    },
  },

  // Longitudes recomendadas
  LENGTHS: {
    headline: { min: 3, max: 8, unit: 'palabras' },
    subheadline: { min: 8, max: 15, unit: 'palabras' },
    paragraph: { min: 40, max: 150, unit: 'palabras' },
    bullet: { min: 3, max: 12, unit: 'palabras' },
    cta: { min: 2, max: 5, unit: 'palabras' },
  },

  // Prompt para mejorar texto
  IMPROVEMENT_PROMPT: (text: string, goal: string) => `
Mejora el siguiente texto para: ${goal}

Texto original:
"${text}"

Instrucciones:
1. Mantener el mensaje principal
2. Mejorar claridad y flujo
3. Corregir errores gramaticales
4. Optimizar para el objetivo

Responde SOLO con el texto mejorado.`,

  // Prompt para expandir texto
  EXPANSION_PROMPT: (text: string, targetLength: number) => `
Expande el siguiente texto a aproximadamente ${targetLength} palabras:

"${text}"

Instrucciones:
1. Mantener el mensaje original
2. Agregar detalles relevantes
3. No repetir ideas
4. Mantener coherencia

Responde SOLO con el texto expandido.`,

  // Prompt para resumir texto
  SUMMARY_PROMPT: (text: string, targetLength: number) => `
Resume el siguiente texto a aproximadamente ${targetLength} palabras:

"${text}"

Instrucciones:
1. Mantener puntos clave
2. Eliminar redundancias
3. Preservar el mensaje principal
4. Mantener coherencia

Responde SOLO con el resumen.`,
};

// ============================================================================
// INSTRUCCIONES DE LAYOUT
// ============================================================================

export const LAYOUT_INSTRUCTIONS = {
  // Tipos de layout disponibles
  LAYOUT_TYPES: {
    hero: {
      description: 'Seccion de encabezado grande con imagen y texto',
      elements: ['titulo', 'subtitulo', 'cta', 'imagen'],
      aspectRatio: '16:9',
    },
    twoColumn: {
      description: 'Dos columnas iguales',
      elements: ['columna_izquierda', 'columna_derecha'],
      aspectRatio: 'flexible',
    },
    threeColumn: {
      description: 'Tres columnas iguales para comparaciones',
      elements: ['columna_1', 'columna_2', 'columna_3'],
      aspectRatio: 'flexible',
    },
    textImage: {
      description: 'Texto a un lado, imagen al otro',
      elements: ['bloque_texto', 'imagen'],
      aspectRatio: 'flexible',
    },
    cards: {
      description: 'Grid de tarjetas para features o servicios',
      elements: ['tarjeta[]'],
      aspectRatio: 'flexible',
    },
    testimonial: {
      description: 'Cita con foto y nombre',
      elements: ['cita', 'foto', 'nombre', 'cargo'],
      aspectRatio: '4:3',
    },
    cta: {
      description: 'Llamada a la accion destacada',
      elements: ['titulo', 'descripcion', 'boton'],
      aspectRatio: '3:1',
    },
  },

  // Prompt para sugerir layout
  SUGGESTION_PROMPT: (content: string, purpose: string) => `
Sugiere el mejor layout para:
Contenido: ${content}
Proposito: ${purpose}

Considera:
1. Tipo de contenido (texto, imagenes, datos)
2. Jerarquia de informacion
3. Objetivo del usuario
4. Mejores practicas de diseno

Responde en formato JSON:
{
  "layout": "tipo_de_layout",
  "elements": ["elemento1", "elemento2"],
  "spacing": "compacto|normal|amplio",
  "alignment": "left|center|right",
  "reasoning": "explicacion breve"
}`,

  // Reglas de espaciado
  SPACING_RULES: {
    compact: {
      padding: 16,
      gap: 8,
      margin: 16,
    },
    normal: {
      padding: 24,
      gap: 16,
      margin: 24,
    },
    spacious: {
      padding: 32,
      gap: 24,
      margin: 32,
    },
  },
};

// ============================================================================
// INSTRUCCIONES DE IMAGEN
// ============================================================================

export const IMAGE_INSTRUCTIONS = {
  // Prompt para sugerir imagenes
  SUGGESTION_PROMPT: (context: string, style: string) => `
Sugiere una imagen para: ${context}
Estilo deseado: ${style}

Describe la imagen ideal:
1. Tema principal
2. Colores dominantes
3. Composicion
4. Mood/atmosfera
5. Keywords para busqueda

Responde en formato JSON:
{
  "description": "descripcion detallada",
  "keywords": ["keyword1", "keyword2"],
  "style": "fotografico|ilustracion|abstracto|iconico",
  "mood": "profesional|casual|energico|calmo",
  "colors": ["#hex1", "#hex2"]
}`,

  // Filtros de imagen disponibles
  FILTERS: {
    none: { brightness: 100, contrast: 100, saturate: 100, blur: 0 },
    vivid: { brightness: 105, contrast: 110, saturate: 120, blur: 0 },
    muted: { brightness: 100, contrast: 95, saturate: 80, blur: 0 },
    warm: { brightness: 102, contrast: 100, saturate: 105, sepia: 15 },
    cool: { brightness: 100, contrast: 102, saturate: 95, hueRotate: 10 },
    grayscale: { brightness: 100, contrast: 105, saturate: 0, blur: 0 },
    vintage: { brightness: 95, contrast: 90, saturate: 85, sepia: 25 },
  },

  // Tamanios recomendados
  RECOMMENDED_SIZES: {
    thumbnail: { width: 150, height: 150 },
    small: { width: 300, height: 200 },
    medium: { width: 600, height: 400 },
    large: { width: 1200, height: 800 },
    hero: { width: 1920, height: 1080 },
    square: { width: 500, height: 500 },
    portrait: { width: 400, height: 600 },
    landscape: { width: 800, height: 450 },
  },
};

// ============================================================================
// REGLAS DE VALIDACION
// ============================================================================

export const VALIDATION_RULES = {
  // Validar respuesta de color
  color: {
    pattern: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    message: 'Color debe ser formato HEX valido',
  },

  // Validar longitud de texto
  textLength: {
    title: { min: 1, max: 100 },
    subtitle: { min: 1, max: 200 },
    paragraph: { min: 10, max: 2000 },
    cta: { min: 2, max: 50 },
  },

  // Validar estructura JSON
  jsonStructure: {
    colorPalette: ['primary', 'secondary', 'accent'],
    layout: ['layout', 'elements'],
    image: ['description', 'keywords'],
  },

  // Funcion de validacion
  validate: (type: string, value: unknown): { valid: boolean; error?: string } => {
    switch (type) {
      case 'color':
        const colorValid = VALIDATION_RULES.color.pattern.test(value as string);
        return { valid: colorValid, error: colorValid ? undefined : VALIDATION_RULES.color.message };
      
      case 'title':
        const titleLen = (value as string).length;
        const titleValid = titleLen >= VALIDATION_RULES.textLength.title.min && 
                          titleLen <= VALIDATION_RULES.textLength.title.max;
        return { valid: titleValid, error: titleValid ? undefined : 'Titulo debe tener entre 1 y 100 caracteres' };
      
      default:
        return { valid: true };
    }
  },
};

// ============================================================================
// CONFIGURACION DEL MODELO
// ============================================================================

export const MODEL_CONFIG = {
  // Modelo por defecto
  defaultModel: 'gemini-pro',
  
  // Temperatura por tipo de tarea
  temperature: {
    creative: 0.9, // Titulos, nombres creativos
    balanced: 0.7, // Contenido general
    precise: 0.3, // Datos, formatos especificos
    deterministic: 0.1, // Correcciones, validaciones
  },

  // Tokens maximos
  maxTokens: {
    short: 100,
    medium: 500,
    long: 1500,
    extended: 3000,
  },

  // Reintentos
  retries: 3,
  retryDelay: 1000,
};

// ============================================================================
// MENSAJES DE ERROR
// ============================================================================

export const ERROR_MESSAGES = {
  EMPTY_PROMPT: 'Por favor, ingresa una descripcion para generar contenido.',
  GENERATION_FAILED: 'No se pudo generar el contenido. Intenta de nuevo.',
  INVALID_RESPONSE: 'La respuesta no tiene el formato esperado.',
  RATE_LIMITED: 'Demasiadas solicitudes. Espera un momento.',
  NETWORK_ERROR: 'Error de conexion. Verifica tu internet.',
  UNAUTHORIZED: 'No tienes permisos para esta accion.',
  TIMEOUT: 'La solicitud tardo demasiado. Intenta de nuevo.',
};

// ============================================================================
// MENSAJES DE EXITO
// ============================================================================

export const SUCCESS_MESSAGES = {
  CONTENT_GENERATED: 'Contenido generado exitosamente.',
  COLORS_APPLIED: 'Paleta de colores aplicada.',
  LAYOUT_UPDATED: 'Layout actualizado.',
  IMAGE_ADDED: 'Imagen agregada.',
  SAVED: 'Cambios guardados.',
};

// ============================================================================
// EXPORTAR TODO
// ============================================================================

export default {
  SYSTEM_PROMPTS,
  GENERATION_TEMPLATES,
  COLOR_INSTRUCTIONS,
  TEXT_INSTRUCTIONS,
  LAYOUT_INSTRUCTIONS,
  IMAGE_INSTRUCTIONS,
  VALIDATION_RULES,
  MODEL_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
