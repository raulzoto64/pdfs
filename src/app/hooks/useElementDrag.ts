/**
 * Hook para arrastrar elementos con mouse y touch
 * Incluye snap a grid y limites de contenedor
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface Position {
  x: number;
  y: number;
}

export interface DragConstraints {
  minX?: number;
  minY?: number;
  maxX?: number;
  maxY?: number;
  snapToGrid?: number;
  boundToParent?: boolean;
}

export interface UseElementDragOptions {
  initialPosition?: Position;
  constraints?: DragConstraints;
  onDragStart?: (position: Position) => void;
  onDrag?: (position: Position, delta: Position) => void;
  onDragEnd?: (position: Position) => void;
  disabled?: boolean;
}

export interface UseElementDragReturn {
  position: Position;
  isDragging: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  setPosition: (position: Position) => void;
  resetPosition: () => void;
  dragRef: React.RefObject<HTMLElement>;
}

export function useElementDrag(options: UseElementDragOptions = {}): UseElementDragReturn {
  const {
    initialPosition = { x: 0, y: 0 },
    constraints = {},
    onDragStart,
    onDrag,
    onDragEnd,
    disabled = false,
  } = options;

  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  
  const dragRef = useRef<HTMLElement>(null);
  const startRef = useRef<{
    mouseX: number;
    mouseY: number;
    startX: number;
    startY: number;
    parentBounds?: DOMRect;
    elementBounds?: DOMRect;
  } | null>(null);

  const applyConstraints = useCallback((newPosition: Position): Position => {
    let { x, y } = newPosition;

    // Limites fijos
    if (constraints.minX !== undefined) x = Math.max(constraints.minX, x);
    if (constraints.maxX !== undefined) x = Math.min(constraints.maxX, x);
    if (constraints.minY !== undefined) y = Math.max(constraints.minY, y);
    if (constraints.maxY !== undefined) y = Math.min(constraints.maxY, y);

    // Limites del padre
    if (constraints.boundToParent && startRef.current?.parentBounds && startRef.current?.elementBounds) {
      const { parentBounds, elementBounds } = startRef.current;
      x = Math.max(0, Math.min(parentBounds.width - elementBounds.width, x));
      y = Math.max(0, Math.min(parentBounds.height - elementBounds.height, y));
    }

    // Snap to grid
    if (constraints.snapToGrid) {
      const grid = constraints.snapToGrid;
      x = Math.round(x / grid) * grid;
      y = Math.round(y / grid) * grid;
    }

    return { x, y };
  }, [constraints]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !startRef.current || disabled) return;

    const deltaX = clientX - startRef.current.mouseX;
    const deltaY = clientY - startRef.current.mouseY;

    const newX = startRef.current.startX + deltaX;
    const newY = startRef.current.startY + deltaY;

    const constrainedPosition = applyConstraints({ x: newX, y: newY });
    
    setPosition(constrainedPosition);
    onDrag?.(constrainedPosition, { x: deltaX, y: deltaY });
  }, [isDragging, disabled, applyConstraints, onDrag]);

  const handleEnd = useCallback(() => {
    if (isDragging) {
      onDragEnd?.(position);
    }
    setIsDragging(false);
    startRef.current = null;
  }, [isDragging, position, onDragEnd]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    
    // Solo boton izquierdo
    if (e.button !== 0) return;
    
    e.preventDefault();
    e.stopPropagation();

    const element = dragRef.current;
    const parent = element?.parentElement;

    startRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position.x,
      startY: position.y,
      parentBounds: parent?.getBoundingClientRect(),
      elementBounds: element?.getBoundingClientRect(),
    };

    setIsDragging(true);
    onDragStart?.(position);
  }, [disabled, position, onDragStart]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0];
    const element = dragRef.current;
    const parent = element?.parentElement;

    startRef.current = {
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      startX: position.x,
      startY: position.y,
      parentBounds: parent?.getBoundingClientRect(),
      elementBounds: element?.getBoundingClientRect(),
    };

    setIsDragging(true);
    onDragStart?.(position);
  }, [disabled, position, onDragStart]);

  // Global event listeners
  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const onMouseUp = () => handleEnd();
    const onTouchEnd = () => handleEnd();

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
  }, [isDragging, handleMove, handleEnd]);

  const resetPosition = useCallback(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  return {
    position,
    isDragging,
    handleMouseDown,
    handleTouchStart,
    setPosition,
    resetPosition,
    dragRef: dragRef as React.RefObject<HTMLElement>,
  };
}

export default useElementDrag;
