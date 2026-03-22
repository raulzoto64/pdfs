import { useState, useCallback } from "react";
import { Box, useTheme } from "@mui/material";
import { EditorCanvas } from "./EditorCanvas";
import { AIContentGenerator } from "../AI/AIContentGenerator";
import { CommunityGallery } from "../Community/CommunityGallery";
import { useEditorStore } from "../../store/editorStore";
import { Section } from "../../types/pdfCreator";

interface AdvancedEditorProps {
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
  onSectionUpdate: (index: number, updatedSection: Section) => void;
  onSectionDelete: (index: number) => void;
  onSectionDuplicate: (index: number) => void;
  onSectionReorder: (fromIndex: number, toIndex: number) => void;
  currentUser?: {
    id: string;
    isAdmin: boolean;
  };
}

export function AdvancedEditor({
  sections,
  onSectionsChange,
  onSectionUpdate,
  onSectionDelete,
  onSectionDuplicate,
  onSectionReorder,
  currentUser
}: AdvancedEditorProps) {
  const theme = useTheme();
  const [showAI, setShowAI] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [selectedSectionForAI, setSelectedSectionForAI] = useState<Section | null>(null);

  // Zustand stores
  const {
    showGrid,
    zoomLevel
  } = useEditorStore();

  // Manejadores de eventos
  const handleSectionUpdate = useCallback((index: number, updatedSection: Section) => {
    onSectionUpdate(index, updatedSection);
  }, [onSectionUpdate]);

  const handleSectionDelete = useCallback((index: number) => {
    onSectionDelete(index);
  }, [onSectionDelete]);

  const handleSectionDuplicate = useCallback((index: number) => {
    onSectionDuplicate(index);
  }, [onSectionDuplicate]);

  const handleSectionReorder = useCallback((fromIndex: number, toIndex: number) => {
    onSectionReorder(fromIndex, toIndex);
  }, [onSectionReorder]);

  const handleDuplicateFromCommunity = useCallback((communitySection: any) => {
    // Convertir sección de comunidad a sección editable
    const newSection: Section = {
      id: `${communitySection.id}-community-${Date.now()}`,
      name: `${communitySection.title} (Copia)`,
      description: communitySection.description || "",
      category: communitySection.category || "",
      content: {
        type: communitySection.category,
        editable: communitySection.content?.editable || {},
        style: communitySection.content?.style || {}
      },
      author: communitySection.author || "Comunidad",
      isPublic: false,
      createdAt: new Date().toISOString()
    };

    // Añadir al final de las secciones
    onSectionsChange([...sections, newSection]);
    setShowCommunity(false);
  }, [sections, onSectionsChange]);

  const handleLikeCommunitySection = useCallback((sectionId: string) => {
    // Implementar lógica de "me gusta"
    console.log("Like section:", sectionId);
  }, []);

  const handleDownloadCommunitySection = useCallback((sectionId: string) => {
    // Implementar lógica de descarga
    console.log("Download section:", sectionId);
  }, []);

  const handleModerateSection = useCallback((sectionId: string, action: 'approve' | 'reject') => {
    // Implementar lógica de moderación
    console.log("Moderate section:", sectionId, action);
  }, []);

  const handleCloseAI = useCallback(() => {
    setShowAI(false);
    setSelectedSectionForAI(null);
  }, []);


  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
        overflow: "hidden"
      }}
    >
      {/* Editor Canvas Principal */}
      <EditorCanvas
        sections={sections}
        onSectionUpdate={handleSectionUpdate}
        onSectionDelete={handleSectionDelete}
        onSectionDuplicate={handleSectionDuplicate}
        onSectionReorder={handleSectionReorder}
      />

      {/* Generador IA */}
      <AIContentGenerator
        section={selectedSectionForAI}
        onContentUpdate={(content) => {
          if (selectedSectionForAI) {
            const sectionIndex = sections.findIndex(s => s.id === selectedSectionForAI.id);
            if (sectionIndex !== -1) {
              const updatedSection = {
                ...sections[sectionIndex],
                content: { ...sections[sectionIndex].content, ...content }
              };
              handleSectionUpdate(sectionIndex, updatedSection);
            }
          }
        }}
        isOpen={showAI}
        onClose={handleCloseAI}
      />

      {/* Galería de Comunidad */}
      <CommunityGallery
        sections={[]} // Mock data - en producción vendría de la API
        onDuplicateSection={handleDuplicateFromCommunity}
        onLikeSection={handleLikeCommunitySection}
        onDownloadSection={handleDownloadCommunitySection}
        currentUser={currentUser}
        onModerateSection={handleModerateSection}
      />

      {/* Controles de Zoom y Grid Globales */}
      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          zIndex: 1500,
        }}
      >
        {/* Botón de IA */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            bgcolor: "white",
            borderRadius: 2,
            p: 1,
            boxShadow: 3,
            border: "1px solid #e0e0e0",
          }}
        >
          <Box
            component="button"
            onClick={() => setShowAI(!showAI)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1,
              bgcolor: showAI ? "#e8ff99" : "transparent",
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              cursor: "pointer",
              transition: "all 0.3s",
              "&:hover": {
                bgcolor: showAI ? "#d4e78a" : "#f5f5f5"
              }
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>🤖</span>
            <span>IA</span>
          </Box>

          {/* Botón de Comunidad */}
          <Box
            component="button"
            onClick={() => setShowCommunity(!showCommunity)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1,
              bgcolor: showCommunity ? "#e8ff99" : "transparent",
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              cursor: "pointer",
              transition: "all 0.3s",
              "&:hover": {
                bgcolor: showCommunity ? "#d4e78a" : "#f5f5f5"
              }
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>👥</span>
            <span>Comunidad</span>
          </Box>
        </Box>

        {/* Indicadores de estado */}
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            p: 1,
            boxShadow: 3,
            border: "1px solid #e0e0e0",
            minWidth: 120,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <span style={{ fontSize: "0.75rem", color: "#666" }}>Zoom:</span>
            <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>{zoomLevel}%</span>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.75rem", color: "#666" }}>Grid:</span>
            <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>{showGrid ? "ON" : "OFF"}</span>
          </Box>
        </Box>
      </Box>

      {/* Overlay cuando está abierto el AI o Comunidad */}
      {(showAI || showCommunity) && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1400,
            backdropFilter: "blur(2px)",
          }}
          onClick={() => {
            setShowAI(false);
            setShowCommunity(false);
          }}
        />
      )}
    </Box>
  );
}