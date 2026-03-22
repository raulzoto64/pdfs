import { projectId, publicAnonKey } from "../../../utils/supabase/info.tsx";
import { toast } from "sonner";
import {
  createAiDocumentDraft,
  createAiSectionDraft,
  type GeneratedDocumentDraft,
  type GeneratedSectionDraft,
} from "./pdfCreatorApi";

export interface GenerateSectionRequest {
  prompt: string;
  sectionType?: string;
  sectionTitle?: string;
}

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-e4166826`;

export class GeminiService {
  static async generateSectionDraft(request: GenerateSectionRequest): Promise<GeneratedSectionDraft> {
    if (!request.prompt.trim()) {
      throw new Error("El prompt esta vacio");
    }

    console.log("[GEMINI][SECTION][REQ]", request);

    const response = await fetch(`${BASE_URL}/ai/generate-section`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(request),
    });

    const data = await response.json().catch(() => ({}));

    console.log("[GEMINI][SECTION][RES]", {
      ok: response.ok,
      status: response.status,
      data,
    });

    if (!response.ok) {
      throw new Error(data.error || "Error generando la seccion con IA");
    }

    return data.draft as GeneratedSectionDraft;
  }

  static async generateDocumentDraft(request: GenerateSectionRequest): Promise<GeneratedDocumentDraft> {
    if (!request.prompt.trim()) {
      throw new Error("El prompt esta vacio");
    }

    console.log("[GEMINI][DOCUMENT][REQ]", request);

    const response = await fetch(`${BASE_URL}/ai/generate-document`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(request),
    });

    const data = await response.json().catch(() => ({}));

    console.log("[GEMINI][DOCUMENT][RES]", {
      ok: response.ok,
      status: response.status,
      data,
    });

    if (!response.ok) {
      throw new Error(data.error || "Error generando el documento con IA");
    }

    return data.draft as GeneratedDocumentDraft;
  }

  static async generateSectionDraftWithFallback(
    request: GenerateSectionRequest
  ): Promise<GeneratedSectionDraft> {
    try {
      const draft = await this.generateSectionDraft(request);
      toast.success("Seccion IA generada");
      return draft;
    } catch (error) {
      console.error("[GEMINI_SECTION_FALLBACK]", error);
      toast.error("La IA fallo. Se genero un borrador base editable.");
      return createAiSectionDraft(request.prompt);
    }
  }

  static async generateDocumentDraftWithFallback(
    request: GenerateSectionRequest
  ): Promise<GeneratedDocumentDraft> {
    try {
      const draft = await this.generateDocumentDraft(request);
      toast.success("Documento IA generado");
      return draft;
    } catch (error) {
      console.error("[GEMINI_DOCUMENT_FALLBACK]", error);
      toast.error("La IA fallo. Se genero un documento base editable.");
      return createAiDocumentDraft(request.prompt);
    }
  }
}
