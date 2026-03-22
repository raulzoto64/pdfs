import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { getCurrentUser } from "../utils/auth";
import { pdfCreatorApi } from "../utils/pdfCreatorApi";
import { SectionVisualPreview } from "./SectionVisualPreview";

export function Templates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);
  const user = getCurrentUser();

  useEffect(() => {
    void loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await pdfCreatorApi.getTemplates(user);
      setTemplates(data);
    } catch (err: any) {
      setTemplates([]);
      setError(err.message || "No se pudieron cargar las plantillas");
    } finally {
      setLoading(false);
    }
  };

  const renderTemplateStack = (template: any, compact = false) => {
    const sections = template.sections?.slice(0, compact ? 3 : undefined) || [];

    if (sections.length === 0) {
      return (
        <Box
          sx={{
            height: compact ? 230 : 720,
            background: "linear-gradient(135deg, #1c5d15 0%, #0d350b 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "4rem",
          }}
        >
          {template.thumbnail || "DOC"}
        </Box>
      );
    }

    return (
      <Box
        sx={{
          position: "relative",
          height: compact ? 290 : "auto",
          minHeight: compact ? 290 : undefined,
          overflow: "hidden",
          background: compact ? "linear-gradient(180deg, #eef4ea 0%, #dde9d6 100%)" : "transparent",
          p: compact ? 2 : 0,
        }}
      >
        {sections.map((section: any, index: number) => (
          <Box
            key={section.id}
            sx={{
              position: compact ? "absolute" : "relative",
              inset: compact ? `${index * 22}px ${index * 8}px auto ${index * 8}px` : "auto",
              transform: compact ? `scale(${1 - index * 0.04})` : "none",
              transformOrigin: "top center",
              opacity: compact ? 1 - index * 0.12 : 1,
              zIndex: compact ? sections.length - index : "auto",
              mb: compact ? 0 : 3,
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
              bgcolor: "white",
            }}
          >
            <SectionVisualPreview section={section} preferredWidth={compact ? 300 : 820} />
          </Box>
        ))}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <CircularProgress size={60} sx={{ color: "#1c5d15" }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          mb: 2,
          color: "#1c5d15",
          textAlign: "center",
        }}
      >
        Plantillas Disponibles
      </Typography>
      <Typography
        variant="body1"
        sx={{
          mb: 6,
          textAlign: "center",
          color: "text.secondary",
          maxWidth: 760,
          mx: "auto",
        }}
      >
        Revisa la apariencia real de cada plantilla antes de abrirla en el editor.
      </Typography>

      {error && (
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {templates.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            No hay plantillas disponibles
          </Typography>
          <Button
            component={Link}
            to="/editor"
            variant="contained"
            startIcon={<EditIcon />}
            sx={{
              bgcolor: "#1c5d15",
              "&:hover": { bgcolor: "#0d350b" },
            }}
          >
            Crear Nueva Plantilla
          </Button>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {templates.map((template) => (
            <Grid size={{ xs: 12, md: 6, xl: 4 }} key={template.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  },
                }}
              >
                {renderTemplateStack(template, true)}

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {template.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {template.description}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {template.isPublic && <Chip label="Publica" size="small" color="primary" />}
                    <Chip label={`${template.sections?.length || 0} secciones`} size="small" variant="outlined" />
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                  <Button fullWidth variant="outlined" onClick={() => setPreviewTemplate(template)}>
                    Vista previa
                  </Button>
                  <Button
                    component={Link}
                    to={`/editor/${template.id}`}
                    variant="contained"
                    fullWidth
                    startIcon={<EditIcon />}
                    sx={{
                      bgcolor: "#1c5d15",
                      "&:hover": { bgcolor: "#0d350b" },
                    }}
                  >
                    Usar Plantilla
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={Boolean(previewTemplate)} onClose={() => setPreviewTemplate(null)} maxWidth="xl" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {previewTemplate?.name || "Vista previa"}
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: "#f7f7f7" }}>
          {previewTemplate ? (
            <Box
              sx={{
                maxHeight: "78vh",
                overflowY: "auto",
                pr: 1,
              }}
            >
              <Box
                sx={{
                  width: "min(100%, 900px)",
                  mx: "auto",
                  bgcolor: "#f3f3f0",
                  p: 3,
                  borderRadius: 3,
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)",
                }}
              >
                {renderTemplateStack(previewTemplate, false)}
              </Box>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setPreviewTemplate(null)}>Cerrar</Button>
          {previewTemplate ? (
            <Button
              component={Link}
              to={`/editor/${previewTemplate.id}`}
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setPreviewTemplate(null)}
              sx={{ bgcolor: "#1c5d15", "&:hover": { bgcolor: "#0d350b" } }}
            >
              Usar plantilla
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>
    </Container>
  );
}
