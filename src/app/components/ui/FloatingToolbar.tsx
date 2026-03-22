import { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Slider,
  Divider,
  Popover,
} from '@mui/material';
import {
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatColorText as ColorIcon,
  TextFields as FontIcon,
  ZoomIn as ZoomIcon,
  GridOn as GridIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import { Section } from '../../types/pdfCreator';

interface FloatingToolbarProps {
  sections: Section[];
  selectedSectionId: string | null;
  selectedElement: string | null;
  isEditing: boolean;
  onEditToggle: () => void;
  onSectionUpdate: (index: number, updatedSection: Section) => void;
  currentUser?: {
    id: string;
    isAdmin: boolean;
  };
}

export function FloatingToolbar({
  sections,
  selectedSectionId,
  selectedElement,
  isEditing,
  onEditToggle,
  onSectionUpdate
}: FloatingToolbarProps) {
  const [colorAnchorEl, setColorAnchorEl] = useState<HTMLElement | null>(null);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [showGrid, setShowGrid] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  const selectedSection = sections.find(s => s.id === selectedSectionId);
  const selectedSectionIndex = sections.findIndex(s => s.id === selectedSectionId);

  if (!selectedSection || !selectedSectionId) {
    return null;
  }

  const handleColorChange = (color: any) => {
    setCurrentColor(color.hex);
    const updatedSection = {
      ...selectedSection,
      content: {
        ...selectedSection.content,
        style: {
          ...selectedSection.content.style,
          textColor: color.hex
        }
      }
    };
    onSectionUpdate(selectedSectionIndex, updatedSection);
  };

  const handleStyleChange = (field: string, value: any) => {
    const updatedSection = {
      ...selectedSection,
      content: {
        ...selectedSection.content,
        style: {
          ...selectedSection.content.style,
          [field]: value
        }
      }
    };
    onSectionUpdate(selectedSectionIndex, updatedSection);
  };

  const handleBoldToggle = () => {
    handleStyleChange('fontWeight', selectedSection.content.style.fontWeight === 'bold' ? 'normal' : 'bold');
  };

  const handleItalicToggle = () => {
    handleStyleChange('fontStyle', selectedSection.content.style.fontStyle === 'italic' ? 'normal' : 'italic');
  };

  const handleVisibilityToggle = () => {
    handleStyleChange('display', selectedSection.content.style.display === 'none' ? 'block' : 'none');
  };

  const handleGridToggle = () => {
    setShowGrid(!showGrid);
  };

  const handleZoomChange = (zoom: number) => {
    setZoomLevel(zoom);
  };

  return (
    <>
      {/* Floating Toolbar Principal */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1200,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          bgcolor: 'white',
          borderRadius: 2,
          p: 1,
          boxShadow: 4,
          border: '1px solid #e0e0e0',
        }}
      >
        {/* Información de Selección */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Chip 
            label={selectedSection.name}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip 
            label={selectedSection.type}
            size="small"
            color="secondary"
            variant="outlined"
          />
          {selectedElement && (
            <Chip 
              label={`Elemento: ${selectedElement}`}
              size="small"
              color="info"
              variant="outlined"
            />
          )}
        </Box>

        <Divider />

        {/* Controles de Texto */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
          <Tooltip title="Negrita">
            <IconButton 
              size="small" 
              onClick={handleBoldToggle}
              color={selectedSection.content.style.fontWeight === 'bold' ? "primary" : "default"}
            >
              <BoldIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Cursiva">
            <IconButton 
              size="small" 
              onClick={handleItalicToggle}
              color={selectedSection.content.style.fontStyle === 'italic' ? "primary" : "default"}
            >
              <ItalicIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Color de Texto">
            <IconButton 
              size="small" 
              onClick={(e) => setColorAnchorEl(e.currentTarget)}
              color="default"
            >
              <ColorIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Fuente">
            <IconButton 
              size="small" 
              onClick={() => {}}
              color="default"
            >
              <FontIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider />

        {/* Controles de Vista */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
          <Tooltip title="Cuadrícula">
            <IconButton 
              size="small" 
              onClick={handleGridToggle}
              color={showGrid ? "primary" : "default"}
            >
              <GridIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Zoom">
            <IconButton 
              size="small" 
              onClick={() => {}}
              color="default"
            >
              <ZoomIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Configuración">
            <IconButton 
              size="small" 
              onClick={() => {}}
              color="default"
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider />

        {/* Controles de Sección */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
          <Tooltip title="Editar">
            <IconButton 
              size="small" 
              onClick={onEditToggle}
              color={isEditing ? "primary" : "default"}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Duplicar">
            <IconButton 
              size="small" 
              onClick={() => {}}
              color="default"
            >
              <CopyIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Eliminar">
            <IconButton 
              size="small" 
              onClick={() => {}}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Visibilidad">
            <IconButton 
              size="small" 
              onClick={handleVisibilityToggle}
              color="default"
            >
              {selectedSection.content.style.display === 'none' ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Barra de Zoom */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <ZoomIcon sx={{ fontSize: '1rem' }} />
          <Slider
            value={zoomLevel}
            onChange={(_, value) => handleZoomChange(value as number)}
            aria-labelledby="zoom-slider"
            min={50}
            max={200}
            sx={{ width: 100 }}
          />
          <Typography variant="caption">{zoomLevel}%</Typography>
        </Box>
      </Box>

      {/* Color Picker */}
      <Popover
        open={Boolean(colorAnchorEl)}
        anchorEl={colorAnchorEl}
        onClose={() => setColorAnchorEl(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <ChromePicker color={currentColor} onChange={handleColorChange} />
      </Popover>

      {/* Indicador de Modo Edición */}
      {isEditing && (
        <Box
          sx={{
            position: 'fixed',
            top: 70,
            right: 20,
            zIndex: 1100,
            bgcolor: '#1c5d15',
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 600,
            boxShadow: 2
          }}
        >
          Modo Edición Activado
        </Box>
      )}
    </>
  );
}