import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Chip,
  Divider,
  Button,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Palette as PaletteIcon,
  FormatAlignLeft as AlignLeftIcon,
  FormatAlignCenter as AlignCenterIcon,
  FormatAlignRight as AlignRightIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import { Section } from '../../types/pdfCreator';

interface PropertyPanelProps {
  sections: Section[];
  selectedSectionId: string | null;
  selectedElement: string | null;
  onSectionUpdate: (index: number, updatedSection: Section) => void;
}

export function PropertyPanel({
  sections,
  selectedSectionId,
  selectedElement,
  onSectionUpdate
}: PropertyPanelProps) {
  const [openSections, setOpenSections] = useState({
    content: true,
    style: true,
    typography: false,
    layout: false,
    effects: false
  });

  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');

  const selectedSection = sections.find(s => s.id === selectedSectionId);
  const selectedSectionIndex = sections.findIndex(s => s.id === selectedSectionId);

  if (!selectedSection || selectedSectionIndex === -1) {
    return (
      <Box sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary" align="center">
          Selecciona una sección para ver sus propiedades
        </Typography>
      </Box>
    );
  }

  const currentStyle = selectedSection.content.style || {};
  const currentEditable = selectedSection.content.editable || {};

  const handleStyleChange = (field: string, value: any) => {
    const updatedSection = {
      ...selectedSection,
      content: {
        ...selectedSection.content,
        style: {
          ...currentStyle,
          [field]: value
        }
      }
    };
    onSectionUpdate(selectedSectionIndex, updatedSection);
  };

  const handleEditableChange = (field: string, value: string) => {
    const updatedSection = {
      ...selectedSection,
      content: {
        ...selectedSection.content,
        editable: {
          ...currentEditable,
          [field]: value
        }
      }
    };
    onSectionUpdate(selectedSectionIndex, updatedSection);
  };

  const handleColorChange = (color: any) => {
    setCurrentColor(color.hex);
    handleStyleChange('textColor', color.hex);
  };

  const getAlignmentIcon = (alignment: string) => {
    switch (alignment) {
      case 'left': return <AlignLeftIcon />;
      case 'center': return <AlignCenterIcon />;
      case 'right': return <AlignRightIcon />;
      default: return <AlignLeftIcon />;
    }
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto', bgcolor: '#fafafa' }}>
      {/* Encabezado */}
      <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0', bgcolor: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
        
        <Typography variant="body2" color="text.secondary">
          Gestiona las propiedades de esta sección
        </Typography>
      </Box>

      {/* Contenido */}
      <Box sx={{ p: 3 }}>
        {/* Sección de Contenido */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              mb: 1
            }}
            onClick={() => setOpenSections(prev => ({ ...prev, content: !prev.content }))}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Contenido
            </Typography>
            <IconButton size="small">
              {openSections.content ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          
          <Collapse in={openSections.content}>
            <Box sx={{ pl: 2 }}>
              {Object.keys(currentEditable).map((key) => (
                <Box key={key} sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={currentEditable[key] || ''}
                    onChange={(e) => handleEditableChange(key, e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              ))}
            </Box>
          </Collapse>
        </Box>

        <Divider />

        {/* Sección de Estilo */}
        <Box sx={{ mb: 3, mt: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              mb: 1
            }}
            onClick={() => setOpenSections(prev => ({ ...prev, style: !prev.style }))}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Estilo Visual
            </Typography>
            <IconButton size="small">
              {openSections.style ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          
          <Collapse in={openSections.style}>
            <Box sx={{ pl: 2 }}>
              {/* Color de Texto */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Color de Texto
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      bgcolor: currentStyle.textColor || '#000000',
                      border: '1px solid #ccc'
                    }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setColorPickerOpen(!colorPickerOpen)}
                    startIcon={<PaletteIcon />}
                  >
                    Seleccionar Color
                  </Button>
                </Box>
                <Collapse in={colorPickerOpen} sx={{ mt: 2 }}>
                  <ChromePicker color={currentColor} onChange={handleColorChange} />
                </Collapse>
              </Box>

              {/* Color de Fondo */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Color de Fondo
                </Typography>
                <TextField
                  fullWidth
                  type="color"
                  value={currentStyle.backgroundColor || '#ffffff'}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Box>

              {/* Fuente */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Fuente
                </Typography>
                <Select
                  fullWidth
                  value={currentStyle.fontFamily || 'Poppins'}
                  onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                  size="small"
                >
                  {['Poppins', 'Roboto', 'Arial', 'Georgia', 'Times New Roman', 'Courier New'].map(font => (
                    <MenuItem key={font} value={font} sx={{ fontFamily: font }}>
                      {font}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              {/* Tamaño de Fuente */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Tamaño de Fuente
                </Typography>
                <Slider
                  value={currentStyle.fontSize || 16}
                  onChange={(_, value) => handleStyleChange('fontSize', value as number)}
                  min={10}
                  max={48}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>

              {/* Peso de Fuente */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Peso de Fuente
                </Typography>
                <Select
                  fullWidth
                  value={currentStyle.fontWeight || 'normal'}
                  onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                  size="small"
                >
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="bold">Negrita</MenuItem>
                  <MenuItem value="lighter">Ligero</MenuItem>
                  <MenuItem value="bolder">Más Grueso</MenuItem>
                </Select>
              </Box>

              {/* Estilo de Fuente */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Estilo de Fuente
                </Typography>
                <Select
                  fullWidth
                  value={currentStyle.fontStyle || 'normal'}
                  onChange={(e) => handleStyleChange('fontStyle', e.target.value)}
                  size="small"
                >
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="italic">Cursiva</MenuItem>
                </Select>
              </Box>

              {/* Alineación de Texto */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Alineación de Texto
                </Typography>
                <Select
                  fullWidth
                  value={currentStyle.textAlign || 'left'}
                  onChange={(e) => handleStyleChange('textAlign', e.target.value)}
                  size="small"
                  renderValue={(value) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getAlignmentIcon(value as string)}
                      <span>{value}</span>
                    </Box>
                  )}
                >
                  <MenuItem value="left">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AlignLeftIcon />
                      <span>Izquierda</span>
                    </Box>
                  </MenuItem>
                  <MenuItem value="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AlignCenterIcon />
                      <span>Centro</span>
                    </Box>
                  </MenuItem>
                  <MenuItem value="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AlignRightIcon />
                      <span>Derecha</span>
                    </Box>
                  </MenuItem>
                </Select>
              </Box>
            </Box>
          </Collapse>
        </Box>

        <Divider />

        {/* Sección de Tipografía */}
        <Box sx={{ mb: 3, mt: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              mb: 1
            }}
            onClick={() => setOpenSections(prev => ({ ...prev, typography: !prev.typography }))}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Tipografía
            </Typography>
            <IconButton size="small">
              {openSections.typography ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          
          <Collapse in={openSections.typography}>
            <Box sx={{ pl: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentStyle.fontWeight === 'bold'}
                      onChange={(e) => handleStyleChange('fontWeight', e.target.checked ? 'bold' : 'normal')}
                    />
                  }
                  label="Negrita"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentStyle.fontStyle === 'italic'}
                      onChange={(e) => handleStyleChange('fontStyle', e.target.checked ? 'italic' : 'normal')}
                    />
                  }
                  label="Cursiva"
                />
              </Box>
            </Box>
          </Collapse>
        </Box>

        <Divider />

        {/* Sección de Layout */}
        <Box sx={{ mb: 3, mt: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              mb: 1
            }}
            onClick={() => setOpenSections(prev => ({ ...prev, layout: !prev.layout }))}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Layout
            </Typography>
            <IconButton size="small">
              {openSections.layout ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          
          <Collapse in={openSections.layout}>
            <Box sx={{ pl: 2 }}>
              {/* Padding */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Padding
                </Typography>
                <TextField
                  fullWidth
                  type="text"
                  value={currentStyle.padding || '20px'}
                  onChange={(e) => handleStyleChange('padding', e.target.value)}
                  variant="outlined"
                  size="small"
                  placeholder="20px"
                />
              </Box>

              {/* Border */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Borde
                </Typography>
                <TextField
                  fullWidth
                  type="text"
                  value={currentStyle.border || 'none'}
                  onChange={(e) => handleStyleChange('border', e.target.value)}
                  variant="outlined"
                  size="small"
                  placeholder="1px solid #ccc"
                />
              </Box>

              {/* Border Radius */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Radio de Bordes
                </Typography>
                <TextField
                  fullWidth
                  type="text"
                  value={currentStyle.borderRadius || '0px'}
                  onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                  variant="outlined"
                  size="small"
                  placeholder="8px"
                />
              </Box>

              {/* Visibilidad */}
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentStyle.display !== 'none'}
                      onChange={(e) => handleStyleChange('display', e.target.checked ? 'block' : 'none')}
                    />
                  }
                  label="Visible en el documento"
                />
              </Box>
            </Box>
          </Collapse>
        </Box>

        <Divider />

        {/* Acciones de Sección */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Acciones de Sección
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<CopyIcon />}
              onClick={() => {}}
            >
              Duplicar Sección
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {}}
            >
              Eliminar Sección
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}