import { Box, Paper, IconButton, Tooltip, Typography } from "@mui/material";
import { 
  Edit, 
  Delete, 
  ContentCopy,
  Visibility,
  VisibilityOff,
  Settings
} from "@mui/icons-material";

interface FloatingToolbarProps {
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleVisibility?: () => void;
  onSettings?: () => void;
  isEditing?: boolean;
  isVisible?: boolean;
}

export function FloatingToolbar({
  onEdit,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onSettings,
  isEditing = false,
  isVisible = true
}: FloatingToolbarProps) {
  return (
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        top: 80,
        right: 24,
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        bgcolor: "white",
        borderRadius: 2,
        p: 1,
        boxShadow: 4,
        border: "1px solid #e0e0e0",
      }}
    >
      {/* Título de la barra */}
      <Box sx={{ px: 1, py: 0.5, borderBottom: "1px solid #eee" }}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: "#666" }}>
          Herramientas de Edición
        </Typography>
      </Box>

      {/* Controles principales */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Tooltip title={isEditing ? "Finalizar Edición" : "Iniciar Edición"}>
          <IconButton 
            size="small" 
            onClick={onEdit}
            sx={{
              bgcolor: isEditing ? "#e8ff99" : "transparent",
              "&:hover": {
                bgcolor: isEditing ? "#d4e78a" : "#f5f5f5"
              }
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Duplicar Sección">
          <IconButton 
            size="small" 
            onClick={onDuplicate}
            sx={{
              "&:hover": {
                bgcolor: "#f5f5f5"
              }
            }}
          >
            <ContentCopy fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Eliminar Sección">
          <IconButton 
            size="small" 
            onClick={onDelete}
            color="error"
            sx={{
              "&:hover": {
                bgcolor: "#ffebee"
              }
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>

        {onToggleVisibility && (
          <Tooltip title={isVisible ? "Ocultar Sección" : "Mostrar Sección"}>
            <IconButton 
              size="small" 
              onClick={onToggleVisibility}
              sx={{
                "&:hover": {
                  bgcolor: "#f5f5f5"
                }
              }}
            >
              {isVisible ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}

        {onSettings && (
          <Tooltip title="Configuración Avanzada">
            <IconButton 
              size="small" 
              onClick={onSettings}
              sx={{
                "&:hover": {
                  bgcolor: "#f5f5f5"
                }
              }}
            >
              <Settings fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Indicador de estado */}
      <Box sx={{ px: 1, py: 0.5, borderTop: "1px solid #eee", bgcolor: "#f9f9f9" }}>
        <Typography variant="caption" sx={{ color: "#666" }}>
          {isEditing ? "Modo Edición" : "Vista Previa"}
        </Typography>
      </Box>
    </Paper>
  );
}