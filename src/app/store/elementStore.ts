/**
 * Store para elementos individuales dentro de secciones
 * Maneja posicion, tamano, rotacion y estilos de cada elemento
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// TIPOS
// ============================================

export type ElementType = 'text' | 'image' | 'shape' | 'icon' | 'container' | 'divider' | 'button';

export interface ElementPosition {
  x: number;
  y: number;
}

export interface ElementSize {
  width: number;
  height: number;
}

export interface ElementStyle {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto';
  backgroundPosition?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderRadius?: number;
  opacity?: number;
  shadow?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: number | string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  padding?: number;
  margin?: number;
}

export interface EditableElement {
  id: string;
  sectionId: string;
  type: ElementType;
  name: string;
  position: ElementPosition;
  size: ElementSize;
  rotation: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  style: ElementStyle;
  content: ElementContent;
  createdAt: string;
  updatedAt: string;
}

export interface ElementContent {
  text?: string;
  html?: string;
  src?: string;
  alt?: string;
  href?: string;
  icon?: string;
  children?: string[]; // IDs de elementos hijos
}

export interface ElementHistoryEntry {
  timestamp: number;
  elementId: string;
  action: 'create' | 'update' | 'delete' | 'move' | 'resize';
  previousState: Partial<EditableElement> | null;
  newState: Partial<EditableElement> | null;
}

// ============================================
// STORE
// ============================================

interface ElementStore {
  // State
  elements: Record<string, EditableElement>;
  selectedElementId: string | null;
  multiSelectedIds: string[];
  hoveredElementId: string | null;
  clipboard: EditableElement | null;
  history: ElementHistoryEntry[];
  historyIndex: number;
  isDragging: boolean;
  isResizing: boolean;
  
  // Element Actions
  addElement: (element: Omit<EditableElement, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateElement: (id: string, updates: Partial<EditableElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => string | null;
  
  // Position & Size
  moveElement: (id: string, position: ElementPosition) => void;
  resizeElement: (id: string, size: ElementSize, position?: ElementPosition) => void;
  rotateElement: (id: string, rotation: number) => void;
  
  // Z-Index
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  
  // Selection
  selectElement: (id: string | null) => void;
  addToSelection: (id: string) => void;
  removeFromSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: (sectionId: string) => void;
  setHoveredElement: (id: string | null) => void;
  
  // Lock & Visibility
  toggleLock: (id: string) => void;
  toggleVisibility: (id: string) => void;
  
  // Clipboard
  copyElement: (id: string) => void;
  cutElement: (id: string) => void;
  pasteElement: (sectionId: string, position?: ElementPosition) => string | null;
  
  // History
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  
  // Style
  updateElementStyle: (id: string, style: Partial<ElementStyle>) => void;
  applyStyleToSelected: (style: Partial<ElementStyle>) => void;
  
  // Bulk Actions
  deleteSelected: () => void;
  alignSelected: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeSelected: (direction: 'horizontal' | 'vertical') => void;
  
  // Drag & Resize State
  setIsDragging: (isDragging: boolean) => void;
  setIsResizing: (isResizing: boolean) => void;
  
  // Queries
  getElementsBySection: (sectionId: string) => EditableElement[];
  getElementById: (id: string) => EditableElement | undefined;
  getSelectedElements: () => EditableElement[];
  
  // Reset
  resetElements: () => void;
  loadElements: (elements: EditableElement[]) => void;
}

// ============================================
// IMPLEMENTACION
// ============================================

const generateId = () => `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const addToHistory = (
  history: ElementHistoryEntry[],
  historyIndex: number,
  entry: Omit<ElementHistoryEntry, 'timestamp'>
): { history: ElementHistoryEntry[]; historyIndex: number } => {
  // Eliminar entradas futuras si estamos en medio del historial
  const newHistory = history.slice(0, historyIndex + 1);
  newHistory.push({ ...entry, timestamp: Date.now() });
  
  // Limitar historial a 50 entradas
  if (newHistory.length > 50) {
    newHistory.shift();
  }
  
  return {
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
};

export const useElementStore = create<ElementStore>()(
  persist(
    (set, get) => ({
      // Initial State
      elements: {},
      selectedElementId: null,
      multiSelectedIds: [],
      hoveredElementId: null,
      clipboard: null,
      history: [],
      historyIndex: -1,
      isDragging: false,
      isResizing: false,

      // Element Actions
      addElement: (elementData) => {
        const id = generateId();
        const now = new Date().toISOString();
        
        const element: EditableElement = {
          ...elementData,
          id,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => {
          const { history, historyIndex } = addToHistory(
            state.history,
            state.historyIndex,
            { elementId: id, action: 'create', previousState: null, newState: element }
          );

          return {
            elements: { ...state.elements, [id]: element },
            selectedElementId: id,
            history,
            historyIndex,
          };
        });

        return id;
      },

      updateElement: (id, updates) => {
        set((state) => {
          const element = state.elements[id];
          if (!element) return state;

          const updatedElement = {
            ...element,
            ...updates,
            updatedAt: new Date().toISOString(),
          };

          const { history, historyIndex } = addToHistory(
            state.history,
            state.historyIndex,
            { elementId: id, action: 'update', previousState: element, newState: updatedElement }
          );

          return {
            elements: { ...state.elements, [id]: updatedElement },
            history,
            historyIndex,
          };
        });
      },

      deleteElement: (id) => {
        set((state) => {
          const element = state.elements[id];
          if (!element) return state;

          const { [id]: deleted, ...remaining } = state.elements;

          const { history, historyIndex } = addToHistory(
            state.history,
            state.historyIndex,
            { elementId: id, action: 'delete', previousState: element, newState: null }
          );

          return {
            elements: remaining,
            selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
            multiSelectedIds: state.multiSelectedIds.filter((sid) => sid !== id),
            history,
            historyIndex,
          };
        });
      },

      duplicateElement: (id) => {
        const state = get();
        const element = state.elements[id];
        if (!element) return null;

        const newId = state.addElement({
          ...element,
          name: `${element.name} (Copia)`,
          position: {
            x: element.position.x + 20,
            y: element.position.y + 20,
          },
        });

        return newId;
      },

      // Position & Size
      moveElement: (id, position) => {
        set((state) => {
          const element = state.elements[id];
          if (!element || element.locked) return state;

          const updatedElement = {
            ...element,
            position,
            updatedAt: new Date().toISOString(),
          };

          return {
            elements: { ...state.elements, [id]: updatedElement },
          };
        });
      },

      resizeElement: (id, size, position) => {
        set((state) => {
          const element = state.elements[id];
          if (!element || element.locked) return state;

          const updatedElement = {
            ...element,
            size,
            ...(position && { position }),
            updatedAt: new Date().toISOString(),
          };

          return {
            elements: { ...state.elements, [id]: updatedElement },
          };
        });
      },

      rotateElement: (id, rotation) => {
        set((state) => {
          const element = state.elements[id];
          if (!element || element.locked) return state;

          const updatedElement = {
            ...element,
            rotation,
            updatedAt: new Date().toISOString(),
          };

          return {
            elements: { ...state.elements, [id]: updatedElement },
          };
        });
      },

      // Z-Index
      bringToFront: (id) => {
        set((state) => {
          const element = state.elements[id];
          if (!element) return state;

          const maxZIndex = Math.max(
            ...Object.values(state.elements)
              .filter((el) => el.sectionId === element.sectionId)
              .map((el) => el.zIndex)
          );

          return {
            elements: {
              ...state.elements,
              [id]: { ...element, zIndex: maxZIndex + 1 },
            },
          };
        });
      },

      sendToBack: (id) => {
        set((state) => {
          const element = state.elements[id];
          if (!element) return state;

          const minZIndex = Math.min(
            ...Object.values(state.elements)
              .filter((el) => el.sectionId === element.sectionId)
              .map((el) => el.zIndex)
          );

          return {
            elements: {
              ...state.elements,
              [id]: { ...element, zIndex: minZIndex - 1 },
            },
          };
        });
      },

      bringForward: (id) => {
        set((state) => {
          const element = state.elements[id];
          if (!element) return state;

          return {
            elements: {
              ...state.elements,
              [id]: { ...element, zIndex: element.zIndex + 1 },
            },
          };
        });
      },

      sendBackward: (id) => {
        set((state) => {
          const element = state.elements[id];
          if (!element) return state;

          return {
            elements: {
              ...state.elements,
              [id]: { ...element, zIndex: Math.max(0, element.zIndex - 1) },
            },
          };
        });
      },

      // Selection
      selectElement: (id) => set({ selectedElementId: id, multiSelectedIds: id ? [id] : [] }),
      
      addToSelection: (id) => set((state) => ({
        multiSelectedIds: state.multiSelectedIds.includes(id)
          ? state.multiSelectedIds
          : [...state.multiSelectedIds, id],
        selectedElementId: id,
      })),
      
      removeFromSelection: (id) => set((state) => ({
        multiSelectedIds: state.multiSelectedIds.filter((sid) => sid !== id),
        selectedElementId: state.selectedElementId === id
          ? state.multiSelectedIds.find((sid) => sid !== id) || null
          : state.selectedElementId,
      })),
      
      clearSelection: () => set({ selectedElementId: null, multiSelectedIds: [] }),
      
      selectAll: (sectionId) => set((state) => {
        const ids = Object.values(state.elements)
          .filter((el) => el.sectionId === sectionId && !el.locked)
          .map((el) => el.id);
        return {
          multiSelectedIds: ids,
          selectedElementId: ids[0] || null,
        };
      }),
      
      setHoveredElement: (id) => set({ hoveredElementId: id }),

      // Lock & Visibility
      toggleLock: (id) => {
        set((state) => {
          const element = state.elements[id];
          if (!element) return state;

          return {
            elements: {
              ...state.elements,
              [id]: { ...element, locked: !element.locked },
            },
          };
        });
      },

      toggleVisibility: (id) => {
        set((state) => {
          const element = state.elements[id];
          if (!element) return state;

          return {
            elements: {
              ...state.elements,
              [id]: { ...element, visible: !element.visible },
            },
          };
        });
      },

      // Clipboard
      copyElement: (id) => {
        const element = get().elements[id];
        if (element) {
          set({ clipboard: { ...element } });
        }
      },

      cutElement: (id) => {
        const state = get();
        const element = state.elements[id];
        if (element) {
          set({ clipboard: { ...element } });
          state.deleteElement(id);
        }
      },

      pasteElement: (sectionId, position) => {
        const clipboard = get().clipboard;
        if (!clipboard) return null;

        return get().addElement({
          ...clipboard,
          sectionId,
          name: `${clipboard.name} (Pegado)`,
          position: position || {
            x: clipboard.position.x + 20,
            y: clipboard.position.y + 20,
          },
        });
      },

      // History
      undo: () => {
        set((state) => {
          if (state.historyIndex < 0) return state;

          const entry = state.history[state.historyIndex];
          if (!entry) return state;

          let newElements = { ...state.elements };

          switch (entry.action) {
            case 'create':
              delete newElements[entry.elementId];
              break;
            case 'delete':
              if (entry.previousState) {
                newElements[entry.elementId] = entry.previousState as EditableElement;
              }
              break;
            case 'update':
            case 'move':
            case 'resize':
              if (entry.previousState) {
                newElements[entry.elementId] = entry.previousState as EditableElement;
              }
              break;
          }

          return {
            elements: newElements,
            historyIndex: state.historyIndex - 1,
          };
        });
      },

      redo: () => {
        set((state) => {
          if (state.historyIndex >= state.history.length - 1) return state;

          const entry = state.history[state.historyIndex + 1];
          if (!entry) return state;

          let newElements = { ...state.elements };

          switch (entry.action) {
            case 'create':
            case 'update':
            case 'move':
            case 'resize':
              if (entry.newState) {
                newElements[entry.elementId] = entry.newState as EditableElement;
              }
              break;
            case 'delete':
              delete newElements[entry.elementId];
              break;
          }

          return {
            elements: newElements,
            historyIndex: state.historyIndex + 1,
          };
        });
      },

      clearHistory: () => set({ history: [], historyIndex: -1 }),

      // Style
      updateElementStyle: (id, style) => {
        set((state) => {
          const element = state.elements[id];
          if (!element) return state;

          return {
            elements: {
              ...state.elements,
              [id]: {
                ...element,
                style: { ...element.style, ...style },
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      applyStyleToSelected: (style) => {
        const state = get();
        state.multiSelectedIds.forEach((id) => {
          state.updateElementStyle(id, style);
        });
      },

      // Bulk Actions
      deleteSelected: () => {
        const state = get();
        state.multiSelectedIds.forEach((id) => {
          state.deleteElement(id);
        });
      },

      alignSelected: (alignment) => {
        set((state) => {
          if (state.multiSelectedIds.length < 2) return state;

          const selected = state.multiSelectedIds.map((id) => state.elements[id]).filter(Boolean);
          if (selected.length < 2) return state;

          let targetValue: number;
          const updates: Record<string, EditableElement> = {};

          switch (alignment) {
            case 'left':
              targetValue = Math.min(...selected.map((el) => el.position.x));
              selected.forEach((el) => {
                updates[el.id] = { ...el, position: { ...el.position, x: targetValue } };
              });
              break;
            case 'center':
              const centerX = selected.reduce((sum, el) => sum + el.position.x + el.size.width / 2, 0) / selected.length;
              selected.forEach((el) => {
                updates[el.id] = { ...el, position: { ...el.position, x: centerX - el.size.width / 2 } };
              });
              break;
            case 'right':
              targetValue = Math.max(...selected.map((el) => el.position.x + el.size.width));
              selected.forEach((el) => {
                updates[el.id] = { ...el, position: { ...el.position, x: targetValue - el.size.width } };
              });
              break;
            case 'top':
              targetValue = Math.min(...selected.map((el) => el.position.y));
              selected.forEach((el) => {
                updates[el.id] = { ...el, position: { ...el.position, y: targetValue } };
              });
              break;
            case 'middle':
              const centerY = selected.reduce((sum, el) => sum + el.position.y + el.size.height / 2, 0) / selected.length;
              selected.forEach((el) => {
                updates[el.id] = { ...el, position: { ...el.position, y: centerY - el.size.height / 2 } };
              });
              break;
            case 'bottom':
              targetValue = Math.max(...selected.map((el) => el.position.y + el.size.height));
              selected.forEach((el) => {
                updates[el.id] = { ...el, position: { ...el.position, y: targetValue - el.size.height } };
              });
              break;
          }

          return {
            elements: { ...state.elements, ...updates },
          };
        });
      },

      distributeSelected: (direction) => {
        set((state) => {
          if (state.multiSelectedIds.length < 3) return state;

          const selected = state.multiSelectedIds
            .map((id) => state.elements[id])
            .filter(Boolean)
            .sort((a, b) => 
              direction === 'horizontal' 
                ? a.position.x - b.position.x 
                : a.position.y - b.position.y
            );

          if (selected.length < 3) return state;

          const updates: Record<string, EditableElement> = {};

          if (direction === 'horizontal') {
            const first = selected[0];
            const last = selected[selected.length - 1];
            const totalWidth = selected.reduce((sum, el) => sum + el.size.width, 0);
            const totalSpace = (last.position.x + last.size.width) - first.position.x - totalWidth;
            const gap = totalSpace / (selected.length - 1);

            let currentX = first.position.x;
            selected.forEach((el) => {
              updates[el.id] = { ...el, position: { ...el.position, x: currentX } };
              currentX += el.size.width + gap;
            });
          } else {
            const first = selected[0];
            const last = selected[selected.length - 1];
            const totalHeight = selected.reduce((sum, el) => sum + el.size.height, 0);
            const totalSpace = (last.position.y + last.size.height) - first.position.y - totalHeight;
            const gap = totalSpace / (selected.length - 1);

            let currentY = first.position.y;
            selected.forEach((el) => {
              updates[el.id] = { ...el, position: { ...el.position, y: currentY } };
              currentY += el.size.height + gap;
            });
          }

          return {
            elements: { ...state.elements, ...updates },
          };
        });
      },

      // Drag & Resize State
      setIsDragging: (isDragging) => set({ isDragging }),
      setIsResizing: (isResizing) => set({ isResizing }),

      // Queries
      getElementsBySection: (sectionId) => {
        const elements = get().elements;
        return Object.values(elements)
          .filter((el) => el.sectionId === sectionId)
          .sort((a, b) => a.zIndex - b.zIndex);
      },

      getElementById: (id) => get().elements[id],

      getSelectedElements: () => {
        const state = get();
        return state.multiSelectedIds.map((id) => state.elements[id]).filter(Boolean);
      },

      // Reset
      resetElements: () => set({
        elements: {},
        selectedElementId: null,
        multiSelectedIds: [],
        hoveredElementId: null,
        clipboard: null,
        history: [],
        historyIndex: -1,
        isDragging: false,
        isResizing: false,
      }),

      loadElements: (elements) => {
        const elementsMap: Record<string, EditableElement> = {};
        elements.forEach((el) => {
          elementsMap[el.id] = el;
        });
        set({ elements: elementsMap });
      },
    }),
    {
      name: 'element-storage',
      partialize: (state) => ({
        elements: state.elements,
      }),
    }
  )
);

export default useElementStore;
