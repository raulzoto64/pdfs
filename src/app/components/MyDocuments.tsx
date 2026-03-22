import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import { Link } from "react-router";
import { getCurrentUser } from "../utils/auth";
import { pdfCreatorApi } from "../utils/pdfCreatorApi";
import { toast } from "sonner";

export function MyDocuments() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    void loadDocuments();
  }, []);

  const loadDocuments = async () => {
    if (!user) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    try {
      const data = await pdfCreatorApi.getDocuments(user);
      setDocuments(data);
    } catch (error: any) {
      toast.error(error.message || "Error al cargar documentos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!user) {
      return;
    }

    try {
      await pdfCreatorApi.deleteDocument(docId, user.id);
      await loadDocuments();
      toast.success("Documento eliminado");
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar documento");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <CircularProgress size={60} sx={{ color: "#1c5d15" }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: "#1c5d15" }}>
          Inicia sesión para ver tus documentos
        </Typography>
        <Button
          component={Link}
          to="/auth"
          variant="contained"
          size="large"
          sx={{
            bgcolor: "#1c5d15",
            "&:hover": { bgcolor: "#0d350b" },
          }}
        >
          Iniciar Sesión
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          mb: 2,
          color: "#1c5d15",
          textAlign: "center",
        }}
      >
        Mis Documentos PDF
      </Typography>
      <Typography
        variant="body1"
        sx={{
          mb: 6,
          textAlign: "center",
          color: "text.secondary",
          maxWidth: 700,
          mx: "auto",
        }}
      >
        Aquí encontrarás todos los PDFs guardados en la base de datos para tu usuario.
      </Typography>

      {documents.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <DescriptionIcon sx={{ fontSize: 80, color: "#ccc", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            No tienes documentos guardados
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
            Crear Primer Documento
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {documents.map((doc) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doc.id}>
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
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <DescriptionIcon sx={{ fontSize: 40, color: "#1c5d15", mr: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {doc.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Última modificación: {new Date(doc.lastModified).toLocaleDateString("es-PE")}
                  </Typography>
                  <Chip label={`${doc.customContent?.length || 0} secciones`} size="small" variant="outlined" />
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0, justifyContent: "space-between" }}>
                  <Button component={Link} to={`/editor/${doc.templateId || ""}?documentId=${doc.id}`} startIcon={<EditIcon />} sx={{ color: "#1c5d15" }}>
                    Editar
                  </Button>
                  <IconButton onClick={() => handleDelete(doc.id)} color="error" size="small">
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
