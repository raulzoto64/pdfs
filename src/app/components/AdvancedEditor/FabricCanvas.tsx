/**
 * FABRIC CANVAS - Editor visual avanzado con Fabric.js
 * 
 * Caracteristicas:
 * - Arrastre de elementos individuales
 * - Redimensionamiento desde esquinas y bordes
 * - Rotacion de elementos
 * - Soporte tactil para moviles
 * - Zoom y pan
 * - Snap to grid
 * - Seleccion multiple
 */

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import * as fabric from 'fabric';
import { Box, IconButton, Tooltip, Paper, Typography, Slider, Switch, FormControlLabel } from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  GridOn,
  GridOff,
  Undo,
  Redo,
  CenterFocusStrong,
  SelectAll,
  Delete,
  ContentCopy,
  Layers,
  Lock,
  LockOpen,
} from '@mui/icons-material';
import { useCanvasStore } from '../../store/canvasStore';
import type { CanvasElement, Position, Size } from '../../types/canvasElements';

// ============================================================================
// TIPOS
// ============================================================================

export interface FabricCanvasRef {
  addText: (text: string, options?: Partial<fabric.ITextOptions>) => void;
  addImage: (url: string, options?: Partial<fabric.ImageOptions>) => void;
  addShape: (type: 'rect' | 'circle' | 'triangle', options?: object) => void;
  getSelectedObjects: () => fabric.Object[];
  deleteSelected: () => void;
  duplicateSelected: () => void;
  selectAll: () => void;
  clearSelection: () => void;
  exportToJSON: () => string;
  loadFromJSON: (json: string) => void;
  setZoom: (zoom: number) => void;
  centerCanvas: () => void;
}

interface FabricCanvasProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  onSelectionChange?: (objects: fabric.Object[]) => void;
  onObjectModified?: (object: fabric.Object) => void;
  onCanvasReady?: (canvas: fabric.Canvas) => void;
  sectionId: string;
  elements?: CanvasElement[];
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const FabricCanvas = forwardRef<FabricCanvasRef, FabricCanvasProps>(({
  width = 800,
  height = 600,
  backgroundColor = '#ffffff',
  onSelectionChange,
  onObjectModified,
  onCanvasReady,
  sectionId,
  elements = [],
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isReady, setIsReady] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  
  const {
    config,
    setConfig,
    undo,
    redo,
    addToHistory,
  } = useCanvasStore();

  // ============================================================================
  // INICIALIZACION DEL CANVAS
  // ============================================================================

  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor,
      selection: true,
      preserveObjectStacking: true,
      allowTouchScrolling: true,
      enableRetinaScaling: true,
      stopContextMenu: true,
      fireRightClick: true,
      controlsAboveOverlay: true,
    });

    // Configurar controles de transformacion
    configureControls(canvas);

    // Event listeners
    canvas.on('selection:created', handleSelectionChange);
    canvas.on('selection:updated', handleSelectionChange);
    canvas.on('selection:cleared', handleSelectionCleared);
    canvas.on('object:modified', handleObjectModified);
    canvas.on('object:moving', handleObjectMoving);
    canvas.on('object:scaling', handleObjectScaling);
    canvas.on('object:rotating', handleObjectRotating);
    canvas.on('mouse:wheel', handleMouseWheel);
    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    // Touch events para moviles
    setupTouchEvents(canvas);

    fabricRef.current = canvas;
    setIsReady(true);
    onCanvasReady?.(canvas);

    // Cargar elementos existentes
    if (elements.length > 0) {
      loadElements(canvas, elements);
    }

    // Dibujar grid si esta activo
    if (showGrid) {
      drawGrid(canvas);
    }

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  // ============================================================================
  // CONFIGURAR CONTROLES DE TRANSFORMACION
  // ============================================================================

  const configureControls = (canvas: fabric.Canvas) => {
    // Personalizar apariencia de los controles
    fabric.Object.prototype.set({
      transparentCorners: false,
      cornerColor: '#2563eb',
      cornerStrokeColor: '#ffffff',
      borderColor: '#2563eb',
      borderScaleFactor: 2,
      cornerSize: 12,
      cornerStyle: 'circle',
      padding: 8,
    });

    // Control de rotacion personalizado
    fabric.Object.prototype.controls.mtr = new fabric.Control({
      x: 0,
      y: -0.5,
      offsetY: -30,
      cursorStyle: 'crosshair',
      actionHandler: fabric.controlsUtils.rotationWithSnapping,
      actionName: 'rotate',
      render: renderRotateControl,
      cornerSize: 24,
      withConnection: true,
    });

    // Controles de esquinas con resize proporcional
    const cornerControls = ['tl', 'tr', 'bl', 'br'];
    cornerControls.forEach(corner => {
      if (fabric.Object.prototype.controls[corner]) {
        fabric.Object.prototype.controls[corner].actionHandler = 
          fabric.controlsUtils.scalingEqually;
      }
    });
  };

  // Renderizar control de rotacion
  const renderRotateControl = (
    ctx: CanvasRenderingContext2D,
    left: number,
    top: number,
    _styleOverride: unknown,
    fabricObject: fabric.Object
  ) => {
    const size = 24;
    ctx.save();
    ctx.translate(left, top);
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle || 0));
    
    // Dibujar circulo
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, 2 * Math.PI);
    ctx.fillStyle = '#2563eb';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Dibujar icono de rotacion
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, 1.5 * Math.PI);
    ctx.stroke();
    
    // Flecha
    ctx.beginPath();
    ctx.moveTo(6, -3);
    ctx.lineTo(6, 3);
    ctx.lineTo(10, 0);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    ctx.restore();
  };

  // ============================================================================
  // EVENTOS DE TOUCH PARA MOVILES
  // ============================================================================

  const setupTouchEvents = (canvas: fabric.Canvas) => {
    let lastDistance = 0;
    let lastAngle = 0;
    let isPinching = false;

    const upperCanvas = canvas.upperCanvasEl;
    if (!upperCanvas) return;

    upperCanvas.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches.length === 2) {
        isPinching = true;
        lastDistance = getDistance(e.touches[0], e.touches[1]);
        lastAngle = getAngle(e.touches[0], e.touches[1]);
        e.preventDefault();
      }
    }, { passive: false });

    upperCanvas.addEventListener('touchmove', (e: TouchEvent) => {
      if (isPinching && e.touches.length === 2) {
        e.preventDefault();
        
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const currentAngle = getAngle(e.touches[0], e.touches[1]);
        
        // Pinch to zoom
        const zoomDelta = currentDistance / lastDistance;
        const newZoom = Math.max(0.1, Math.min(4, (canvas.getZoom() || 1) * zoomDelta));
        
        const center = getCenter(e.touches[0], e.touches[1]);
        const point = new fabric.Point(center.x, center.y);
        canvas.zoomToPoint(point, newZoom);
        setCurrentZoom(Math.round(newZoom * 100));
        
        // Rotacion con dos dedos del objeto seleccionado
        const activeObject = canvas.getActiveObject();
        if (activeObject && Math.abs(currentAngle - lastAngle) > 2) {
          const angleDelta = currentAngle - lastAngle;
          activeObject.rotate((activeObject.angle || 0) + angleDelta);
          canvas.renderAll();
        }
        
        lastDistance = currentDistance;
        lastAngle = currentAngle;
      }
    }, { passive: false });

    upperCanvas.addEventListener('touchend', () => {
      isPinching = false;
      lastDistance = 0;
      lastAngle = 0;
    });
  };

  const getDistance = (touch1: Touch, touch2: Touch): number => {
    return Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
  };

  const getAngle = (touch1: Touch, touch2: Touch): number => {
    return Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * 180 / Math.PI;
  };

  const getCenter = (touch1: Touch, touch2: Touch): { x: number; y: number } => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSelectionChange = useCallback((e: fabric.TEvent<fabric.TPointerEvent>) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const selected = canvas.getActiveObjects();
    setSelectedCount(selected.length);
    onSelectionChange?.(selected);
  }, [onSelectionChange]);

  const handleSelectionCleared = useCallback(() => {
    setSelectedCount(0);
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  const handleObjectModified = useCallback((e: fabric.ModifiedEvent<fabric.TPointerEvent>) => {
    const target = e.target;
    if (target) {
      onObjectModified?.(target);
      addToHistory('update');
    }
  }, [onObjectModified, addToHistory]);

  const handleObjectMoving = useCallback((e: fabric.ModifiedEvent<fabric.TPointerEvent>) => {
    const target = e.target;
    if (!target || !fabricRef.current) return;

    // Snap to grid
    if (snapToGrid && config.gridSize > 0) {
      const gridSize = config.gridSize;
      target.set({
        left: Math.round((target.left || 0) / gridSize) * gridSize,
        top: Math.round((target.top || 0) / gridSize) * gridSize,
      });
    }

    // Limitar al canvas
    const canvas = fabricRef.current;
    const bound = target.getBoundingRect();
    
    if (bound.left < 0) target.set({ left: (target.left || 0) - bound.left });
    if (bound.top < 0) target.set({ top: (target.top || 0) - bound.top });
    if (bound.left + bound.width > canvas.width!) {
      target.set({ left: canvas.width! - bound.width + ((target.left || 0) - bound.left) });
    }
    if (bound.top + bound.height > canvas.height!) {
      target.set({ top: canvas.height! - bound.height + ((target.top || 0) - bound.top) });
    }
  }, [snapToGrid, config.gridSize]);

  const handleObjectScaling = useCallback((e: fabric.ModifiedEvent<fabric.TPointerEvent>) => {
    const target = e.target;
    if (!target) return;

    // Limitar escala minima
    const minScale = 0.1;
    if ((target.scaleX || 1) < minScale) target.set({ scaleX: minScale });
    if ((target.scaleY || 1) < minScale) target.set({ scaleY: minScale });
  }, []);

  const handleObjectRotating = useCallback((e: fabric.ModifiedEvent<fabric.TPointerEvent>) => {
    const target = e.target;
    if (!target) return;

    // Snap a angulos de 15 grados si shift esta presionado
    if (e.e instanceof MouseEvent && e.e.shiftKey) {
      const snapAngle = 15;
      const angle = target.angle || 0;
      target.set({ angle: Math.round(angle / snapAngle) * snapAngle });
    }
  }, []);

  const handleMouseWheel = useCallback((opt: fabric.TEvent<WheelEvent>) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const e = opt.e;
    e.preventDefault();
    e.stopPropagation();

    const delta = e.deltaY;
    let zoom = canvas.getZoom() || 1;
    zoom *= 0.999 ** delta;
    zoom = Math.max(0.1, Math.min(4, zoom));

    const point = canvas.getPointer(e, true);
    canvas.zoomToPoint(new fabric.Point(point.x, point.y), zoom);
    setCurrentZoom(Math.round(zoom * 100));
  }, []);

  // Variables para pan
  const isDragging = useRef(false);
  const lastPosX = useRef(0);
  const lastPosY = useRef(0);

  const handleMouseDown = useCallback((opt: fabric.TEvent<fabric.TPointerEvent>) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const e = opt.e as MouseEvent;
    
    // Pan con boton central o Alt+click
    if (e.button === 1 || (e.altKey && e.button === 0)) {
      isDragging.current = true;
      canvas.selection = false;
      lastPosX.current = e.clientX;
      lastPosY.current = e.clientY;
    }
  }, []);

  const handleMouseMove = useCallback((opt: fabric.TEvent<fabric.TPointerEvent>) => {
    const canvas = fabricRef.current;
    if (!canvas || !isDragging.current) return;

    const e = opt.e as MouseEvent;
    const vpt = canvas.viewportTransform;
    if (!vpt) return;

    vpt[4] += e.clientX - lastPosX.current;
    vpt[5] += e.clientY - lastPosY.current;
    canvas.requestRenderAll();
    
    lastPosX.current = e.clientX;
    lastPosY.current = e.clientY;
  }, []);

  const handleMouseUp = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    isDragging.current = false;
    canvas.selection = true;
    canvas.setViewportTransform(canvas.viewportTransform || [1, 0, 0, 1, 0, 0]);
  }, []);

  // ============================================================================
  // GRID
  // ============================================================================

  const drawGrid = useCallback((canvas: fabric.Canvas) => {
    const gridSize = config.gridSize || 20;
    const lines: fabric.Line[] = [];

    // Lineas verticales
    for (let i = 0; i <= canvas.width!; i += gridSize) {
      const line = new fabric.Line([i, 0, i, canvas.height!], {
        stroke: '#e5e7eb',
        strokeWidth: 1,
        selectable: false,
        evented: false,
        excludeFromExport: true,
      });
      lines.push(line);
    }

    // Lineas horizontales
    for (let i = 0; i <= canvas.height!; i += gridSize) {
      const line = new fabric.Line([0, i, canvas.width!, i], {
        stroke: '#e5e7eb',
        strokeWidth: 1,
        selectable: false,
        evented: false,
        excludeFromExport: true,
      });
      lines.push(line);
    }

    const gridGroup = new fabric.Group(lines, {
      selectable: false,
      evented: false,
      excludeFromExport: true,
      data: { isGrid: true },
    });

    canvas.add(gridGroup);
    gridGroup.sendToBack();
    canvas.renderAll();
  }, [config.gridSize]);

  const removeGrid = useCallback((canvas: fabric.Canvas) => {
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      if (obj.data?.isGrid) {
        canvas.remove(obj);
      }
    });
    canvas.renderAll();
  }, []);

  const toggleGrid = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (showGrid) {
      removeGrid(canvas);
    } else {
      drawGrid(canvas);
    }
    setShowGrid(!showGrid);
  }, [showGrid, drawGrid, removeGrid]);

  // ============================================================================
  // CARGAR ELEMENTOS
  // ============================================================================

  const loadElements = useCallback((canvas: fabric.Canvas, elements: CanvasElement[]) => {
    elements.forEach(element => {
      let fabricObject: fabric.Object | null = null;

      switch (element.type) {
        case 'text':
          fabricObject = new fabric.IText(element.content || 'Texto', {
            left: element.transform.position.x,
            top: element.transform.position.y,
            fontSize: element.textStyle?.fontSize || 24,
            fontFamily: element.textStyle?.fontFamily || 'Arial',
            fill: element.textStyle?.color || '#000000',
            fontWeight: element.textStyle?.fontWeight || 'normal',
            fontStyle: element.textStyle?.fontStyle || 'normal',
            textAlign: element.textStyle?.textAlign || 'left',
            angle: element.transform.rotation,
            scaleX: element.transform.scaleX,
            scaleY: element.transform.scaleY,
            opacity: element.transform.opacity,
          });
          break;

        case 'image':
          fabric.FabricImage.fromURL(element.src).then(img => {
            img.set({
              left: element.transform.position.x,
              top: element.transform.position.y,
              scaleX: element.transform.size.width / (img.width || 100),
              scaleY: element.transform.size.height / (img.height || 100),
              angle: element.transform.rotation,
              opacity: element.transform.opacity,
            });
            img.data = { elementId: element.id };
            canvas.add(img);
            canvas.renderAll();
          });
          return;

        case 'shape':
          switch (element.shapeType) {
            case 'rectangle':
              fabricObject = new fabric.Rect({
                left: element.transform.position.x,
                top: element.transform.position.y,
                width: element.transform.size.width,
                height: element.transform.size.height,
                fill: element.fill?.color || '#3b82f6',
                rx: element.cornerRadius || 0,
                ry: element.cornerRadius || 0,
                angle: element.transform.rotation,
                opacity: element.transform.opacity,
              });
              break;

            case 'circle':
              fabricObject = new fabric.Circle({
                left: element.transform.position.x,
                top: element.transform.position.y,
                radius: Math.min(element.transform.size.width, element.transform.size.height) / 2,
                fill: element.fill?.color || '#3b82f6',
                angle: element.transform.rotation,
                opacity: element.transform.opacity,
              });
              break;

            case 'triangle':
              fabricObject = new fabric.Triangle({
                left: element.transform.position.x,
                top: element.transform.position.y,
                width: element.transform.size.width,
                height: element.transform.size.height,
                fill: element.fill?.color || '#3b82f6',
                angle: element.transform.rotation,
                opacity: element.transform.opacity,
              });
              break;
          }
          break;
      }

      if (fabricObject) {
        fabricObject.data = { elementId: element.id };
        fabricObject.set({
          selectable: element.selectable !== false,
          visible: element.visible !== false,
        });
        canvas.add(fabricObject);
      }
    });

    canvas.renderAll();
  }, []);

  // ============================================================================
  // METODOS EXPUESTOS VIA REF
  // ============================================================================

  useImperativeHandle(ref, () => ({
    addText: (text: string, options?: Partial<fabric.ITextOptions>) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const textObj = new fabric.IText(text, {
        left: canvas.width! / 2 - 50,
        top: canvas.height! / 2 - 20,
        fontSize: 24,
        fontFamily: 'Arial',
        fill: '#000000',
        ...options,
      });

      canvas.add(textObj);
      canvas.setActiveObject(textObj);
      canvas.renderAll();
      addToHistory('add');
    },

    addImage: async (url: string, options?: Partial<fabric.ImageOptions>) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const img = await fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
      
      // Escalar para que quepa en el canvas
      const maxSize = Math.min(canvas.width!, canvas.height!) * 0.5;
      const scale = Math.min(maxSize / (img.width || 100), maxSize / (img.height || 100));
      
      img.set({
        left: canvas.width! / 2 - ((img.width || 100) * scale) / 2,
        top: canvas.height! / 2 - ((img.height || 100) * scale) / 2,
        scaleX: scale,
        scaleY: scale,
        ...options,
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      addToHistory('add');
    },

    addShape: (type: 'rect' | 'circle' | 'triangle', options?: object) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      let shape: fabric.Object;

      switch (type) {
        case 'rect':
          shape = new fabric.Rect({
            left: canvas.width! / 2 - 50,
            top: canvas.height! / 2 - 50,
            width: 100,
            height: 100,
            fill: '#3b82f6',
            rx: 8,
            ry: 8,
            ...options,
          });
          break;

        case 'circle':
          shape = new fabric.Circle({
            left: canvas.width! / 2 - 50,
            top: canvas.height! / 2 - 50,
            radius: 50,
            fill: '#3b82f6',
            ...options,
          });
          break;

        case 'triangle':
          shape = new fabric.Triangle({
            left: canvas.width! / 2 - 50,
            top: canvas.height! / 2 - 50,
            width: 100,
            height: 100,
            fill: '#3b82f6',
            ...options,
          });
          break;
      }

      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.renderAll();
      addToHistory('add');
    },

    getSelectedObjects: () => {
      return fabricRef.current?.getActiveObjects() || [];
    },

    deleteSelected: () => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const activeObjects = canvas.getActiveObjects();
      if (activeObjects.length === 0) return;

      activeObjects.forEach(obj => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.renderAll();
      addToHistory('delete');
    },

    duplicateSelected: () => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const activeObjects = canvas.getActiveObjects();
      if (activeObjects.length === 0) return;

      canvas.discardActiveObject();

      activeObjects.forEach(obj => {
        obj.clone().then((cloned: fabric.Object) => {
          cloned.set({
            left: (obj.left || 0) + 20,
            top: (obj.top || 0) + 20,
          });
          canvas.add(cloned);
        });
      });

      canvas.renderAll();
      addToHistory('add');
    },

    selectAll: () => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const objects = canvas.getObjects().filter(obj => obj.selectable && !obj.data?.isGrid);
      if (objects.length > 0) {
        const selection = new fabric.ActiveSelection(objects, { canvas });
        canvas.setActiveObject(selection);
        canvas.renderAll();
      }
    },

    clearSelection: () => {
      fabricRef.current?.discardActiveObject();
      fabricRef.current?.renderAll();
    },

    exportToJSON: () => {
      return JSON.stringify(fabricRef.current?.toJSON() || {});
    },

    loadFromJSON: (json: string) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      canvas.loadFromJSON(JSON.parse(json)).then(() => {
        canvas.renderAll();
      });
    },

    setZoom: (zoom: number) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const center = canvas.getCenter();
      canvas.zoomToPoint(new fabric.Point(center.left, center.top), zoom / 100);
      setCurrentZoom(zoom);
    },

    centerCanvas: () => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      setCurrentZoom(100);
    },
  }), [addToHistory]);

  // ============================================================================
  // ACCIONES DE TOOLBAR
  // ============================================================================

  const handleZoomIn = () => {
    const newZoom = Math.min(currentZoom + 10, 400);
    fabricRef.current?.setZoom(newZoom / 100);
    setCurrentZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(currentZoom - 10, 10);
    fabricRef.current?.setZoom(newZoom / 100);
    setCurrentZoom(newZoom);
  };

  const handleZoomChange = (_: Event, value: number | number[]) => {
    const zoom = value as number;
    fabricRef.current?.setZoom(zoom / 100);
    setCurrentZoom(zoom);
  };

  const handleCenterCanvas = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.setZoom(1);
    setCurrentZoom(100);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        bgcolor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Toolbar superior */}
      <Paper
        elevation={2}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1,
          borderRadius: 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        {/* Zoom controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Alejar">
            <IconButton size="small" onClick={handleZoomOut}>
              <ZoomOut fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Box sx={{ width: 100 }}>
            <Slider
              size="small"
              value={currentZoom}
              min={10}
              max={400}
              onChange={handleZoomChange}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v}%`}
            />
          </Box>
          
          <Tooltip title="Acercar">
            <IconButton size="small" onClick={handleZoomIn}>
              <ZoomIn fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Typography variant="caption" sx={{ minWidth: 45, textAlign: 'center' }}>
            {currentZoom}%
          </Typography>
          
          <Tooltip title="Centrar canvas">
            <IconButton size="small" onClick={handleCenterCanvas}>
              <CenterFocusStrong fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ width: 1, height: 24, bgcolor: 'divider', mx: 1 }} />

        {/* Grid controls */}
        <Tooltip title={showGrid ? 'Ocultar cuadricula' : 'Mostrar cuadricula'}>
          <IconButton size="small" onClick={toggleGrid} color={showGrid ? 'primary' : 'default'}>
            {showGrid ? <GridOn fontSize="small" /> : <GridOff fontSize="small" />}
          </IconButton>
        </Tooltip>
        
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={snapToGrid}
              onChange={(e) => setSnapToGrid(e.target.checked)}
            />
          }
          label={<Typography variant="caption">Snap</Typography>}
          sx={{ mr: 1 }}
        />

        <Box sx={{ width: 1, height: 24, bgcolor: 'divider', mx: 1 }} />

        {/* History controls */}
        <Tooltip title="Deshacer (Ctrl+Z)">
          <IconButton size="small" onClick={undo}>
            <Undo fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Rehacer (Ctrl+Y)">
          <IconButton size="small" onClick={redo}>
            <Redo fontSize="small" />
          </IconButton>
        </Tooltip>

        <Box sx={{ width: 1, height: 24, bgcolor: 'divider', mx: 1 }} />

        {/* Selection info */}
        {selectedCount > 0 && (
          <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
            {selectedCount} objeto{selectedCount > 1 ? 's' : ''} seleccionado{selectedCount > 1 ? 's' : ''}
          </Typography>
        )}

        <Box sx={{ flex: 1 }} />

        {/* Selection actions */}
        {selectedCount > 0 && (
          <>
            <Tooltip title="Duplicar (Ctrl+D)">
              <IconButton
                size="small"
                onClick={() => (ref as React.MutableRefObject<FabricCanvasRef>)?.current?.duplicateSelected()}
              >
                <ContentCopy fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Eliminar (Delete)">
              <IconButton
                size="small"
                color="error"
                onClick={() => (ref as React.MutableRefObject<FabricCanvasRef>)?.current?.deleteSelected()}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
        
        <Tooltip title="Seleccionar todo (Ctrl+A)">
          <IconButton
            size="small"
            onClick={() => (ref as React.MutableRefObject<FabricCanvasRef>)?.current?.selectAll()}
          >
            <SelectAll fontSize="small" />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Canvas */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          p: 2,
        }}
      >
        <Paper
          elevation={4}
          sx={{
            display: 'inline-block',
            lineHeight: 0,
          }}
        >
          <canvas ref={canvasRef} />
        </Paper>
      </Box>

      {/* Instrucciones tactiles */}
      <Paper
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          px: 2,
          py: 1,
          bgcolor: 'rgba(0,0,0,0.7)',
          color: 'white',
          borderRadius: 2,
        }}
      >
        <Typography variant="caption" sx={{ display: 'block' }}>
          Arrastra elementos | Esquinas para redimensionar | Circulo superior para rotar
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', opacity: 0.7 }}>
          Movil: Dos dedos para zoom/rotar | Alt+Click para mover canvas
        </Typography>
      </Paper>
    </Box>
  );
});

FabricCanvas.displayName = 'FabricCanvas';

export default FabricCanvas;
