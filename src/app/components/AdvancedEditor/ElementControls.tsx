/**
 * CONTROLES DE ELEMENTOS
 * 
 * Panel de propiedades para editar elementos seleccionados:
 * - Posicion y tamano
 * - Rotacion y opacidad
 * - Estilos de texto
 * - Filtros de imagen
 * - Bordes y sombras
 * - Acciones rapidas
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Button,
  Divider,
  Collapse,
  Switch,
  FormControlLabel,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  Crop,
  FilterVintage,
  FlipToFront,
  FlipToBack,
  Lock,
  LockOpen,
  Visibility,
  VisibilityOff,
  ContentCopy,
  Delete,
  ExpandMore,
  AspectRatio,
  Rotate90DegreesCw,
  Opacity,
  Image as ImageIcon,
  TextFields,
  CropSquare,
  BorderStyle,
  AutoFixHigh,
  PhotoFilter,
  Tune,
  Upload,
} from '@mui/icons-material';
import * as fabric from 'fabric';
import { useCanvasStore } from '../../store/canvasStore';
import { IMAGE_INSTRUCTIONS } from '../../config/aiInstructions';

// ============================================================================
// TIPOS
// ============================================================================

interface ElementControlsProps {
  selectedObjects: fabric.Object[];
  canvas: fabric.Canvas | null;
  onUpdateObject: (object: fabric.Object, updates: Partial<fabric.Object>) => void;
  onDeleteObject: (object: fabric.Object) => void;
  onDuplicateObject: (object: fabric.Object) => void;
  onBringToFront: (object: fabric.Object) => void;
  onSendToBack: (object: fabric.Object) => void;
  onOpenColorPalette: (color: string, target: 'fill' | 'stroke' | 'text') => void;
}

type TabType = 'transform' | 'style' | 'filters' | 'actions';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function ElementControls({
  selectedObjects,
  canvas,
  onUpdateObject,
  onDeleteObject,
  onDuplicateObject,
  onBringToFront,
  onSendToBack,
  onOpenColorPalette,
}: ElementControlsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('transform');
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const selectedObject = selectedObjects.length === 1 ? selectedObjects[0] : null;
  const isMultiSelect = selectedObjects.length > 1;
  const isText = selectedObject instanceof fabric.IText || selectedObject instanceof fabric.Text;
  const isImage = selectedObject instanceof fabric.FabricImage;
  const isShape = selectedObject instanceof fabric.Rect || 
                  selectedObject instanceof fabric.Circle || 
                  selectedObject instanceof fabric.Triangle;

  // ============================================================================
  // TRANSFORM HANDLERS
  // ============================================================================

  const handlePositionChange = useCallback((axis: 'x' | 'y', value: number) => {
    if (!selectedObject) return;
    const prop = axis === 'x' ? 'left' : 'top';
    selectedObject.set(prop, value);
    canvas?.renderAll();
    onUpdateObject(selectedObject, { [prop]: value });
  }, [selectedObject, canvas, onUpdateObject]);

  const handleSizeChange = useCallback((dimension: 'width' | 'height', value: number) => {
    if (!selectedObject) return;

    const currentWidth = selectedObject.getScaledWidth();
    const currentHeight = selectedObject.getScaledHeight();
    
    if (dimension === 'width') {
      const scale = value / (selectedObject.width || 1);
      selectedObject.set('scaleX', scale);
      
      if (aspectRatioLocked) {
        const ratio = currentHeight / currentWidth;
        selectedObject.set('scaleY', scale * (ratio * currentWidth / currentHeight));
      }
    } else {
      const scale = value / (selectedObject.height || 1);
      selectedObject.set('scaleY', scale);
      
      if (aspectRatioLocked) {
        const ratio = currentWidth / currentHeight;
        selectedObject.set('scaleX', scale * (ratio * currentHeight / currentWidth));
      }
    }

    canvas?.renderAll();
    onUpdateObject(selectedObject, { scaleX: selectedObject.scaleX, scaleY: selectedObject.scaleY });
  }, [selectedObject, canvas, aspectRatioLocked, onUpdateObject]);

  const handleRotationChange = useCallback((value: number) => {
    if (!selectedObject) return;
    selectedObject.set('angle', value);
    canvas?.renderAll();
    onUpdateObject(selectedObject, { angle: value });
  }, [selectedObject, canvas, onUpdateObject]);

  const handleOpacityChange = useCallback((value: number) => {
    if (!selectedObject) return;
    selectedObject.set('opacity', value / 100);
    canvas?.renderAll();
    onUpdateObject(selectedObject, { opacity: value / 100 });
  }, [selectedObject, canvas, onUpdateObject]);

  // ============================================================================
  // TEXT HANDLERS
  // ============================================================================

  const handleTextStyleChange = useCallback((style: 'bold' | 'italic' | 'underline') => {
    if (!selectedObject || !isText) return;
    const textObj = selectedObject as fabric.IText;

    switch (style) {
      case 'bold':
        textObj.set('fontWeight', textObj.fontWeight === 'bold' ? 'normal' : 'bold');
        break;
      case 'italic':
        textObj.set('fontStyle', textObj.fontStyle === 'italic' ? 'normal' : 'italic');
        break;
      case 'underline':
        textObj.set('underline', !textObj.underline);
        break;
    }

    canvas?.renderAll();
    onUpdateObject(selectedObject, {
      fontWeight: textObj.fontWeight,
      fontStyle: textObj.fontStyle,
      underline: textObj.underline,
    });
  }, [selectedObject, isText, canvas, onUpdateObject]);

  const handleTextAlignChange = useCallback((align: 'left' | 'center' | 'right' | 'justify') => {
    if (!selectedObject || !isText) return;
    const textObj = selectedObject as fabric.IText;
    textObj.set('textAlign', align);
    canvas?.renderAll();
    onUpdateObject(selectedObject, { textAlign: align });
  }, [selectedObject, isText, canvas, onUpdateObject]);

  const handleFontFamilyChange = useCallback((fontFamily: string) => {
    if (!selectedObject || !isText) return;
    const textObj = selectedObject as fabric.IText;
    textObj.set('fontFamily', fontFamily);
    canvas?.renderAll();
    onUpdateObject(selectedObject, { fontFamily });
  }, [selectedObject, isText, canvas, onUpdateObject]);

  const handleFontSizeChange = useCallback((fontSize: number) => {
    if (!selectedObject || !isText) return;
    const textObj = selectedObject as fabric.IText;
    textObj.set('fontSize', fontSize);
    canvas?.renderAll();
    onUpdateObject(selectedObject, { fontSize });
  }, [selectedObject, isText, canvas, onUpdateObject]);

  // ============================================================================
  // IMAGE HANDLERS
  // ============================================================================

  const handleImageFilterChange = useCallback((filterType: string, value: number) => {
    if (!selectedObject || !isImage) return;
    const imgObj = selectedObject as fabric.FabricImage;
    
    // Aplicar filtros
    let filters = imgObj.filters || [];
    
    switch (filterType) {
      case 'brightness':
        filters = filters.filter(f => !(f instanceof fabric.filters.Brightness));
        if (value !== 100) {
          filters.push(new fabric.filters.Brightness({ brightness: (value - 100) / 100 }));
        }
        break;
      case 'contrast':
        filters = filters.filter(f => !(f instanceof fabric.filters.Contrast));
        if (value !== 100) {
          filters.push(new fabric.filters.Contrast({ contrast: (value - 100) / 100 }));
        }
        break;
      case 'saturation':
        filters = filters.filter(f => !(f instanceof fabric.filters.Saturation));
        if (value !== 100) {
          filters.push(new fabric.filters.Saturation({ saturation: (value - 100) / 100 }));
        }
        break;
      case 'blur':
        filters = filters.filter(f => !(f instanceof fabric.filters.Blur));
        if (value > 0) {
          filters.push(new fabric.filters.Blur({ blur: value / 100 }));
        }
        break;
      case 'grayscale':
        filters = filters.filter(f => !(f instanceof fabric.filters.Grayscale));
        if (value > 0) {
          filters.push(new fabric.filters.Grayscale({ grayscale: value / 100 }));
        }
        break;
    }

    imgObj.filters = filters;
    imgObj.applyFilters();
    canvas?.renderAll();
  }, [selectedObject, isImage, canvas]);

  const handleImageReplace = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedObject || !isImage) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const url = e.target?.result as string;
      const imgObj = selectedObject as fabric.FabricImage;
      
      const newImg = await fabric.FabricImage.fromURL(url);
      imgObj.setElement(newImg.getElement());
      imgObj.set({
        scaleX: imgObj.scaleX,
        scaleY: imgObj.scaleY,
      });
      canvas?.renderAll();
    };
    reader.readAsDataURL(file);
  }, [selectedObject, isImage, canvas]);

  const applyPresetFilter = useCallback((preset: keyof typeof IMAGE_INSTRUCTIONS.FILTERS) => {
    if (!selectedObject || !isImage) return;
    const imgObj = selectedObject as fabric.FabricImage;
    const filter = IMAGE_INSTRUCTIONS.FILTERS[preset];

    imgObj.filters = [];
    
    if (filter.brightness !== 100) {
      imgObj.filters.push(new fabric.filters.Brightness({ brightness: (filter.brightness - 100) / 100 }));
    }
    if (filter.contrast !== 100) {
      imgObj.filters.push(new fabric.filters.Contrast({ contrast: (filter.contrast - 100) / 100 }));
    }
    if (filter.saturate !== 100) {
      imgObj.filters.push(new fabric.filters.Saturation({ saturation: (filter.saturate - 100) / 100 }));
    }
    if (filter.blur > 0) {
      imgObj.filters.push(new fabric.filters.Blur({ blur: filter.blur / 100 }));
    }

    imgObj.applyFilters();
    canvas?.renderAll();
  }, [selectedObject, isImage, canvas]);

  // ============================================================================
  // SHAPE HANDLERS
  // ============================================================================

  const handleFillColorChange = useCallback(() => {
    if (!selectedObject) return;
    const currentFill = String(selectedObject.fill || '#000000');
    onOpenColorPalette(currentFill, 'fill');
  }, [selectedObject, onOpenColorPalette]);

  const handleStrokeColorChange = useCallback(() => {
    if (!selectedObject) return;
    const currentStroke = String(selectedObject.stroke || '#000000');
    onOpenColorPalette(currentStroke, 'stroke');
  }, [selectedObject, onOpenColorPalette]);

  const handleStrokeWidthChange = useCallback((value: number) => {
    if (!selectedObject) return;
    selectedObject.set('strokeWidth', value);
    canvas?.renderAll();
    onUpdateObject(selectedObject, { strokeWidth: value });
  }, [selectedObject, canvas, onUpdateObject]);

  const handleCornerRadiusChange = useCallback((value: number) => {
    if (!selectedObject || !(selectedObject instanceof fabric.Rect)) return;
    selectedObject.set({ rx: value, ry: value });
    canvas?.renderAll();
    onUpdateObject(selectedObject, { rx: value, ry: value });
  }, [selectedObject, canvas, onUpdateObject]);

  // ============================================================================
  // VISIBILITY HANDLERS
  // ============================================================================

  const handleToggleLock = useCallback(() => {
    if (!selectedObject) return;
    const isLocked = !selectedObject.selectable;
    selectedObject.set({
      selectable: isLocked,
      evented: isLocked,
    });
    canvas?.renderAll();
    onUpdateObject(selectedObject, { selectable: isLocked, evented: isLocked });
  }, [selectedObject, canvas, onUpdateObject]);

  const handleToggleVisibility = useCallback(() => {
    if (!selectedObject) return;
    const isVisible = !selectedObject.visible;
    selectedObject.set('visible', isVisible);
    canvas?.renderAll();
    onUpdateObject(selectedObject, { visible: isVisible });
  }, [selectedObject, canvas, onUpdateObject]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (selectedObjects.length === 0) {
    return (
      <Paper
        elevation={3}
        sx={{
          width: 300,
          p: 3,
          bgcolor: 'background.paper',
          borderRadius: 2,
        }}
      >
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CropSquare sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Selecciona un elemento para editar sus propiedades
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
            Haz clic en un elemento del canvas o arrastra para crear uno nuevo
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (isMultiSelect) {
    return (
      <Paper
        elevation={3}
        sx={{
          width: 300,
          p: 3,
          bgcolor: 'background.paper',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {selectedObjects.length} elementos seleccionados
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title="Eliminar todos">
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => selectedObjects.forEach(obj => onDeleteObject(obj))}
            >
              Eliminar
            </Button>
          </Tooltip>
          <Tooltip title="Duplicar todos">
            <Button
              variant="outlined"
              startIcon={<ContentCopy />}
              onClick={() => selectedObjects.forEach(obj => onDuplicateObject(obj))}
            >
              Duplicar
            </Button>
          </Tooltip>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        width: 300,
        maxHeight: '80vh',
        overflow: 'auto',
        bgcolor: 'background.paper',
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {isText && <TextFields color="primary" />}
        {isImage && <ImageIcon color="primary" />}
        {isShape && <CropSquare color="primary" />}
        <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
          {isText ? 'Texto' : isImage ? 'Imagen' : 'Forma'}
        </Typography>
        
        {/* Quick actions */}
        <Tooltip title={selectedObject?.selectable ? 'Bloquear' : 'Desbloquear'}>
          <IconButton size="small" onClick={handleToggleLock}>
            {selectedObject?.selectable ? <LockOpen fontSize="small" /> : <Lock fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title={selectedObject?.visible ? 'Ocultar' : 'Mostrar'}>
          <IconButton size="small" onClick={handleToggleVisibility}>
            {selectedObject?.visible ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<AspectRatio fontSize="small" />} value="transform" sx={{ minWidth: 0 }} />
        <Tab icon={<Tune fontSize="small" />} value="style" sx={{ minWidth: 0 }} />
        {isImage && <Tab icon={<PhotoFilter fontSize="small" />} value="filters" sx={{ minWidth: 0 }} />}
        <Tab icon={<AutoFixHigh fontSize="small" />} value="actions" sx={{ minWidth: 0 }} />
      </Tabs>

      {/* Tab Content */}
      <Box sx={{ p: 2 }}>
        {/* Transform Tab */}
        {activeTab === 'transform' && (
          <Box>
            {/* Position */}
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Posicion
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                size="small"
                label="X"
                type="number"
                value={Math.round(selectedObject?.left || 0)}
                onChange={(e) => handlePositionChange('x', Number(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">px</InputAdornment>,
                }}
                sx={{ flex: 1 }}
              />
              <TextField
                size="small"
                label="Y"
                type="number"
                value={Math.round(selectedObject?.top || 0)}
                onChange={(e) => handlePositionChange('y', Number(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">px</InputAdornment>,
                }}
                sx={{ flex: 1 }}
              />
            </Box>

            {/* Size */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Tamano
              </Typography>
              <Tooltip title={aspectRatioLocked ? 'Desbloquear proporcion' : 'Bloquear proporcion'}>
                <IconButton
                  size="small"
                  onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
                  color={aspectRatioLocked ? 'primary' : 'default'}
                >
                  {aspectRatioLocked ? <Lock fontSize="small" /> : <LockOpen fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                size="small"
                label="Ancho"
                type="number"
                value={Math.round(selectedObject?.getScaledWidth() || 0)}
                onChange={(e) => handleSizeChange('width', Number(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">px</InputAdornment>,
                }}
                sx={{ flex: 1 }}
              />
              <TextField
                size="small"
                label="Alto"
                type="number"
                value={Math.round(selectedObject?.getScaledHeight() || 0)}
                onChange={(e) => handleSizeChange('height', Number(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">px</InputAdornment>,
                }}
                sx={{ flex: 1 }}
              />
            </Box>

            {/* Rotation */}
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Rotacion: {Math.round(selectedObject?.angle || 0)}°
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Slider
                value={selectedObject?.angle || 0}
                onChange={(_, v) => handleRotationChange(v as number)}
                min={0}
                max={360}
                sx={{ flex: 1 }}
              />
              <Tooltip title="Rotar 90°">
                <IconButton
                  size="small"
                  onClick={() => handleRotationChange(((selectedObject?.angle || 0) + 90) % 360)}
                >
                  <Rotate90DegreesCw fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Opacity */}
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Opacidad: {Math.round((selectedObject?.opacity || 1) * 100)}%
            </Typography>
            <Slider
              value={(selectedObject?.opacity || 1) * 100}
              onChange={(_, v) => handleOpacityChange(v as number)}
              min={0}
              max={100}
            />
          </Box>
        )}

        {/* Style Tab */}
        {activeTab === 'style' && (
          <Box>
            {/* Text styles */}
            {isText && (
              <>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Fuente
                </Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Familia</InputLabel>
                  <Select
                    value={(selectedObject as fabric.IText)?.fontFamily || 'Arial'}
                    onChange={(e) => handleFontFamilyChange(e.target.value)}
                    label="Familia"
                  >
                    {['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'Impact', 'Comic Sans MS'].map(font => (
                      <MenuItem key={font} value={font} sx={{ fontFamily: font }}>
                        {font}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    label="Tamano"
                    type="number"
                    value={(selectedObject as fabric.IText)?.fontSize || 24}
                    onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">px</InputAdornment>,
                    }}
                    sx={{ flex: 1 }}
                  />
                </Box>

                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Estilo
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                  <Tooltip title="Negrita">
                    <IconButton
                      size="small"
                      onClick={() => handleTextStyleChange('bold')}
                      color={(selectedObject as fabric.IText)?.fontWeight === 'bold' ? 'primary' : 'default'}
                    >
                      <FormatBold fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Cursiva">
                    <IconButton
                      size="small"
                      onClick={() => handleTextStyleChange('italic')}
                      color={(selectedObject as fabric.IText)?.fontStyle === 'italic' ? 'primary' : 'default'}
                    >
                      <FormatItalic fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Subrayado">
                    <IconButton
                      size="small"
                      onClick={() => handleTextStyleChange('underline')}
                      color={(selectedObject as fabric.IText)?.underline ? 'primary' : 'default'}
                    >
                      <FormatUnderlined fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Alineacion
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                  {[
                    { align: 'left' as const, icon: <FormatAlignLeft fontSize="small" /> },
                    { align: 'center' as const, icon: <FormatAlignCenter fontSize="small" /> },
                    { align: 'right' as const, icon: <FormatAlignRight fontSize="small" /> },
                    { align: 'justify' as const, icon: <FormatAlignJustify fontSize="small" /> },
                  ].map(({ align, icon }) => (
                    <Tooltip key={align} title={align.charAt(0).toUpperCase() + align.slice(1)}>
                      <IconButton
                        size="small"
                        onClick={() => handleTextAlignChange(align)}
                        color={(selectedObject as fabric.IText)?.textAlign === align ? 'primary' : 'default'}
                      >
                        {icon}
                      </IconButton>
                    </Tooltip>
                  ))}
                </Box>

                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Color de texto
                </Typography>
                <Box
                  onClick={() => onOpenColorPalette(String((selectedObject as fabric.IText)?.fill || '#000000'), 'text')}
                  sx={{
                    width: '100%',
                    height: 40,
                    borderRadius: 1,
                    bgcolor: String((selectedObject as fabric.IText)?.fill || '#000000'),
                    cursor: 'pointer',
                    border: '1px solid #ddd',
                    mb: 2,
                  }}
                />
              </>
            )}

            {/* Shape/Image fill and stroke */}
            {(isShape || isImage) && (
              <>
                {isShape && (
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Color de relleno
                    </Typography>
                    <Box
                      onClick={handleFillColorChange}
                      sx={{
                        width: '100%',
                        height: 40,
                        borderRadius: 1,
                        bgcolor: String(selectedObject?.fill || '#3b82f6'),
                        cursor: 'pointer',
                        border: '1px solid #ddd',
                        mb: 2,
                      }}
                    />
                  </>
                )}

                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Borde
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
                  <Box
                    onClick={handleStrokeColorChange}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: String(selectedObject?.stroke || '#000000'),
                      cursor: 'pointer',
                      border: '1px solid #ddd',
                    }}
                  />
                  <TextField
                    size="small"
                    label="Grosor"
                    type="number"
                    value={selectedObject?.strokeWidth || 0}
                    onChange={(e) => handleStrokeWidthChange(Number(e.target.value))}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">px</InputAdornment>,
                    }}
                    sx={{ flex: 1 }}
                  />
                </Box>

                {selectedObject instanceof fabric.Rect && (
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Radio de esquinas: {(selectedObject as fabric.Rect).rx || 0}px
                    </Typography>
                    <Slider
                      value={(selectedObject as fabric.Rect).rx || 0}
                      onChange={(_, v) => handleCornerRadiusChange(v as number)}
                      min={0}
                      max={Math.min(selectedObject.width || 100, selectedObject.height || 100) / 2}
                    />
                  </>
                )}
              </>
            )}
          </Box>
        )}

        {/* Filters Tab (Image only) */}
        {activeTab === 'filters' && isImage && (
          <Box>
            {/* Preset filters */}
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Filtros predefinidos
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
              {Object.keys(IMAGE_INSTRUCTIONS.FILTERS).map((preset) => (
                <Button
                  key={preset}
                  size="small"
                  variant="outlined"
                  onClick={() => applyPresetFilter(preset as keyof typeof IMAGE_INSTRUCTIONS.FILTERS)}
                >
                  {preset}
                </Button>
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Manual adjustments */}
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Ajustes manuales
            </Typography>

            {[
              { name: 'Brillo', key: 'brightness', default: 100, min: 0, max: 200 },
              { name: 'Contraste', key: 'contrast', default: 100, min: 0, max: 200 },
              { name: 'Saturacion', key: 'saturation', default: 100, min: 0, max: 200 },
              { name: 'Desenfoque', key: 'blur', default: 0, min: 0, max: 100 },
              { name: 'Escala de grises', key: 'grayscale', default: 0, min: 0, max: 100 },
            ].map((filter) => (
              <Box key={filter.key} sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {filter.name}
                </Typography>
                <Slider
                  defaultValue={filter.default}
                  min={filter.min}
                  max={filter.max}
                  onChange={(_, v) => handleImageFilterChange(filter.key, v as number)}
                  valueLabelDisplay="auto"
                />
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />

            {/* Replace image */}
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Upload />}
              onClick={() => fileInputRef.current?.click()}
            >
              Reemplazar imagen
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageReplace}
            />
          </Box>
        )}

        {/* Actions Tab */}
        {activeTab === 'actions' && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Acciones rapidas
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ContentCopy />}
                onClick={() => selectedObject && onDuplicateObject(selectedObject)}
              >
                Duplicar
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<FlipToFront />}
                onClick={() => selectedObject && onBringToFront(selectedObject)}
              >
                Traer al frente
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<FlipToBack />}
                onClick={() => selectedObject && onSendToBack(selectedObject)}
              >
                Enviar atras
              </Button>

              <Divider sx={{ my: 1 }} />

              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => selectedObject && onDeleteObject(selectedObject)}
              >
                Eliminar
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

export default ElementControls;
