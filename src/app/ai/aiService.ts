/**
 * ============================================
 * SERVICIO DE IA - LOGICA DE EJECUCION
 * ============================================
 * 
 * Este archivo contiene la LOGICA de ejecucion de la IA.
 * Usa las instrucciones de aiInstructions.ts para generar contenido.
 * 
 * Para modificar el comportamiento de la IA:
 * - Cambia las instrucciones en aiInstructions.ts
 * - NO modifiques este archivo a menos que necesites cambiar la logica
 */

import { 
  AI_INSTRUCTIONS, 
  PROMPT_TEMPLATES, 
  VALIDATORS, 
  ERROR_MESSAGES, 
  FALLBACK_CONTENT,
  COLOR_PALETTES,
  AI_CONFIG 
} from './aiInstructions';
import { projectId, publicAnonKey } from '../../../utils/supabase/info.tsx';
import { toast } from 'sonner';

// ============================================
// TIPOS
// ============================================
export interface AIRequest {
  type: 'section' | 'text' | 'colors' | 'layout' | 'title' | 'cards' | 'image' | 'analyze';
  prompt: string;
  params?: Record<string, unknown>;
}

export interface AIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fromFallback?: boolean;
}

export interface GeneratedSection {
  title: string;
  subtitle?: string;
  description: string;
  content?: {
    items?: string[];
    highlights?: string[];
  };
  style?: {
    primaryColor: string;
    secondaryColor: string;
    layout: string;
  };
}

export interface GeneratedColors {
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  variations?: Array<{
    name: string;
    colors: string[];
  }>;
  reasoning?: string;
}

export interface GeneratedText {
  improvedText: string;
  alternatives?: string[];
  changes?: string[];
}

export interface GeneratedLayout {
  layout: string;
  columns: number;
  spacing: string;
  alignment: string;
  recommendations?: string[];
}

export interface GeneratedCards {
  cards: Array<{
    title: string;
    description: string;
    icon?: string;
    color?: string;
  }>;
}

// ============================================
// CACHE
// ============================================
const responseCache = new Map<string, { data: unknown; timestamp: number }>();

function getCacheKey(request: AIRequest): string {
  return `${request.type}:${request.prompt}:${JSON.stringify(request.params || {})}`;
}

function getCachedResponse<T>(key: string): T | null {
  if (!AI_CONFIG.enableCaching) return null;
  
  const cached = responseCache.get(key);
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > AI_CONFIG.cacheExpiration;
  if (isExpired) {
    responseCache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

function setCachedResponse(key: string, data: unknown): void {
  if (!AI_CONFIG.enableCaching) return;
  responseCache.set(key, { data, timestamp: Date.now() });
}

// ============================================
// API BASE URL
// ============================================
const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-e4166826`;

// ============================================
// SERVICIO PRINCIPAL
// ============================================
export class AIService {
  /**
   * Genera una seccion completa
   */
  static async generateSection(
    context: string, 
    type: string = 'general',
    style?: string
  ): Promise<AIResponse<GeneratedSection>> {
    const request: AIRequest = {
      type: 'section',
      prompt: context,
      params: { type, style }
    };
    
    return this.execute<GeneratedSection>(request, () => {
      const prompt = PROMPT_TEMPLATES.generateSection({ type, context, style });
      return this.callAPI(prompt);
    }, FALLBACK_CONTENT.section);
  }
  
  /**
   * Mejora texto existente
   */
  static async improveText(
    originalText: string,
    instruction: string,
    tone?: string
  ): Promise<AIResponse<GeneratedText>> {
    const request: AIRequest = {
      type: 'text',
      prompt: instruction,
      params: { originalText, tone }
    };
    
    return this.execute<GeneratedText>(request, () => {
      const prompt = PROMPT_TEMPLATES.improveText({ originalText, instruction, tone });
      return this.callAPI(prompt);
    }, FALLBACK_CONTENT.text);
  }
  
  /**
   * Sugiere una paleta de colores
   */
  static async suggestColors(
    theme: string,
    mood?: string,
    baseColor?: string
  ): Promise<AIResponse<GeneratedColors>> {
    const request: AIRequest = {
      type: 'colors',
      prompt: theme,
      params: { mood, baseColor }
    };
    
    return this.execute<GeneratedColors>(request, () => {
      const prompt = PROMPT_TEMPLATES.suggestColors({ theme, mood, baseColor });
      return this.callAPI(prompt);
    }, FALLBACK_CONTENT.colors);
  }
  
  /**
   * Sugiere un layout
   */
  static async suggestLayout(
    contentType: string,
    items: number,
    purpose: string
  ): Promise<AIResponse<GeneratedLayout>> {
    const request: AIRequest = {
      type: 'layout',
      prompt: purpose,
      params: { contentType, items }
    };
    
    return this.execute<GeneratedLayout>(request, () => {
      const prompt = PROMPT_TEMPLATES.suggestLayout({ contentType, items, purpose });
      return this.callAPI(prompt);
    }, { layout: 'grid', columns: 3, spacing: 'normal', alignment: 'center' });
  }
  
  /**
   * Genera un titulo impactante
   */
  static async generateTitle(
    context: string,
    type: string,
    keywords?: string[]
  ): Promise<AIResponse<{ title: string; alternatives: string[]; subtitle?: string }>> {
    const request: AIRequest = {
      type: 'title',
      prompt: context,
      params: { type, keywords }
    };
    
    return this.execute(request, () => {
      const prompt = PROMPT_TEMPLATES.generateTitle({ context, type, keywords });
      return this.callAPI(prompt);
    }, { title: 'Titulo de Ejemplo', alternatives: [], subtitle: '' });
  }
  
  /**
   * Genera cards
   */
  static async generateCards(
    topic: string,
    count: number = 3,
    style: string = 'profesional'
  ): Promise<AIResponse<GeneratedCards>> {
    const request: AIRequest = {
      type: 'cards',
      prompt: topic,
      params: { count, style }
    };
    
    return this.execute<GeneratedCards>(request, () => {
      const prompt = PROMPT_TEMPLATES.generateCards({ topic, count, style });
      return this.callAPI(prompt);
    }, { cards: FALLBACK_CONTENT.cards });
  }
  
  /**
   * Analiza y sugiere mejoras para una seccion
   */
  static async analyzeSection(
    sectionData: object
  ): Promise<AIResponse<{
    score: number;
    strengths: string[];
    improvements: string[];
    suggestedChanges: object;
  }>> {
    const request: AIRequest = {
      type: 'analyze',
      prompt: 'analyze',
      params: { sectionData }
    };
    
    return this.execute(request, () => {
      const prompt = PROMPT_TEMPLATES.analyzeSection({ sectionData });
      return this.callAPI(prompt);
    }, { 
      score: 7, 
      strengths: ['Contenido claro'], 
      improvements: ['Agregar mas detalles'],
      suggestedChanges: {}
    });
  }
  
  /**
   * Obtiene una paleta de colores predefinida
   */
  static getColorPalette(name: string): typeof COLOR_PALETTES.corporativo | null {
    const palette = COLOR_PALETTES[name as keyof typeof COLOR_PALETTES];
    return palette || null;
  }
  
  /**
   * Obtiene todas las paletas predefinidas
   */
  static getAllColorPalettes(): typeof COLOR_PALETTES {
    return COLOR_PALETTES;
  }
  
  /**
   * Genera color complementario
   */
  static getComplementaryColor(hex: string): string {
    // Remover #
    const color = hex.replace('#', '');
    
    // Convertir a RGB
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    
    // Calcular complementario
    const compR = (255 - r).toString(16).padStart(2, '0');
    const compG = (255 - g).toString(16).padStart(2, '0');
    const compB = (255 - b).toString(16).padStart(2, '0');
    
    return `#${compR}${compG}${compB}`;
  }
  
  /**
   * Genera colores analogos
   */
  static getAnalogousColors(hex: string, count: number = 3): string[] {
    const hsl = this.hexToHSL(hex);
    const colors: string[] = [];
    const step = 30; // 30 grados de separacion
    
    for (let i = 0; i < count; i++) {
      const newHue = (hsl.h + (i - Math.floor(count / 2)) * step + 360) % 360;
      colors.push(this.hslToHex(newHue, hsl.s, hsl.l));
    }
    
    return colors;
  }
  
  /**
   * Genera colores triadicos
   */
  static getTriadicColors(hex: string): string[] {
    const hsl = this.hexToHSL(hex);
    return [
      hex,
      this.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
      this.hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
    ];
  }
  
  // ============================================
  // METODOS PRIVADOS
  // ============================================
  
  private static async execute<T>(
    request: AIRequest,
    apiCall: () => Promise<T>,
    fallback: T
  ): Promise<AIResponse<T>> {
    const cacheKey = getCacheKey(request);
    
    // Verificar cache
    const cached = getCachedResponse<T>(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }
    
    // Intentar llamada a API
    let attempts = 0;
    while (attempts < AI_CONFIG.retryAttempts) {
      try {
        const data = await apiCall();
        setCachedResponse(cacheKey, data);
        return { success: true, data };
      } catch (error) {
        attempts++;
        if (attempts < AI_CONFIG.retryAttempts) {
          await this.delay(AI_CONFIG.retryDelay * attempts);
        }
      }
    }
    
    // Usar fallback si esta habilitado
    if (AI_CONFIG.enableFallback) {
      toast.warning(ERROR_MESSAGES.fallbackUsed);
      return { success: true, data: fallback, fromFallback: true };
    }
    
    return { success: false, error: ERROR_MESSAGES.serverError };
  }
  
  private static async callAPI(prompt: string): Promise<unknown> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.requestTimeout);
    
    try {
      const response = await fetch(`${BASE_URL}/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          prompt,
          config: {
            model: AI_CONFIG.model,
            temperature: AI_CONFIG.temperature,
            maxTokens: AI_CONFIG.maxTokens,
          }
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || ERROR_MESSAGES.serverError);
      }
      
      const data = await response.json();
      return data.result || data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(ERROR_MESSAGES.timeout);
        }
        throw error;
      }
      
      throw new Error(ERROR_MESSAGES.networkError);
    }
  }
  
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private static hexToHSL(hex: string): { h: number; s: number; l: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 0 };
    
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return { h: h * 360, s: s * 100, l: l * 100 };
  }
  
  private static hslToHex(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
    
    const toHex = (n: number) => {
      const hex = Math.round((n + m) * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}

export default AIService;
