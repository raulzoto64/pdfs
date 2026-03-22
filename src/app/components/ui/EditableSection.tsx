import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Card,
  CardContent,
  Popover,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  DragIndicator as DragIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatColorText as ColorIcon,
  ZoomIn as ZoomIcon,
  GridOn as GridIcon
} from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import { useDrag, useDrop } from 'react-dnd';
import { useEditorStore } from '../../store/editorStore';
import { Section } from '../../types/pdfCreator';

const FONT_OPTIONS = [
  'Poppins',
  'Roboto',
  'Arial',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Helvetica'
];

interface EditableSectionProps {
  section: Section;
  index: number;
  onEdit: (sectionId: string, field: string, value: any) => void;
  onDelete: (sectionId: string) => void;
  onDuplicate: (sectionId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  isSelected: boolean;
  onSelect: (sectionId: string) => void;
}

export function EditableSection({
  section,
  index,
  onEdit,
  onDelete,
  onDuplicate,
  onReorder,
  isSelected,
  onSelect
}: EditableSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [colorAnchorEl, setColorAnchorEl] = useState<HTMLElement | null>(null);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [showGrid, setShowGrid] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  const { setSelectedElement } = useEditorStore();

  // Drag and Drop
  const [{ isDragging }, drag] = useDrag({
    type: 'SECTION',
    item: { id: section.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'SECTION',
    hover: (item: { id: string; index: number }) => {
      if (item.index !== index) {
        onReorder(item.index, index);
        item.index = index;
      }
    },
  });


  const handleStyleChange = (field: string, value: any) => {
    onEdit(section.id, 'content.style', {
      ...section.content.style,
      [field]: value
    });
  };

  const handleColorChange = (color: any) => {
    setCurrentColor(color.hex);
    handleStyleChange('textColor', color.hex);
  };

  const handleFontChange = (font: string) => {
    handleStyleChange('fontFamily', font);
  };

  const handleFontSizeChange = (size: number) => {
    handleStyleChange('fontSize', size);
  };

  const handleBoldToggle = () => {
    handleStyleChange('fontWeight', section.content.style.fontWeight === 'bold' ? 'normal' : 'bold');
  };

  const handleItalicToggle = () => {
    handleStyleChange('fontStyle', section.content.style.fontStyle === 'italic' ? 'normal' : 'italic');
  };

  const handleVisibilityToggle = () => {
    handleStyleChange('display', section.content.style.display === 'none' ? 'block' : 'none');
  };

  const handleGridToggle = () => {
    setShowGrid(!showGrid);
  };

  const handleZoomChange = (zoom: number) => {
    setZoomLevel(zoom);
  };

  // Render section content based on type
  const renderSectionContent = () => {
    const style = {
      ...section.content.style,
      fontFamily: section.content.style.fontFamily || 'Poppins',
      fontSize: `${section.content.style.fontSize || 16}px`,
      fontWeight: section.content.style.fontWeight || 'normal',
      fontStyle: section.content.style.fontStyle || 'normal',
      color: section.content.style.textColor || '#000000',
      backgroundColor: section.content.style.backgroundColor || '#ffffff',
      padding: section.content.style.padding || '20px',
      border: section.content.style.border || 'none',
      borderRadius: section.content.style.borderRadius || '0px',
      textAlign: section.content.style.textAlign || 'left'
    };

    switch (section.type) {
      case 'hero':
        return (
          <Box sx={{ ...style, minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontSize: '3rem',
                fontWeight: 'bold',
                mb: 2,
                cursor: isEditing ? 'text' : 'default'
              }}
              onClick={() => setSelectedElement(`${section.id}.title`)}
            >
              {section.content.editable.title || 'Título Principal'}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontSize: '1.5rem',
                mb: 3,
                cursor: isEditing ? 'text' : 'default'
              }}
              onClick={() => setSelectedElement(`${section.id}.subtitle`)}
            >
              {section.content.editable.subtitle || 'Subtítulo descriptivo'}
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                alignSelf: 'flex-start',
                cursor: isEditing ? 'text' : 'default'
              }}
              onClick={() => setSelectedElement(`${section.id}.buttonText`)}
            >
              {section.content.editable.buttonText || 'Botón de Acción'}
            </Button>
          </Box>
        );

      case 'heading':
        return (
          <Box sx={style}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                cursor: isEditing ? 'text' : 'default'
              }}
              onClick={() => setSelectedElement(`${section.id}.title`)}
            >
              {section.content.editable.title || 'Título de Sección'}
            </Typography>
          </Box>
        );

      case 'text':
        return (
          <Box sx={style}>
            <Typography
              variant="body1"
              sx={{
                fontSize: '1.1rem',
                lineHeight: 1.6,
                cursor: isEditing ? 'text' : 'default'
              }}
              onClick={() => setSelectedElement(`${section.id}.content`)}
            >
              {section.content.editable.content || 'Contenido de texto editable...'}
            </Typography>
          </Box>
        );

      case 'simple-text':
        return (
          <Box sx={style}>
            <Typography
              variant="body2"
              sx={{
                fontSize: '1rem',
                cursor: isEditing ? 'text' : 'default'
              }}
              onClick={() => setSelectedElement(`${section.id}.content`)}
            >
              {section.content.editable.content || 'Texto simple...'}
            </Typography>
          </Box>
        );

      default:
        return (
          <Box sx={{ ...style, minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Tipo de sección: {section.type}
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Card
      ref={(node) => {
        if (node) {
          drag(drop(node));
        }
      }}
      elevation={isSelected ? 8 : 2}
      onClick={() => onSelect(section.id)}
      sx={{
        position: 'relative',
        mb: 3,
        overflow: 'hidden',
        transition: 'all 0.3s',
        border: isSelected ? '2px solid #1c5d15' : '2px solid transparent',
        transform: isDragging ? 'none' : `scale(${zoomLevel / 100})`,
        opacity: isDragging ? 0.8 : 1,
        cursor: 'move',
        bgcolor: showGrid ? 'rgba(28, 93, 20, 0.02)' : 'transparent',
        backgroundImage: showGrid 
          ? "linear-gradient(rgba(28, 93, 20, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(28, 93, 20, 0.1) 1px, transparent 1px)"
          : "none",
        backgroundSize: showGrid ? "20px 20px" : "auto",
        transformOrigin: 'top left'
      }}
    >
      {/* Section Header */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'white',
          borderRadius: 1,
          p: 0.5,
          boxShadow: 3,
          border: '1px solid #e0e0e0'
        }}
      >
        <DragIcon sx={{ color: '#1c5d15', fontSize: '1rem' }} />
        <Typography variant="caption" sx={{ fontWeight: 600, color: '#666' }}>
          {section.name}
        </Typography>
        <Chip 
          label={section.type} 
          size="small" 
          color="primary" 
          variant="outlined"
          sx={{ fontSize: '0.6rem' }}
        />
      </Box>

      {/* Controls */}
      {isSelected && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 100,
            display: 'flex',
            gap: 1,
            bgcolor: 'white',
            borderRadius: 1,
            p: 0.5,
            boxShadow: 3,
            border: '1px solid #e0e0e0'
          }}
        >
          <IconButton size="small" onClick={() => setIsEditing(!isEditing)} color={isEditing ? "primary" : "default"}>
            <EditIcon />
          </IconButton>
          
          <IconButton size="small" onClick={() => onDuplicate(section.id)} color="default">
            <CopyIcon />
          </IconButton>

          <IconButton size="small" onClick={() => onDelete(section.id)} color="error">
            <DeleteIcon />
          </IconButton>

          <IconButton size="small" onClick={handleGridToggle} color={showGrid ? "primary" : "default"}>
            <GridIcon />
          </IconButton>

          <IconButton size="small" onClick={handleVisibilityToggle} color="default">
            {section.content.style.display === 'none' ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </IconButton>
        </Box>
      )}

      {/* Content */}
      <CardContent sx={{ p: 0 }}>
        {renderSectionContent()}
      </CardContent>

      {/* Floating Toolbar */}
      {isSelected && isEditing && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            right: 8,
            bgcolor: 'white',
            borderRadius: 2,
            p: 1,
            boxShadow: 4,
            border: '1px solid #e0e0e0',
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          {/* Text Controls */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <IconButton size="small" onClick={handleBoldToggle} color={section.content.style.fontWeight === 'bold' ? "primary" : "default"}>
              <BoldIcon />
            </IconButton>
            <IconButton size="small" onClick={handleItalicToggle} color={section.content.style.fontStyle === 'italic' ? "primary" : "default"}>
              <ItalicIcon />
            </IconButton>
            <IconButton size="small" onClick={(e) => setColorAnchorEl(e.currentTarget)} color="default">
              <ColorIcon />
            </IconButton>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Font</InputLabel>
              <Select
                value={section.content.style.fontFamily || 'Poppins'}
                label="Font"
                onChange={(e) => handleFontChange(e.target.value)}
              >
                {FONT_OPTIONS.map(font => (
                  <MenuItem key={font} value={font} sx={{ fontFamily: font }}>
                    {font}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Slider
              value={section.content.style.fontSize || 16}
              onChange={(_, value) => handleFontSizeChange(value as number)}
              aria-labelledby="font-size-slider"
              min={10}
              max={48}
              sx={{ width: 100 }}
            />
          </Box>

          <Divider orientation="vertical" flexItem />

          {/* Zoom Controls */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <ZoomIcon />
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
      )}

      {/* Color Picker */}
      <Popover
        open={Boolean(colorAnchorEl)}
        anchorEl={colorAnchorEl}
        onClose={() => setColorAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <ChromePicker color={currentColor} onChange={handleColorChange} />
      </Popover>

      {/* Indicador de selección */}
      {isSelected && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            bgcolor: '#1c5d15',
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          Seleccionado
        </Box>
      )}
    </Card>
  );
}