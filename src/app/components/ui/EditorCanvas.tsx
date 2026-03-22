import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Divider,
  Alert
} from '@mui/material';
import {
  Add,
  Save,
  Download,
  ZoomIn,
  ZoomOut,
  GridOn,
  Settings
} from '@mui/icons-material';
import { useDrop } from 'react-dnd';
import { EditableSection } from './EditableSection';
import { SectionLibraryModal } from './SectionLibraryModal';
import { useEditorStore } from '../../store/editorStore';
import { Section } from '../../types/pdfCreator';

interface EditorCanvasProps {
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
  onSectionUpdate: (index: number, updatedSection: Section) => void;
  onSectionDelete: (index: number) => void;
  onSectionDuplicate: (index: number) => void;
  onSectionReorder: (fromIndex: number, toIndex: number) => void;
  currentUser?: {
    id: string;
    isAdmin: boolean;
  };
}

export function EditorCanvas({
  sections,
  onSectionsChange,
  onSectionUpdate,
  onSectionReorder,
}: EditorCanvasProps) {
  const [showLibrary, setShowLibrary] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showSettings, setShowSettings] = useState(false);
  const [documentName, setDocumentName] = useState('Mi Documento');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const canvasRef = useRef<HTMLDivElement>(null);
  
  const {
    selectedSectionId,
    setSelectedSection,
    setSelectedElement
  } = useEditorStore();

  // Sistema de arrastrar y soltar con React DnD
  const [, drop] = useDrop({
    accept: 'SECTION',
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
    setSelectedSection(sectionId);
    if (elementPath) {
      setSelectedElement(elementPath);
    }
  }, [setSelectedSection, setSelectedElement]);

  // Manejo de edición en tiempo real
  const handleSectionEdit = useCallback((sectionId: string, field: string, value: any) => {
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex !== -1) {
      const updatedSection = { ...sections[sectionIndex] };
      
      // Manejar edición de campos anidados
      if (field.includes('.')) {
        const [parent, child] = field.split('.') as [keyof typeof updatedSection.content, string];
        if (!updatedSection.content[parent]) {
          updatedSection.content[parent] = {} as any;
        }
        (updatedSection.content[parent] as any)[child] = value;
      } else {
        (updatedSection as any)[field] = value;
      }
      
      onSectionUpdate(sectionIndex, updatedSection);
    }
  }, [sections, onSectionUpdate]);

  // Manejo de duplicación
  const handleSectionDuplicate = useCallback((index: number) => {
    const sectionToDuplicate = sections[index];
    if (!sectionToDuplicate) return;

    const duplicatedSection: Section = {
      ...sectionToDuplicate,
      id: `${sectionToDuplicate.id}-copy-${Date.now()}`,
      name: `${sectionToDuplicate.name} (Copia)`,
      createdAt: new Date().toISOString()
    };

    const newSections = [...sections];
    newSections.splice(index + 1, 0, duplicatedSection);
    onSectionsChange(newSections);
  }, [sections, onSectionsChange]);

  // Manejo de eliminación
  const handleSectionDelete = useCallback((index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    onSectionsChange(newSections);
    if (selectedSectionId === sections[index].id) {
      setSelectedSection(newSections.length > 0 ? newSections[0].id : null);
    }
  }, [sections, onSectionsChange, selectedSectionId, setSelectedSection]);

  // Controles de zoom
  const handleZoomIn = () => setZoomLevel(Math.min(zoomLevel + 10, 200));
  const handleZoomOut = () => setZoomLevel(Math.max(zoomLevel - 10, 50));
  const handleZoomReset = () => setZoomLevel(100);

  // Guardar documento
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Exportar a PDF
  const handleExportPDF = async () => {
    try {
      // Simular exportación
      const blob = new Blob(['PDF Content'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${documentName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
    }
  };

  return (
    <Box ref={drop as unknown as React.RefObject<HTMLDivElement>} sx={{ position: 'relative', minHeight: '100vh' }}>
      {/* Controles de Canvas */}
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          bgcolor: 'white',
          borderRadius: 2,
          p: 1,
          boxShadow: 3,
          border: '1px solid #e0e0e0',
        }}
      >
        {/* Controles de Zoom */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#666', minWidth: 40 }}>
            Zoom
          </Typography>
          <IconButton size="small" onClick={handleZoomOut} disabled={zoomLevel <= 50}>
            <ZoomOut />
          </IconButton>
          <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'center' }}>
            {zoomLevel}%
          </Typography>
          <IconButton size="small" onClick={handleZoomIn} disabled={zoomLevel >= 200}>
            <ZoomIn />
          </IconButton>
          <IconButton size="small" onClick={handleZoomReset}>
            <span style={{ fontSize: '1rem' }}>⟲</span>
          </IconButton>
        </Box>

        <Divider />

        {/* Controles de Vista */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
          <Tooltip title="Cuadrícula de ayuda">
            <IconButton 
              size="small" 
              onClick={() => setShowGrid(!showGrid)}
              color={showGrid ? "primary" : "default"}
            >
              <GridOn />
            </IconButton>
          </Tooltip>

          <Tooltip title="Biblioteca de Secciones">
            <IconButton 
              size="small" 
              onClick={() => setShowLibrary(true)}
              color="default"
            >
              <Add />
            </IconButton>
          </Tooltip>

          <Tooltip title="Configuración">
            <IconButton 
              size="small" 
              onClick={() => setShowSettings(true)}
              color="default"
            >
              <Settings />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider />

        {/* Controles de Documento */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
          <Tooltip title="Guardar Documento">
            <span>
              <IconButton 
                size="small" 
                onClick={handleSave}
                disabled={isSaving}
                color={saveStatus === 'saved' ? "success" : "default"}
              >
                <Save />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Exportar a PDF">
            <IconButton 
              size="small" 
              onClick={handleExportPDF}
              color="primary"
            >
              <Download />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Estado de Guardado */}
        {saveStatus !== 'idle' && (
          <Alert 
            severity={saveStatus === 'error' ? 'error' : 'success'}
            sx={{ mt: 1, fontSize: '0.75rem', p: 0.5 }}
          >
            {saveStatus === 'saving' && 'Guardando...'}
            {saveStatus === 'saved' && 'Guardado exitosamente'}
            {saveStatus === 'error' && 'Error al guardar'}
          </Alert>
        )}
      </Box>

      {/* Canvas Principal */}
      <Box
        sx={{
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top left',
          minHeight: '100vh',
          p: 4,
          bgcolor: showGrid ? 'rgba(28, 93, 20, 0.02)' : 'transparent',
          backgroundImage: showGrid 
            ? "linear-gradient(rgba(28, 93, 20, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(28, 93, 20, 0.1) 1px, transparent 1px)"
            : "none",
          backgroundSize: showGrid ? "20px 20px" : "auto",
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {sections.map((section, index) => (
            <Box key={section.id}>
              <EditableSection
                section={section}
                index={index}
                onEdit={handleSectionEdit}
                onDelete={() => handleSectionDelete(index)}
                onDuplicate={() => handleSectionDuplicate(index)}
                onReorder={onSectionReorder}
                isSelected={selectedSectionId === section.id}
                onSelect={handleSectionSelect}
              />
            </Box>
          ))}
          
          {/* Mensaje cuando no hay secciones */}
          {sections.length === 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                border: '2px dashed #ccc',
                borderRadius: 2,
                p: 4,
                bgcolor: '#fafafa'
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No hay secciones en tu documento
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Comienza añadiendo una sección desde la biblioteca
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowLibrary(true)}
                sx={{ mt: 2 }}
              >
                Añadir Sección
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Modal de Biblioteca de Secciones */}
      <SectionLibraryModal
        open={showLibrary}
        onClose={() => setShowLibrary(false)}
        onAddSection={(section) => {
          onSectionsChange([...sections, section]);
          setSelectedSection(section.id);
          setShowLibrary(false);
        }}
      />

      {/* Modal de Configuración */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Configuración del Documento</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Nombre del Documento"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
            />
            
            <FormControl fullWidth>
              <InputLabel>Formato de Página</InputLabel>
              <Select value="A4" label="Formato de Página">
                <MenuItem value="A4">A4 (210 x 297 mm)</MenuItem>
                <MenuItem value="Letter">Carta (8.5 x 11 in)</MenuItem>
                <MenuItem value="Legal">Oficio (8.5 x 14 in)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Orientación</InputLabel>
              <Select value="portrait" label="Orientación">
                <MenuItem value="portrait">Vertical</MenuItem>
                <MenuItem value="landscape">Horizontal</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Calidad de Exportación</InputLabel>
              <Select value="high" label="Calidad de Exportación">
                <MenuItem value="low">Baja</MenuItem>
                <MenuItem value="medium">Media</MenuItem>
                <MenuItem value="high">Alta</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mt: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                />
              }
              label="Mostrar cuadrícula de ayuda"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => setShowSettings(false)}>
            Guardar Configuración
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}