/**
 * PALETA DE COLORES AVANZADA
 * 
 * Caracteristicas:
 * - Selector de color completo (HEX, RGB, HSL)
 * - Gradientes lineales y radiales
 * - Paletas predefinidas por industria
 * - Armonias de colores
 * - Historial de colores usados
 * - Guardar paletas personalizadas
 * - Eyedropper (cuentagotas)
 * - Soporte tactil
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  Tabs,
  Tab,
  Slider,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Menu,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  Colorize,
  Palette,
  History,
  Gradient,
  Save,
  Delete,
  Add,
  Lock,
  LockOpen,
  ContentCopy,
  Check,
  Refresh,
  AutoAwesome,
} from '@mui/icons-material';
import { ChromePicker, type ColorResult } from 'react-color';
import { useCanvasStore } from '../../store/canvasStore';
import { aiService, useAIGeneration } from '../../services/aiService';
import { COLOR_INSTRUCTIONS } from '../../config/aiInstructions';
import type { ColorPalette, ColorHarmony, Gradient as GradientType, GradientStop } from '../../types/canvasElements';

// ============================================================================
// TIPOS
// ============================================================================

interface AdvancedColorPaletteProps {
  currentColor: string;
  onColorChange: (color: string) => void;
  onGradientChange?: (gradient: GradientType) => void;
  isOpen: boolean;
  onClose: () => void;
  anchorPosition?: { top: number; left: number };
}

type TabType = 'picker' | 'palettes' | 'gradient' | 'harmony' | 'history';
type ColorMode = 'hex' | 'rgb' | 'hsl';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function AdvancedColorPalette({
  currentColor,
  onColorChange,
  onGradientChange,
  isOpen,
  onClose,
  anchorPosition,
}: AdvancedColorPaletteProps) {
  const [activeTab, setActiveTab] = useState<TabType>('picker');
  const [colorMode, setColorMode] = useState<ColorMode>('hex');
  const [showSavePaletteDialog, setShowSavePaletteDialog] = useState(false);
  const [newPaletteName, setNewPaletteName] = useState('');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [industryMenuAnchor, setIndustryMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Gradient state
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [gradientAngle, setGradientAngle] = useState(90);
  const [gradientStops, setGradientStops] = useState<GradientStop[]>([
    { offset: 0, color: currentColor },
    { offset: 100, color: '#ffffff' },
  ]);
  const [selectedStopIndex, setSelectedStopIndex] = useState(0);
  
  // Harmony state
  const [harmonyType, setHarmonyType] = useState<ColorHarmony>('complementary');
  const [harmonyColors, setHarmonyColors] = useState<string[]>([]);
  
  // Store
  const { colorEditor, setActiveColor, addColorToHistory, addPalette, updatePalette } = useCanvasStore();
  
  // AI
  const { generate, isGenerating } = useAIGeneration();

  // ============================================================================
  // EFECTOS
  // ============================================================================

  useEffect(() => {
    if (currentColor) {
      generateHarmony(currentColor);
    }
  }, [currentColor, harmonyType]);

  // ============================================================================
  // HANDLERS DE COLOR
  // ============================================================================

  const handleColorChange = useCallback((color: ColorResult) => {
    const hexColor = color.hex.toUpperCase();
    onColorChange(hexColor);
    setActiveColor(hexColor);
  }, [onColorChange, setActiveColor]);

  const handleHexInput = useCallback((value: string) => {
    let hex = value.toUpperCase();
    if (!hex.startsWith('#')) hex = '#' + hex;
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      onColorChange(hex);
      setActiveColor(hex);
    }
  }, [onColorChange, setActiveColor]);

  const copyColor = useCallback((color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  }, []);

  // ============================================================================
  // HANDLERS DE GRADIENTE
  // ============================================================================

  const handleGradientStopColorChange = useCallback((color: ColorResult) => {
    const newStops = [...gradientStops];
    newStops[selectedStopIndex] = {
      ...newStops[selectedStopIndex],
      color: color.hex.toUpperCase(),
    };
    setGradientStops(newStops);
    
    onGradientChange?.({
      type: gradientType,
      angle: gradientAngle,
      stops: newStops,
    });
  }, [gradientStops, selectedStopIndex, gradientType, gradientAngle, onGradientChange]);

  const handleGradientStopOffsetChange = useCallback((index: number, offset: number) => {
    const newStops = [...gradientStops];
    newStops[index] = { ...newStops[index], offset };
    setGradientStops(newStops);
    
    onGradientChange?.({
      type: gradientType,
      angle: gradientAngle,
      stops: newStops,
    });
  }, [gradientStops, gradientType, gradientAngle, onGradientChange]);

  const addGradientStop = useCallback(() => {
    const midOffset = 50;
    const midColor = gradientStops[0]?.color || '#888888';
    const newStops = [...gradientStops, { offset: midOffset, color: midColor }];
    newStops.sort((a, b) => a.offset - b.offset);
    setGradientStops(newStops);
  }, [gradientStops]);

  const removeGradientStop = useCallback((index: number) => {
    if (gradientStops.length <= 2) return;
    const newStops = gradientStops.filter((_, i) => i !== index);
    setGradientStops(newStops);
    if (selectedStopIndex >= newStops.length) {
      setSelectedStopIndex(newStops.length - 1);
    }
  }, [gradientStops, selectedStopIndex]);

  const getGradientCSS = useCallback(() => {
    const stops = gradientStops
      .map(s => `${s.color} ${s.offset}%`)
      .join(', ');
    
    if (gradientType === 'linear') {
      return `linear-gradient(${gradientAngle}deg, ${stops})`;
    }
    return `radial-gradient(circle, ${stops})`;
  }, [gradientType, gradientAngle, gradientStops]);

  // ============================================================================
  // HANDLERS DE ARMONIA
  // ============================================================================

  const generateHarmony = useCallback((baseColor: string) => {
    const colors = aiService.generateHarmony(baseColor, harmonyType);
    setHarmonyColors(colors);
  }, [harmonyType]);

  const harmonyOptions: { value: ColorHarmony; label: string; description: string }[] = [
    { value: 'complementary', label: 'Complementario', description: 'Color opuesto' },
    { value: 'analogous', label: 'Analogo', description: 'Colores adyacentes' },
    { value: 'triadic', label: 'Triadico', description: '3 colores equidistantes' },
    { value: 'tetradic', label: 'Tetradico', description: '4 colores' },
    { value: 'split-complementary', label: 'Complementario dividido', description: '2 adyacentes al complementario' },
    { value: 'monochromatic', label: 'Monocromatico', description: 'Variaciones de tono' },
  ];

  // ============================================================================
  // HANDLERS DE PALETAS
  // ============================================================================

  const handleSelectPaletteColor = useCallback((hex: string) => {
    onColorChange(hex);
    setActiveColor(hex);
    addColorToHistory(hex);
  }, [onColorChange, setActiveColor, addColorToHistory]);

  const handleSavePalette = useCallback(() => {
    if (!newPaletteName.trim()) return;

    const newPalette: ColorPalette = {
      id: `palette-${Date.now()}`,
      name: newPaletteName,
      colors: harmonyColors.map((hex, index) => ({
        id: `color-${index}`,
        hex,
        name: `Color ${index + 1}`,
        isLocked: false,
      })),
      isDefault: false,
      createdAt: new Date().toISOString(),
    };

    addPalette(newPalette);
    setNewPaletteName('');
    setShowSavePaletteDialog(false);
  }, [newPaletteName, harmonyColors, addPalette]);

  const handleGenerateAIPalette = useCallback(async (industry: string) => {
    setIndustryMenuAnchor(null);
    
    await generate(
      () => aiService.generateColorPalette(industry, 'profesional', [currentColor]),
      'Paleta generada'
    );
  }, [generate, currentColor]);

  // ============================================================================
  // UTILIDADES DE COLOR
  // ============================================================================

  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
    const rgb = hexToRgb(hex);
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const getContrastColor = (hex: string): string => {
    const rgb = hexToRgb(hex);
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!isOpen) return null;

  const rgb = hexToRgb(currentColor);
  const hsl = hexToHsl(currentColor);

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        top: anchorPosition?.top || 100,
        left: anchorPosition?.left || 100,
        zIndex: 3000,
        width: 380,
        maxHeight: '80vh',
        overflow: 'hidden',
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          background: getGradientCSS(),
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1,
            bgcolor: currentColor,
            border: '2px solid white',
            boxShadow: 2,
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ color: getContrastColor(currentColor), fontWeight: 600 }}>
            Editor de Color
          </Typography>
          <Typography variant="caption" sx={{ color: getContrastColor(currentColor), opacity: 0.8 }}>
            {currentColor}
          </Typography>
        </Box>
        <Tooltip title="Copiar color">
          <IconButton
            size="small"
            onClick={() => copyColor(currentColor)}
            sx={{ color: getContrastColor(currentColor) }}
          >
            {copiedColor === currentColor ? <Check /> : <ContentCopy />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<Colorize fontSize="small" />} label="Picker" value="picker" />
        <Tab icon={<Palette fontSize="small" />} label="Paletas" value="palettes" />
        <Tab icon={<Gradient fontSize="small" />} label="Gradiente" value="gradient" />
        <Tab icon={<AutoAwesome fontSize="small" />} label="Armonia" value="harmony" />
        <Tab icon={<History fontSize="small" />} label="Historial" value="history" />
      </Tabs>

      {/* Content */}
      <Box sx={{ p: 2, maxHeight: 'calc(80vh - 200px)', overflow: 'auto' }}>
        {/* Tab: Picker */}
        {activeTab === 'picker' && (
          <Box>
            <ChromePicker
              color={currentColor}
              onChange={handleColorChange}
              disableAlpha
              styles={{
                default: {
                  picker: {
                    width: '100%',
                    boxShadow: 'none',
                  },
                },
              }}
            />

            {/* Color mode selector */}
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              {(['hex', 'rgb', 'hsl'] as ColorMode[]).map(mode => (
                <Chip
                  key={mode}
                  label={mode.toUpperCase()}
                  onClick={() => setColorMode(mode)}
                  color={colorMode === mode ? 'primary' : 'default'}
                  variant={colorMode === mode ? 'filled' : 'outlined'}
                  size="small"
                />
              ))}
            </Box>

            {/* Color values */}
            <Box sx={{ mt: 2 }}>
              {colorMode === 'hex' && (
                <TextField
                  fullWidth
                  size="small"
                  label="HEX"
                  value={currentColor}
                  onChange={(e) => handleHexInput(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">#</InputAdornment>,
                  }}
                />
              )}

              {colorMode === 'rgb' && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField size="small" label="R" value={rgb.r} sx={{ flex: 1 }} InputProps={{ readOnly: true }} />
                  <TextField size="small" label="G" value={rgb.g} sx={{ flex: 1 }} InputProps={{ readOnly: true }} />
                  <TextField size="small" label="B" value={rgb.b} sx={{ flex: 1 }} InputProps={{ readOnly: true }} />
                </Box>
              )}

              {colorMode === 'hsl' && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField size="small" label="H" value={`${hsl.h}°`} sx={{ flex: 1 }} InputProps={{ readOnly: true }} />
                  <TextField size="small" label="S" value={`${hsl.s}%`} sx={{ flex: 1 }} InputProps={{ readOnly: true }} />
                  <TextField size="small" label="L" value={`${hsl.l}%`} sx={{ flex: 1 }} InputProps={{ readOnly: true }} />
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Tab: Palettes */}
        {activeTab === 'palettes' && (
          <Box>
            {/* Generate AI palette */}
            <Button
              fullWidth
              variant="outlined"
              startIcon={isGenerating ? undefined : <AutoAwesome />}
              onClick={(e) => setIndustryMenuAnchor(e.currentTarget)}
              disabled={isGenerating}
              sx={{ mb: 2 }}
            >
              {isGenerating ? 'Generando...' : 'Generar paleta con IA'}
            </Button>

            <Menu
              anchorEl={industryMenuAnchor}
              open={Boolean(industryMenuAnchor)}
              onClose={() => setIndustryMenuAnchor(null)}
            >
              {Object.keys(COLOR_INSTRUCTIONS.BY_INDUSTRY).map(industry => (
                <MenuItem key={industry} onClick={() => handleGenerateAIPalette(industry)}>
                  {industry.charAt(0).toUpperCase() + industry.slice(1)}
                </MenuItem>
              ))}
            </Menu>

            {/* Saved palettes */}
            {colorEditor.palettes.map(palette => (
              <Box key={palette.id} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  {palette.name}
                  {palette.isDefault && (
                    <Chip label="Default" size="small" sx={{ ml: 1 }} />
                  )}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {palette.colors.map(color => (
                    <Tooltip key={color.id} title={`${color.name}: ${color.hex}`}>
                      <Box
                        onClick={() => handleSelectPaletteColor(color.hex)}
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1,
                          bgcolor: color.hex,
                          cursor: 'pointer',
                          border: color.hex === currentColor ? '2px solid #2563eb' : '1px solid #ddd',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          },
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* Tab: Gradient */}
        {activeTab === 'gradient' && (
          <Box>
            {/* Gradient preview */}
            <Box
              sx={{
                height: 80,
                borderRadius: 2,
                background: getGradientCSS(),
                border: '1px solid #ddd',
                mb: 2,
              }}
            />

            {/* Gradient type */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label="Lineal"
                onClick={() => setGradientType('linear')}
                color={gradientType === 'linear' ? 'primary' : 'default'}
                variant={gradientType === 'linear' ? 'filled' : 'outlined'}
              />
              <Chip
                label="Radial"
                onClick={() => setGradientType('radial')}
                color={gradientType === 'radial' ? 'primary' : 'default'}
                variant={gradientType === 'radial' ? 'filled' : 'outlined'}
              />
            </Box>

            {/* Angle (only for linear) */}
            {gradientType === 'linear' && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Angulo: {gradientAngle}°
                </Typography>
                <Slider
                  value={gradientAngle}
                  onChange={(_, v) => setGradientAngle(v as number)}
                  min={0}
                  max={360}
                  valueLabelDisplay="auto"
                />
              </Box>
            )}

            {/* Gradient stops */}
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Puntos de color
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              {gradientStops.map((stop, index) => (
                <Box
                  key={index}
                  onClick={() => setSelectedStopIndex(index)}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: stop.color,
                    cursor: 'pointer',
                    border: index === selectedStopIndex ? '3px solid #2563eb' : '1px solid #ddd',
                    position: 'relative',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      bottom: -20,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: 10,
                    }}
                  >
                    {stop.offset}%
                  </Typography>
                  {gradientStops.length > 2 && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeGradientStop(index);
                      }}
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        bgcolor: 'error.main',
                        color: 'white',
                        width: 16,
                        height: 16,
                        '&:hover': { bgcolor: 'error.dark' },
                      }}
                    >
                      <Delete sx={{ fontSize: 10 }} />
                    </IconButton>
                  )}
                </Box>
              ))}
              <IconButton onClick={addGradientStop} sx={{ width: 40, height: 40 }}>
                <Add />
              </IconButton>
            </Box>

            {/* Stop color picker */}
            <ChromePicker
              color={gradientStops[selectedStopIndex]?.color || '#000000'}
              onChange={handleGradientStopColorChange}
              disableAlpha
              styles={{
                default: {
                  picker: {
                    width: '100%',
                    boxShadow: 'none',
                  },
                },
              }}
            />

            {/* Stop offset */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Posicion: {gradientStops[selectedStopIndex]?.offset}%
              </Typography>
              <Slider
                value={gradientStops[selectedStopIndex]?.offset || 0}
                onChange={(_, v) => handleGradientStopOffsetChange(selectedStopIndex, v as number)}
                min={0}
                max={100}
                valueLabelDisplay="auto"
              />
            </Box>
          </Box>
        )}

        {/* Tab: Harmony */}
        {activeTab === 'harmony' && (
          <Box>
            {/* Harmony type selector */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Tipo de armonia
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {harmonyOptions.map(option => (
                  <Tooltip key={option.value} title={option.description}>
                    <Chip
                      label={option.label}
                      onClick={() => setHarmonyType(option.value)}
                      color={harmonyType === option.value ? 'primary' : 'default'}
                      variant={harmonyType === option.value ? 'filled' : 'outlined'}
                      size="small"
                    />
                  </Tooltip>
                ))}
              </Box>
            </Box>

            {/* Base color */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Color base
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: 40,
                  borderRadius: 1,
                  bgcolor: currentColor,
                  border: '1px solid #ddd',
                }}
              />
            </Box>

            {/* Harmony colors */}
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Colores armonicos
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {harmonyColors.map((color, index) => (
                <Tooltip key={index} title={color}>
                  <Box
                    onClick={() => handleSelectPaletteColor(color)}
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 1,
                      bgcolor: color,
                      cursor: 'pointer',
                      border: '1px solid #ddd',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  />
                </Tooltip>
              ))}
            </Box>

            {/* Regenerate */}
            <Button
              startIcon={<Refresh />}
              onClick={() => generateHarmony(currentColor)}
              sx={{ mt: 2 }}
              variant="outlined"
              fullWidth
            >
              Regenerar
            </Button>

            {/* Save as palette */}
            <Button
              startIcon={<Save />}
              onClick={() => setShowSavePaletteDialog(true)}
              sx={{ mt: 1 }}
              variant="contained"
              fullWidth
            >
              Guardar como paleta
            </Button>
          </Box>
        )}

        {/* Tab: History */}
        {activeTab === 'history' && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Colores recientes
            </Typography>
            
            {colorEditor.colorHistory.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No hay colores en el historial
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {colorEditor.colorHistory.map((color, index) => (
                  <Tooltip key={index} title={color}>
                    <Box
                      onClick={() => handleSelectPaletteColor(color)}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        bgcolor: color,
                        cursor: 'pointer',
                        border: color === currentColor ? '2px solid #2563eb' : '1px solid #ddd',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Close button */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button fullWidth variant="outlined" onClick={onClose}>
          Cerrar
        </Button>
      </Box>

      {/* Save Palette Dialog */}
      <Dialog open={showSavePaletteDialog} onClose={() => setShowSavePaletteDialog(false)}>
        <DialogTitle>Guardar Paleta</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre de la paleta"
            value={newPaletteName}
            onChange={(e) => setNewPaletteName(e.target.value)}
            sx={{ mt: 1 }}
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            {harmonyColors.map((color, index) => (
              <Box
                key={index}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: color,
                  border: '1px solid #ddd',
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSavePaletteDialog(false)}>Cancelar</Button>
          <Button onClick={handleSavePalette} variant="contained" disabled={!newPaletteName.trim()}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default AdvancedColorPalette;
