/**
 * Hooks del Editor Avanzado
 * 
 * Exporta todos los hooks personalizados para manipulacion de elementos
 */

export { 
  useElementResize, 
  HANDLE_CURSORS, 
  HANDLE_POSITIONS,
  type ResizeHandle,
  type Size,
  type Position as ResizePosition,
  type ResizeConstraints,
  type UseElementResizeOptions,
  type UseElementResizeReturn,
} from './useElementResize';

export { 
  useElementDrag,
  type Position as DragPosition,
  type DragConstraints,
  type UseElementDragOptions,
  type UseElementDragReturn,
} from './useElementDrag';

export { 
  useTouchGestures,
  type TouchPoint,
  type GestureState,
  type UseTouchGesturesOptions,
  type UseTouchGesturesReturn,
} from './useTouchGestures';
