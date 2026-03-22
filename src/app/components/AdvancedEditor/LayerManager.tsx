import { Box, Paper, Typography, List, ListItemText, ListItemIcon, IconButton, Chip, Divider, Button, ListItemButton } from "@mui/material";
import { 
  Layers, 
  Visibility, 
  VisibilityOff, 
  Delete, 
  Edit, 
  DragIndicator,
  Add
} from "@mui/icons-material";
import { useDrag, useDrop } from "react-dnd";

interface LayerManagerProps {
  sections: any[];
  selectedSectionId: string | null;
  onSectionSelect: (sectionId: string, elementPath?: string) => void;
  onSectionReorder: (fromIndex: number, toIndex: number) => void;
  onSectionDelete: (index: number) => void;
  onSectionDuplicate: (index: number) => void;
  onToggleVisibility?: (sectionId: string) => void;
}

interface DraggableItem {
  id: string;
  index: number;
}

export function LayerManager({
  sections,
  selectedSectionId,
  onSectionReorder,
  onSectionDelete,
  onSectionDuplicate,
  onToggleVisibility
}: LayerManagerProps) {
  const handleDrop = (dragIndex: number, hoverIndex: number) => {
    onSectionReorder(dragIndex, hoverIndex);
  };

  const LayerItem = ({ section, index }: { section: any; index: number }) => {
    const [{ isDragging }, drag] = useDrag({
      type: "LAYER",
      item: { id: section.id, index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [, drop] = useDrop({
      accept: "LAYER",
      hover: (item: DraggableItem) => {
        if (item.index !== index) {
          handleDrop(item.index, index);
          item.index = index;
        }
      },
    });

    const isSelected = selectedSectionId === section.id;
    const isVisible = section.visible !== false;

    return (
      <ListItemButton
        ref={(node) => {
          if (node) {
            drag(drop(node));
          }
        }}
        selected={isSelected}
        sx={{
          bgcolor: isSelected ? "#e8ff99" : "transparent",
          borderLeft: isSelected ? "3px solid #1c5d15" : "3px solid transparent",
          mb: 0.5,
          borderRadius: 1,
          opacity: isDragging ? 0.5 : 1,
          cursor: "move",
        }}
      >
        <ListItemIcon>
          <DragIndicator fontSize="small" sx={{ color: "#666" }} />
        </ListItemIcon>
        
        <ListItemText
          primary={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: isSelected ? 600 : 400 }}>
                {section.name || `Sección ${index + 1}`}
              </Typography>
              <Chip 
                label={section.content?.type || "Tipo desconocido"} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: "0.6rem" }}
              />
            </Box>
          }
          secondary={
            <Typography variant="caption" color="text.secondary">
              Capa {sections.length - index} • {section.content?.type || "Tipo desconocido"}
            </Typography>
          }
        />

        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton 
            size="small" 
            onClick={() => onToggleVisibility?.(section.id)}
            color={isVisible ? "default" : "error"}
          >
            {isVisible ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
          </IconButton>

          <IconButton 
            size="small" 
            onClick={() => onSectionDuplicate(index)}
          >
            <Edit fontSize="small" />
          </IconButton>

          <IconButton 
            size="small" 
            onClick={() => onSectionDelete(index)}
            color="error"
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      </ListItemButton>
    );
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        bottom: 24,
        left: 24,
        zIndex: 2000,
        width: 320,
        bgcolor: "white",
        borderRadius: 2,
        p: 2,
        boxShadow: 4,
        border: "1px solid #e0e0e0",
        maxHeight: "40vh",
        overflow: "auto",
      }}
    >
      {/* Encabezado */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, pb: 2, borderBottom: "1px solid #eee" }}>
        <Layers color="primary" />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Gestor de Capas
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {sections.length} secciones
          </Typography>
        </Box>
        <Button
          startIcon={<Add />}
          size="small"
          variant="outlined"
          onClick={() => {}}
        >
          Nueva Capa
        </Button>
      </Box>

      {/* Lista de capas */}
      <List dense>
        {sections.map((section, index) => (
          <LayerItem
            section={section}
            index={index}
          />
        ))}
      </List>

      {sections.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
          <Layers sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
          <Typography variant="body2">
            No hay secciones creadas
          </Typography>
          <Typography variant="caption">
            Crea tu primera sección para comenzar
          </Typography>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Acciones rápidas */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          fullWidth
          onClick={() => {}}
        >
          Seleccionar Todo
        </Button>
        <Button
          variant="outlined"
          size="small"
          fullWidth
          onClick={() => {}}
        >
          Limpiar Capas
        </Button>
      </Box>

      {/* Información del estado */}
      <Box sx={{ mt: 2, p: 1, bgcolor: "#f5f5f5", borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Arrastra para reordenar • Clic para seleccionar • Icono de ojo para visibilidad
        </Typography>
      </Box>
    </Paper>
  );
}