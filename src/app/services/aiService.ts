/**
 * SERVICIO DE IA PARA EL EDITOR
 * 
 * Este servicio utiliza las instrucciones definidas en aiInstructions.ts
 * para generar contenido mediante la API de Gemini.
 * 
 * Para cambiar el comportamiento de la IA, modifica aiInstructions.ts
 * sin necesidad de tocar este archivo.
 */

import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../utils/supabase/info.tsx';
import {
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
} from '../config/aiInstructions';

// URL base del servidor
const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-e4166826`;

// ============================================================================
// TIPOS
// ============================================================================

export interface AIGenerationRequest {
  type: 'text' | 'color' | 'layout' | 'image' | 'improve' | 'expand' | 'summarize';
  prompt: string;
  context?: string;
  style?: string;
  options?: Record<string, unknown>;
}

export interface AIGenerationResponse {
  success: boolean;
  content?: unknown;
  error?: string;
  metadata?: {
    model: string;
    tokens: number;
    processingTime: number;
  };
}

export interface ColorPaletteResult {
  primary: string;
  secondary: string;
  accent: string;
  neutralLight: string;
  neutralDark: string;
  explanation: string;
}

export interface LayoutSuggestion {
  layout: string;
  elements: string[];
  spacing: 'compact' | 'normal' | 'spacious';
  alignment: 'left' | 'center' | 'right';
  reasoning: string;
}

export interface ImageSuggestion {
  description: string;
  keywords: string[];
  style: 'fotografico' | 'ilustracion' | 'abstracto' | 'iconico';
  mood: string;
  colors: string[];
}

// ============================================================================
// CLASE PRINCIPAL DEL SERVICIO
// ============================================================================

export class AIEditorService {
  private static instance: AIEditorService;
  private requestQueue: Promise<unknown> = Promise.resolve();
  private lastRequestTime: number = 0;
  private minRequestInterval: number = 500; // ms entre requests

  private constructor() {}

  static getInstance(): AIEditorService {
    if (!AIEditorService.instance) {
      AIEditorService.instance = new AIEditorService();
    }
    return AIEditorService.instance;
  }

  // ============================================================================
  // METODOS PRINCIPALES DE GENERACION
  // ============================================================================

  /**
   * Genera un titulo basado en contexto y estilo
   */
  async generateTitle(context: string, style: string = 'corporativo'): Promise<string> {
    const prompt = GENERATION_TEMPLATES.TITLE.prompt(context, style);
    
    const response = await this.makeRequest({
      type: 'text',
      prompt,
      context: SYSTEM_PROMPTS.TEXT_GENERATION,
      options: {
        temperature: MODEL_CONFIG.temperature.creative,
        maxTokens: MODEL_CONFIG.maxTokens.short,
      },
    });

    if (response.success && response.content) {
      const title = String(response.content).trim();
      const validation = VALIDATION_RULES.validate('title', title);
      
      if (validation.valid) {
        return title;
      }
      throw new Error(validation.error);
    }

    throw new Error(ERROR_MESSAGES.GENERATION_FAILED);
  }

  /**
   * Genera un subtitulo complementario
   */
  async generateSubtitle(context: string, title: string): Promise<string> {
    const prompt = GENERATION_TEMPLATES.SUBTITLE.prompt(context, title);
    
    const response = await this.makeRequest({
      type: 'text',
      prompt,
      context: SYSTEM_PROMPTS.TEXT_GENERATION,
      options: {
        temperature: MODEL_CONFIG.temperature.balanced,
        maxTokens: MODEL_CONFIG.maxTokens.short,
      },
    });

    if (response.success && response.content) {
      return String(response.content).trim();
    }

    throw new Error(ERROR_MESSAGES.GENERATION_FAILED);
  }

  /**
   * Genera un parrafo de texto
   */
  async generateParagraph(
    topic: string,
    tone: string = 'formal',
    length: 'corto' | 'medio' | 'largo' = 'medio'
  ): Promise<string> {
    const prompt = GENERATION_TEMPLATES.PARAGRAPH.prompt(topic, tone, length);
    
    const response = await this.makeRequest({
      type: 'text',
      prompt,
      context: SYSTEM_PROMPTS.TEXT_GENERATION,
      options: {
        temperature: MODEL_CONFIG.temperature.balanced,
        maxTokens: MODEL_CONFIG.maxTokens.medium,
      },
    });

    if (response.success && response.content) {
      return String(response.content).trim();
    }

    throw new Error(ERROR_MESSAGES.GENERATION_FAILED);
  }

  /**
   * Genera un CTA (Call to Action)
   */
  async generateCTA(action: string, context: string): Promise<string> {
    const prompt = GENERATION_TEMPLATES.CTA.prompt(action, context);
    
    const response = await this.makeRequest({
      type: 'text',
      prompt,
      context: SYSTEM_PROMPTS.TEXT_GENERATION,
      options: {
        temperature: MODEL_CONFIG.temperature.creative,
        maxTokens: MODEL_CONFIG.maxTokens.short,
      },
    });

    if (response.success && response.content) {
      return String(response.content).trim();
    }

    throw new Error(ERROR_MESSAGES.GENERATION_FAILED);
  }

  /**
   * Genera una lista de items
   */
  async generateList(
    topic: string,
    count: number = 5,
    style: 'bullets' | 'numbered' = 'bullets'
  ): Promise<string[]> {
    const prompt = GENERATION_TEMPLATES.LIST.prompt(topic, count, style);
    
    const response = await this.makeRequest({
      type: 'text',
      prompt,
      context: SYSTEM_PROMPTS.TEXT_GENERATION,
      options: {
        temperature: MODEL_CONFIG.temperature.balanced,
        maxTokens: MODEL_CONFIG.maxTokens.medium,
      },
    });

    if (response.success && response.content) {
      return String(response.content)
        .split('\n')
        .map(line => line.replace(/^[-*\d.)\s]+/, '').trim())
        .filter(line => line.length > 0);
    }

    throw new Error(ERROR_MESSAGES.GENERATION_FAILED);
  }

  // ============================================================================
  // GENERACION DE COLORES
  // ============================================================================

  /**
   * Genera una paleta de colores
   */
  async generateColorPalette(
    context: string,
    mood: string,
    existingColors: string[] = []
  ): Promise<ColorPaletteResult> {
    const prompt = COLOR_INSTRUCTIONS.SUGGESTION_PROMPT(context, mood, existingColors);
    
    const response = await this.makeRequest({
      type: 'color',
      prompt,
      context: SYSTEM_PROMPTS.COLOR_SUGGESTION,
      options: {
        temperature: MODEL_CONFIG.temperature.balanced,
        maxTokens: MODEL_CONFIG.maxTokens.medium,
      },
    });

    if (response.success && response.content) {
      try {
        const parsed = typeof response.content === 'string' 
          ? JSON.parse(response.content) 
          : response.content;
        
        return {
          primary: parsed.primary || '#3b82f6',
          secondary: parsed.secondary || '#64748b',
          accent: parsed.accent || '#f97316',
          neutralLight: parsed['neutral-light'] || '#f8fafc',
          neutralDark: parsed['neutral-dark'] || '#1e293b',
          explanation: parsed.explanation || '',
        };
      } catch {
        // Si falla el parsing, retornar paleta por defecto
        return this.getDefaultPalette(mood);
      }
    }

    return this.getDefaultPalette(mood);
  }

  /**
   * Obtiene paleta por industria
   */
  getIndustryPalette(industry: keyof typeof COLOR_INSTRUCTIONS.BY_INDUSTRY): {
    primary: string[];
    secondary: string[];
    accent: string[];
    description: string;
  } {
    return COLOR_INSTRUCTIONS.BY_INDUSTRY[industry] || COLOR_INSTRUCTIONS.BY_INDUSTRY.tecnologia;
  }

  /**
   * Genera colores armonicos
   */
  generateHarmony(
    baseColor: string,
    harmonyType: keyof typeof COLOR_INSTRUCTIONS.HARMONY_RULES
  ): string[] {
    const hsl = this.hexToHSL(baseColor);
    const harmonyFn = COLOR_INSTRUCTIONS.HARMONY_RULES[harmonyType];
    const hues = harmonyFn(hsl.h);
    
    return [baseColor, ...hues.map(h => this.hslToHex(h, hsl.s, hsl.l))];
  }

  private getDefaultPalette(mood: string): ColorPaletteResult {
    const palettes: Record<string, ColorPaletteResult> = {
      profesional: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#f97316',
        neutralLight: '#f8fafc',
        neutralDark: '#1e293b',
        explanation: 'Paleta profesional con azul confiable',
      },
      creativo: {
        primary: '#8b5cf6',
        secondary: '#ec4899',
        accent: '#06b6d4',
        neutralLight: '#faf5ff',
        neutralDark: '#1e1b4b',
        explanation: 'Paleta vibrante para creatividad',
      },
      natural: {
        primary: '#16a34a',
        secondary: '#84cc16',
        accent: '#eab308',
        neutralLight: '#f0fdf4',
        neutralDark: '#14532d',
        explanation: 'Paleta natural con verdes organicos',
      },
    };

    return palettes[mood] || palettes.profesional;
  }

  // ============================================================================
  // SUGERENCIAS DE LAYOUT
  // ============================================================================

  /**
   * Sugiere un layout basado en contenido
   */
  async suggestLayout(content: string, purpose: string): Promise<LayoutSuggestion> {
    const prompt = LAYOUT_INSTRUCTIONS.SUGGESTION_PROMPT(content, purpose);
    
    const response = await this.makeRequest({
      type: 'layout',
      prompt,
      context: SYSTEM_PROMPTS.LAYOUT_DESIGN,
      options: {
        temperature: MODEL_CONFIG.temperature.precise,
        maxTokens: MODEL_CONFIG.maxTokens.medium,
      },
    });

    if (response.success && response.content) {
      try {
        const parsed = typeof response.content === 'string' 
          ? JSON.parse(response.content) 
          : response.content;
        
        return {
          layout: parsed.layout || 'textImage',
          elements: parsed.elements || ['titulo', 'descripcion', 'imagen'],
          spacing: parsed.spacing || 'normal',
          alignment: parsed.alignment || 'left',
          reasoning: parsed.reasoning || '',
        };
      } catch {
        return this.getDefaultLayout(purpose);
      }
    }

    return this.getDefaultLayout(purpose);
  }

  /**
   * Obtiene informacion de un tipo de layout
   */
  getLayoutInfo(layoutType: keyof typeof LAYOUT_INSTRUCTIONS.LAYOUT_TYPES) {
    return LAYOUT_INSTRUCTIONS.LAYOUT_TYPES[layoutType];
  }

  /**
   * Obtiene reglas de espaciado
   */
  getSpacingRules(spacingType: keyof typeof LAYOUT_INSTRUCTIONS.SPACING_RULES) {
    return LAYOUT_INSTRUCTIONS.SPACING_RULES[spacingType];
  }

  private getDefaultLayout(purpose: string): LayoutSuggestion {
    const layouts: Record<string, LayoutSuggestion> = {
      presentacion: {
        layout: 'hero',
        elements: ['titulo', 'subtitulo', 'cta'],
        spacing: 'spacious',
        alignment: 'center',
        reasoning: 'Hero para captar atencion inicial',
      },
      informativo: {
        layout: 'textImage',
        elements: ['titulo', 'parrafo', 'imagen'],
        spacing: 'normal',
        alignment: 'left',
        reasoning: 'Texto e imagen para balance visual',
      },
      comparativo: {
        layout: 'threeColumn',
        elements: ['columna_1', 'columna_2', 'columna_3'],
        spacing: 'compact',
        alignment: 'center',
        reasoning: 'Columnas para comparar opciones',
      },
    };

    return layouts[purpose] || layouts.informativo;
  }

  // ============================================================================
  // SUGERENCIAS DE IMAGEN
  // ============================================================================

  /**
   * Sugiere una imagen basada en contexto
   */
  async suggestImage(context: string, style: string = 'fotografico'): Promise<ImageSuggestion> {
    const prompt = IMAGE_INSTRUCTIONS.SUGGESTION_PROMPT(context, style);
    
    const response = await this.makeRequest({
      type: 'image',
      prompt,
      context: SYSTEM_PROMPTS.EDITOR_ASSISTANT,
      options: {
        temperature: MODEL_CONFIG.temperature.creative,
        maxTokens: MODEL_CONFIG.maxTokens.medium,
      },
    });

    if (response.success && response.content) {
      try {
        const parsed = typeof response.content === 'string' 
          ? JSON.parse(response.content) 
          : response.content;
        
        return {
          description: parsed.description || context,
          keywords: parsed.keywords || [context],
          style: parsed.style || 'fotografico',
          mood: parsed.mood || 'profesional',
          colors: parsed.colors || ['#3b82f6'],
        };
      } catch {
        return {
          description: context,
          keywords: context.split(' '),
          style: 'fotografico',
          mood: 'profesional',
          colors: ['#3b82f6', '#64748b'],
        };
      }
    }

    throw new Error(ERROR_MESSAGES.GENERATION_FAILED);
  }

  /**
   * Obtiene filtros de imagen disponibles
   */
  getImageFilters() {
    return IMAGE_INSTRUCTIONS.FILTERS;
  }

  /**
   * Obtiene tamanios recomendados de imagen
   */
  getRecommendedSizes() {
    return IMAGE_INSTRUCTIONS.RECOMMENDED_SIZES;
  }

  // ============================================================================
  // MEJORA DE TEXTO
  // ============================================================================

  /**
   * Mejora un texto existente
   */
  async improveText(text: string, goal: string): Promise<string> {
    const prompt = TEXT_INSTRUCTIONS.IMPROVEMENT_PROMPT(text, goal);
    
    const response = await this.makeRequest({
      type: 'improve',
      prompt,
      context: SYSTEM_PROMPTS.TEXT_GENERATION,
      options: {
        temperature: MODEL_CONFIG.temperature.balanced,
        maxTokens: MODEL_CONFIG.maxTokens.medium,
      },
    });

    if (response.success && response.content) {
      return String(response.content).trim();
    }

    throw new Error(ERROR_MESSAGES.GENERATION_FAILED);
  }

  /**
   * Expande un texto
   */
  async expandText(text: string, targetLength: number): Promise<string> {
    const prompt = TEXT_INSTRUCTIONS.EXPANSION_PROMPT(text, targetLength);
    
    const response = await this.makeRequest({
      type: 'expand',
      prompt,
      context: SYSTEM_PROMPTS.TEXT_GENERATION,
      options: {
        temperature: MODEL_CONFIG.temperature.balanced,
        maxTokens: MODEL_CONFIG.maxTokens.long,
      },
    });

    if (response.success && response.content) {
      return String(response.content).trim();
    }

    throw new Error(ERROR_MESSAGES.GENERATION_FAILED);
  }

  /**
   * Resume un texto
   */
  async summarizeText(text: string, targetLength: number): Promise<string> {
    const prompt = TEXT_INSTRUCTIONS.SUMMARY_PROMPT(text, targetLength);
    
    const response = await this.makeRequest({
      type: 'summarize',
      prompt,
      context: SYSTEM_PROMPTS.TEXT_GENERATION,
      options: {
        temperature: MODEL_CONFIG.temperature.precise,
        maxTokens: MODEL_CONFIG.maxTokens.medium,
      },
    });

    if (response.success && response.content) {
      return String(response.content).trim();
    }

    throw new Error(ERROR_MESSAGES.GENERATION_FAILED);
  }

  // ============================================================================
  // METODO DE REQUEST INTERNO
  // ============================================================================

  private async makeRequest(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    // Rate limiting simple
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();

    // Validar prompt
    if (!request.prompt?.trim()) {
      return {
        success: false,
        error: ERROR_MESSAGES.EMPTY_PROMPT,
      };
    }

    try {
      const startTime = Date.now();
      
      const response = await fetch(`${BASE_URL}/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          prompt: request.prompt,
          systemPrompt: request.context,
          type: request.type,
          options: request.options,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error('[AI_SERVICE_ERROR]', { status: response.status, data });
        
        if (response.status === 429) {
          return { success: false, error: ERROR_MESSAGES.RATE_LIMITED };
        }
        if (response.status === 401) {
          return { success: false, error: ERROR_MESSAGES.UNAUTHORIZED };
        }
        
        return { 
          success: false, 
          error: data.error || ERROR_MESSAGES.GENERATION_FAILED 
        };
      }

      return {
        success: true,
        content: data.content || data.result || data,
        metadata: {
          model: data.model || MODEL_CONFIG.defaultModel,
          tokens: data.tokens || 0,
          processingTime: Date.now() - startTime,
        },
      };
    } catch (error) {
      console.error('[AI_SERVICE_NETWORK_ERROR]', error);
      return {
        success: false,
        error: ERROR_MESSAGES.NETWORK_ERROR,
      };
    }
  }

  // ============================================================================
  // UTILIDADES DE COLOR
  // ============================================================================

  private hexToHSL(hex: string): { h: number; s: number; l: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 0 };

    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  private hslToHex(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
    else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
    else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
    else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
    else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    const toHex = (n: number) => {
      const hex = Math.round((n + m) * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}

// Exportar instancia singleton
export const aiService = AIEditorService.getInstance();

// ============================================================================
// HOOKS PARA USO EN COMPONENTES
// ============================================================================

import { useState, useCallback } from 'react';

export function useAIGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async <T>(
    generatorFn: () => Promise<T>,
    successMessage?: string
  ): Promise<T | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generatorFn();
      if (successMessage) {
        toast.success(successMessage);
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : ERROR_MESSAGES.GENERATION_FAILED;
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generate, isGenerating, error };
}
