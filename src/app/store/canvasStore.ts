import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CanvasElement,
  CanvasSection,
  SelectionState,
  HistoryEntry,
  CanvasConfig,
  ColorPalette,
  ColorEditorState,
  TouchState,
  ResizeState,
  Position,
  Size,
  Transform,
  Fill,
} from '../types/canvasElements';

// Estado principal del canvas
interface CanvasStore {
  // Secciones y elementos
  sections: CanvasSection[];
  activeSectionId: string | null;
  
  // Seleccion
  selection: SelectionState;
  
  // Historial
  history: HistoryEntry[];
  historyIndex: number;
  
  // Configuracion
  config: CanvasConfig;
  
  // Colores
  colorEditor: ColorEditorState;
  
  // Touch/Gestos
  touch: TouchState;
  
  // Resize
  resize: ResizeState;
  
  // Clipboard
  clipboard: CanvasElement[];
  
  // Estado de edicion
  isEditing: boolean;
  editingElementId: string | null;
  
  // Acciones de secciones
  addSection: (section: CanvasSection) => void;
  updateSection: (id: string, updates: Partial<CanvasSection>) => void;
  deleteSection: (id: string) => void;
  setActiveSection: (id: string | null) => void;
  
  // Acciones de elementos
  addElement: (sectionId: string, element: CanvasElement) => void;
  updateElement: (sectionId: string, elementId: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (sectionId: string, elementId: string) => void;
  duplicateElement: (sectionId: string, elementId: string) => void;
  
  // Transformaciones
  moveElement: (sectionId: string, elementId: string, position: Position) => void;
  resizeElement: (sectionId: string, elementId: string, size: Size) => void;
  rotateElement: (sectionId: string, elementId: string, rotation: number) => void;
  setElementTransform: (sectionId: string, elementId: string, transform: Partial<Transform>) => void;
  
  // Seleccion
  selectElement: (elementId: string, addToSelection?: boolean) => void;
  deselectElement: (elementId: string) => void;
  clearSelection: () => void;
  selectAll: (sectionId: string) => void;
  
  // Orden Z
  bringToFront: (sectionId: string, elementId: string) => void;
  sendToBack: (sectionId: string, elementId: string) => void;
  bringForward: (sectionId: string, elementId: string) => void;
  sendBackward: (sectionId: string, elementId: string) => void;
  
  // Agrupacion
  groupElements: (sectionId: string, elementIds: string[]) => void;
  ungroupElements: (sectionId: string, groupId: string) => void;
  
  // Historial
  undo: () => void;
  redo: () => void;
  addToHistory: (action: HistoryEntry['action']) => void;
  
  // Configuracion
  setConfig: (config: Partial<CanvasConfig>) => void;
  toggleGrid: () => void;
  setZoom: (zoom: number) => void;
  setPan: (offset: Position) => void;
  
  // Colores
  setActiveColor: (color: string) => void;
  addColorToHistory: (color: string) => void;
  addPalette: (palette: ColorPalette) => void;
  setActivePalette: (id: string | null) => void;
  updatePalette: (id: string, updates: Partial<ColorPalette>) => void;
  
  // Touch
  setTouchState: (state: Partial<TouchState>) => void;
  
  // Resize
  setResizeState: (state: Partial<ResizeState>) => void;
  
  // Clipboard
  copyToClipboard: (elements: CanvasElement[]) => void;
  pasteFromClipboard: (sectionId: string) => void;
  cutToClipboard: (sectionId: string, elementIds: string[]) => void;
  
  // Edicion
  setIsEditing: (isEditing: boolean) => void;
  setEditingElement: (elementId: string | null) => void;
  
  // Utilidades
  getElement: (sectionId: string, elementId: string) => CanvasElement | undefined;
  getSelectedElements: () => CanvasElement[];
  reset: () => void;
}

const defaultConfig: CanvasConfig = {
  gridEnabled: false,
  gridSize: 10,
  snapToGrid: false,
  snapToElements: true,
  showRulers: false,
  showGuides: true,
  zoomLevel: 100,
  panOffset: { x: 0, y: 0 },
};

const defaultColorEditor: ColorEditorState = {
  activeColor: '#000000',
  colorHistory: [],
  palettes: [
    {
      id: 'default',
      name: 'Colores Base',
      colors: [
        { id: '1', hex: '#000000', name: 'Negro', isLocked: false },
        { id: '2', hex: '#ffffff', name: 'Blanco', isLocked: false },
        { id: '3', hex: '#ef4444', name: 'Rojo', isLocked: false },
        { id: '4', hex: '#f97316', name: 'Naranja', isLocked: false },
        { id: '5', hex: '#eab308', name: 'Amarillo', isLocked: false },
        { id: '6', hex: '#22c55e', name: 'Verde', isLocked: false },
        { id: '7', hex: '#3b82f6', name: 'Azul', isLocked: false },
        { id: '8', hex: '#8b5cf6', name: 'Violeta', isLocked: false },
      ],
      isDefault: true,
      createdAt: new Date().toISOString(),
    },
  ],
  activePaletteId: 'default',
  showPicker: false,
  pickerMode: 'hex',
};

const defaultSelection: SelectionState = {
  selectedIds: [],
  isMultiSelect: false,
};

const defaultTouch: TouchState = {
  isTouching: false,
  touchPoints: [],
  gesture: null,
  initialDistance: 0,
  initialAngle: 0,
};

const defaultResize: ResizeState = {
  isResizing: false,
  activeHandle: null,
  startPosition: { x: 0, y: 0 },
  startSize: { width: 0, height: 0 },
  startRotation: 0,
  aspectRatioLocked: false,
};

export const useCanvasStore = create<CanvasStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      sections: [],
      activeSectionId: null,
      selection: defaultSelection,
      history: [],
      historyIndex: -1,
      config: defaultConfig,
      colorEditor: defaultColorEditor,
      touch: defaultTouch,
      resize: defaultResize,
      clipboard: [],
      isEditing: false,
      editingElementId: null,

      // Acciones de secciones
      addSection: (section) => {
        set((state) => ({
          sections: [...state.sections, section],
          activeSectionId: section.id,
        }));
        get().addToHistory('add');
      },

      updateSection: (id, updates) => {
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      deleteSection: (id) => {
        set((state) => ({
          sections: state.sections.filter((s) => s.id !== id),
          activeSectionId:
            state.activeSectionId === id ? null : state.activeSectionId,
        }));
        get().addToHistory('delete');
      },

      setActiveSection: (id) => {
        set({ activeSectionId: id });
      },

      // Acciones de elementos
      addElement: (sectionId, element) => {
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === sectionId
              ? { ...s, elements: [...s.elements, element] }
              : s
          ),
        }));
        get().addToHistory('add');
      },

      updateElement: (sectionId, elementId, updates) => {
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === sectionId
              ? {
                  ...s,
                  elements: s.elements.map((el) =>
                    el.id === elementId
                      ? { ...el, ...updates, updatedAt: new Date().toISOString() }
                      : el
                  ),
                }
              : s
          ),
        }));
      },

      deleteElement: (sectionId, elementId) => {
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === sectionId
              ? { ...s, elements: s.elements.filter((el) => el.id !== elementId) }
              : s
          ),
          selection: {
            ...state.selection,
            selectedIds: state.selection.selectedIds.filter((id) => id !== elementId),
          },
        }));
        get().addToHistory('delete');
      },

      duplicateElement: (sectionId, elementId) => {
        const state = get();
        const section = state.sections.find((s) => s.id === sectionId);
        const element = section?.elements.find((el) => el.id === elementId);

        if (element) {
          const newElement = {
            ...element,
            id: `${element.id}-copy-${Date.now()}`,
            name: `${element.name} (Copia)`,
            transform: {
              ...element.transform,
              position: {
                x: element.transform.position.x + 20,
                y: element.transform.position.y + 20,
              },
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          get().addElement(sectionId, newElement as CanvasElement);
        }
      },

      // Transformaciones
      moveElement: (sectionId, elementId, position) => {
        get().setElementTransform(sectionId, elementId, { position });
      },

      resizeElement: (sectionId, elementId, size) => {
        get().setElementTransform(sectionId, elementId, { size });
      },

      rotateElement: (sectionId, elementId, rotation) => {
        get().setElementTransform(sectionId, elementId, { rotation });
      },

      setElementTransform: (sectionId, elementId, transform) => {
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === sectionId
              ? {
                  ...s,
                  elements: s.elements.map((el) =>
                    el.id === elementId
                      ? {
                          ...el,
                          transform: { ...el.transform, ...transform },
                          updatedAt: new Date().toISOString(),
                        }
                      : el
                  ),
                }
              : s
          ),
        }));
      },

      // Seleccion
      selectElement: (elementId, addToSelection = false) => {
        set((state) => ({
          selection: {
            ...state.selection,
            selectedIds: addToSelection
              ? [...state.selection.selectedIds, elementId]
              : [elementId],
            isMultiSelect: addToSelection,
          },
        }));
      },

      deselectElement: (elementId) => {
        set((state) => ({
          selection: {
            ...state.selection,
            selectedIds: state.selection.selectedIds.filter((id) => id !== elementId),
          },
        }));
      },

      clearSelection: () => {
        set({ selection: defaultSelection });
      },

      selectAll: (sectionId) => {
        const section = get().sections.find((s) => s.id === sectionId);
        if (section) {
          set({
            selection: {
              selectedIds: section.elements.map((el) => el.id),
              isMultiSelect: true,
            },
          });
        }
      },

      // Orden Z
      bringToFront: (sectionId, elementId) => {
        set((state) => {
          const section = state.sections.find((s) => s.id === sectionId);
          if (!section) return state;

          const maxZ = Math.max(...section.elements.map((el) => el.transform.zIndex));

          return {
            sections: state.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    elements: s.elements.map((el) =>
                      el.id === elementId
                        ? { ...el, transform: { ...el.transform, zIndex: maxZ + 1 } }
                        : el
                    ),
                  }
                : s
            ),
          };
        });
        get().addToHistory('reorder');
      },

      sendToBack: (sectionId, elementId) => {
        set((state) => {
          const section = state.sections.find((s) => s.id === sectionId);
          if (!section) return state;

          const minZ = Math.min(...section.elements.map((el) => el.transform.zIndex));

          return {
            sections: state.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    elements: s.elements.map((el) =>
                      el.id === elementId
                        ? { ...el, transform: { ...el.transform, zIndex: minZ - 1 } }
                        : el
                    ),
                  }
                : s
            ),
          };
        });
        get().addToHistory('reorder');
      },

      bringForward: (sectionId, elementId) => {
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === sectionId
              ? {
                  ...s,
                  elements: s.elements.map((el) =>
                    el.id === elementId
                      ? { ...el, transform: { ...el.transform, zIndex: el.transform.zIndex + 1 } }
                      : el
                  ),
                }
              : s
          ),
        }));
        get().addToHistory('reorder');
      },

      sendBackward: (sectionId, elementId) => {
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === sectionId
              ? {
                  ...s,
                  elements: s.elements.map((el) =>
                    el.id === elementId
                      ? { ...el, transform: { ...el.transform, zIndex: el.transform.zIndex - 1 } }
                      : el
                  ),
                }
              : s
          ),
        }));
        get().addToHistory('reorder');
      },

      // Agrupacion
      groupElements: (sectionId, elementIds) => {
        set((state) => {
          const section = state.sections.find((s) => s.id === sectionId);
          if (!section) return state;

          const elementsToGroup = section.elements.filter((el) =>
            elementIds.includes(el.id)
          );
          const otherElements = section.elements.filter(
            (el) => !elementIds.includes(el.id)
          );

          // Calcular bounds
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          elementsToGroup.forEach((el) => {
            minX = Math.min(minX, el.transform.position.x);
            minY = Math.min(minY, el.transform.position.y);
            maxX = Math.max(maxX, el.transform.position.x + el.transform.size.width);
            maxY = Math.max(maxY, el.transform.position.y + el.transform.size.height);
          });

          const groupElement: CanvasElement = {
            id: `group-${Date.now()}`,
            type: 'group',
            name: 'Grupo',
            children: elementsToGroup,
            transform: {
              position: { x: minX, y: minY },
              size: { width: maxX - minX, height: maxY - minY },
              rotation: 0,
              scaleX: 1,
              scaleY: 1,
              opacity: 1,
              zIndex: Math.max(...elementsToGroup.map((el) => el.transform.zIndex)),
            },
            locked: false,
            visible: true,
            selectable: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as CanvasElement;

          return {
            sections: state.sections.map((s) =>
              s.id === sectionId
                ? { ...s, elements: [...otherElements, groupElement] }
                : s
            ),
            selection: { selectedIds: [groupElement.id], isMultiSelect: false },
          };
        });
        get().addToHistory('group');
      },

      ungroupElements: (sectionId, groupId) => {
        set((state) => {
          const section = state.sections.find((s) => s.id === sectionId);
          if (!section) return state;

          const group = section.elements.find((el) => el.id === groupId);
          if (!group || group.type !== 'group') return state;

          const otherElements = section.elements.filter((el) => el.id !== groupId);
          const children = (group as any).children || [];

          return {
            sections: state.sections.map((s) =>
              s.id === sectionId
                ? { ...s, elements: [...otherElements, ...children] }
                : s
            ),
            selection: { selectedIds: children.map((c: CanvasElement) => c.id), isMultiSelect: true },
          };
        });
        get().addToHistory('ungroup');
      },

      // Historial
      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          const entry = history[historyIndex - 1];
          set((state) => {
            const section = state.sections.find((s) => s.id === state.activeSectionId);
            if (section) {
              return {
                sections: state.sections.map((s) =>
                  s.id === state.activeSectionId
                    ? { ...s, elements: entry.previousState }
                    : s
                ),
                historyIndex: state.historyIndex - 1,
              };
            }
            return { historyIndex: state.historyIndex - 1 };
          });
        }
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
          const entry = history[historyIndex + 1];
          set((state) => {
            const section = state.sections.find((s) => s.id === state.activeSectionId);
            if (section) {
              return {
                sections: state.sections.map((s) =>
                  s.id === state.activeSectionId
                    ? { ...s, elements: entry.currentState }
                    : s
                ),
                historyIndex: state.historyIndex + 1,
              };
            }
            return { historyIndex: state.historyIndex + 1 };
          });
        }
      },

      addToHistory: (action) => {
        const state = get();
        const section = state.sections.find((s) => s.id === state.activeSectionId);
        if (!section) return;

        const entry: HistoryEntry = {
          id: `history-${Date.now()}`,
          action,
          timestamp: Date.now(),
          previousState: state.history[state.historyIndex]?.currentState || [],
          currentState: [...section.elements],
        };

        set((s) => ({
          history: [...s.history.slice(0, s.historyIndex + 1), entry],
          historyIndex: s.historyIndex + 1,
        }));
      },

      // Configuracion
      setConfig: (config) => {
        set((state) => ({
          config: { ...state.config, ...config },
        }));
      },

      toggleGrid: () => {
        set((state) => ({
          config: { ...state.config, gridEnabled: !state.config.gridEnabled },
        }));
      },

      setZoom: (zoom) => {
        set((state) => ({
          config: { ...state.config, zoomLevel: Math.max(10, Math.min(400, zoom)) },
        }));
      },

      setPan: (offset) => {
        set((state) => ({
          config: { ...state.config, panOffset: offset },
        }));
      },

      // Colores
      setActiveColor: (color) => {
        set((state) => ({
          colorEditor: { ...state.colorEditor, activeColor: color },
        }));
        get().addColorToHistory(color);
      },

      addColorToHistory: (color) => {
        set((state) => {
          const history = state.colorEditor.colorHistory.filter((c) => c !== color);
          return {
            colorEditor: {
              ...state.colorEditor,
              colorHistory: [color, ...history].slice(0, 20),
            },
          };
        });
      },

      addPalette: (palette) => {
        set((state) => ({
          colorEditor: {
            ...state.colorEditor,
            palettes: [...state.colorEditor.palettes, palette],
          },
        }));
      },

      setActivePalette: (id) => {
        set((state) => ({
          colorEditor: { ...state.colorEditor, activePaletteId: id },
        }));
      },

      updatePalette: (id, updates) => {
        set((state) => ({
          colorEditor: {
            ...state.colorEditor,
            palettes: state.colorEditor.palettes.map((p) =>
              p.id === id ? { ...p, ...updates } : p
            ),
          },
        }));
      },

      // Touch
      setTouchState: (touchState) => {
        set((state) => ({
          touch: { ...state.touch, ...touchState },
        }));
      },

      // Resize
      setResizeState: (resizeState) => {
        set((state) => ({
          resize: { ...state.resize, ...resizeState },
        }));
      },

      // Clipboard
      copyToClipboard: (elements) => {
        set({ clipboard: elements.map((el) => ({ ...el })) });
      },

      pasteFromClipboard: (sectionId) => {
        const { clipboard } = get();
        clipboard.forEach((el, index) => {
          const newElement = {
            ...el,
            id: `${el.id}-paste-${Date.now()}-${index}`,
            transform: {
              ...el.transform,
              position: {
                x: el.transform.position.x + 20,
                y: el.transform.position.y + 20,
              },
            },
          };
          get().addElement(sectionId, newElement as CanvasElement);
        });
      },

      cutToClipboard: (sectionId, elementIds) => {
        const section = get().sections.find((s) => s.id === sectionId);
        if (section) {
          const elements = section.elements.filter((el) => elementIds.includes(el.id));
          get().copyToClipboard(elements);
          elementIds.forEach((id) => get().deleteElement(sectionId, id));
        }
      },

      // Edicion
      setIsEditing: (isEditing) => {
        set({ isEditing });
      },

      setEditingElement: (elementId) => {
        set({ editingElementId: elementId });
      },

      // Utilidades
      getElement: (sectionId, elementId) => {
        const section = get().sections.find((s) => s.id === sectionId);
        return section?.elements.find((el) => el.id === elementId);
      },

      getSelectedElements: () => {
        const { sections, activeSectionId, selection } = get();
        const section = sections.find((s) => s.id === activeSectionId);
        if (!section) return [];
        return section.elements.filter((el) => selection.selectedIds.includes(el.id));
      },

      reset: () => {
        set({
          sections: [],
          activeSectionId: null,
          selection: defaultSelection,
          history: [],
          historyIndex: -1,
          config: defaultConfig,
          colorEditor: defaultColorEditor,
          touch: defaultTouch,
          resize: defaultResize,
          clipboard: [],
          isEditing: false,
          editingElementId: null,
        });
      },
    }),
    {
      name: 'canvas-storage',
      partialize: (state) => ({
        sections: state.sections,
        config: state.config,
        colorEditor: {
          palettes: state.colorEditor.palettes,
          colorHistory: state.colorEditor.colorHistory,
        },
      }),
    }
  )
);
