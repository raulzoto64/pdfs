import { useState, useCallback } from 'react';
import {
  Box,
  Drawer,
  Toolbar,
  IconButton,
  Typography,
  Chip,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { EditorCanvas } from './EditorCanvas';
import { FloatingToolbar } from './FloatingToolbar';
import { LayerManager } from './LayerManager';
import { PropertyPanel } from './PropertyPanel';
import { useEditorStore } from '../../store/editorStore';
import { Section, Document } from '../../types/pdfCreator';

interface AdvancedEditorProps {
  document?: Document;
  onSave?: (document: Document) => void;
  onExport?: (document: Document) => void;
  currentUser?: {
    id: string;
    isAdmin: boolean;
  };
}

export function AdvancedEditor({
  document,
  onSave,
  onExport,
  currentUser
}: AdvancedEditorProps) {
  const [sections, setSections] = useState<Section[]>(document?.customContent || []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLayerManagerOpen, setIsLayerManagerOpen] = useState(false);
  const [isPropertyPanelOpen, setIsPropertyPanelOpen] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('info');

  const {
    selectedSectionId,
    selectedElement,
    isEditing,
    setSelectedSection,
    setSelectedElement,
    setIsEditing
  } = useEditorStore();

  // Manejo de cambios en secciones
  const handleSectionsChange = useCallback((newSections: Section[]) => {
    setSections(newSections);
  }, []);

  const handleSectionUpdate = useCallback((index: number, updatedSection: Section) => {
    const newSections = [...sections];
    newSections[index] = updatedSection;
    setSections(newSections);
  }, [sections]);

  const handleSectionDelete = useCallback((index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);
    if (selectedSectionId === sections[index].id) {
      setSelectedSection(newSections.length > 0 ? newSections[0].id : null);
    }
    showSnackbar('Sección eliminada', 'info');
  }, [sections, selectedSectionId, setSelectedSection]);

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
    setSections(newSections);
    showSnackbar('Sección duplicada', 'success');
  }, [sections]);

  const handleSectionReorder = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const newSections = [...sections];
    const [movedSection] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, movedSection);
    setSections(newSections);
  }, [sections]);

  // Manejo de selección
  const handleSectionSelect = useCallback((sectionId: string, elementPath?: string) => {
    setSelectedSection(sectionId);
    if (elementPath) {
      setSelectedElement(elementPath);
    }
  }, [setSelectedSection, setSelectedElement]);

  // Controles de editor
  const handleSave = async () => {
    try {
      const documentToSave: Document = {
        id: document?.id || `doc-${Date.now()}`,
        userId: currentUser?.id || 'anonymous',
        templateId: null,
        name: document?.name || 'Documento sin nombre',
        customContent: sections,
        lastModified: new Date().toISOString()
      };

      if (onSave) {
        await onSave(documentToSave);
      }
      showSnackbar('Documento guardado exitosamente', 'success');
    } catch (error) {
      showSnackbar('Error al guardar el documento', 'error');
    }
  };

  const handleExport = async () => {
    try {
      const documentToExport: Document = {
        id: document?.id || `doc-${Date.now()}`,
        userId: currentUser?.id || 'anonymous',
        templateId: null,
        name: document?.name || 'Documento sin nombre',
        customContent: sections,
        lastModified: new Date().toISOString()
      };

      if (onExport) {
        await onExport(documentToExport);
      }
      showSnackbar('Documento exportado exitosamente', 'success');
    } catch (error) {
      showSnackbar('Error al exportar el documento', 'error');
    }
  };

  const handleAddSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      name: 'Nueva Sección',
      description: 'Sección recién creada',
      category: 'Content',
      type: 'text',
      content: {
        type: 'text',
        editable: {
          content: 'Contenido de la nueva sección...'
        },
        style: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          padding: '20px',
          fontFamily: 'Poppins',
          fontSize: 16,
          fontWeight: 'normal',
          fontStyle: 'normal',
          textAlign: 'left'
        }
      },
      author: currentUser?.id || 'Usuario',
      isPublic: false,
      createdAt: new Date().toISOString()
    };

    setSections([...sections, newSection]);
    setSelectedSection(newSection.id);
    showSnackbar('Sección añadida', 'success');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Toolbar Superior */}
      <Toolbar
        sx={{
          position: 'fixed',
          top: 0,
          left: isSidebarOpen ? 280 : 0,
          right: 0,
          zIndex: 1100,
          bgcolor: 'white',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          transition: 'left 0.3s'
        }}
      >
        {/* Controles de Documento */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {document?.name || 'Editor Avanzado'}
          </Typography>

          <Chip 
            label={`${sections.length} sección${sections.length !== 1 ? 'es' : ''}`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>

        {/* Controles de Acción */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Añadir Sección">
            <IconButton onClick={handleAddSection} color="primary">
              <AddIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Guardar Documento">
            <IconButton onClick={handleSave} color="default">
              <SaveIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Exportar PDF">
            <IconButton onClick={handleExport} color="primary">
              <DownloadIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Gestor de Capas">
            <IconButton 
              onClick={() => setIsLayerManagerOpen(!isLayerManagerOpen)}
              color={isLayerManagerOpen ? "primary" : "default"}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Panel de Propiedades">
            <IconButton 
              onClick={() => setIsPropertyPanelOpen(!isPropertyPanelOpen)}
              color={isPropertyPanelOpen ? "primary" : "default"}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      {/* Sidebar Izquierdo */}
      <Drawer
        variant="persistent"
        open={isSidebarOpen}
        sx={{
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            bgcolor: '#ffffff',
            borderRight: '1px solid #e0e0e0',
            mt: 8, // Para que no tape el toolbar
            zIndex: 1000
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Biblioteca de Secciones
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Arrastra y suelta secciones para añadirlas a tu documento
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
            {[
              { type: 'hero', name: 'Hero Principal', desc: 'Encabezado impactante' },
              { type: 'heading', name: 'Título', desc: 'Título de sección' },
              { type: 'text', name: 'Texto', desc: 'Párrafo de contenido' },
              { type: 'simple-text', name: 'Texto Simple', desc: 'Texto básico' }
            ].map((sectionType) => (
              <Box
                key={sectionType.type}
                sx={{
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  cursor: 'grab',
                  '&:hover': {
                    borderColor: '#1c5d15',
                    bgcolor: '#f8fff8'
                  }
                }}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('sectionType', sectionType.type);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
              >
                <Typography variant="subtitle2">{sectionType.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {sectionType.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Drawer>

      {/* Contenido Principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8, // Para que no tape el toolbar
          ml: isSidebarOpen ? 280 : 0,
          transition: 'margin-left 0.3s',
          position: 'relative'
        }}
      >
        {/* Canvas del Editor */}
        <EditorCanvas
          sections={sections}
          onSectionsChange={handleSectionsChange}
          onSectionUpdate={handleSectionUpdate}
          onSectionDelete={handleSectionDelete}
          onSectionDuplicate={handleSectionDuplicate}
          onSectionReorder={handleSectionReorder}
          currentUser={currentUser}
        />

        {/* Floating Toolbar */}
        <FloatingToolbar
          sections={sections}
          selectedSectionId={selectedSectionId}
          selectedElement={selectedElement}
          isEditing={isEditing}
          onEditToggle={() => setIsEditing(!isEditing)}
          onSectionUpdate={handleSectionUpdate}
          currentUser={currentUser}
        />

        {/* Layer Manager */}
        <Drawer
          anchor="right"
          open={isLayerManagerOpen}
          onClose={() => setIsLayerManagerOpen(false)}
          sx={{
            width: 300,
            '& .MuiDrawer-paper': {
              width: 300,
              bgcolor: '#ffffff',
              borderLeft: '1px solid #e0e0e0',
              mt: 8,
              zIndex: 1000
            }
          }}
        >
          <LayerManager
            sections={sections}
            selectedSectionId={selectedSectionId}
            onSectionSelect={handleSectionSelect}
            onSectionDelete={handleSectionDelete}
            onSectionDuplicate={handleSectionDuplicate}
            onSectionReorder={handleSectionReorder}
          />
        </Drawer>

        {/* Property Panel */}
        <Drawer
          anchor="right"
          open={isPropertyPanelOpen && !!selectedSectionId}
          onClose={() => setIsPropertyPanelOpen(false)}
          sx={{
            width: 350,
            '& .MuiDrawer-paper': {
              width: 350,
              bgcolor: '#ffffff',
              borderLeft: '1px solid #e0e0e0',
              mt: 8,
              zIndex: 1000
            }
          }}
        >
          <PropertyPanel
            sections={sections}
            selectedSectionId={selectedSectionId}
            selectedElement={selectedElement}
            onSectionUpdate={handleSectionUpdate}
          />
        </Drawer>
      </Box>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}