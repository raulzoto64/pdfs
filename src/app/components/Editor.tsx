import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import {
  AppBar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fab,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DownloadIcon from "@mui/icons-material/Download";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { SectionLibraryModal } from "./SectionLibraryModal";
import { EditableSection } from "./EditableSection";
import { AIContentGenerator } from "./AIContentGenerator";
import { getCurrentUser } from "../utils/auth";
import {
  consumeSeedSectionsForEditor,
  pdfCreatorApi,
  type GeneratedDocumentDraft,
  type GeneratedSectionDraft,
} from "../utils/pdfCreatorApi";
import {
  SECTION_DIMENSION_PRESETS,
  type Section,
  type SectionDimensionPreset,
} from "../types/pdfCreator";

const ITEM_TYPE = "SECTION";

interface DraggableSectionWrapperProps {
  section: Section;
  index: number;
  moveSection: (fromIndex: number, toIndex: number) => void;
  onUpdate: (index: number, updatedSection: Section) => void;
  onDelete: (index: number) => void;
}

function DraggableSectionWrapper({
  section,
  index,
  moveSection,
  onUpdate,
  onDelete,
  onGenerateAI,
}: DraggableSectionWrapperProps & { onGenerateAI?: (section: Section) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveSection(item.index, index);
        item.index = index;
      }
    },
  });

  drag(drop(ref));

  return (
    <Box ref={ref} sx={{ opacity: isDragging ? 0.5 : 1 }}>
      <EditableSection
        section={section}
        index={index}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onGenerateAI={onGenerateAI}
        dragHandleProps={{ ref: preview }}
      />
    </Box>
  );
}

export function Editor() {
  const { templateId } = useParams();
  const [searchParams] = useSearchParams();
  const documentId = searchParams.get("documentId");
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [sections, setSections] = useState<Section[]>([]);
  const [documentName, setDocumentName] = useState("Nuevo PDF");
  const [loading, setLoading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiMode, setAiMode] = useState<"section" | "document">("section");
  const [selectedSectionForAI, setSelectedSectionForAI] = useState<Section | null>(null);
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(documentId);
  const [autosaveMessage, setAutosaveMessage] = useState("Sin guardar");
  const [documentSectionPreset, setDocumentSectionPreset] = useState<SectionDimensionPreset | "all">("all");
  const previewRef = useRef<HTMLDivElement>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autosaveReadyRef = useRef(false);
  const currentDocumentIdRef = useRef<string | null>(documentId);
  const sectionAutosaveTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    void loadInitialData();
  }, [templateId, documentId]);

  useEffect(() => {
    currentDocumentIdRef.current = currentDocumentId;
  }, [currentDocumentId]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!autosaveReadyRef.current) {
      autosaveReadyRef.current = true;
      return;
    }

    if (!user || sections.length === 0) {
      return;
    }

    setAutosaveMessage("Guardando borrador...");

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      void persistDocument(true);
    }, 1200);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [sections, documentName, loading, user, templateId]);

  async function loadInitialData() {
    setLoading(true);

    try {
      if (documentId && user) {
        const docs = await pdfCreatorApi.getDocuments(user);
        const existingDocument = docs.find((doc) => doc.id === documentId);

        if (existingDocument) {
          setSections(existingDocument.customContent || []);
          setDocumentName(existingDocument.name);
          setCurrentDocumentId(existingDocument.id);
          currentDocumentIdRef.current = existingDocument.id;
          setDocumentSectionPreset(existingDocument.customContent?.[0]?.dimensions?.preset || "all");
          setAutosaveMessage("Documento cargado");
          setLoading(false);
          return;
        }
      }

      if (templateId) {
        const template = await pdfCreatorApi.getTemplate(templateId);
        setSections([...template.sections]);
        setDocumentName(`Copia de ${template.name}`);
        setDocumentSectionPreset(template.sections?.[0]?.dimensions?.preset || "all");
        setAutosaveMessage("Borrador listo");
      } else {
        const seededSections = consumeSeedSectionsForEditor();
        setSections(seededSections);
        setDocumentName(seededSections.length > 0 ? "Documento desde biblioteca" : "Nuevo PDF");
        setDocumentSectionPreset(seededSections?.[0]?.dimensions?.preset || "all");
        setAutosaveMessage(seededSections.length > 0 ? "Borrador listo" : "Sin guardar");
      }
    } catch (error: any) {
      toast.error(error.message || "No se pudo cargar la informacion solicitada");
    } finally {
      setLoading(false);
    }
  }

  async function persistSection(section: Section) {
    try {
      return await pdfCreatorApi.updateSection(section.id, section, user);
    } catch (error: any) {
      if (String(error?.message || "").includes("Section not found")) {
        return await pdfCreatorApi.createSection(section, user);
      }

      throw error;
    }
  }

  async function persistDocument(silent = false, nextSections?: Section[], nextName?: string) {
    if (!user) {
      if (!silent) {
        toast.error("Debes iniciar sesion para guardar");
        navigate("/auth");
      }
      return null;
    }

    const sectionsToSave = nextSections ?? sections;
    if (sectionsToSave.length === 0) {
      return null;
    }

    try {
      const saved = await pdfCreatorApi.saveDocument({
        id: currentDocumentIdRef.current || undefined,
        name: nextName ?? documentName,
        templateId: templateId || null,
        customContent: sectionsToSave,
        userId: user.id,
      });

      setCurrentDocumentId(saved.id);
      currentDocumentIdRef.current = saved.id;
      setAutosaveMessage(`Guardado ${new Date().toLocaleTimeString()}`);

      if (!silent) {
        toast.success("Documento guardado exitosamente");
        setSaveDialogOpen(false);
      }

      return saved;
    } catch (error: any) {
      setAutosaveMessage("Error al guardar");
      if (!silent) {
        toast.error(error.message || "No se pudo guardar el documento");
      }
      return null;
    }
  }

  async function handleSelectSection(section: Section) {
    const isOwnedSection = Boolean(user?.id && section.userId === user.id);

    if (isOwnedSection) {
      setSections((prev) => [...prev, section]);
      setAutosaveMessage("Cambios pendientes");
      toast.success(`Seccion "${section.name}" agregada sin duplicarla`);
      return;
    }

    try {
      const savedSection = await pdfCreatorApi.createSection(section, user);
      setSections((prev) => [...prev, savedSection]);
      toast.success(`Seccion "${savedSection.name}" agregada y guardada`);
    } catch (error: any) {
      setSections((prev) => [...prev, section]);
      setAutosaveMessage("Pendiente de guardar");
      toast.error(error.message || "La seccion se agrego localmente, pero no se pudo persistir.");
    }
  }

  function moveSection(fromIndex: number, toIndex: number) {
    const newSections = [...sections];
    const [movedSection] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, movedSection);
    setSections(newSections);
    setAutosaveMessage("Cambios pendientes");
  }

  function updateSection(index: number, updatedSection: Section) {
    const newSections = [...sections];
    newSections[index] = updatedSection;
    setSections(newSections);
    setAutosaveMessage("Cambios pendientes");

    const existingTimer = sectionAutosaveTimersRef.current[updatedSection.id];
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    sectionAutosaveTimersRef.current[updatedSection.id] = setTimeout(() => {
      void persistSection(updatedSection)
        .then((savedSection) => {
          setSections((prev) =>
            prev.map((section) => (section.id === updatedSection.id ? savedSection : section))
          );
          setAutosaveMessage(`Seccion guardada ${new Date().toLocaleTimeString()}`);
        })
        .catch((error: any) => {
          console.error("[SECTION_AUTOSAVE][ERROR]", {
            sectionId: updatedSection.id,
            sectionName: updatedSection.name,
            error,
          });
          setAutosaveMessage("Seccion pendiente de guardar");
        })
        .finally(() => {
          delete sectionAutosaveTimersRef.current[updatedSection.id];
        });
    }, 800);
  }

  function deleteSection(index: number) {
    setSections(sections.filter((_, i) => i !== index));
    setAutosaveMessage("Cambios pendientes");
    toast.success("Seccion eliminada");
  }

  function handleGenerateAIContent(section: Section) {
    setAiMode("section");
    setSelectedSectionForAI(section);
    setAiDialogOpen(true);
  }

  function mapDraftToSection(draft: GeneratedSectionDraft, forcedId?: string): Section {
    return {
      id: forcedId || `section-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: draft.name,
      description: draft.description,
      category: draft.category,
      type: draft.type,
      content: draft.content,
      dimensions: draft.dimensions,
      thumbnail: draft.thumbnail,
      author: user?.id || "guest",
      isPublic: false,
      createdAt: new Date().toISOString(),
      userId: user?.id || "guest",
      htmlCode: draft.htmlCode,
      cssCode: draft.cssCode,
      jsCode: draft.jsCode,
    };
  }

  function collectDraftTexts(value: any): string[] {
    if (value == null) {
      return [];
    }

    if (typeof value === "string") {
      const clean = value.trim();
      return clean ? [clean] : [];
    }

    if (Array.isArray(value)) {
      return value.flatMap((item) => collectDraftTexts(item));
    }

    if (typeof value === "object") {
      if (typeof value.text === "string") {
        const clean = value.text.trim();
        return clean ? [clean] : [];
      }

      return Object.values(value).flatMap((item) => collectDraftTexts(item));
    }

    return [];
  }

  function sanitizeTextValue(text: string) {
    return text.replace(/\{\{\s*([^}]+)\s*\}\}/g, "$1").trim();
  }

  function detectAiEditMode(prompt: string): "text" | "design" | "full" {
    const normalized = prompt.toLowerCase();
    const asksTextOnly =
      /(solo|solamente|unicamente|únicamente).*(texto|copy|contenido)/.test(normalized) ||
      /(texto|copy|contenido).*(solo|solamente|unicamente|únicamente)/.test(normalized);
    const asksDesignOnly =
      /(solo|solamente|unicamente|únicamente).*(diseño|diseno|layout|estilo|visual)/.test(normalized) ||
      /(diseño|diseno|layout|estilo|visual).*(solo|solamente|unicamente|únicamente)/.test(normalized);

    if (asksTextOnly && !asksDesignOnly) {
      return "text";
    }

    if (asksDesignOnly && !asksTextOnly) {
      return "design";
    }

    return "full";
  }

  function detectRequestedKeys(prompt: string) {
    const normalized = prompt.toLowerCase();
    const requestedKeys = new Set<string>();
    const aliases: Record<string, string[]> = {
      title: ["titulo", "título", "title", "encabezado", "headline"],
      subtitle: ["subtitulo", "subtítulo", "subtitle", "subheadline"],
      description: ["descripcion", "descripción", "description", "parrafo", "párrafo", "texto", "contenido"],
      tagline: ["tagline", "frase", "claim"],
      eyebrow: ["badge", "eyebrow", "etiqueta"],
      name: ["nombre", "name"],
      role: ["cargo", "role"],
      email: ["email", "correo", "mail"],
      phone: ["telefono", "teléfono", "phone", "celular"],
      address: ["direccion", "dirección", "address", "ubicacion", "ubicación"],
      website: ["web", "sitio", "website", "url"],
      question: ["pregunta", "question"],
      answer: ["respuesta", "answer"],
      challenge: ["desafio", "desafío", "challenge"],
      solution: ["solucion", "solución", "solution"],
    };

    Object.entries(aliases).forEach(([key, words]) => {
      if (words.some((word) => normalized.includes(word))) {
        requestedKeys.add(key);
      }
    });

    return requestedKeys;
  }

  function wantsToAddContent(prompt: string) {
    return /(agrega|agregar|añade|anade|incluye|suma|pon|inserta|add|append)/i.test(prompt);
  }

  function detectAiEditModeSafe(prompt: string): "text" | "design" | "full" {
    const normalized = prompt.toLowerCase();
    const asksTextOnly =
      /(solo|solamente|unicamente).*(texto|copy|contenido)/.test(normalized) ||
      /(texto|copy|contenido).*(solo|solamente|unicamente)/.test(normalized);
    const asksDesignOnly =
      /(solo|solamente|unicamente).*(diseno|layout|estilo|visual)/.test(normalized) ||
      /(diseno|layout|estilo|visual).*(solo|solamente|unicamente)/.test(normalized);

    if (asksTextOnly && !asksDesignOnly) {
      return "text";
    }

    if (asksDesignOnly && !asksTextOnly) {
      return "design";
    }

    return "full";
  }

  function detectRequestedKeysSafe(prompt: string) {
    const normalized = prompt.toLowerCase();
    const requestedKeys = new Set<string>();
    const aliases: Record<string, string[]> = {
      title: ["titulo", "title", "encabezado", "headline"],
      subtitle: ["subtitulo", "subtitle", "subheadline"],
      description: ["descripcion", "description", "parrafo", "texto", "contenido"],
      tagline: ["tagline", "frase", "claim"],
      eyebrow: ["badge", "eyebrow", "etiqueta"],
      name: ["nombre", "name"],
      role: ["cargo", "role"],
      email: ["email", "correo", "mail"],
      phone: ["telefono", "phone", "celular"],
      address: ["direccion", "address", "ubicacion"],
      website: ["web", "sitio", "website", "url"],
      question: ["pregunta", "question"],
      answer: ["respuesta", "answer"],
      challenge: ["desafio", "challenge"],
      solution: ["solucion", "solution"],
    };

    Object.entries(aliases).forEach(([key, words]) => {
      if (words.some((word) => normalized.includes(word))) {
        requestedKeys.add(key);
      }
    });

    return requestedKeys;
  }

  function wantsToAddContentSafe(prompt: string) {
    return /(agrega|agregar|anade|incluye|suma|pon|inserta|add|append)/i.test(prompt);
  }

  function mergeTextEditable(target: any, source: any, requestedKeys: Set<string>, allowAppend: boolean, currentKey = ""): any {
    if (target == null) {
      return target;
    }

    if (Array.isArray(target)) {
      const sourceArray = Array.isArray(source) ? source : [];
      const merged = target.map((item, index) =>
        mergeTextEditable(item, sourceArray[index], requestedKeys, allowAppend, currentKey)
      );

      if (allowAppend && sourceArray.length > target.length) {
        return [...merged, ...sourceArray.slice(target.length)];
      }

      return merged;
    }

    if (typeof target === "object") {
      if (typeof target.text === "string") {
        const sourceText =
          source && typeof source === "object" && typeof source.text === "string"
            ? sanitizeTextValue(source.text)
            : typeof source === "string"
              ? sanitizeTextValue(source)
              : "";

        const shouldUpdate =
          sourceText &&
          (requestedKeys.size === 0 || requestedKeys.has(currentKey) || currentKey === "");

        return shouldUpdate ? { ...target, text: sourceText } : target;
      }

      const nextObject: Record<string, any> = { ...target };
      for (const [key, value] of Object.entries(target)) {
        nextObject[key] = mergeTextEditable(
          value,
          source && typeof source === "object" ? source[key] : undefined,
          requestedKeys,
          allowAppend,
          key
        );
      }
      return nextObject;
    }

    if (typeof target === "string") {
      const sourceText =
        typeof source === "string"
          ? sanitizeTextValue(source)
          : source && typeof source === "object" && typeof source.text === "string"
            ? sanitizeTextValue(source.text)
            : "";
      const shouldUpdate =
        sourceText &&
        (requestedKeys.size === 0 || requestedKeys.has(currentKey) || currentKey === "");
      return shouldUpdate ? sourceText : target;
    }

    return target;
  }

  function mergeDesignEditable(target: any, source: any): any {
    if (target == null) {
      return target;
    }

    if (Array.isArray(target)) {
      const sourceArray = Array.isArray(source) ? source : [];
      return target.map((item, index) => mergeDesignEditable(item, sourceArray[index]));
    }

    if (typeof target === "object") {
      if (typeof target.text === "string") {
        const sourceObject = source && typeof source === "object" ? source : {};
        const { text: _ignoredText, ...visualProps } = sourceObject;
        return Object.keys(visualProps).length > 0 ? { ...target, ...visualProps, text: target.text } : target;
      }

      const nextObject: Record<string, any> = { ...target };
      const sourceObject = source && typeof source === "object" ? source : {};
      for (const [key, value] of Object.entries(target)) {
        nextObject[key] = mergeDesignEditable(value, sourceObject[key]);
      }
      return nextObject;
    }

    return target;
  }

  function applyTextsToEditable(target: any, queue: string[]): any {
    if (target == null) {
      return target;
    }

    if (Array.isArray(target)) {
      return target.map((item) => applyTextsToEditable(item, queue));
    }

    if (typeof target === "object") {
      if (typeof target.text === "string") {
        const nextText = queue.shift();
        return nextText ? { ...target, text: nextText } : target;
      }

      const nextObject: Record<string, any> = {};
      for (const [key, value] of Object.entries(target)) {
        nextObject[key] = applyTextsToEditable(value, queue);
      }
      return nextObject;
    }

    if (typeof target === "string") {
      return queue.shift() || target;
    }

    return target;
  }

  function mergeDraftIntoSection(section: Section, draft: GeneratedSectionDraft, prompt: string): Section {
    const mode = detectAiEditModeSafe(prompt);
    const requestedKeys = detectRequestedKeysSafe(prompt);
    const allowAppend = wantsToAddContentSafe(prompt);
    const sourceEditable = draft.content?.editable || {};
    const preserveIdentity = Boolean(section.id);

    let nextEditable = section.content?.editable || {};
    let nextStyle = section.content?.style;
    let nextType = section.content?.type || section.type;
    let nextHtmlCode = section.htmlCode;
    let nextCssCode = section.cssCode;
    let nextJsCode = section.jsCode;
    let nextThumbnail = section.thumbnail;
    let nextDimensions = section.dimensions;

    if (mode === "text") {
      nextEditable = mergeTextEditable(nextEditable, sourceEditable, requestedKeys, allowAppend);
    } else if (mode === "design") {
      nextEditable = mergeDesignEditable(nextEditable, sourceEditable);
      nextStyle = draft.content?.style || nextStyle;
      nextHtmlCode = draft.htmlCode || nextHtmlCode;
      nextCssCode = draft.cssCode || nextCssCode;
      nextJsCode = draft.jsCode || nextJsCode;
      nextThumbnail = draft.thumbnail || nextThumbnail;
      nextDimensions = draft.dimensions || nextDimensions;
    } else {
      const draftTexts = collectDraftTexts(sourceEditable).map(sanitizeTextValue);
      nextEditable = applyTextsToEditable(nextEditable, [...draftTexts]);
      nextEditable = mergeDesignEditable(nextEditable, sourceEditable);
      nextStyle = draft.content?.style || nextStyle;
      nextType = draft.content?.type || draft.type || nextType;
      nextHtmlCode = draft.htmlCode || nextHtmlCode;
      nextCssCode = draft.cssCode || nextCssCode;
      nextJsCode = draft.jsCode || nextJsCode;
      nextThumbnail = draft.thumbnail || nextThumbnail;
      nextDimensions = draft.dimensions || nextDimensions;
    }

    return {
      ...section,
      name: preserveIdentity ? section.name : draft.name || section.name,
      description: draft.description || section.description,
      category: preserveIdentity ? section.category : draft.category || section.category,
      type: nextType,
      dimensions: nextDimensions,
      thumbnail: nextThumbnail,
      htmlCode: nextHtmlCode,
      cssCode: nextCssCode,
      jsCode: nextJsCode,
      content: {
        ...section.content,
        type: nextType,
        style: nextStyle,
        editable: nextEditable,
      },
    };
  }

  async function handleAISectionGenerated(draft: GeneratedSectionDraft, prompt: string) {
    console.log("[AI_SECTION][ACCEPT]", {
      prompt,
      selectedSectionId: selectedSectionForAI?.id || null,
      draftType: draft.type,
      draftName: draft.name,
    });

    const baseSection = mapDraftToSection(draft);

    if (selectedSectionForAI) {
      const updatedSection = mergeDraftIntoSection(selectedSectionForAI, draft, prompt);
      const sectionIndex = sections.findIndex((section) => section.id === selectedSectionForAI.id);

      if (sectionIndex === -1) {
        return;
      }

      updateSection(sectionIndex, updatedSection);

      try {
        const savedSection = await persistSection(updatedSection);
        console.log("[AI_SECTION][PERSIST_OK]", {
          sectionId: savedSection.id,
          sectionName: savedSection.name,
          mode: "update",
        });
        setSections((prev) => {
          const next = [...prev];
          next[sectionIndex] = savedSection;
          return next;
        });
        toast.success("Seccion actualizada con IA");
      } catch (error: any) {
        setAutosaveMessage("Pendiente de guardar");
        toast.error(error.message || "La seccion se actualizo localmente, pero no se pudo persistir.");
      }
      return;
    }

    try {
      const savedSection = await pdfCreatorApi.createSection(baseSection, user);
      console.log("[AI_SECTION][PERSIST_OK]", {
        sectionId: savedSection.id,
        sectionName: savedSection.name,
        mode: "create",
      });
      setSections((prev) => [...prev, savedSection]);
      toast.success("Seccion creada con IA y guardada");
    } catch (error: any) {
      setSections((prev) => [...prev, baseSection]);
      setAutosaveMessage("Pendiente de guardar");
      toast.error(error.message || "No se pudo guardar la seccion IA. Se agrego localmente.");
    }
  }

  async function handleAIDocumentGenerated(draft: GeneratedDocumentDraft) {
    console.log("[AI_DOCUMENT][ACCEPT]", {
      documentName: draft.documentName,
      sections: draft.sections.length,
    });

    const timestamp = Date.now();
    const nextDocumentName = draft.documentName || "Documento IA";
    const generatedSections = draft.sections.map((sectionDraft, index) =>
      mapDraftToSection(
        sectionDraft,
        `section-${timestamp}-${index}-${Math.random().toString(36).slice(2, 6)}`
      )
    );

    try {
      const persistedSections = await Promise.all(
        generatedSections.map((section) => pdfCreatorApi.createSection(section, user))
      );

      setSections(persistedSections);
      setDocumentName(nextDocumentName);
      setCurrentDocumentId(null);
      setDocumentSectionPreset(persistedSections?.[0]?.dimensions?.preset || "all");
      await persistDocument(true, persistedSections, nextDocumentName);
      toast.success(`Documento generado con ${persistedSections.length} secciones y guardado como borrador`);
    } catch (error: any) {
      setSections(generatedSections);
      setDocumentName(nextDocumentName);
      setCurrentDocumentId(null);
      setDocumentSectionPreset(generatedSections?.[0]?.dimensions?.preset || "all");
      setAutosaveMessage("Pendiente de guardar");
      toast.error(error.message || "Documento generado localmente. Quedo pendiente de persistir.");
    }
  }

  async function saveDocument() {
    await persistDocument(false);
  }

  async function exportToPDF() {
    if (!previewRef.current) {
      return;
    }

    try {
      toast.info("Generando PDF... Esto puede tomar unos segundos");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;

      if (scaledHeight > pdfHeight) {
        let heightLeft = scaledHeight;
        let position = 0;

        while (heightLeft > 0) {
          if (position > 0) {
            pdf.addPage();
          }

          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, scaledHeight);
          heightLeft -= pdfHeight;
          position -= pdfHeight / ratio;
        }
      } else {
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, scaledHeight);
      }

      pdf.save(`${documentName}.pdf`);
      toast.success("PDF descargado exitosamente");
    } catch (error: any) {
      toast.error(`Error al exportar PDF: ${error.message}`);
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress size={60} sx={{ color: "#1c5d15" }} />
      </Box>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <AppBar position="static" color="default" elevation={2}>
          <Toolbar sx={{ gap: 2, flexWrap: "wrap" }}>
            <TextField
              value={documentName}
              onChange={(event) => setDocumentName(event.target.value)}
              size="small"
              sx={{
                minWidth: 300,
                "& .MuiOutlinedInput-root": {
                  fontWeight: 600,
                  bgcolor: "white",
                },
              }}
            />

            <Box sx={{ flexGrow: 1 }} />

            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Dimensiones del documento</InputLabel>
              <Select
                value={documentSectionPreset}
                label="Dimensiones del documento"
                onChange={(event) => setDocumentSectionPreset(event.target.value as SectionDimensionPreset | "all")}
                sx={{ bgcolor: "white" }}
              >
                <MenuItem value="all">Todas</MenuItem>
                {Object.values(SECTION_DIMENSION_PRESETS).map((preset) => (
                  <MenuItem key={preset.preset} value={preset.preset}>
                    {preset.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Chip label={`${sections.length} secciones`} color="primary" variant="outlined" />
            <Chip
              label={autosaveMessage}
              color={autosaveMessage.includes("Error") ? "error" : autosaveMessage.includes("Guardado") ? "success" : "default"}
              variant="outlined"
            />

            <Divider orientation="vertical" flexItem />

            <Button
              startIcon={<SaveIcon />}
              onClick={() => setSaveDialogOpen(true)}
              variant="contained"
              sx={{
                bgcolor: "#1c5d15",
                "&:hover": { bgcolor: "#0d350b" },
              }}
            >
              Guardar
            </Button>

            <Button
              startIcon={<DownloadIcon />}
              onClick={() => void exportToPDF()}
              variant="outlined"
              sx={{
                borderColor: "#1c5d15",
                color: "#1c5d15",
                "&:hover": {
                  borderColor: "#0d350b",
                  bgcolor: "#f0f7ef",
                },
              }}
            >
              Exportar PDF
            </Button>
          </Toolbar>
        </AppBar>

        <Box sx={{ flexGrow: 1, overflow: "hidden", bgcolor: "#f5f5f5" }}>
          <Container maxWidth="lg" sx={{ py: 4, height: "100%", overflowY: "auto" }}>
            {sections.length === 0 ? (
              <Paper
                sx={{
                  p: 8,
                  textAlign: "center",
                  bgcolor: "white",
                  borderRadius: 3,
                }}
              >
                <ViewModuleIcon sx={{ fontSize: 80, color: "#1c5d15", mb: 3 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: "#1c5d15" }}>
                  Construye tu PDF paso a paso
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: "auto" }}>
                  <strong>1.</strong> Selecciona secciones de la biblioteca
                  <br />
                  <strong>2.</strong> Ordenalas dentro del PDF
                  <br />
                  <strong>3.</strong> Edita el contenido
                  <br />
                  <strong>4.</strong> Continualo luego desde tus borradores
                </Typography>

                <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
                  <FormControl size="small" sx={{ minWidth: 260 }}>
                    <InputLabel>Dimensiones a usar</InputLabel>
                    <Select
                      value={documentSectionPreset}
                      label="Dimensiones a usar"
                      onChange={(event) => setDocumentSectionPreset(event.target.value as SectionDimensionPreset | "all")}
                    >
                      <MenuItem value="all">Todas</MenuItem>
                      {Object.values(SECTION_DIMENSION_PRESETS).map((preset) => (
                        <MenuItem key={preset.preset} value={preset.preset}>
                          {preset.label} ({preset.width} x {preset.height})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddCircleIcon />}
                  onClick={() => setLibraryOpen(true)}
                  sx={{
                    bgcolor: "#1c5d15",
                    py: 1.5,
                    px: 4,
                    fontSize: "1.1rem",
                    "&:hover": { bgcolor: "#0d350b" },
                  }}
                >
                  Abrir biblioteca de secciones
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => {
                    setAiMode("document");
                    setSelectedSectionForAI(null);
                    setAiDialogOpen(true);
                  }}
                  sx={{
                    mt: 2,
                    borderColor: "#1c5d15",
                    color: "#1c5d15",
                    py: 1.5,
                    px: 4,
                    fontSize: "1.1rem",
                    "&:hover": { borderColor: "#0d350b", bgcolor: "#f0f7ef" },
                  }}
                >
                  Crear documento con IA
                </Button>
              </Paper>
            ) : (
              <Box>
                <Paper sx={{ p: 3, mb: 3, bgcolor: "white", borderRadius: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Editor visual de PDF
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Cada cambio se guarda como borrador para que puedas continuar despues.
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Button
                        variant="outlined"
                        startIcon={<AddCircleIcon />}
                        onClick={() => setLibraryOpen(true)}
                        sx={{
                          borderColor: "#1c5d15",
                          color: "#1c5d15",
                          fontWeight: 600,
                          "&:hover": {
                            borderColor: "#0d350b",
                            bgcolor: "#f0f7ef",
                          },
                        }}
                      >
                        Agregar seccion
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => {
                          setAiMode("document");
                          setSelectedSectionForAI(null);
                          setAiDialogOpen(true);
                        }}
                        sx={{
                          bgcolor: "#abc685",
                          color: "#17201a",
                          "&:hover": { bgcolor: "#92b066" },
                        }}
                      >
                        Crear con IA
                      </Button>
                    </Box>
                  </Box>
                </Paper>

                <Paper
                  ref={previewRef}
                  sx={{
                    bgcolor: "white",
                    minHeight: 1123,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                    borderRadius: 2,
                    overflow: "hidden",
                    p: 4,
                  }}
                >
                  {sections.map((section, index) => (
                    <Box key={section.id} sx={{ position: "relative" }}>
                      <DraggableSectionWrapper
                        section={section}
                        index={index}
                        moveSection={moveSection}
                        onUpdate={updateSection}
                        onDelete={deleteSection}
                        onGenerateAI={handleGenerateAIContent}
                      />

                      <Box
                        sx={{
                          position: "absolute",
                          top: -40,
                          right: 20,
                          display: "flex",
                          gap: 1,
                          opacity: 0,
                          transition: "opacity 0.2s",
                          "&:hover": { opacity: 1 },
                        }}
                      >
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => moveSection(index, Math.max(0, index - 1))}
                          disabled={index === 0}
                          sx={{
                            bgcolor: "#1c5d15",
                            "&:hover": { bgcolor: "#0d350b" },
                            "&.Mui-disabled": { bgcolor: "#e0e0e0", color: "#999" },
                          }}
                        >
                          Subir
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => moveSection(index, index + 1)}
                          disabled={index === sections.length - 1}
                          sx={{
                            bgcolor: "#1c5d15",
                            "&:hover": { bgcolor: "#0d350b" },
                            "&.Mui-disabled": { bgcolor: "#e0e0e0", color: "#999" },
                          }}
                        >
                          Bajar
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Paper>
              </Box>
            )}
          </Container>
        </Box>

        {sections.length > 0 && (
          <Fab
            color="primary"
            sx={{
              position: "fixed",
              bottom: 32,
              right: 32,
              bgcolor: "#1c5d15",
              "&:hover": { bgcolor: "#0d350b" },
            }}
            onClick={() => setLibraryOpen(true)}
          >
            <AddCircleIcon />
          </Fab>
        )}

        <SectionLibraryModal
          open={libraryOpen}
          onClose={() => setLibraryOpen(false)}
          onSelectSection={handleSelectSection}
          selectedDimensionPreset={documentSectionPreset}
          onDimensionPresetChange={setDocumentSectionPreset}
        />

        <AIContentGenerator
          open={aiDialogOpen}
          mode={aiMode}
          onClose={() => {
            setAiDialogOpen(false);
            setSelectedSectionForAI(null);
          }}
          onGenerateSection={handleAISectionGenerated}
          onGenerateDocument={handleAIDocumentGenerated}
          sectionType={aiMode === "section" ? selectedSectionForAI?.type || "dynamic" : "document"}
          sectionTitle={aiMode === "section" ? selectedSectionForAI?.name || "Seccion IA" : "Documento completo"}
        />

        <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
          <DialogTitle sx={{ bgcolor: "#1c5d15", color: "white" }}>Guardar documento</DialogTitle>
          <DialogContent sx={{ mt: 3 }}>
            <TextField
              autoFocus
              fullWidth
              label="Nombre del documento"
              value={documentName}
              onChange={(event) => setDocumentName(event.target.value)}
              helperText="Este nombre se usara al exportar el PDF"
            />
            <Box sx={{ mt: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>{sections.length}</strong> secciones
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Guardado como: <strong>{user?.email || "Invitado"}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Estado del borrador: <strong>{autosaveMessage}</strong>
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setSaveDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => void saveDocument()}
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{
                bgcolor: "#1c5d15",
                "&:hover": { bgcolor: "#0d350b" },
              }}
            >
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DndProvider>
  );
}
