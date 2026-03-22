import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { getCurrentUser } from "../utils/auth";
import { cloneSectionForEditor, groupSectionsByCategory, pdfCreatorApi } from "../utils/pdfCreatorApi";
import {
  SECTION_DIMENSION_PRESETS,
  type Section,
  type SectionDimensionPreset,
} from "../types/pdfCreator";
import { SectionVisualPreview } from "./SectionVisualPreview";

interface SectionLibraryModalProps {
  open: boolean;
  onClose: () => void;
  onSelectSection: (section: Section) => void;
  selectedDimensionPreset: SectionDimensionPreset | "all";
  onDimensionPresetChange: (preset: SectionDimensionPreset | "all") => void;
}

export function SectionLibraryModal({
  open,
  onClose,
  onSelectSection,
  selectedDimensionPreset,
  onDimensionPresetChange,
}: SectionLibraryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewSection, setPreviewSection] = useState<Section | null>(null);
  const user = getCurrentUser();

  useEffect(() => {
    if (!open) {
      return;
    }

    void loadSections();
  }, [open]);

  const loadSections = async () => {
    setLoading(true);

    try {
      const data = await pdfCreatorApi.getSections(user);
      setSections(data);
    } finally {
      setLoading(false);
    }
  };

  const sectionsByCategory = useMemo(() => groupSectionsByCategory(sections), [sections]);
  const categories = useMemo(() => ["all", ...Object.keys(sectionsByCategory)], [sectionsByCategory]);

  const dimensionFilteredSections = useMemo(() => {
    if (selectedDimensionPreset === "all") {
      return sections;
    }

    return sections.filter((section) => section.dimensions?.preset === selectedDimensionPreset);
  }, [sections, selectedDimensionPreset]);

  const filteredSections =
    selectedCategory === "all"
      ? dimensionFilteredSections
      : dimensionFilteredSections.filter((section) => section.category === selectedCategory);

  const handleSelectSection = (section: Section) => {
    const shouldReuseOriginal = Boolean(user?.id && section.userId === user.id);
    const nextSection = shouldReuseOriginal
      ? section
      : cloneSectionForEditor(section, user?.id || "guest");

    onSelectSection(nextSection);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: "82vh",
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #1c5d15 0%, #0d350b 100%)",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Biblioteca de Secciones
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              La vista previa conserva el ancho tipo PDF y la altura real de cada seccion.
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Box sx={{ px: 3, py: 2, bgcolor: "#f8faf7", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            <FormControl size="small" sx={{ minWidth: 240 }}>
              <InputLabel>Dimensiones de seccion</InputLabel>
              <Select
                value={selectedDimensionPreset}
                label="Dimensiones de seccion"
                onChange={(event) =>
                  onDimensionPresetChange(event.target.value as SectionDimensionPreset | "all")
                }
              >
                <MenuItem value="all">Todas las dimensiones</MenuItem>
                {Object.values(SECTION_DIMENSION_PRESETS).map((preset) => (
                  <MenuItem key={preset.preset} value={preset.preset}>
                    {preset.label} ({preset.width} x {preset.height})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="body2" color="text.secondary">
              {selectedDimensionPreset === "all"
                ? "Mostrando todas las secciones disponibles."
                : `Filtrando por ${SECTION_DIMENSION_PRESETS[selectedDimensionPreset].label}.`}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "#f5f5f5" }}>
          <Tabs
            value={selectedCategory}
            onChange={(_, newValue) => setSelectedCategory(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                minHeight: 48,
              },
              "& .Mui-selected": {
                color: "#1c5d15",
              },
            }}
          >
            {categories.map((category) => (
              <Tab key={category} value={category} label={category === "all" ? "Todas" : category} />
            ))}
          </Tabs>
        </Box>

        <DialogContent sx={{ p: 3, bgcolor: "#fafafa" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress sx={{ color: "#1c5d15" }} />
            </Box>
          ) : filteredSections.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No hay secciones para ese filtro
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredSections.map((section) => (
                <Grid size={{ xs: 12, md: 6, xl: 4 }} key={section.id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "all 0.3s",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 12px 24px rgba(28, 93, 21, 0.16)",
                      },
                    }}
                    onClick={() => setPreviewSection(section)}
                  >
                    <SectionVisualPreview section={section} preferredWidth={360} />

                    <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
                          {section.name}
                        </Typography>
                        <Chip
                          label={section.category}
                          size="small"
                          sx={{
                            bgcolor: "#e8ff99",
                            color: "#1c5d15",
                            fontWeight: 600,
                            fontSize: "0.7rem",
                          }}
                        />
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          lineHeight: 1.6,
                          minHeight: 44,
                        }}
                      >
                        {section.description || "Seccion disponible para reutilizar en el editor."}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                        {section.isPublic && <Chip label="Publica" size="small" variant="outlined" />}
                        <Chip label={section.type || "dynamic"} size="small" variant="outlined" />
                        <Chip label={`Por ${section.author}`} size="small" variant="outlined" />
                      </Box>
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0, display: "flex", gap: 1 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<VisibilityOutlinedIcon />}
                        onClick={(event) => {
                          event.stopPropagation();
                          setPreviewSection(section);
                        }}
                        sx={{
                          borderColor: "#abc685",
                          color: "#1c5d15",
                          fontWeight: 600,
                        }}
                      >
                        Vista previa
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AddCircleIcon />}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleSelectSection(section);
                        }}
                        sx={{
                          bgcolor: "#1c5d15",
                          py: 1,
                          fontWeight: 600,
                          "&:hover": {
                            bgcolor: "#0d350b",
                          },
                        }}
                      >
                        Usar
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(previewSection)} onClose={() => setPreviewSection(null)} maxWidth="xl" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {previewSection?.name || "Vista previa"}
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: "#f7f7f7" }}>
          {previewSection ? (
            <Box
              sx={{
                bgcolor: "white",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
              }}
            >
              <SectionVisualPreview section={previewSection} preferredWidth={860} />
              <Box sx={{ p: 3 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {previewSection.description || "Seccion disponible para reutilizar en el editor."}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip label={previewSection.category} size="small" />
                  <Chip label={previewSection.type || "dynamic"} size="small" variant="outlined" />
                  {previewSection.isPublic && <Chip label="Publica" size="small" variant="outlined" />}
                </Box>
              </Box>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setPreviewSection(null)}>Cerrar</Button>
          {previewSection ? (
            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              onClick={() => {
                handleSelectSection(previewSection);
                setPreviewSection(null);
              }}
              sx={{ bgcolor: "#1c5d15", "&:hover": { bgcolor: "#0d350b" } }}
            >
              Usar esta seccion
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>
    </>
  );
}
