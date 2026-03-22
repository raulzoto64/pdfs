import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Section, EditorState } from '../types/pdfCreator';

interface EditorStore extends EditorState {
  // Actions
  setSections: (sections: Section[]) => void;
  addSection: (section: Section) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  deleteSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  setSelectedSection: (id: string | null) => void;
  setIsEditing: (isEditing: boolean) => void;
  setShowGrid: (showGrid: boolean) => void;
  setZoomLevel: (zoomLevel: number) => void;
  setSelectedElement: (elementPath: string | null) => void;
  resetEditor: () => void;
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
      // State
      sections: [],
      selectedSectionId: null,
      isEditing: false,
      showGrid: false,
      zoomLevel: 100,
      selectedElement: null,

      // Actions
      setSections: (sections) => set({ sections }),
      
      addSection: (section) => 
        set((state) => ({
          sections: [...state.sections, section],
          selectedSectionId: section.id
        })),

      updateSection: (id, updates) => 
        set((state) => ({
          sections: state.sections.map(section =>
            section.id === id ? { ...section, ...updates } : section
          )
        })),

      deleteSection: (id) => 
        set((state) => ({
          sections: state.sections.filter(section => section.id !== id),
          selectedSectionId: state.selectedSectionId === id ? null : state.selectedSectionId
        })),

      duplicateSection: (id) => 
        set((state) => {
          const sectionToDuplicate = state.sections.find(s => s.id === id);
          if (!sectionToDuplicate) return state;

          const duplicatedSection: Section = {
            ...sectionToDuplicate,
            id: `${sectionToDuplicate.id}-copy-${Date.now()}`,
            name: `${sectionToDuplicate.name} (Copia)`,
            createdAt: new Date().toISOString()
          };

          const index = state.sections.findIndex(s => s.id === id);
          const newSections = [...state.sections];
          newSections.splice(index + 1, 0, duplicatedSection);

          return {
            sections: newSections,
            selectedSectionId: duplicatedSection.id
          };
        }),

      reorderSections: (fromIndex, toIndex) => 
        set((state) => {
          const newSections = [...state.sections];
          const [movedSection] = newSections.splice(fromIndex, 1);
          newSections.splice(toIndex, 0, movedSection);

          return { sections: newSections };
        }),

      setSelectedSection: (id) => set({ selectedSectionId: id }),
      
      setIsEditing: (isEditing) => set({ isEditing }),
      
      setShowGrid: (showGrid) => set({ showGrid }),
      
      setZoomLevel: (zoomLevel) => set({ zoomLevel: Math.max(50, Math.min(200, zoomLevel)) }),
      
      setSelectedElement: (elementPath) => set({ selectedElement: elementPath }),
      
      resetEditor: () => set({
        sections: [],
        selectedSectionId: null,
        isEditing: false,
        showGrid: false,
        zoomLevel: 100,
        selectedElement: null
      })
    }),
    {
      name: 'editor-storage',
      partialize: (state) => ({
        sections: state.sections,
        showGrid: state.showGrid,
        zoomLevel: state.zoomLevel
      })
    }
  )
);

// Store para autenticación
interface AuthStore {
  user: {
    id: string;
    email: string;
    name?: string;
  } | null;
  isAuthenticated: boolean;
  login: (user: any) => void;
  logout: () => void;
  setUser: (user: any) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  setUser: (user) => set({ user })
}));

// Store para documentos
interface DocumentStore {
  documents: any[];
  selectedDocument: any | null;
  addDocument: (document: any) => void;
  updateDocument: (id: string, updates: any) => void;
  deleteDocument: (id: string) => void;
  setSelectedDocument: (document: any | null) => void;
  loadDocuments: (documents: any[]) => void;
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  documents: [],
  selectedDocument: null,
  addDocument: (document) => set((state) => ({ documents: [...state.documents, document] })),
  updateDocument: (id, updates) => set((state) => ({
    documents: state.documents.map(doc => doc.id === id ? { ...doc, ...updates } : doc)
  })),
  deleteDocument: (id) => set((state) => ({
    documents: state.documents.filter(doc => doc.id !== id)
  })),
  setSelectedDocument: (document) => set({ selectedDocument: document }),
  loadDocuments: (documents) => set({ documents })
}));