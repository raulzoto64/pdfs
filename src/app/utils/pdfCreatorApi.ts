import {
  getDefaultSectionDimensions,
  type DocumentRecord,
  type Section,
  type SectionDimensions,
  type Template,
} from "../types/pdfCreator";

const BASE_URL = `https://xsuauybjzhipyigoveko.supabase.co/functions/v1/make-server-e4166826`;
export const EDITOR_SEED_STORAGE_KEY = "pdf_creator_editor_seed";
const PDF_API_DEBUG = false;

interface CurrentUser {
  id: string;
  email: string;
  name?: string;
}

export interface GeneratedSectionDraft {
  name: string;
  description: string;
  category: string;
  type: string;
  thumbnail?: string;
  htmlCode: string;
  cssCode: string;
  jsCode?: string;
  content: any;
  dimensions?: SectionDimensions;
}

export interface GeneratedDocumentDraft {
  documentName: string;
  description: string;
  sections: GeneratedSectionDraft[];
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const method = init?.method || "GET";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer sb_publishable_KjXZvXMsyURjamzp4b5MtA_3GfvF-91`,
    ...(init?.headers || {}),
  };

  if (PDF_API_DEBUG) {
    console.log("[PDF_API][REQ]", {
      method,
      url,
      hasAuth: Boolean((headers as Record<string, string>).Authorization),
      body: init?.body ? "yes" : "no",
    });
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers,
    });
  } catch (error) {
    if (PDF_API_DEBUG) {
      console.error("[PDF_API][NETWORK_ERROR]", {
        method,
        url,
        error,
      });
    }
    throw error;
  }

  if (PDF_API_DEBUG) {
    console.log("[PDF_API][RES]", {
      method,
      url,
      status: response.status,
      ok: response.ok,
      contentType: response.headers.get("content-type"),
    });
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    if (PDF_API_DEBUG) {
      console.error("[PDF_API][ERROR_PAYLOAD]", {
        method,
        url,
        status: response.status,
        payload,
      });
    }
    throw new Error((payload as any).error || "No se pudo completar la solicitud");
  }

  return response.json();
}

function toTextField(value: any, fallback = "") {
  if (typeof value === "object" && value !== null && "text" in value) {
    return value;
  }

  return {
    text: typeof value === "string" ? value : fallback,
    fontSize: 16,
    fontWeight: 400,
    color: "#333333",
    fontFamily: "Poppins",
    lineHeight: 1.5,
  };
}

function buildDefaultStyle(type: string) {
  switch (type) {
    case "hero":
      return {
        background: "linear-gradient(135deg, #1c5d15 0%, #0d350b 100%)",
        padding: "120px 40px",
        textAlign: "center",
      };
    case "simple-text":
      return {
        padding: "48px 40px",
        background: "#ffffff",
      };
    default:
      return {
        padding: "48px 40px",
        background: "#ffffff",
      };
  }
}

function normalizeDimensions(type: string, rawDimensions: any) {
  const fallback = getDefaultSectionDimensions(type);

  if (!rawDimensions || typeof rawDimensions !== "object") {
    return fallback;
  }

  return {
    preset: rawDimensions.preset || fallback.preset,
    width: Number(rawDimensions.width) || fallback.width,
    height: Number(rawDimensions.height) || fallback.height,
    label: rawDimensions.label || fallback.label,
  };
}

function normalizeSectionContent(type: string, rawContent: any) {
  if (rawContent?.editable) {
    return {
      ...rawContent,
      style: rawContent.style || buildDefaultStyle(type),
      type: rawContent.type || type,
    };
  }

  switch (type) {
    case "hero":
      return {
        type: "hero",
        editable: {
          title: toTextField(rawContent?.title, "Titulo principal"),
          subtitle: toTextField(rawContent?.subtitle, "Subtitulo"),
          tagline: toTextField(rawContent?.tagline, ""),
        },
        style: buildDefaultStyle("hero"),
      };
    case "heading":
      return {
        type: "simple-text",
        editable: {
          text: {
            ...toTextField(rawContent?.text, "Titulo"),
            fontSize: 32,
            fontWeight: 700,
            color: "#1c5d15",
          },
        },
        style: {
          ...buildDefaultStyle("simple-text"),
          textAlign: "center",
        },
      };
    case "text":
      return {
        type: "simple-text",
        editable: {
          text: toTextField(rawContent?.text, "Contenido"),
        },
        style: buildDefaultStyle("simple-text"),
      };
    default:
      return {
        type: "simple-text",
        editable: {
          text: toTextField(
            typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent || {}, null, 2),
            "Contenido"
          ),
        },
        style: buildDefaultStyle("simple-text"),
      };
  }
}

function normalizeSection(section: any): Section {
  if (!section || typeof section !== "object") {
    return {
      id: `invalid-section-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: "Seccion invalida",
      description: "",
      category: "General",
      type: "simple-text",
      content: normalizeSectionContent("simple-text", {
        text: "Esta seccion no pudo cargarse correctamente.",
      }),
      dimensions: getDefaultSectionDimensions("simple-text"),
      thumbnail: "DOC",
      author: "sistema",
      isPublic: false,
      createdAt: new Date().toISOString(),
      userId: "system",
    };
  }

  const type = section.type || section.content?.type || "simple-text";
  const createdAt = section.createdAt || section.created_at || new Date().toISOString();

  return {
    id: section.id,
    name: section.name || "Seccion sin nombre",
    description: section.description || "",
    category: section.category || "General",
    type,
    content: normalizeSectionContent(type, section.content || section.metadata || {}),
    dimensions: normalizeDimensions(type, section.dimensions),
    thumbnail: section.thumbnail || "DOC",
    htmlCode: section.htmlCode || section.html_code,
    cssCode: section.cssCode || section.css_code,
    jsCode: section.jsCode || section.js_code,
    author: section.author || section.userId || section.user_id || "sistema",
    isPublic: Boolean(section.isPublic ?? section.is_public),
    createdAt,
    userId: section.userId || section.user_id,
  };
}

function normalizeTemplate(template: any): Template {
  const sections = Array.isArray(template.sections)
    ? template.sections.filter(Boolean).map((section: any) => normalizeSection(section))
    : [];

  return {
    id: template.id,
    name: template.name || "Plantilla sin nombre",
    description: template.description || "",
    sections,
    thumbnail: template.thumbnail || "TPL",
    author: template.author || template.userId || template.user_id || "sistema",
    isPublic: Boolean(template.isPublic ?? template.is_public),
    createdAt: template.createdAt || template.created_at || new Date().toISOString(),
    updatedAt: template.updatedAt || template.updated_at,
    userId: template.userId || template.user_id,
  };
}

function normalizeDocument(document: any): DocumentRecord {
  return {
    id: document.id,
    name: document.name || "Documento sin nombre",
    templateId: document.templateId || document.template_id || null,
    customContent: Array.isArray(document.customContent)
      ? document.customContent.map((section: any) => normalizeSection(section))
      : [],
    userId: document.userId || document.user_id,
    lastModified: document.lastModified || document.last_modified || new Date().toISOString(),
  };
}

export function cloneSectionForEditor(section: Section, userId: string): Section {
  return {
    ...section,
    id: `section-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    author: userId,
    userId,
    isPublic: false,
    createdAt: new Date().toISOString(),
  };
}

export function storeSeedSectionsForEditor(sections: Section[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(EDITOR_SEED_STORAGE_KEY, JSON.stringify(sections));
}

export function consumeSeedSectionsForEditor(): Section[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.sessionStorage.getItem(EDITOR_SEED_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  window.sessionStorage.removeItem(EDITOR_SEED_STORAGE_KEY);

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((section) => normalizeSection(section)) : [];
  } catch (error) {
    if (PDF_API_DEBUG) {
      console.error("[PDF_API][SEED_PARSE_ERROR]", error);
    }
    return [];
  }
}

export function createAiSectionDraft(instruction: string): GeneratedSectionDraft {
  const normalizedInstruction = instruction.trim() || "Seccion generada por IA";
  const imageUrl =
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80";

  return {
    name: "Seccion generada con IA",
    description: normalizedInstruction,
    category: "AI Generated",
    type: "ai-layout-split",
    thumbnail: "AI",
    dimensions: getDefaultSectionDimensions("ai-layout-split"),
    htmlCode:
      `<section class="ai-split-section"><div class="ai-split-copy"><span class="ai-eyebrow">Coleccion destacada</span><h2>Soluciones organizadas con enfoque comercial</h2><p>${normalizedInstruction}</p><div class="ai-product-grid"><article class="ai-product-card"><h3>Producto 01</h3><ul><li>Caracteristica principal</li><li>Beneficio operativo</li><li>Aplicacion destacada</li></ul></article><article class="ai-product-card"><h3>Producto 02</h3><ul><li>Caracteristica principal</li><li>Beneficio operativo</li><li>Aplicacion destacada</li></ul></article><article class="ai-product-card"><h3>Producto 03</h3><ul><li>Caracteristica principal</li><li>Beneficio operativo</li><li>Aplicacion destacada</li></ul></article></div></div><div class="ai-split-media"><img src="${imageUrl}" alt="Imagen lateral de la seccion generada" /></div></section>`,
    cssCode:
      ".ai-split-section{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(320px,1fr);gap:32px;padding:56px;border-radius:28px;background:#f4f4f4;align-items:stretch}.ai-eyebrow{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#46614a;margin-bottom:14px}.ai-split-copy h2{font-size:40px;line-height:1.05;color:#17201a;margin:0 0 14px}.ai-split-copy p{font-size:17px;line-height:1.7;color:#49534a;margin:0 0 26px}.ai-product-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.ai-product-card{background:#fff;border:1px solid rgba(23,32,26,.08);border-radius:20px;padding:22px;box-shadow:0 12px 30px rgba(23,32,26,.06)}.ai-product-card h3{font-size:18px;margin:0 0 12px;color:#17201a}.ai-product-card ul{margin:0;padding-left:18px;color:#49534a;display:grid;gap:8px}.ai-split-media img{width:100%;height:100%;min-height:360px;object-fit:cover;border-radius:22px;display:block}@media (max-width:960px){.ai-split-section{grid-template-columns:1fr;padding:28px}.ai-product-grid{grid-template-columns:1fr}}",
    content: {
      type: "ai-layout-split",
      editable: {
        eyebrow: {
          text: "Coleccion destacada",
          fontSize: 12,
          fontWeight: 700,
          color: "#46614a",
          letterSpacing: "0.14em",
        },
        title: {
          text: "Soluciones organizadas con enfoque comercial",
          fontSize: 40,
          fontWeight: 700,
          color: "#17201a",
        },
        description: {
          text: normalizedInstruction,
          fontSize: 17,
          fontWeight: 400,
          color: "#49534a",
          lineHeight: 1.7,
        },
        imageUrl,
        cards: [
          {
            title: { text: "Producto 01", fontSize: 18, fontWeight: 700, color: "#17201a" },
            bullets: [
              { text: "Caracteristica principal", fontSize: 14, fontWeight: 400, color: "#49534a" },
              { text: "Beneficio operativo", fontSize: 14, fontWeight: 400, color: "#49534a" },
              { text: "Aplicacion destacada", fontSize: 14, fontWeight: 400, color: "#49534a" },
            ],
          },
          {
            title: { text: "Producto 02", fontSize: 18, fontWeight: 700, color: "#17201a" },
            bullets: [
              { text: "Caracteristica principal", fontSize: 14, fontWeight: 400, color: "#49534a" },
              { text: "Beneficio operativo", fontSize: 14, fontWeight: 400, color: "#49534a" },
              { text: "Aplicacion destacada", fontSize: 14, fontWeight: 400, color: "#49534a" },
            ],
          },
          {
            title: { text: "Producto 03", fontSize: 18, fontWeight: 700, color: "#17201a" },
            bullets: [
              { text: "Caracteristica principal", fontSize: 14, fontWeight: 400, color: "#49534a" },
              { text: "Beneficio operativo", fontSize: 14, fontWeight: 400, color: "#49534a" },
              { text: "Aplicacion destacada", fontSize: 14, fontWeight: 400, color: "#49534a" },
            ],
          },
        ],
      },
      style: {
        background: "#f4f4f4",
        padding: "56px",
        borderRadius: "28px",
      },
      generatedFromPrompt: normalizedInstruction,
    },
  };
}

function buildDocumentSectionDraft(instruction: string, index: number): GeneratedSectionDraft {
  const sectionKinds = [
    {
      suffix: "Portada",
      category: "Hero",
      type: "hero",
      content: {
        type: "hero",
        editable: {
          title: { text: "Presentacion del documento", fontSize: 46, fontWeight: 700, color: "#ffffff", fontFamily: "Poppins", lineHeight: 1.2 },
          subtitle: { text: instruction, fontSize: 22, fontWeight: 400, color: "#ffffff", fontFamily: "Poppins", lineHeight: 1.5 },
          tagline: { text: "Seccion creada para abrir el documento", fontSize: 16, fontWeight: 400, color: "#ffffff", fontFamily: "Poppins", lineHeight: 1.4 },
        },
        style: {
          background: "linear-gradient(135deg, #1c5d15 0%, #0d350b 100%)",
          padding: "120px 40px",
          textAlign: "center",
        },
      },
      htmlCode:
        `<section class="hero-doc"><div class="hero-doc__inner"><h1>Presentacion del documento</h1><p>${instruction}</p><span>Seccion creada para abrir el documento</span></div></section>`,
      cssCode:
        ".hero-doc{background:linear-gradient(135deg,#1c5d15 0%,#0d350b 100%);color:#fff;padding:120px 40px;text-align:center}.hero-doc__inner{max-width:920px;margin:0 auto}.hero-doc h1{font-size:48px;line-height:1.05;margin:0 0 16px}.hero-doc p{font-size:22px;line-height:1.6;margin:0 0 14px}.hero-doc span{font-size:15px;opacity:.92}",
    },
    {
      suffix: "Resumen",
      category: "Overview",
      type: "heading",
      content: {
        type: "simple-text",
        editable: {
          text: { text: `Resumen estrategico: ${instruction}`, fontSize: 30, fontWeight: 700, color: "#1c5d15", fontFamily: "Poppins", lineHeight: 1.4 },
        },
        style: { padding: "56px 40px", background: "#ffffff", textAlign: "center" },
      },
      htmlCode:
        `<section class="doc-heading"><div class="doc-heading__inner"><h2>Resumen estrategico</h2><p>${instruction}</p></div></section>`,
      cssCode:
        ".doc-heading{padding:56px 40px;background:#fff}.doc-heading__inner{max-width:880px;margin:0 auto;text-align:center}.doc-heading h2{margin:0 0 12px;color:#1c5d15;font-size:34px}.doc-heading p{margin:0;color:#49534a;font-size:18px;line-height:1.7}",
    },
    {
      suffix: "Bloque Comercial",
      category: "AI Generated",
      type: "ai-layout-split",
    },
    {
      suffix: "Contenido",
      category: "Narrative",
      type: "text",
      content: {
        type: "simple-text",
        editable: {
          text: { text: `Desarrollo del documento: ${instruction}`, fontSize: 18, fontWeight: 400, color: "#333333", fontFamily: "Poppins", lineHeight: 1.8 },
        },
        style: { padding: "56px 40px", background: "#ffffff" },
      },
      htmlCode:
        `<section class="doc-text"><div class="doc-text__inner"><p>Desarrollo del documento: ${instruction}</p></div></section>`,
      cssCode:
        ".doc-text{padding:56px 40px;background:#fff}.doc-text__inner{max-width:900px;margin:0 auto}.doc-text p{margin:0;font-size:18px;line-height:1.8;color:#333}",
    },
    {
      suffix: "Cierre",
      category: "Closing",
      type: "heading",
      content: {
        type: "simple-text",
        editable: {
          text: { text: "Cierre y llamado a la accion", fontSize: 28, fontWeight: 700, color: "#17201a", fontFamily: "Poppins", lineHeight: 1.4 },
        },
        style: { padding: "56px 40px", background: "#f5f7f2", textAlign: "center" },
      },
      htmlCode:
        '<section class="doc-closing"><div class="doc-closing__inner"><h2>Cierre y llamado a la accion</h2><p>Invita a continuar la lectura o a tomar la siguiente accion comercial.</p></div></section>',
      cssCode:
        ".doc-closing{padding:56px 40px;background:#f5f7f2}.doc-closing__inner{max-width:900px;margin:0 auto;text-align:center}.doc-closing h2{margin:0 0 14px;font-size:30px;color:#17201a}.doc-closing p{margin:0;font-size:18px;line-height:1.7;color:#49534a}",
    },
  ];

  const picked = sectionKinds[index % sectionKinds.length];

  if (picked.type === "ai-layout-split") {
    const splitDraft = createAiSectionDraft(`${instruction} | Bloque ${index + 1}`);
    return {
      ...splitDraft,
      name: `${picked.suffix} ${index + 1}`,
    };
  }

  return {
    name: `${picked.suffix} ${index + 1}`,
    description: instruction,
    category: picked.category,
    type: picked.type,
    thumbnail: "AI",
    dimensions: getDefaultSectionDimensions(picked.type),
    htmlCode: picked.htmlCode!,
    cssCode: picked.cssCode!,
    jsCode: "",
    content: picked.content,
  };
}

export function createAiDocumentDraft(instruction: string): GeneratedDocumentDraft {
  const normalizedInstruction = instruction.trim() || "Documento generado por IA";
  const match = normalizedInstruction.match(/\b([4-9]|1\d|20)\b/);
  const requestedCount = match ? Number(match[1]) : 4;
  const sectionCount = Math.max(4, Math.min(20, requestedCount));

  return {
    documentName: "Documento IA",
    description: normalizedInstruction,
    sections: Array.from({ length: sectionCount }, (_, index) =>
      buildDocumentSectionDraft(normalizedInstruction, index)
    ),
  };
}

export function groupSectionsByCategory(sections: Section[]) {
  return sections.reduce<Record<string, Section[]>>((acc, section) => {
    if (!acc[section.category]) {
      acc[section.category] = [];
    }

    acc[section.category].push(section);
    return acc;
  }, {});
}

export const pdfCreatorApi = {
  async getTemplates(user: CurrentUser | null) {
    const params = new URLSearchParams();
    if (user?.id) {
      params.set("userId", user.id);
    }

    const query = params.toString();
    const payload = await apiRequest<{ templates: any[] }>(`/templates${query ? `?${query}` : ""}`);
    return (payload.templates || []).map(normalizeTemplate);
  },

  async getTemplate(id: string) {
    const payload = await apiRequest<{ template: any }>(`/templates/${id}`);
    return normalizeTemplate(payload.template);
  },

  async getSections(user: CurrentUser | null) {
    const params = new URLSearchParams();
    if (user?.id) {
      params.set("userId", user.id);
    }

    const query = params.toString();
    const payload = await apiRequest<{ sections: any[] }>(`/sections${query ? `?${query}` : ""}`);
    return (payload.sections || []).map(normalizeSection);
  },

  async createSection(section: Partial<Section>, user: CurrentUser | null) {
    const payload = await apiRequest<{ section: any }>("/sections", {
      method: "POST",
      body: JSON.stringify({
        name: section.name,
        description: section.description,
        category: section.category,
        type: section.type,
        content: section.content,
        dimensions: section.dimensions,
        thumbnail: section.thumbnail,
        author: section.author,
        htmlCode: section.htmlCode,
        cssCode: section.cssCode,
        jsCode: section.jsCode,
        userId: user?.id || "guest",
        isPublic: section.isPublic ?? false,
      }),
    });

    return normalizeSection(payload.section);
  },

  async updateSection(id: string, section: Partial<Section>, user: CurrentUser | null) {
    const payload = await apiRequest<{ section: any }>(`/sections/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...section,
        userId: user?.id || section.userId || "guest",
      }),
    });

    return normalizeSection(payload.section);
  },

  async deleteSection(id: string, userId: string) {
    await apiRequest<{ success: boolean }>(`/sections/${id}?userId=${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });
  },

  async getDocuments(user: CurrentUser) {
    const payload = await apiRequest<{ documents: any[] }>(`/documents?userId=${encodeURIComponent(user.id)}`);
    return (payload.documents || []).map(normalizeDocument);
  },

  async saveDocument(document: {
    id?: string;
    name: string;
    templateId?: string | null;
    customContent: Section[];
    userId: string;
  }) {
    const payload = await apiRequest<{ document: any }>("/documents", {
      method: "POST",
      body: JSON.stringify(document),
    });

    return normalizeDocument(payload.document);
  },

  async deleteDocument(id: string, userId: string) {
    await apiRequest<{ success: boolean }>(`/documents/${id}?userId=${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });
  },
};
