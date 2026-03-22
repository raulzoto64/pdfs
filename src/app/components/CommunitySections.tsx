import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { toast } from "sonner";
import CodeIcon from "@mui/icons-material/Code";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PublicIcon from "@mui/icons-material/Public";
import LockIcon from "@mui/icons-material/Lock";
import { AIContentGenerator } from "./AIContentGenerator";
import { SectionVisualPreview } from "./SectionVisualPreview";
import { getCurrentUser } from "../utils/auth";
import {
  cloneSectionForEditor,
  groupSectionsByCategory,
  pdfCreatorApi,
  storeSeedSectionsForEditor,
  type GeneratedSectionDraft,
} from "../utils/pdfCreatorApi";
import { getDefaultSectionDimensions, type Section } from "../types/pdfCreator";

export function CommunitySections() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [previewSection, setPreviewSection] = useState<Section | null>(null);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    void loadSections();
  }, []);

  const loadSections = async () => {
    setLoading(true);

    try {
      const data = await pdfCreatorApi.getSections(user);
      setSections(data);
    } catch (error: any) {
      toast.error(error.message || "No se pudieron cargar las secciones");
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  const sectionsByCategory = useMemo(() => groupSectionsByCategory(sections), [sections]);
  const categories = useMemo(() => ["all", ...Object.keys(sectionsByCategory)], [sectionsByCategory]);

  async function handleAiSectionGenerated(draft: GeneratedSectionDraft) {
    const baseSection: Section = {
      id: `section-${Date.now()}`,
      name: draft.name,
      description: draft.description,
      category: draft.category,
      type: draft.type,
      content: draft.content,
      dimensions: getDefaultSectionDimensions(draft.type),
      thumbnail: draft.thumbnail,
      htmlCode: draft.htmlCode,
      cssCode: draft.cssCode,
      jsCode: draft.jsCode,
      author: user?.id || "guest",
      isPublic: true,
      createdAt: new Date().toISOString(),
      userId: user?.id || "guest",
    };

    try {
      const savedSection = await pdfCreatorApi.createSection(baseSection, user);
      setSections((prev) => [savedSection, ...prev]);
      toast.success("Seccion generada con IA y guardada");
    } catch (error: any) {
      setSections((prev) => [baseSection, ...prev]);
      toast.error(error.message || "No se pudo guardar en la base de datos");
    }
  }

  function handleOpenInEditor(section: Section) {
    const seededSection = cloneSectionForEditor(section, user?.id || "guest");
    storeSeedSectionsForEditor([seededSection]);
    navigate("/editor");
  }

  async function handleDeleteSection(section: Section) {
    if (!user) {
      toast.error("Debes iniciar sesion para eliminar secciones");
      return;
    }

    if (section.userId !== user.id) {
      toast.error("Solo puedes eliminar secciones tuyas");
      return;
    }

    try {
      await pdfCreatorApi.deleteSection(section.id, user.id);
      setSections((prev) => prev.filter((item) => item.id !== section.id));
      toast.success("Seccion eliminada");
    } catch (error: any) {
      toast.error(error.message || "No se pudo eliminar la seccion");
    }
  }

  const filteredSections =
    selectedCategory === "all" ? sections : sectionsByCategory[selectedCategory] || [];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <CircularProgress size={60} sx={{ color: "#1c5d15" }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          mb: 4,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: "#1c5d15" }}>
            Biblioteca Comunitaria
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760 }}>
            Genera secciones completas con IA, guarda su HTML, CSS y estructura editable, y reutilizalas luego en el
            editor visual.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => void loadSections()}
            sx={{ borderColor: "#abc685", color: "#1c5d15" }}
          >
            Recargar
          </Button>
          <Button
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => setAiDialogOpen(true)}
            sx={{ bgcolor: "#1c5d15", "&:hover": { bgcolor: "#0d350b" } }}
          >
            Crear con IA
          </Button>
        </Box>

        <Tabs
          value={selectedCategory}
          onChange={(_, newValue) => setSelectedCategory(newValue)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ width: "100%", "& .MuiTabs-indicator": { backgroundColor: "#1c5d15" } }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {categories.map((category) => (
            <Tab key={category} label={category === "all" ? "Todas" : category} value={category} />
          ))}
        </Tabs>
      </Box>

      {filteredSections.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <CodeIcon sx={{ fontSize: 80, color: "#ccc", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Todavia no hay secciones dinamicas guardadas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Empieza generando una seccion con IA. El sistema guardara el diseno, sus estilos y el contenido editable.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => setAiDialogOpen(true)}
            sx={{ bgcolor: "#1c5d15", "&:hover": { bgcolor: "#0d350b" } }}
          >
            Crear Primera Seccion
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredSections.map((section) => {
            const editable = section.content?.editable || {};
            const htmlLength = section.htmlCode?.length || 0;
            const cssLength = section.cssCode?.length || 0;
            const elementCount = Array.isArray(editable.cards)
              ? editable.cards.length
              : Array.isArray(editable.features)
                ? editable.features.length
                : Array.isArray(editable.items)
                  ? editable.items.length
                  : Object.keys(editable).length;
            const isOwner = Boolean(user && section.userId === user.id);

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={section.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <SectionVisualPreview section={section} preferredWidth={360} />

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {section.name}
                      </Typography>
                      {section.isPublic ? <PublicIcon sx={{ color: "#1c5d15" }} /> : <LockIcon sx={{ color: "#999" }} />}
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                      <Chip label={section.category} size="small" sx={{ bgcolor: "#f0f7ef", color: "#1c5d15", fontWeight: 600 }} />
                      <Chip label={section.type || "dynamic"} size="small" variant="outlined" />
                      <Chip label={`${elementCount} bloques`} size="small" variant="outlined" />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ minHeight: 58, mb: 2 }}>
                      {section.description || "Seccion dinamica generada y persistida desde la IA."}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Chip label={`HTML ${htmlLength}`} size="small" sx={{ bgcolor: "#fff4e5" }} />
                      <Chip label={`CSS ${cssLength}`} size="small" sx={{ bgcolor: "#eef5ff" }} />
                      <Chip label={section.userId || "guest"} size="small" sx={{ bgcolor: "#f5f5f5" }} />
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0, display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button size="small" startIcon={<EditIcon />} sx={{ color: "#1c5d15" }} onClick={() => handleOpenInEditor(section)}>
                      Abrir en editor
                    </Button>
                    <Button size="small" onClick={() => setPreviewSection(section)}>
                      Vista previa
                    </Button>
                    {isOwner ? (
                      <Button
                        size="small"
                        startIcon={<DeleteOutlineIcon />}
                        color="error"
                        onClick={() => void handleDeleteSection(section)}
                      >
                        Eliminar
                      </Button>
                    ) : null}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <AIContentGenerator
        open={aiDialogOpen}
        mode="section"
        onClose={() => setAiDialogOpen(false)}
        onGenerateSection={handleAiSectionGenerated}
        sectionType="dynamic"
        sectionTitle="Nueva seccion comunitaria"
      />

      <Dialog open={Boolean(previewSection)} onClose={() => setPreviewSection(null)} maxWidth="xl" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{previewSection?.name || "Vista previa"}</DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: "#f7f7f7" }}>
          {previewSection ? (
            <Box sx={{ bgcolor: "white", borderRadius: 2, overflow: "hidden", boxShadow: "0 12px 30px rgba(0,0,0,0.08)" }}>
              <SectionVisualPreview section={previewSection} preferredWidth={860} />
              <Box sx={{ p: 3 }}>
                <Typography variant="body1">{previewSection.description || "Seccion comunitaria reutilizable."}</Typography>
              </Box>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setPreviewSection(null)}>Cerrar</Button>
          {previewSection ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => {
                handleOpenInEditor(previewSection);
                setPreviewSection(null);
              }}
              sx={{ bgcolor: "#1c5d15", "&:hover": { bgcolor: "#0d350b" } }}
            >
              Abrir en editor
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>
    </Container>
  );
}
