import { Hono } from "jsr:@hono/hono@4.6.14";
import { cors } from "jsr:@hono/hono@4.6.14/cors";
import * as kv from "./kv_store.tsx";

const app = new Hono();

function buildSectionPrompt(prompt: string, sectionType?: string, sectionTitle?: string) {
  return `
Actua como un Senior Frontend Designer y arquitecto de interfaces para un editor visual estilo Canva.

Debes responder unicamente con JSON valido.

Objetivo:
Generar una seccion web completa, elegante y editable a partir de una instruccion del usuario.

Entrada del usuario:
- Prompt: ${prompt}
- Tipo sugerido: ${sectionType || "dynamic"}
- Titulo sugerido: ${sectionTitle || "sin titulo"}

Debes devolver este formato exacto:
{
  "name": "string",
  "description": "string",
  "category": "string",
  "type": "string",
  "thumbnail": "string",
  "htmlCode": "string",
  "cssCode": "string",
  "jsCode": "",
  "content": {
    "type": "string",
    "editable": {},
    "style": {}
  }
}

Reglas:
- El diseno debe ser limpio, comercial, ordenado y visualmente elegante.
- Incluye todos los estilos en cssCode.
- htmlCode debe ser autocontenido para esa seccion.
- content.editable debe incluir cada texto editable y cualquier dato estructural importante.
- Usa nombres de claves consistentes y faciles de editar.
- Si hay cards, productos, bullets o imagenes, incluyelos en content.editable.
- No devuelvas markdown.
- No expliques nada fuera del JSON.
`;
}

function buildDocumentPrompt(prompt: string) {
  return `
Actua como un Senior Frontend Designer y arquitecto de interfaces para un editor visual estilo Canva.

Debes responder unicamente con JSON valido.

Objetivo:
Generar un documento completo compuesto por multiples secciones web editables.

Entrada del usuario:
- Prompt: ${prompt}

Debes devolver este formato exacto:
{
  "documentName": "string",
  "description": "string",
  "sections": [
    {
      "name": "string",
      "description": "string",
      "category": "string",
      "type": "string",
      "thumbnail": "string",
      "htmlCode": "string",
      "cssCode": "string",
      "jsCode": "",
      "content": {
        "type": "string",
        "editable": {},
        "style": {}
      }
    }
  ]
}

Reglas:
- Genera un documento completo con minimo 4 secciones y maximo 20.
- Si el usuario pide un numero concreto de secciones, respeta ese numero.
- Cada seccion debe ser visualmente distinta y coherente con el documento.
- Incluye todos los estilos de cada seccion en su cssCode.
- Cada seccion debe quedar editable mediante content.editable.
- No devuelvas markdown.
- No expliques nada fuera del JSON.
`;
}

async function callAiProvider(promptText: string) {
  const groqApiKey = Deno.env.get("GROQ_API_KEY");
  const groqModel = Deno.env.get("GROQ_MODEL") || "llama-3.3-70b-versatile";

  if (groqApiKey) {
    console.log(`[AI PROVIDER] provider=groq model=${groqModel}`);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: groqModel,
        temperature: 0.8,
        messages: [
          {
            role: "user",
            content: promptText,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("[AI PROVIDER][GROQ] provider_error", data);
      return {
        ok: false,
        error: data?.error?.message || "Groq request failed",
        data,
      };
    }

    const text = data?.choices?.[0]?.message?.content?.trim() || "";
    return {
      ok: true,
      text,
      provider: "groq",
    };
  }

  const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_API_KEY");
  const geminiModel = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";

  if (!geminiApiKey) {
    return {
      ok: false,
      error: "No AI provider key is configured. Set GROQ_API_KEY or GEMINI_API_KEY.",
    };
  }

  console.log(`[AI PROVIDER] provider=gemini model=${geminiModel}`);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: promptText }],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
        },
      }),
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("[AI PROVIDER][GEMINI] provider_error", data);
    return {
      ok: false,
      error: data?.error?.message || "Gemini request failed",
      data,
    };
  }

  const text =
    data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("") || "";

  return {
    ok: true,
    text,
    provider: "gemini",
  };
}

app.use("*", async (c, next) => {
  const start = Date.now();
  const method = c.req.method;
  const url = new URL(c.req.url);

  console.log(
    `[REQ] ${method} ${url.pathname}${url.search} origin=${c.req.header("origin") || "-"} auth=${c.req.header("authorization") ? "yes" : "no"}`
  );

  await next();

  console.log(`[RES] ${method} ${url.pathname} status=${c.res.status} duration_ms=${Date.now() - start}`);
});

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

app.onError((error, c) => {
  console.error(`[ERROR] ${c.req.method} ${c.req.path}`, error);
  return c.json({ error: "Internal server error", details: String(error?.message || error) }, 500);
});

app.notFound((c) => {
  console.error(`[NOT_FOUND] ${c.req.method} ${c.req.path}`);
  return c.json({ error: "Route not found", path: c.req.path, method: c.req.method }, 404);
});

app.post("/ai/generate-section", async (c) => {
  const body = await c.req.json();
  const { prompt, sectionType, sectionTitle } = body;

  console.log(`[AI GENERATE] type=${sectionType || "dynamic"} title=${sectionTitle || "-"} prompt_length=${String(prompt || "").length}`);

  if (!prompt || !String(prompt).trim()) {
    return c.json({ error: "Prompt is required" }, 400);
  }

  const providerResult = await callAiProvider(buildSectionPrompt(prompt, sectionType, sectionTitle));

  if (!providerResult.ok) {
    return c.json({ error: providerResult.error || "AI request failed" }, 500);
  }

  const text = providerResult.text || "";
  const clean = text.replace(/```json|```/g, "").trim();

  if (!clean) {
    console.error("[AI GENERATE] empty_response");
    return c.json({ error: "Gemini returned an empty draft" }, 500);
  }

  try {
    const draft = JSON.parse(clean);
    return c.json({ draft, provider: providerResult.provider });
  } catch (error) {
    console.error("[AI GENERATE] invalid_json", clean);
    return c.json({ error: "AI provider returned invalid JSON", details: String(error) }, 500);
  }
});

app.post("/ai/generate-document", async (c) => {
  const body = await c.req.json();
  const { prompt } = body;

  console.log(`[AI DOCUMENT] prompt_length=${String(prompt || "").length}`);

  if (!prompt || !String(prompt).trim()) {
    return c.json({ error: "Prompt is required" }, 400);
  }

  const providerResult = await callAiProvider(buildDocumentPrompt(prompt));

  if (!providerResult.ok) {
    return c.json({ error: providerResult.error || "AI request failed" }, 500);
  }

  const text = providerResult.text || "";
  const clean = text.replace(/```json|```/g, "").trim();

  if (!clean) {
    console.error("[AI DOCUMENT] empty_response");
    return c.json({ error: "Gemini returned an empty document draft" }, 500);
  }

  try {
    const draft = JSON.parse(clean);
    return c.json({ draft, provider: providerResult.provider });
  } catch (error) {
    console.error("[AI DOCUMENT] invalid_json", clean);
    return c.json({ error: "AI provider returned invalid JSON", details: String(error) }, 500);
  }
});

app.post("/auth/register", async (c) => {
  const body = await c.req.json();
  console.log(`[AUTH REGISTER] email=${body.email} name=${body.name || "-"}`);

  const { email, password, name } = body;

  if (!email || !password) {
    return c.json({ error: "Email y contrasena son requeridos" }, 400);
  }

  const existing = await kv.getUserByEmail(email);
  if (existing) {
    console.log(`[AUTH REGISTER] existing_user=${email}`);
    return c.json({ error: "El usuario ya existe" }, 409);
  }

  const user = await kv.createUser(email, password, name);
  console.log(`[AUTH REGISTER] created_user_id=${user.id}`);

  const { password: _, ...userWithoutPassword } = user;
  return c.json({ user: userWithoutPassword }, 201);
});

app.post("/auth/login", async (c) => {
  const body = await c.req.json();
  console.log(`[AUTH LOGIN] email=${body.email}`);

  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: "Email y contrasena son requeridos" }, 400);
  }

  const user = await kv.getUserByEmail(email);

  if (!user || user.password !== password) {
    console.log(`[AUTH LOGIN] invalid_credentials email=${email}`);
    return c.json({ error: "Email o contrasena incorrectos" }, 401);
  }

  console.log(`[AUTH LOGIN] success user_id=${user.id}`);
  const { password: _, ...userWithoutPassword } = user;
  return c.json({ user: userWithoutPassword });
});

app.get("/auth/me/:id", async (c) => {
  const id = c.req.param("id");
  console.log(`[AUTH ME] user_id=${id}`);

  const user = await kv.getUserById(id);

  if (!user) {
    return c.json({ error: "Usuario no encontrado" }, 404);
  }

  const { password: _, ...userWithoutPassword } = user;
  return c.json({ user: userWithoutPassword });
});

app.get("/templates", async (c) => {
  const userId = c.req.query("userId") || "guest";
  console.log(`[TEMPLATES GET ALL] user_id=${userId}`);

  const allTemplates = await kv.getByPrefix("template:");
  const filtered = allTemplates.filter((t: any) => t.value.isPublic || t.value.userId === userId);

  console.log(`[TEMPLATES GET ALL] raw_count=${allTemplates.length} filtered_count=${filtered.length}`);
  return c.json({ templates: filtered.map((t: any) => t.value) });
});

app.get("/templates/:id", async (c) => {
  const id = c.req.param("id");
  console.log(`[TEMPLATES GET] template_id=${id}`);

  const template = await kv.get(`template:${id}`);
  if (!template) {
    return c.json({ error: "Template not found" }, 404);
  }

  return c.json({ template });
});

app.post("/templates", async (c) => {
  const body = await c.req.json();
  const { name, description, sections, userId, isPublic } = body;
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

  console.log(`[TEMPLATES CREATE] name=${name} user_id=${userId || "guest"}`);

  const template = {
    id,
    name,
    description,
    sections,
    userId: userId || "guest",
    isPublic: isPublic ?? false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await kv.set(`template:${id}`, template);
  return c.json({ template }, 201);
});

app.put("/templates/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  console.log(`[TEMPLATES UPDATE] template_id=${id}`);

  const existing = await kv.get(`template:${id}`);
  if (!existing) {
    return c.json({ error: "Template not found" }, 404);
  }

  const updated = {
    ...existing,
    ...body,
    id,
    updatedAt: new Date().toISOString(),
  };

  await kv.set(`template:${id}`, updated);
  return c.json({ template: updated });
});

app.delete("/templates/:id", async (c) => {
  const id = c.req.param("id");
  console.log(`[TEMPLATES DELETE] template_id=${id}`);

  await kv.del(`template:${id}`);
  return c.json({ success: true });
});

app.get("/sections", async (c) => {
  const userId = c.req.query("userId") || "guest";
  console.log(`[SECTIONS GET ALL] user_id=${userId}`);

  const allSections = await kv.getByPrefix("section:");
  const filtered = allSections.filter((s: any) => s.value.isPublic || s.value.userId === userId);

  console.log(`[SECTIONS GET ALL] raw_count=${allSections.length} filtered_count=${filtered.length}`);
  return c.json({ sections: filtered.map((s: any) => s.value) });
});

app.post("/sections", async (c) => {
  const body = await c.req.json();
  const { type, name, description, category, content, thumbnail, author, htmlCode, cssCode, jsCode, userId, isPublic } =
    body;
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

  console.log(`[SECTIONS CREATE] name=${name} type=${type} user_id=${userId || "guest"}`);

  const section = {
    id,
    type,
    name,
    description: description || "",
    category: category || "General",
    content,
    thumbnail: thumbnail || "DOC",
    author: author || userId || "guest",
    htmlCode: htmlCode || "",
    cssCode: cssCode || "",
    jsCode: jsCode || "",
    userId: userId || "guest",
    isPublic: isPublic ?? false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await kv.set(`section:${id}`, section);
  return c.json({ section }, 201);
});

app.put("/sections/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const requesterId = body.userId || "guest";

  console.log(`[SECTIONS UPDATE] section_id=${id} requester_id=${requesterId}`);

  const existing = await kv.get(`section:${id}`);
  if (!existing) {
    return c.json({ error: "Section not found" }, 404);
  }

  if (existing.userId && existing.userId !== requesterId) {
    return c.json({ error: "No tienes permisos para editar esta seccion" }, 403);
  }

  const updated = {
    ...existing,
    ...body,
    id,
    userId: existing.userId || requesterId,
    updatedAt: new Date().toISOString(),
  };

  await kv.set(`section:${id}`, updated);
  return c.json({ section: updated });
});

app.delete("/sections/:id", async (c) => {
  const id = c.req.param("id");
  const requesterId = c.req.query("userId") || "guest";

  console.log(`[SECTIONS DELETE] section_id=${id} requester_id=${requesterId}`);

  const existing = await kv.get(`section:${id}`);
  if (!existing) {
    return c.json({ error: "Section not found" }, 404);
  }

  if (existing.userId && existing.userId !== requesterId) {
    return c.json({ error: "No tienes permisos para eliminar esta seccion" }, 403);
  }

  await kv.del(`section:${id}`);
  return c.json({ success: true });
});

app.get("/documents", async (c) => {
  const userId = c.req.query("userId") || "guest";
  console.log(`[DOCUMENTS GET ALL] user_id=${userId}`);

  const allDocs = await kv.getByPrefix(`document:${userId}:`);
  console.log(`[DOCUMENTS GET ALL] count=${allDocs.length}`);

  return c.json({ documents: allDocs.map((d: any) => d.value) });
});

app.get("/documents/:id", async (c) => {
  const id = c.req.param("id");
  const userId = c.req.query("userId") || "guest";
  console.log(`[DOCUMENTS GET] user_id=${userId} document_id=${id}`);

  const document = await kv.get(`document:${userId}:${id}`);
  if (!document) {
    return c.json({ error: "Document not found" }, 404);
  }

  return c.json({ document });
});

app.post("/documents", async (c) => {
  const body = await c.req.json();
  const { id, userId, templateId, customContent, name } = body;
  const docId = id || `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  const userIdSafe = userId || "guest";

  console.log(`[DOCUMENTS SAVE] name=${name} user_id=${userIdSafe} template_id=${templateId || "-"}`);

  const document = {
    id: docId,
    userId: userIdSafe,
    templateId,
    name: name || "Untitled Document",
    customContent,
    lastModified: new Date().toISOString(),
  };

  await kv.set(`document:${userIdSafe}:${docId}`, document);
  return c.json({ document }, 201);
});

app.delete("/documents/:id", async (c) => {
  const id = c.req.param("id");
  const userId = c.req.query("userId") || "guest";
  console.log(`[DOCUMENTS DELETE] user_id=${userId} document_id=${id}`);

  await kv.del(`document:${userId}:${id}`);
  return c.json({ success: true });
});

app.get("/diagnostics/storage", async (c) => {
  const sampleUserId = c.req.query("userId") || null;
  console.log(`[DIAGNOSTICS STORAGE] sample_user_id=${sampleUserId || "-"}`);

  const [templates, sections, usersSummary, sampleDocuments] = await Promise.all([
    kv.getByPrefix("template:"),
    kv.getByPrefix("section:"),
    kv.getUsersSummary(),
    sampleUserId ? kv.getByPrefix(`document:${sampleUserId}:`) : Promise.resolve([]),
  ]);

  const publicTemplates = templates.filter((item: any) => item.value?.isPublic).length;
  const publicSections = sections.filter((item: any) => item.value?.isPublic).length;

  return c.json({
    ok: true,
    tables: {
      kv_store_pdf_creator: {
        reachable: true,
      },
      users_pdf_creator: {
        reachable: true,
      },
    },
    counts: {
      templates_total: templates.length,
      templates_public: publicTemplates,
      sections_total: sections.length,
      sections_public: publicSections,
      users_total: usersSummary.count,
      sample_user_documents: sampleDocuments.length,
    },
    sample: {
      template_keys: templates.slice(0, 5).map((item: any) => item.key),
      section_keys: sections.slice(0, 5).map((item: any) => item.key),
      sample_user_document_keys: sampleDocuments.slice(0, 5).map((item: any) => item.key),
      user_ids: usersSummary.ids,
    },
  });
});

Deno.serve(app.fetch);
