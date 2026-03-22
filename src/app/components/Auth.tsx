import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { login, register } from "../utils/auth";

export function Auth() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  console.log('🔐 Componente de autenticación cargado');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log('🔐 Intentando iniciar sesión con:', email);

    try {
      console.log('🔑 Llamando a función login');
      await login(email, password);
      console.log('✅ Login exitoso');
      navigate("/");
      window.location.reload(); // Recargar para actualizar el user en toda la app
    } catch (err: any) {
      console.log('❌ Error en login:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log('📝 Intentando registrar usuario:', email);

    try {
      console.log('🔑 Llamando a función register');
      await register(email, password, name);
      console.log('✅ Registro exitoso');
      navigate("/");
      window.location.reload(); // Recargar para actualizar el user en toda la app
    } catch (err: any) {
      console.log('❌ Error en registro:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            mb: 3,
            fontWeight: 700,
            color: "#1c5d15",
          }}
        >
          PDF Creator
        </Typography>

        <Tabs
          value={tab}
          onChange={(_, newValue) => {
            setTab(newValue);
            setError("");
          }}
          centered
          sx={{ mb: 3 }}
        >
          <Tab label="Iniciar Sesión" icon={<LoginIcon />} />
          <Tab label="Registrarse" icon={<PersonAddIcon />} />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {tab === 0 ? (
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={<LoginIcon />}
              sx={{
                bgcolor: "#1c5d15",
                py: 1.5,
                "&:hover": {
                  bgcolor: "#0d350b",
                },
              }}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <TextField
              fullWidth
              label="Nombre (opcional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={<PersonAddIcon />}
              sx={{
                bgcolor: "#1c5d15",
                py: 1.5,
                "&:hover": {
                  bgcolor: "#0d350b",
                },
              }}
            >
              {loading ? "Registrando..." : "Registrarse"}
            </Button>
          </form>
        )}

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Al usar este sistema aceptas guardar tus datos en nuestra base de
            datos
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
