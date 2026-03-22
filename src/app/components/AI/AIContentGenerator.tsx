import { useState } from "react";
import { Box, Paper, Typography, TextField, Button, Chip, IconButton, Divider, CircularProgress } from "@mui/material";
import { 
  Psychology, 
  Send, 
  Clear, 
  Image, 
  TextFields, 
  ColorLens,
  Refresh,
  Close
} from "@mui/icons-material";
import { ChromePicker } from "react-color";

interface AIContentGeneratorProps {
  section: any;
  onContentUpdate: (content: any) => void;
  onImageUpdate?: (imageUrl: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface AIRequest {
  type: 'text' | 'color' | 'image' | 'layout';
  prompt: string;
  field?: string;
  currentContent?: any;
}

interface AIResponse {
  success: boolean;
  content?: any;
  message?: string;
  error?: string;
}

export function AIContentGenerator({ 
  section, 
  onContentUpdate, 
  onImageUpdate, 
  isOpen, 
  onClose 
}: AIContentGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [requestType, setRequestType] = useState<'text' | 'color' | 'image' | 'layout'>('text');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState("#000000");
  const [history, setHistory] = useState<AIRequest[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    const request: AIRequest = {
      type: requestType,
      prompt,
      field: section.content?.type,
      currentContent: section.content
    };

    try {
      // Simulación de llamada a IA (en producción usarías Gemini API)
      const response = await simulateAIRequest(request);
      
      if (response.success) {
        setGeneratedContent(response.content);
        setHistory((prev: AIRequest[]) => [...prev, request]);
        
        // Aplicar cambios automáticamente según el tipo de solicitud
        if (requestType === 'text') {
          onContentUpdate({
            ...section.content,
            editable: {
              ...section.content.editable,
              ...response.content
            }
          });
        } else if (requestType === 'color') {
          onContentUpdate({
            ...section.content,
            style: {
              ...section.content.style,
              backgroundColor: response.content.color
            }
          });
        } else if (requestType === 'image') {
          onImageUpdate?.(response.content.imageUrl);
        }
      }
    } catch (error) {
      console.error("Error generando contenido:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const simulateAIRequest = async (request: AIRequest): Promise<AIResponse> => {
    // Simulación de delay de IA
    await new Promise(resolve => setTimeout(resolve, 1500));

    switch (request.type) {
      case 'text':
        return {
          success: true,
          content: {
            title: `Título generado: ${request.prompt}`,
            description: `Descripción generada basada en: ${request.prompt}`,
            subtitle: `Subtítulo IA: ${request.prompt}`
          }
        };
      
      case 'color':
        const colors = ["#1c5d15", "#2e7d32", "#4caf50", "#81c784", "#c8e6c9"];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        return {
          success: true,
          content: {
            color: randomColor,
            complementary: getComplementaryColor(randomColor)
          }
        };

      case 'image':
        return {
          success: true,
          content: {
            imageUrl: `https://picsum.photos/800/600?random=${Math.random()}`
          }
        };

      case 'layout':
        return {
          success: true,
          content: {
            layout: 'grid',
            columns: 3,
            spacing: 2
          }
        };

      default:
        return {
          success: false,
          error: "Tipo de solicitud no soportado"
        };
    }
  };

  const getComplementaryColor = (color: string) => {
    // Lógica simple para obtener color complementario
    return color === "#1c5d15" ? "#f7b500" : "#1c5d15";
  };

  const handleColorChange = (color: any) => {
    setCurrentColor(color.hex);
    onContentUpdate({
      ...section.content,
      style: {
        ...section.content.style,
        color: color.hex
      }
    });
  };

  const clearGeneratedContent = () => {
    setGeneratedContent(null);
    setPrompt("");
  };

  if (!isOpen || !section) return null;

  return (
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 3000,
        width: 400,
        bgcolor: "white",
        borderRadius: 2,
        p: 2,
        boxShadow: 6,
        border: "1px solid #e0e0e0",
        maxHeight: "60vh",
        overflow: "auto",
      }}
    >
      {/* Encabezado */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Psychology color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Generador IA
          </Typography>
          <Chip 
            label={section.name || "Sección"} 
            size="small" 
            variant="outlined"
          />
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Selector de tipo de generación */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Tipo de Generación
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            startIcon={<TextFields />}
            variant={requestType === 'text' ? "contained" : "outlined"}
            size="small"
            onClick={() => setRequestType('text')}
          >
            Texto
          </Button>
          <Button
            startIcon={<ColorLens />}
            variant={requestType === 'color' ? "contained" : "outlined"}
            size="small"
            onClick={() => setRequestType('color')}
          >
            Color
          </Button>
          <Button
            startIcon={<Image />}
            variant={requestType === 'image' ? "contained" : "outlined"}
            size="small"
            onClick={() => setRequestType('image')}
          >
            Imagen
          </Button>
          <Button
            startIcon={<Refresh />}
            variant={requestType === 'layout' ? "contained" : "outlined"}
            size="small"
            onClick={() => setRequestType('layout')}
          >
            Layout
          </Button>
        </Box>
      </Box>

      {/* Input de prompt */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Describe lo que deseas generar..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          multiline
          rows={3}
          size="small"
          placeholder="Ejemplo: Un título impactante para una sección de servicios..."
        />
      </Box>

      {/* Controles de generación */}
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <Button
          startIcon={<Send />}
          variant="contained"
          color="primary"
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          fullWidth
        >
          {isGenerating ? <CircularProgress size={20} /> : "Generar"}
        </Button>
        <Button
          startIcon={<Clear />}
          variant="outlined"
          onClick={clearGeneratedContent}
          disabled={isGenerating}
        >
          Limpiar
        </Button>
      </Box>

      {/* Contenido generado */}
      {generatedContent && (
        <Box sx={{ mb: 2, p: 2, bgcolor: "#f8f9fa", borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Contenido Generado
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {Object.entries(generatedContent).map(([key, value]) => (
              <Chip
                key={key}
                label={`${key}: ${value}`}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Selector de color */}
      {requestType === 'color' && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Selector de Color
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <IconButton onClick={() => setShowColorPicker(!showColorPicker)}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  bgcolor: currentColor,
                  border: "1px solid #ccc"
                }}
              />
            </IconButton>
            <Typography variant="body2">
              Color actual: {currentColor}
            </Typography>
          </Box>
          {showColorPicker && (
            <Box sx={{ mt: 1 }}>
              <ChromePicker color={currentColor} onChange={handleColorChange} />
            </Box>
          )}
        </Box>
      )}

      {/* Historial */}
      {history.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Historial
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {history.map((item: AIRequest, index: number) => (
              <Chip
                key={index}
                label={`${item.type}: ${item.prompt.substring(0, 20)}...`}
                size="small"
                variant="outlined"
                color="primary"
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Mensaje de ayuda */}
      <Box sx={{ mt: 2, p: 1, bgcolor: "#e8f5e9", borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Consejo: Sé específico en tu descripción para obtener mejores resultados
        </Typography>
      </Box>
    </Paper>
  );
}