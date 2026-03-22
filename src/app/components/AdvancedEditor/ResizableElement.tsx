'use client';

/**
 * ResizableElement - Componente redimensionable con 8 handles
 * Soporta mouse y touch para desktop y moviles
 */

import React, { useCallback, useMemo } from 'react';
import { Box } from '@mui/material';
import { useElementResize, ResizeHandle, HANDLE_CURSORS, HANDLE_POSITIONS } from '../../hooks/useElementResize';
import { useTouchGestures } from '../../hooks/useTouchGestures';
import { useElementStore, EditableElement } from '../../store/elementStore';

interface ResizableElementProps {
  element: EditableElement;
  children: React.ReactNode;
  onSelect?: () => void;
  showHandles?: boolean;
  disabled?: boolean;
  snapToGrid?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

const HANDLES: ResizeHandle[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

export function ResizableElement({
  element,
  children,
  onSelect,
  showHandles = true,
  disabled = false,
  snapToGrid,
  minWidth = 50,
  minHeight = 50,
  maxWidth = 2000,
  maxHeight = 2000,
}: ResizableElementProps) {
  const { resizeElement, selectElement, selectedElementId, setIsResizing } = useElementStore();
  
  const isSelected = selectedElementId === element.id;
  const isLocked = element.locked;
  const canResize = !disabled && !isLocked && isSelected;

  const {
    size,
    position,
    isResizing,
    activeHandle,
    handleMouseDown,
    handleTouchStart,
  } = useElementResize({
    initialSize: element.size,
    initialPosition: element.position,
    constraints: {
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      snapToGrid,
    },
    onResizeStart: () => {
      setIsResizing(true);
    },
    onResize: (newSize, newPosition) => {
      resizeElement(element.id, newSize, newPosition);
    },
    onResizeEnd: () => {
      setIsResizing(false);
    },
  });

  // Touch gestures for pinch-to-resize on mobile
  const { touchHandlers } = useTouchGestures({
    disabled: !canResize,
    onPinch: (scale) => {
      const newWidth = Math.min(maxWidth, Math.max(minWidth, element.size.width * scale));
      const newHeight = Math.min(maxHeight, Math.max(minHeight, element.size.height * scale));
      resizeElement(element.id, { width: newWidth, height: newHeight });
    },
  });

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSelected) {
      selectElement(element.id);
      onSelect?.();
    }
  }, [isSelected, element.id, selectElement, onSelect]);

  const renderHandle = useCallback((handle: ResizeHandle) => {
    const isCorner = handle.length === 2;
    const handleSize = isCorner ? 10 : 8;
    const pos = HANDLE_POSITIONS[handle];

    return (
      <Box
        key={handle}
        onMouseDown={canResize ? handleMouseDown(handle) : undefined}
        onTouchStart={canResize ? handleTouchStart(handle) : undefined}
        sx={{
          position: 'absolute',
          width: handleSize,
          height: handleSize,
          backgroundColor: activeHandle === handle ? '#1976d2' : '#ffffff',
          border: '2px solid #1976d2',
          borderRadius: isCorner ? '2px' : '50%',
          cursor: canResize ? HANDLE_CURSORS[handle] : 'default',
          zIndex: 10,
          touchAction: 'none',
          transition: 'background-color 0.15s, transform 0.15s',
          '&:hover': canResize ? {
            backgroundColor: '#1976d2',
            transform: 'scale(1.2)',
          } : {},
          ...pos,
        }}
      />
    );
  }, [canResize, activeHandle, handleMouseDown, handleTouchStart]);

  const containerStyle = useMemo(() => ({
    position: 'absolute' as const,
    left: position.x,
    top: position.y,
    width: size.width,
    height: size.height,
    transform: `rotate(${element.rotation}deg)`,
    opacity: element.visible ? (element.style.opacity ?? 1) : 0.3,
    zIndex: element.zIndex,
    outline: isSelected ? '2px solid #1976d2' : 'none',
    outlineOffset: '2px',
    cursor: isLocked ? 'not-allowed' : (isResizing ? 'grabbing' : 'grab'),
    userSelect: 'none' as const,
    touchAction: 'none',
    transition: isResizing ? 'none' : 'outline 0.15s',
  }), [position, size, element.rotation, element.visible, element.style.opacity, element.zIndex, isSelected, isLocked, isResizing]);

  return (
    <Box
      onClick={handleClick}
      {...touchHandlers}
      sx={containerStyle}
    >
      {/* Content */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          borderRadius: element.style.borderRadius ? `${element.style.borderRadius}px` : 0,
          backgroundColor: element.style.backgroundColor,
          border: element.style.borderWidth 
            ? `${element.style.borderWidth}px ${element.style.borderStyle || 'solid'} ${element.style.borderColor || '#ccc'}`
            : 'none',
          boxShadow: element.style.shadow,
        }}
      >
        {children}
      </Box>

      {/* Resize Handles */}
      {showHandles && canResize && HANDLES.map(renderHandle)}

      {/* Lock Indicator */}
      {isLocked && isSelected && (
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            fontSize: 10,
            padding: '2px 6px',
            borderRadius: 1,
            whiteSpace: 'nowrap',
          }}
        >
          Bloqueado
        </Box>
      )}

      {/* Size Indicator */}
      {isResizing && (
        <Box
          sx={{
            position: 'absolute',
            bottom: -25,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 1,
            whiteSpace: 'nowrap',
            fontFamily: 'monospace',
          }}
        >
          {Math.round(size.width)} x {Math.round(size.height)}
        </Box>
      )}
    </Box>
  );
}

export default ResizableElement;
