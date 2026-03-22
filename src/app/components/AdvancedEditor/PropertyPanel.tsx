import { useState } from "react";
import { Box, Paper, Typography, TextField, Select, MenuItem, Button, Chip, IconButton, Divider, Switch, FormControlLabel } from "@mui/material";
import { 
  ColorLens, 
  TextFields, 
  Settings, 
  Delete, 
  Add, 
  DragIndicator,
  VisibilityOff
} from "@mui/icons-material";
import { ChromePicker } from "react-color";

interface PropertyPanelProps {
  section: any;
  onUpdate: (field: string, value: any) => void;
  onAddElement?: () => void;
  onRemoveElement?: (elementId: string) => void;
}

export function PropertyPanel({ section, onUpdate, onAddElement, onRemoveElement }: PropertyPanelProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorField, setColorField] = useState("");
  const [currentColor, setCurrentColor] = useState("#000000");

  if (!section) {
    return (
      <Paper
        elevation={3}
        sx={{
          position: "fixed",
          top: 80,
          left: 24,
          zIndex: 2000,
          width: 320,
          bgcolor: "white",
          borderRadius: 2,
          p: 2,
          boxShadow: 4,
          border: "1px solid #e0e0e0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Settings color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Propiedades
          </Typography>
        </Box>
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
          Selecciona una sección para ver sus propiedades
        </Typography>
      </Paper>
    );
  }

  const handleColorChange = (color: any) => {
    setCurrentColor(color.hex);
    onUpdate(colorField, color.hex);
  };


  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        top: 80,
        left: 24,
        zIndex: 2000,
        width: 320,
        bgcolor: "white",
        borderRadius: 2,
        p: 2,
        boxShadow: 4,
        border: "1px solid #e0e0e0",
        maxHeight: "calc(100vh - 120px)",
        overflow: "auto",
      }}
    >
      {/* Encabezado */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, pb: 2, borderBottom: "1px solid #eee" }}>
        <DragIndicator color="primary" />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {section.name || "Sección"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {section.content?.type || "Tipo desconocido"}
          </Typography>
        </Box>
        <Chip 
          label="Seleccionado" 
          size="small" 
          color="primary" 
          variant="outlined"
        />
      </Box>

      {/* Controles de visibilidad */}
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch 
              checked={section.visible !== false} 
              onChange={(e) => onUpdate("visible", e.target.checked)}
            />
          }
          label="Visible en PDF"
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Propiedades generales */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: "#666" }}>
          Configuración General
        </Typography>
        
        <TextField
          fullWidth
          label="Nombre de la sección"
          value={section.name || ""}
          onChange={(e) => onUpdate("name", e.target.value)}
          size="small"
          sx={{ mb: 1 }}
        />

        <TextField
          fullWidth
          label="Descripción"
          value={section.description || ""}
          onChange={(e) => onUpdate("description", e.target.value)}
          size="small"
          multiline
          rows={2}
          sx={{ mb: 1 }}
        />

        <TextField
          fullWidth
          label="Tipo de sección"
          value={section.content?.type || ""}
          onChange={(e) => onUpdate("type", e.target.value)}
          size="small"
          sx={{ mb: 1 }}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Propiedades de estilo */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: "#666" }}>
          Estilo y Apariencia
        </Typography>

        {/* Selector de color principal */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <ColorLens fontSize="small" color="primary" />
          <Typography variant="body2">Color Principal</Typography>
          <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
            <IconButton 
              size="small" 
              onClick={() => {
                setColorField("primaryColor");
                setCurrentColor(section.primaryColor || "#000000");
                setShowColorPicker(true);
              }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  bgcolor: section.primaryColor || "#000000",
                  border: "1px solid #ccc"
                }}
              />
            </IconButton>
          </Box>
        </Box>

        {/* Selector de fuente */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <TextFields fontSize="small" color="primary" />
          <Typography variant="body2">Fuente</Typography>
          <Select
            size="small"
            value={section.fontFamily || "Poppins"}
            onChange={(e) => onUpdate("fontFamily", e.target.value)}
            sx={{ ml: "auto", minWidth: 120 }}
          >
            {["Poppins", "Roboto", "Arial", "Georgia", "Times New Roman", "Courier New", "Verdana", "Helvetica"].map((font) => (
              <MenuItem key={font} value={font}>
                {font}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Selector de tamaño de fuente */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <TextFields fontSize="small" color="primary" />
          <Typography variant="body2">Tamaño de Fuente</Typography>
          <Select
            size="small"
            value={section.fontSize || 16}
            onChange={(e) => onUpdate("fontSize", parseInt(e.target.value))}
            sx={{ ml: "auto", minWidth: 80 }}
          >
            {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64].map((size) => (
              <MenuItem key={size} value={size}>
                {size}px
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Controles de contenido */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: "#666" }}>
          Contenido
        </Typography>

        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
          <Button
            startIcon={<Add />}
            variant="outlined"
            size="small"
            onClick={onAddElement}
            fullWidth
          >
            Añadir Elemento
          </Button>
          <Button
            startIcon={<Delete />}
            variant="outlined"
            size="small"
            color="error"
            onClick={() => onRemoveElement?.(section.id)}
            disabled={!onRemoveElement}
          >
            Eliminar
          </Button>
        </Box>
      </Box>

      {/* Selector de color */}
      {showColorPicker && (
        <Box sx={{ mb: 2, p: 1, border: "1px solid #eee", borderRadius: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2">Seleccionar Color</Typography>
            <IconButton size="small" onClick={() => setShowColorPicker(false)}>
              <VisibilityOff />
            </IconButton>
          </Box>
          <ChromePicker color={currentColor} onChange={handleColorChange} />
        </Box>
      )}

      {/* Acciones rápidas */}
      <Box sx={{ borderTop: "1px solid #eee", pt: 2 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => onUpdate("reset", true)}
          sx={{ mb: 1 }}
        >
          Restablecer Estilo
        </Button>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => onUpdate("duplicate", true)}
        >
          Duplicar Sección
        </Button>
      </Box>
    </Paper>
  );
}