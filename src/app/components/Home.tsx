import { Link } from "react-router";
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Paper,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import CodeIcon from "@mui/icons-material/Code";
import TuneIcon from "@mui/icons-material/Tune";

export function Home() {
  const features = [
    {
      title: "Generacion con IA",
      description:
        "Describe la seccion que quieres y el sistema genera estructura, contenido, HTML y CSS listos para guardar.",
      icon: <AutoAwesomeIcon sx={{ fontSize: 48, color: "#1c5d15" }} />,
      link: "/community",
    },
    {
      title: "Editor Visual",
      description:
        "Abre cualquier seccion guardada y ajusta textos, bloques, estilos y composicion visual con un editor tipo Canva.",
      icon: <DashboardCustomizeIcon sx={{ fontSize: 48, color: "#1c5d15" }} />,
      link: "/editor",
    },
    {
      title: "Codigo Persistente",
      description:
        "Cada seccion guarda su HTML, CSS y estructura editable para reutilizarla despues sin depender de datos fijos.",
      icon: <CodeIcon sx={{ fontSize: 48, color: "#1c5d15" }} />,
      link: "/templates",
    },
  ];

  const steps = [
    {
      step: "1",
      title: "Describe la seccion",
      description:
        "Escribe el layout, los elementos, el estilo visual y la organizacion que quieres generar.",
    },
    {
      step: "2",
      title: "La IA construye el bloque",
      description:
        "Se genera una seccion completa con nombre, contenido, HTML, CSS y estructura editable.",
    },
    {
      step: "3",
      title: "Guarda y reutiliza",
      description:
        "La seccion queda persistida en base de datos para usarla luego en documentos, plantillas o biblioteca.",
    },
    {
      step: "4",
      title: "Edita manualmente",
      description:
        "Ajusta textos, estilos y composicion visual desde el editor sin perder el codigo generado.",
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          background:
            "radial-gradient(circle at top left, #d8efb6 0%, #1c5d15 42%, #0d350b 100%)",
          color: "white",
          py: 12,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", position: "relative", zIndex: 2 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: "2.4rem", md: "3.8rem" },
                lineHeight: 1.05,
              }}
            >
              Crea Secciones con IA
            </Typography>

            <Typography
              variant="h5"
              sx={{
                mb: 4,
                opacity: 0.92,
                maxWidth: 820,
                mx: "auto",
                fontSize: { xs: "1.1rem", md: "1.45rem" },
              }}
            >
              Genera secciones completas con instrucciones en lenguaje natural,
              guarda su codigo y editalas visualmente despues como bloques
              reutilizables.
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                component={Link}
                to="/community"
                variant="contained"
                size="large"
                startIcon={<AutoAwesomeIcon />}
                sx={{
                  bgcolor: "white",
                  color: "#1c5d15",
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  "&:hover": {
                    bgcolor: "#eef8cf",
                  },
                }}
              >
                Generar Seccion
              </Button>

              <Button
                component={Link}
                to="/editor"
                variant="outlined"
                size="large"
                startIcon={<TuneIcon />}
                sx={{
                  borderColor: "white",
                  color: "white",
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  "&:hover": {
                    borderColor: "#e8ff99",
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                Abrir Editor
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          sx={{
            textAlign: "center",
            mb: 6,
            fontWeight: 700,
            color: "#1c5d15",
          }}
        >
          Flujo del Sistema
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature) => (
            <Grid size={{ xs: 12, md: 4 }} key={feature.title}>
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
                <CardContent sx={{ flexGrow: 1, textAlign: "center", pt: 4 }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, mb: 2, color: "#1c5d15" }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>

                <CardActions sx={{ justifyContent: "center", pb: 3 }}>
                  <Button
                    component={Link}
                    to={feature.link}
                    variant="contained"
                    sx={{
                      bgcolor: "#1c5d15",
                      "&:hover": {
                        bgcolor: "#0d350b",
                      },
                    }}
                  >
                    Abrir
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ bgcolor: "#f0f7ef", py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{
              textAlign: "center",
              mb: 6,
              fontWeight: 700,
              color: "#1c5d15",
            }}
          >
            Como Funciona
          </Typography>

          <Grid container spacing={3}>
            {steps.map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.step}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    bgcolor: "white",
                    border: "2px solid #abc685",
                    borderRadius: 3,
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      bgcolor: "#1c5d15",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    {item.step}
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {item.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <AutoAwesomeIcon sx={{ fontSize: 64, color: "#1c5d15", mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: "#1c5d15" }}>
          Tu contenido ya no depende de plantillas fijas
        </Typography>
        <Typography
          variant="body1"
          sx={{ mb: 4, color: "text.secondary", fontSize: "1.1rem" }}
        >
          Cada seccion puede tener una estructura distinta, elementos distintos y
          estilos distintos. Todo se guarda de forma dinamica.
        </Typography>

        <Button
          component={Link}
          to="/community"
          variant="contained"
          size="large"
          startIcon={<AutoAwesomeIcon />}
          sx={{
            bgcolor: "#1c5d15",
            px: 5,
            py: 2,
            fontSize: "1.1rem",
            fontWeight: 700,
            "&:hover": {
              bgcolor: "#0d350b",
            },
          }}
        >
          Empezar Ahora
        </Button>
      </Container>
    </Box>
  );
}
