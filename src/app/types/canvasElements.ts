// Tipos para elementos del canvas avanzado
// Soporta texto, imagenes, formas y grupos con propiedades de transformacion

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Transform {
  position: Position;
  size: Size;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  zIndex: number;
}

export interface Shadow {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface Border {
  color: string;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
  radius: number;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
  letterSpacing: number;
  textDecoration: 'none' | 'underline' | 'line-through';
  color: string;
}

export interface GradientStop {
  offset: number;
  color: string;
}

export interface Gradient {
  type: 'linear' | 'radial';
  angle: number;
  stops: GradientStop[];
}

export interface Fill {
  type: 'solid' | 'gradient' | 'pattern';
  color?: string;
  gradient?: Gradient;
  patternUrl?: string;
}

// Elemento base que todos los elementos heredan
export interface BaseElement {
  id: string;
  type: ElementType;
  name: string;
  transform: Transform;
  locked: boolean;
  visible: boolean;
  selectable: boolean;
  fill?: Fill;
  shadow?: Shadow;
  border?: Border;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Elemento de texto
export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  textStyle: TextStyle;
  padding: number;
  maxWidth?: number;
  editable: boolean;
}

// Elemento de imagen
export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  originalSrc: string;
  alt: string;
  objectFit: 'contain' | 'cover' | 'fill' | 'none';
  filters?: ImageFilters;
  cropArea?: CropArea;
}

export interface ImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
  sepia: number;
  hueRotate: number;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Elemento de forma
export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: ShapeType;
  points?: Position[]; // Para poligonos personalizados
  cornerRadius?: number; // Para rectangulos
}

export type ShapeType = 'rectangle' | 'circle' | 'ellipse' | 'triangle' | 'star' | 'polygon' | 'line' | 'arrow';

// Elemento de grupo (contenedor de otros elementos)
export interface GroupElement extends BaseElement {
  type: 'group';
  children: CanvasElement[];
}

// Elemento de icono/SVG
export interface IconElement extends BaseElement {
  type: 'icon';
  iconName: string;
  iconSet: string;
  svgContent?: string;
  strokeWidth: number;
  strokeColor: string;
}

// Union de todos los tipos de elementos
export type CanvasElement = TextElement | ImageElement | ShapeElement | GroupElement | IconElement;
export type ElementType = 'text' | 'image' | 'shape' | 'group' | 'icon';

// Seccion del canvas con sus elementos
export interface CanvasSection {
  id: string;
  name: string;
  elements: CanvasElement[];
  background: Fill;
  size: Size;
  locked: boolean;
  visible: boolean;
}

// Estado de seleccion
export interface SelectionState {
  selectedIds: string[];
  selectionBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isMultiSelect: boolean;
}

// Historial para undo/redo
export interface HistoryEntry {
  id: string;
  action: HistoryAction;
  timestamp: number;
  previousState: CanvasElement[];
  currentState: CanvasElement[];
}

export type HistoryAction = 
  | 'add'
  | 'delete'
  | 'update'
  | 'move'
  | 'resize'
  | 'rotate'
  | 'group'
  | 'ungroup'
  | 'reorder'
  | 'style';

// Configuracion del canvas
export interface CanvasConfig {
  gridEnabled: boolean;
  gridSize: number;
  snapToGrid: boolean;
  snapToElements: boolean;
  showRulers: boolean;
  showGuides: boolean;
  zoomLevel: number;
  panOffset: Position;
}

// Paleta de colores
export interface ColorPalette {
  id: string;
  name: string;
  colors: PaletteColor[];
  isDefault: boolean;
  createdAt: string;
}

export interface PaletteColor {
  id: string;
  hex: string;
  name: string;
  isLocked: boolean;
}

// Armonias de colores
export type ColorHarmony = 
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'tetradic'
  | 'split-complementary'
  | 'monochromatic';

// Estado de edicion de colores
export interface ColorEditorState {
  activeColor: string;
  colorHistory: string[];
  palettes: ColorPalette[];
  activePaletteId: string | null;
  showPicker: boolean;
  pickerMode: 'hex' | 'rgb' | 'hsl';
}

// Eventos tactiles
export interface TouchState {
  isTouching: boolean;
  touchPoints: TouchPoint[];
  gesture: GestureType | null;
  initialDistance: number;
  initialAngle: number;
}

export interface TouchPoint {
  id: number;
  x: number;
  y: number;
  force: number;
}

export type GestureType = 'tap' | 'double-tap' | 'long-press' | 'pan' | 'pinch' | 'rotate' | 'swipe';

// Controles de redimensionamiento
export type ResizeHandle = 
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'rotation';

export interface ResizeState {
  isResizing: boolean;
  activeHandle: ResizeHandle | null;
  startPosition: Position;
  startSize: Size;
  startRotation: number;
  aspectRatioLocked: boolean;
}

// Helpers para crear elementos
export function createDefaultTransform(overrides?: Partial<Transform>): Transform {
  return {
    position: { x: 0, y: 0 },
    size: { width: 100, height: 100 },
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    zIndex: 0,
    ...overrides,
  };
}

export function createDefaultTextStyle(overrides?: Partial<TextStyle>): TextStyle {
  return {
    fontFamily: 'Inter, sans-serif',
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left',
    lineHeight: 1.5,
    letterSpacing: 0,
    textDecoration: 'none',
    color: '#000000',
    ...overrides,
  };
}

export function createTextElement(
  content: string,
  position: Position,
  overrides?: Partial<TextElement>
): TextElement {
  const id = `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id,
    type: 'text',
    name: 'Texto',
    content,
    transform: createDefaultTransform({
      position,
      size: { width: 200, height: 50 },
    }),
    textStyle: createDefaultTextStyle(),
    padding: 8,
    locked: false,
    visible: true,
    selectable: true,
    editable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createImageElement(
  src: string,
  position: Position,
  size: Size,
  overrides?: Partial<ImageElement>
): ImageElement {
  const id = `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id,
    type: 'image',
    name: 'Imagen',
    src,
    originalSrc: src,
    alt: 'Imagen',
    objectFit: 'cover',
    transform: createDefaultTransform({ position, size }),
    locked: false,
    visible: true,
    selectable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createShapeElement(
  shapeType: ShapeType,
  position: Position,
  size: Size,
  overrides?: Partial<ShapeElement>
): ShapeElement {
  const id = `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id,
    type: 'shape',
    name: `Forma ${shapeType}`,
    shapeType,
    transform: createDefaultTransform({ position, size }),
    fill: { type: 'solid', color: '#3b82f6' },
    locked: false,
    visible: true,
    selectable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createGroupElement(
  children: CanvasElement[],
  overrides?: Partial<GroupElement>
): GroupElement {
  const id = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Calcular bounds del grupo basado en los hijos
  const bounds = calculateGroupBounds(children);
  
  return {
    id,
    type: 'group',
    name: 'Grupo',
    children,
    transform: createDefaultTransform({
      position: { x: bounds.x, y: bounds.y },
      size: { width: bounds.width, height: bounds.height },
    }),
    locked: false,
    visible: true,
    selectable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function calculateGroupBounds(elements: CanvasElement[]): { x: number; y: number; width: number; height: number } {
  if (elements.length === 0) {
    return { x: 0, y: 0, width: 100, height: 100 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  elements.forEach(el => {
    const { position, size } = el.transform;
    minX = Math.min(minX, position.x);
    minY = Math.min(minY, position.y);
    maxX = Math.max(maxX, position.x + size.width);
    maxY = Math.max(maxY, position.y + size.height);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
