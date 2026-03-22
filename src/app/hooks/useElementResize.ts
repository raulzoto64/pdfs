/**
 * Hook para redimensionar elementos con mouse y touch
 * Soporta 8 handles (4 esquinas + 4 lados)
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export interface Size {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface ResizeConstraints {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number; // width / height
  snapToGrid?: number;
}

export interface UseElementResizeOptions {
  initialSize: Size;
  initialPosition?: Position;
  constraints?: ResizeConstraints;
  onResizeStart?: () => void;
  onResize?: (size: Size, position: Position) => void;
  onResizeEnd?: (size: Size, position: Position) => void;
  maintainAspectRatio?: boolean;
}

export interface UseElementResizeReturn {
  size: Size;
  position: Position;
  isResizing: boolean;
  activeHandle: ResizeHandle | null;
  handleMouseDown: (handle: ResizeHandle) => (e: React.MouseEvent) => void;
  handleTouchStart: (handle: ResizeHandle) => (e: React.TouchEvent) => void;
  setSize: (size: Size) => void;
  setPosition: (position: Position) => void;
  resetSize: () => void;
}

const DEFAULT_CONSTRAINTS: ResizeConstraints = {
  minWidth: 50,
  minHeight: 50,
  maxWidth: 2000,
  maxHeight: 2000,
};

export function useElementResize(options: UseElementResizeOptions): UseElementResizeReturn {
  const {
    initialSize,
    initialPosition = { x: 0, y: 0 },
    constraints = DEFAULT_CONSTRAINTS,
    onResizeStart,
    onResize,
    onResizeEnd,
    maintainAspectRatio = false,
  } = options;

  const [size, setSize] = useState<Size>(initialSize);
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isResizing, setIsResizing] = useState(false);
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);

  const startRef = useRef<{
    mouseX: number;
    mouseY: number;
    width: number;
    height: number;
    x: number;
    y: number;
    aspectRatio: number;
  } | null>(null);

  const constrainedConstraints = {
    ...DEFAULT_CONSTRAINTS,
    ...constraints,
  };

  const applyConstraints = useCallback((newSize: Size, newPosition: Position): { size: Size; position: Position } => {
    let { width, height } = newSize;
    let { x, y } = newPosition;

    // Aplicar limites min/max
    width = Math.max(constrainedConstraints.minWidth!, Math.min(constrainedConstraints.maxWidth!, width));
    height = Math.max(constrainedConstraints.minHeight!, Math.min(constrainedConstraints.maxHeight!, height));

    // Mantener aspect ratio si es necesario
    if (maintainAspectRatio && startRef.current) {
      const ratio = startRef.current.aspectRatio;
      if (width / height > ratio) {
        width = height * ratio;
      } else {
        height = width / ratio;
      }
    }

    // Aplicar aspect ratio fijo si esta definido
    if (constrainedConstraints.aspectRatio) {
      const ratio = constrainedConstraints.aspectRatio;
      if (width / height > ratio) {
        width = height * ratio;
      } else {
        height = width / ratio;
      }
    }

    // Snap to grid
    if (constrainedConstraints.snapToGrid) {
      const grid = constrainedConstraints.snapToGrid;
      width = Math.round(width / grid) * grid;
      height = Math.round(height / grid) * grid;
      x = Math.round(x / grid) * grid;
      y = Math.round(y / grid) * grid;
    }

    return { size: { width, height }, position: { x, y } };
  }, [constrainedConstraints, maintainAspectRatio]);

  const calculateNewDimensions = useCallback((
    handle: ResizeHandle,
    deltaX: number,
    deltaY: number
  ): { size: Size; position: Position } => {
    if (!startRef.current) {
      return { size, position };
    }

    const { width: startWidth, height: startHeight, x: startX, y: startY } = startRef.current;
    let newWidth = startWidth;
    let newHeight = startHeight;
    let newX = startX;
    let newY = startY;

    // Calcular nuevas dimensiones segun el handle
    switch (handle) {
      case 'e':
        newWidth = startWidth + deltaX;
        break;
      case 'w':
        newWidth = startWidth - deltaX;
        newX = startX + deltaX;
        break;
      case 's':
        newHeight = startHeight + deltaY;
        break;
      case 'n':
        newHeight = startHeight - deltaY;
        newY = startY + deltaY;
        break;
      case 'se':
        newWidth = startWidth + deltaX;
        newHeight = startHeight + deltaY;
        break;
      case 'sw':
        newWidth = startWidth - deltaX;
        newX = startX + deltaX;
        newHeight = startHeight + deltaY;
        break;
      case 'ne':
        newWidth = startWidth + deltaX;
        newHeight = startHeight - deltaY;
        newY = startY + deltaY;
        break;
      case 'nw':
        newWidth = startWidth - deltaX;
        newX = startX + deltaX;
        newHeight = startHeight - deltaY;
        newY = startY + deltaY;
        break;
    }

    return applyConstraints(
      { width: newWidth, height: newHeight },
      { x: newX, y: newY }
    );
  }, [size, position, applyConstraints]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isResizing || !activeHandle || !startRef.current) return;

    const deltaX = clientX - startRef.current.mouseX;
    const deltaY = clientY - startRef.current.mouseY;

    const { size: newSize, position: newPosition } = calculateNewDimensions(activeHandle, deltaX, deltaY);
    
    setSize(newSize);
    setPosition(newPosition);
    onResize?.(newSize, newPosition);
  }, [isResizing, activeHandle, calculateNewDimensions, onResize]);

  const handleEnd = useCallback(() => {
    if (isResizing) {
      onResizeEnd?.(size, position);
    }
    setIsResizing(false);
    setActiveHandle(null);
    startRef.current = null;
  }, [isResizing, size, position, onResizeEnd]);

  // Mouse events
  const handleMouseDown = useCallback((handle: ResizeHandle) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: size.width,
      height: size.height,
      x: position.x,
      y: position.y,
      aspectRatio: size.width / size.height,
    };

    setIsResizing(true);
    setActiveHandle(handle);
    onResizeStart?.();
  }, [size, position, onResizeStart]);

  // Touch events
  const handleTouchStart = useCallback((handle: ResizeHandle) => (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0];
    
    startRef.current = {
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      width: size.width,
      height: size.height,
      x: position.x,
      y: position.y,
      aspectRatio: size.width / size.height,
    };

    setIsResizing(true);
    setActiveHandle(handle);
    onResizeStart?.();
  }, [size, position, onResizeStart]);

  // Global event listeners
  useEffect(() => {
    if (!isResizing) return;

    const onMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const onMouseUp = () => handleEnd();
    const onTouchEnd = () => handleEnd();

    // Agregar listeners globales
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [isResizing, handleMove, handleEnd]);

  const resetSize = useCallback(() => {
    setSize(initialSize);
    setPosition(initialPosition);
  }, [initialSize, initialPosition]);

  return {
    size,
    position,
    isResizing,
    activeHandle,
    handleMouseDown,
    handleTouchStart,
    setSize,
    setPosition,
    resetSize,
  };
}

// Estilos de cursor para cada handle
export const HANDLE_CURSORS: Record<ResizeHandle, string> = {
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  nw: 'nwse-resize',
  se: 'nwse-resize',
};

// Posiciones de los handles
export const HANDLE_POSITIONS: Record<ResizeHandle, { top?: string; bottom?: string; left?: string; right?: string; transform: string }> = {
  n: { top: '-4px', left: '50%', transform: 'translateX(-50%)' },
  s: { bottom: '-4px', left: '50%', transform: 'translateX(-50%)' },
  e: { right: '-4px', top: '50%', transform: 'translateY(-50%)' },
  w: { left: '-4px', top: '50%', transform: 'translateY(-50%)' },
  ne: { top: '-4px', right: '-4px', transform: 'none' },
  nw: { top: '-4px', left: '-4px', transform: 'none' },
  se: { bottom: '-4px', right: '-4px', transform: 'none' },
  sw: { bottom: '-4px', left: '-4px', transform: 'none' },
};

export default useElementResize;
