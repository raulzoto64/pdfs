/**
 * ============================================
 * MODULO DE IA - EXPORTACIONES
 * ============================================
 * 
 * Punto de entrada para todas las funcionalidades de IA.
 * 
 * USO:
 * import { AIService, AI_INSTRUCTIONS } from '@/app/ai';
 * 
 * // Para cambiar comportamiento de IA:
 * // Edita aiInstructions.ts
 * 
 * // Para usar el servicio:
 * const result = await AIService.generateSection('contexto', 'tipo');
 */

// Exportar instrucciones (CEREBRO)
export { 
  AI_INSTRUCTIONS,
  AI_CONFIG,
  SYSTEM_PROMPTS,
  PROMPT_TEMPLATES,
  COLOR_PALETTES,
  STYLE_PRESETS,
  VALIDATORS,
  ERROR_MESSAGES,
  FALLBACK_CONTENT,
} from './aiInstructions';

// Exportar servicio (LOGICA)
export { 
  AIService,
  type AIRequest,
  type AIResponse,
  type GeneratedSection,
  type GeneratedColors,
  type GeneratedText,
  type GeneratedLayout,
  type GeneratedCards,
} from './aiService';

// Exportar por defecto
export { default as AIInstructions } from './aiInstructions';
export { default as AIServiceDefault } from './aiService';
