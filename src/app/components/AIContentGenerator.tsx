import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  Paper,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import PsychologyIcon from "@mui/icons-material/Psychology";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { GeminiService } from "../utils/geminiService";
import type { GeneratedDocumentDraft, GeneratedSectionDraft } from "../utils/pdfCreatorApi";

interface AIContentGeneratorProps {
  open: boolean;
  mode: "section" | "document";
  onClose: () => void;
  onGenerateSection?: (draft: GeneratedSectionDraft, prompt: string) => void | Promise<void>;
  onGenerateDocument?: (draft: GeneratedDocumentDraft) => void | Promise<void>;
  sectionType?: string;
  sectionTitle?: string;
}

export function AIContentGenerator({
  open,
  mode,
  onClose,
  onGenerateSection,
  onGenerateDocument,
  sectionType,
  sectionTitle,
}: AIContentGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedSectionDraft, setGeneratedSectionDraft] = useState<GeneratedSectionDraft | null>(null);
  const [generatedDocumentDraft, setGeneratedDocumentDraft] = useState<GeneratedDocumentDraft | null>(null);

  const isDocumentMode = mode === "document";

  const handleGenerateContent = async () => {
    if (!prompt.trim()) {
      return;
    }

    setLoading(true);
    console.log("[AI_MODAL][GENERATE]", {
      mode,
      prompt,
      sectionType,
      sectionTitle,
    });

    try {
      if (isDocumentMode) {
        const draft = await GeminiService.generateDocumentDraftWithFallback({
          prompt,
          sectionType,
          sectionTitle,
        });
        setGeneratedDocumentDraft(draft);
        setGeneratedSectionDraft(null);
        return;
      }

      const draft = await GeminiService.generateSectionDraftWithFallback({
        prompt,
        sectionType,
        sectionTitle,
      });
      setGeneratedSectionDraft(draft);
      setGeneratedDocumentDraft(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptContent = async () => {
    console.log("[AI_MODAL][ACCEPT]", {
      mode,
      hasSectionDraft: Boolean(generatedSectionDraft),
      hasDocumentDraft: Boolean(generatedDocumentDraft),
    });

    if (isDocumentMode) {
      if (!generatedDocumentDraft || !onGenerateDocument) {
        return;
      }

      await onGenerateDocument(generatedDocumentDraft);
    } else {
      if (!generatedSectionDraft || !onGenerateSection) {
        return;
      }

      await onGenerateSection(generatedSectionDraft, prompt);
    }

    setPrompt("");
    setGeneratedSectionDraft(null);
    setGeneratedDocumentDraft(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: "#1c5d15",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <PsychologyIcon />
          <Typography variant="h6" fontWeight="bold">
            {isDocumentMode ? "Generar Documento con IA" : "Editar Seccion con IA"}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={6}
            placeholder={
              isDocumentMode
                ? "Describe el documento completo. La IA debe generar entre 4 y 20 secciones segun el prompt. Ejemplo: brochure corporativo de 8 secciones para presentar servicios, metodologia, casos y cierre comercial."
                : "Describe como quieres que se regenere esta seccion. Ejemplo: convierte esta seccion en un bloque premium con tres cards, viñetas claras, imagen lateral y mas contraste."
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, color: "#1c5d15" }}>
                  <AutoFixHighIcon />
                </Box>
              ),
            }}
          />

          <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label={isDocumentMode ? "Documento completo" : sectionType || "Seccion"}
              size="small"
              variant="outlined"
              sx={{ borderColor: "#1c5d15", color: "#1c5d15" }}
            />
            {sectionTitle ? (
              <Chip
                label={sectionTitle}
                size="small"
                variant="outlined"
                sx={{ borderColor: "#1c5d15", color: "#1c5d15" }}
              />
            ) : null}
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleGenerateContent}
            disabled={!prompt.trim() || loading}
            sx={{ bgcolor: "#1c5d15", "&:hover": { bgcolor: "#0d350b" } }}
          >
            {loading ? "Generando..." : isDocumentMode ? "Generar documento" : "Generar seccion"}
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setPrompt("");
              setGeneratedSectionDraft(null);
              setGeneratedDocumentDraft(null);
            }}
            sx={{ borderColor: "#1c5d15", color: "#1c5d15" }}
          >
            Limpiar
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <CircularProgress size={20} />
            <Typography>
              {isDocumentMode ? "La IA esta construyendo el documento completo..." : "La IA esta reconstruyendo la seccion..."}
            </Typography>
          </Box>
        ) : null}

        {generatedDocumentDraft ? (
          <Paper sx={{ p: 2.5, bgcolor: "#f8f9fa", borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ color: "#1c5d15", fontWeight: 700, mb: 1 }}>
              Documento generado
            </Typography>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {generatedDocumentDraft.documentName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {generatedDocumentDraft.description}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
              <Chip label={`${generatedDocumentDraft.sections.length} secciones`} size="small" />
            </Box>
            <Typography variant="body2" sx={{ fontSize: 12 }}>
              La IA preparo un documento editable con multiples secciones listas para el lienzo.
            </Typography>
          </Paper>
        ) : null}

        {generatedSectionDraft ? (
          <Paper sx={{ p: 2.5, bgcolor: "#f8f9fa", borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ color: "#1c5d15", fontWeight: 700, mb: 1 }}>
              Seccion generada
            </Typography>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {generatedSectionDraft.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {generatedSectionDraft.description}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
              <Chip label={generatedSectionDraft.category} size="small" />
              <Chip label={generatedSectionDraft.type} size="small" variant="outlined" />
            </Box>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: 12 }}>
              HTML: {generatedSectionDraft.htmlCode.slice(0, 240)}...
            </Typography>
          </Paper>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleAcceptContent}
          variant="contained"
          disabled={isDocumentMode ? !generatedDocumentDraft : !generatedSectionDraft}
          sx={{ bgcolor: "#1c5d15", "&:hover": { bgcolor: "#0d350b" } }}
        >
          {isDocumentMode ? "Usar documento" : "Guardar seccion"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
