import { useState, useRef, useCallback } from "react";
import { useDrop } from "react-dnd";
import { Box, Paper, Typography, Chip, IconButton, Tooltip } from "@mui/material";
import { 
  DragIndicator, 
  Edit, 
  Delete, 
  ContentCopy,
  Visibility,
  VisibilityOff
} from "@mui/icons-material";
import { Section } from "../../types/pdfCreator";
import { useEditorStore } from "../../store/editorStore";
import { FloatingToolbar } from "./FloatingToolbar";
import { PropertyPanel } from "./PropertyPanel";
import { LayerManager } from "./LayerManager";
import Draggable from "react-draggable";

// Type for React DnD drop target ref
type DropTargetRef = (node: HTMLElement | null) => void;

interface EditorCanvasProps {
  sections: Section[];
  onSectionUpdate: (index: number, updatedSection: Section) => void;
  onSectionDelete: (index: number) => void;
  onSectionDuplicate: (index: number) => void;
  onSectionReorder: (fromIndex: number, toIndex: number) => void;
}

export function EditorCanvas({
  sections,
  onSectionUpdate,
  onSectionDelete,
  onSectionDuplicate,
  onSectionReorder
}: EditorCanvasProps) {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const {
    setSelectedElement,
    isEditing,
    setIsEditing,
    showGrid,
    setShowGrid,
    zoomLevel,
    setZoomLevel
  } = useEditorStore();

  // Sistema de arrastrar y soltar con React DnD
  const [, drop] = useDrop({
    accept: "SECTION",
    hover: (item: { id: string }, monitor) => {
      const dragIndex = sections.findIndex(s => s.id === item.id);
      const hoverIndex = sections.findIndex(s => s.id === selectedSectionId);
      
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = canvasRef.current?.getBoundingClientRect();
      const hoverMiddleY = hoverBoundingRect ? hoverBoundingRect.height / 2 : 0;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset ? clientOffset.y - (hoverBoundingRect?.top || 0) : 0;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      onSectionReorder(dragIndex, hoverIndex);
      item.id = sections[hoverIndex].id;
    },
  });

  // Manejo de selección inteligente
  const handleSectionSelect = useCallback((sectionId: string, elementPath?: string) => {
    setSelectedSectionId(sectionId);
    if (elementPath) {
      setSelectedElement(elementPath);
    }
  }, [setSelectedElement]);

  // Manejo de edición en tiempo real
  const handleSectionEdit = useCallback((sectionId: string, field: string, value: any) => {
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex !== -1) {
      const updatedSection = { ...sections[sectionIndex], [field]: value };
      onSectionUpdate(sectionIndex, updatedSection);
    }
  }, [sections, onSectionUpdate]);

  // Renderizado de sección con controles de edición
  const renderSection = (section: Section, index: number) => {
    const isSelected = selectedSectionId === section.id;
    const isSectionEditing = isEditing && isSelected;

    return (
      <Draggable
        key={section.id}
        axis="y"
        position={{ x: 0, y: 0 }}
        onStart={() => {
          setIsDragging(true);
        }}
        onStop={() => {
          setIsDragging(false);
        }}
        onDrag={(_, data: any) => setDragPosition({ x: data.x, y: data.y })}
      >
        <Paper
          component="div"
          ref={drop as DropTargetRef}
          elevation={isSelected ? 8 : 2}
          onClick={() => handleSectionSelect(section.id)}
          sx={{
            position: "relative",
            mb: 3,
            overflow: "hidden",
            transition: "all 0.3s",
            border: isSelected ? "2px solid #1c5d15" : "2px solid transparent",
            transform: isDragging ? `translateY(${dragPosition.y}px)` : "none",
            opacity: isDragging ? 0.8 : 1,
            cursor: "move",
            minHeight: "200px",
            bgcolor: showGrid ? "rgba(28, 93, 20, 0.02)" : "transparent",
            backgroundImage: showGrid 
              ? "linear-gradient(rgba(28, 93, 20, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(28, 93, 20, 0.1) 1px, transparent 1px)"
              : "none",
            backgroundSize: showGrid ? "20px 20px" : "auto",
          }}
        >
          {/* Controles de sección */}
          {isSelected && (
            <Box
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 100,
                display: "flex",
                gap: 1,
                bgcolor: "white",
                borderRadius: 1,
                p: 0.5,
                boxShadow: 3,
              }}
            >
              <Tooltip title="Editar Contenido">
                <IconButton 
                  size="small" 
                  onClick={() => setIsEditing(!isSectionEditing)}
                  color={isSectionEditing ? "primary" : "default"}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Duplicar">
                <IconButton 
                  size="small" 
                  onClick={() => onSectionDuplicate(index)}
                  color="default"
                >
                  <ContentCopy />
                </IconButton>
              </Tooltip>

              <Tooltip title="Eliminar">
                <IconButton 
                  size="small" 
                  onClick={() => onSectionDelete(index)}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </Tooltip>

              <Tooltip title={showGrid ? "Ocultar Cuadrícula" : "Mostrar Cuadrícula"}>
                <IconButton 
                  size="small" 
                  onClick={() => setShowGrid(!showGrid)}
                  color={showGrid ? "primary" : "default"}
                >
                  {showGrid ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {/* Contenido de la sección */}
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <DragIndicator sx={{ color: "#1c5d15" }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {section.name}
              </Typography>
              <Chip 
                label={section.content?.type || "Tipo desconocido"} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>

            {/* Vista previa o editor según el modo */}
            {isSectionEditing ? (
              <Box>
                {/* Aquí iría el editor avanzado de contenido */}
                <Typography color="text.secondary">
                  Modo edición activado para {section.name}
                </Typography>
                {/* Componente de edición avanzada */}
                <Box
                  sx={{
                    minHeight: "150px",
                    border: "1px dashed #ccc",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#f9f9f9"
                  }}
                >
                  <Typography color="text.secondary">
                    Editor avanzado de {section.name}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box>
                {/* Vista previa de la sección */}
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Vista previa de {section.name}
                </Typography>
                {/* Componente de vista previa */}
                <Box
                  sx={{
                    minHeight: "150px",
                    border: "1px dashed #ccc",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#f9f9f9"
                  }}
                >
                  <Typography color="text.secondary">
                    Contenido de la sección {section.name}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {/* Indicador de selección */}
          {isSelected && (
            <Box
              sx={{
                position: "absolute",
                bottom: 8,
                left: 8,
                bgcolor: "#1c5d15",
                color: "white",
                px: 2,
                py: 0.5,
                borderRadius: 1,
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              Seleccionado
            </Box>
          )}
        </Paper>
      </Draggable>
    );
  };

  return (
    <Box ref={canvasRef} sx={{ position: "relative", minHeight: "100vh" }}>
      {/* Barra de herramientas flotante */}
      {selectedSectionId && (
        <FloatingToolbar
          onEdit={() => setIsEditing(!isEditing)}
          onDelete={() => onSectionDelete(sections.findIndex(s => s.id === selectedSectionId))}
          onDuplicate={() => onSectionDuplicate(sections.findIndex(s => s.id === selectedSectionId))}
        />
      )}

      {/* Panel de propiedades */}
      <PropertyPanel
        section={sections.find(s => s.id === selectedSectionId)}
        onUpdate={(field, value) => handleSectionEdit(selectedSectionId || "", field, value)}
      />

      {/* Gestor de capas */}
      <LayerManager
        sections={sections}
        selectedSectionId={selectedSectionId}
        onSectionSelect={handleSectionSelect}
        onSectionReorder={onSectionReorder}
        onSectionDelete={onSectionDelete}
        onSectionDuplicate={onSectionDuplicate}
      />

      {/* Controles de canvas */}
      <Box
        sx={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 1000,
          display: "flex",
          gap: 1,
          bgcolor: "white",
          borderRadius: 2,
          p: 1,
          boxShadow: 3,
        }}
      >
        <Tooltip title="Zoom In">
          <IconButton 
            size="small" 
            onClick={() => setZoomLevel(Math.min(zoomLevel + 10, 200))}
          >
            <span style={{ fontSize: "1.2rem" }}>+</span>
          </IconButton>
        </Tooltip>
        
        <Typography variant="body2" sx={{ minWidth: 40, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {zoomLevel}%
        </Typography>

        <Tooltip title="Zoom Out">
          <IconButton 
            size="small" 
            onClick={() => setZoomLevel(Math.max(zoomLevel - 10, 50))}
          >
            <span style={{ fontSize: "1.2rem" }}>-</span>
          </IconButton>
        </Tooltip>

        <Tooltip title="Reset Zoom">
          <IconButton 
            size="small" 
            onClick={() => setZoomLevel(100)}
          >
            <span style={{ fontSize: "1rem" }}>⟲</span>
          </IconButton>
        </Tooltip>
      </Box>

      {/* Canvas principal */}
      <Box
        sx={{
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: "top left",
          minHeight: "100vh",
          p: 4,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {sections.map((section, index) => (
            <Box key={section.id}>
              {renderSection(section, index)}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}