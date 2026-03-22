import React, { useState } from "react";
import {
  Box,
  Paper,
  IconButton,
  Popover,
  TextField,
  MenuItem,
  Typography,
  Tooltip,
} from "@mui/material";
import { ChromePicker } from "react-color";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteIcon from "@mui/icons-material/Delete";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import PsychologyIcon from "@mui/icons-material/Psychology";
import type { Section } from "../types/pdfCreator";

interface EditableSectionProps {
  section: Section;
  index: number;
  onUpdate: (index: number, updatedSection: Section) => void;
  onDelete: (index: number) => void;
  onGenerateAI?: (section: Section) => void;
  dragHandleProps?: any;
  onSaveToDatabase?: (section: Section) => Promise<void>;
}

const FONTS = [
  "Poppins",
  "Roboto",
  "Arial",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Helvetica",
];

export function EditableSection({
  section,
  index,
  onUpdate,
  onDelete,
  onGenerateAI,
  dragHandleProps,
}: EditableSectionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLElement | null>(null);
  const [activeColor, setActiveColor] = useState("#000000");
  const [activeColorPath, setActiveColorPath] = useState<string[]>([]);

  const updateContent = (path: string[], value: any) => {
    const newContent = JSON.parse(JSON.stringify(section.content));
    let current = newContent.editable;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    const lastKey = path[path.length - 1];
    if (typeof current[lastKey] === "object" && current[lastKey] !== null) {
      current[lastKey] = { ...current[lastKey], ...value };
    } else {
      current[lastKey] = value;
    }

    onUpdate(index, { ...section, content: newContent });
  };

  const asArray = (value: any) => (Array.isArray(value) ? value : []);
  const getIcon = (value: any, fallback = "•") =>
    value && typeof value === "object" && "icon" in value ? value.icon || fallback : fallback;
  const getBorderColor = (value: any, fallback = "#abc685") =>
    value && typeof value === "object" && "borderColor" in value ? value.borderColor || fallback : fallback;

  const handleColorChange = (color: any) => {
    setActiveColor(color.hex);
    updateContent(activeColorPath, { color: color.hex });
  };

  const openColorPicker = (event: React.MouseEvent<HTMLElement>, path: string[]) => {
    setColorPickerAnchor(event.currentTarget);
    setActiveColorPath(path);
    // Get current color
    let current = section.content.editable;
    for (const key of path) {
      current = current[key];
    }
    setActiveColor(current.color || "#000000");
  };

  const renderEditableText = (
    text: any,
    path: string[],
    placeholder = "Texto editable..."
  ) => {
    const isSelected = selectedElement === path.join(".");
    
    // Si text es undefined o null, usar valores por defecto
    const textData = text || {
      text: "",
      fontSize: 16,
      fontWeight: 400,
      color: "#000000",
      fontFamily: "Poppins",
      lineHeight: 1.5
    };
    
    return (
      <Box
        sx={{
          position: "relative",
          display: "inline-block",
          width: "100%",
        }}
        onClick={() => setSelectedElement(path.join("."))}
      >
        <Box
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => updateContent(path, { text: e.currentTarget.textContent })}
          sx={{
            fontSize: `${textData.fontSize || 16}px`,
            fontWeight: textData.fontWeight || 400,
            color: textData.color || "#000000",
            fontFamily: textData.fontFamily || "Poppins",
            lineHeight: textData.lineHeight || 1.5,
            outline: isSelected ? "2px solid #1c5d15" : "none",
            padding: isSelected ? "8px" : "0",
            borderRadius: "4px",
            cursor: "text",
            minHeight: "1em",
            "&:hover": {
              outline: !isSelected ? "1px dashed #1c5d15" : undefined,
            },
          }}
        >
          {textData.text || placeholder}
        </Box>

        {/* Toolbar flotante */}
        {isSelected && (
          <Paper
            elevation={8}
            sx={{
              position: "absolute",
              top: -60,
              left: 0,
              zIndex: 1000,
              p: 1,
              display: "flex",
              gap: 1,
              alignItems: "center",
              bgcolor: "white",
              borderRadius: 2,
            }}
          >
            {/* Font Size */}
            <TextField
              select
              size="small"
              value={textData.fontSize || 16}
              onChange={(e) => updateContent(path, { fontSize: parseInt(e.target.value) })}
              sx={{ width: 80 }}
            >
              {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64].map((size) => (
                <MenuItem key={size} value={size}>
                  {size}px
                </MenuItem>
              ))}
            </TextField>

            {/* Font Family */}
            <TextField
              select
              size="small"
              value={textData.fontFamily || "Poppins"}
              onChange={(e) => updateContent(path, { fontFamily: e.target.value })}
              sx={{ width: 120 }}
            >
              {FONTS.map((font) => (
                <MenuItem key={font} value={font}>
                  {font}
                </MenuItem>
              ))}
            </TextField>

            {/* Bold */}
            <Tooltip title="Negrita">
              <IconButton
                size="small"
                onClick={() =>
                  updateContent(path, {
                    fontWeight: textData.fontWeight === 700 ? 400 : 700,
                  })
                }
                sx={{
                  bgcolor: textData.fontWeight === 700 ? "#e8ff99" : "transparent",
                }}
              >
                <FormatBoldIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Color */}
            <Tooltip title="Color">
              <IconButton
                size="small"
                onClick={(e) => openColorPicker(e, [...path, "color"])}
              >
                <FormatColorTextIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Paper>
        )}
      </Box>
    );
  };

  const renderSectionContent = () => {
    const { type, editable, style } = section.content || {};
    const editableData = editable || {};

    switch (type) {
      case "ai-layout-split":
        return (
          <Box
            sx={{
              background: style?.background || "#f4f4f4",
              padding: style?.padding || "56px",
              borderRadius: style?.borderRadius || "28px",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1.4fr 1fr" },
                gap: 4,
                alignItems: "stretch",
              }}
            >
              <Box>
                {renderEditableText(editableData.eyebrow, ["eyebrow"], "Eyebrow")}
                <Box sx={{ mt: 1.5 }}>
                  {renderEditableText(editableData.title, ["title"], "Titulo principal")}
                </Box>
                <Box sx={{ mt: 2 }}>
                  {renderEditableText(editableData.description, ["description"], "Descripcion de la seccion")}
                </Box>
                <Box
                  sx={{
                    mt: 4,
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
                    gap: 2,
                  }}
                >
                  {(editableData.cards || []).map((card: any, idx: number) => (
                    <Box
                      key={idx}
                      sx={{
                        bgcolor: "#ffffff",
                        borderRadius: 2,
                        p: 2.5,
                        boxShadow: "0 12px 30px rgba(23,32,26,0.06)",
                        border: "1px solid rgba(23,32,26,0.08)",
                      }}
                    >
                      {renderEditableText(card.title, ["cards", idx.toString(), "title"], "Producto")}
                      <Box component="ul" sx={{ mt: 2, pl: 2 }}>
                        {(card.bullets || []).map((bullet: any, bulletIdx: number) => (
                          <Box component="li" key={bulletIdx} sx={{ mb: 1 }}>
                            {renderEditableText(
                              bullet,
                              ["cards", idx.toString(), "bullets", bulletIdx.toString()],
                              "Caracteristica"
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box>
                <Box
                  component="img"
                  src={editableData.imageUrl}
                  sx={{
                    width: "100%",
                    height: "100%",
                    minHeight: 360,
                    objectFit: "cover",
                    borderRadius: 3,
                    display: "block",
                  }}
                />
              </Box>
            </Box>
          </Box>
        );

      case "hero":
        return (
          <Box sx={style}>
            {renderEditableText(editableData.title, ["title"])}
            <Box sx={{ mt: 2 }}>
              {renderEditableText(editableData.subtitle, ["subtitle"])}
            </Box>
            <Box sx={{ mt: 2 }}>
              {renderEditableText(editableData.tagline, ["tagline"])}
            </Box>
          </Box>
        );

      case "cards-horizontal":
        return (
          <Box sx={style}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 4,
              }}
            >
              <Box
                sx={{
                  bgcolor: "white",
                  p: 4,
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <Box sx={{ fontSize: "3rem", mb: 2 }}>{editable.card1?.icon || "🚀"}</Box>
                {renderEditableText(editable.card1?.title, ["card1", "title"])}
                <Box sx={{ mt: 2 }}>
                  {renderEditableText(editable.card1?.description, ["card1", "description"])}
                </Box>
              </Box>
              <Box
                sx={{
                  bgcolor: "white",
                  p: 4,
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <Box sx={{ fontSize: "3rem", mb: 2 }}>{editable.card2?.icon || "🌟"}</Box>
                {renderEditableText(editable.card2?.title, ["card2", "title"])}
                <Box sx={{ mt: 2 }}>
                  {renderEditableText(editable.card2?.description, ["card2", "description"])}
                </Box>
              </Box>
            </Box>
          </Box>
        );

      case "grid-4":
        return (
          <Box sx={style}>
            <Box sx={{ mb: 4 }}>
              {renderEditableText(editable.title, ["title"])}
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 4,
              }}
            >
              {asArray(editable.values).map((value: any, idx: number) => (
                <Box
                  key={idx}
                  sx={{
                    textAlign: "center",
                    p: 3,
                    bgcolor: "white",
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  <Box sx={{ fontSize: "3rem", mb: 2 }}>{getIcon(value, "•")}</Box>
                  {renderEditableText(value.name, ["values", idx.toString(), "name"])}
                  <Box sx={{ mt: 1 }}>
                    {renderEditableText(value.description, ["values", idx.toString(), "description"])}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        );

      case "services-grid":
        return (
          <Box sx={style}>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              {renderEditableText(editable.title, ["title"])}
            </Box>
            <Box sx={{ textAlign: "center", mb: 5 }}>
              {renderEditableText(editable.subtitle, ["subtitle"])}
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: 4,
              }}
            >
              {asArray(editable.services).map((service: any, idx: number) => (
                <Box
                  key={idx}
                  sx={{
                    p: 4,
                    bgcolor: "#f8f9fa",
                    borderRadius: 2,
                    transition: "all 0.3s",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  <Box sx={{ fontSize: "3rem", mb: 2 }}>{getIcon(service, "•")}</Box>
                  {renderEditableText(service.name, ["services", idx.toString(), "name"])}
                  <Box sx={{ mt: 2 }}>
                    {renderEditableText(service.description, ["services", idx.toString(), "description"])}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        );

      case "footer-contact":
        return (
          <Box sx={style}>
            {renderEditableText(editable.title, ["title"])}
            <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 1 }}>
              {renderEditableText(editable.email, ["email"])}
              {renderEditableText(editable.phone, ["phone"])}
              {renderEditableText(editable.address, ["address"])}
              {renderEditableText(editable.website, ["website"])}
            </Box>
          </Box>
        );

      case "simple-text":
        return (
          <Box sx={style}>
            {renderEditableText(editable.text, ["text"])}
          </Box>
        );

      case "image-text":
        return (
          <Box sx={style}>
            <Box
              component="img"
              src={editable.imageUrl}
              sx={{
                width: "100%",
                height: "auto",
                borderRadius: 2,
                objectFit: "cover",
              }}
            />
            <Box>
              {renderEditableText(editable.title, ["title"])}
              <Box sx={{ mt: 3 }}>
                {renderEditableText(editable.description, ["description"])}
              </Box>
            </Box>
          </Box>
        );

      case "value-proposition-grid":
        return (
          <Box sx={style}>
            <Box sx={{ textAlign: "center", mb: 5 }}>
              {renderEditableText(editable.title, ["title"])}
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 3,
              }}
            >
              {asArray(editable.values).map((value: any, idx: number) => (
                <Box
                  key={idx}
                  sx={{
                    p: 3,
                    bgcolor: "#1c5d15",
                    borderRadius: 2,
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  <Box sx={{ fontSize: "2.5rem", mb: 1 }}>{getIcon(value, "•")}</Box>
                  {renderEditableText(value.title, ["values", idx.toString(), "title"])}
                  <Box sx={{ mt: 1 }}>
                    {renderEditableText(value.description, ["values", idx.toString(), "description"])}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        );

      case "tech-cards":
        return (
          <Box sx={style}>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              {renderEditableText(editable.title, ["title"])}
            </Box>
            <Box sx={{ textAlign: "center", mb: 5, maxWidth: 700, mx: "auto" }}>
              {renderEditableText(editable.subtitle, ["subtitle"])}
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 3,
              }}
            >
              {asArray(editable.cards).map((card: any, idx: number) => (
                <Box
                  key={idx}
                  sx={{
                    p: 3,
                    bgcolor: "white",
                    borderRadius: 2,
                    borderTop: `4px solid ${card.borderColor}`,
                    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
                  }}
                >
                  <Box sx={{ fontSize: "2rem", mb: 2 }}>{getIcon(card, "•")}</Box>
                  {renderEditableText(card.title, ["cards", idx.toString(), "title"])}
                  <Box component="ul" sx={{ mt: 2, pl: 2 }}>
                    {asArray(card.bullets).map((bullet: string, bIdx: number) => (
                      <Box component="li" key={bIdx} sx={{ mb: 1, fontSize: "0.92rem", color: "#556b55" }}>
                        {bullet}
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        );

      case "products-detailed":
        return (
          <Box sx={style}>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              {renderEditableText(editable.title, ["title"])}
            </Box>
            <Box sx={{ textAlign: "center", mb: 4, maxWidth: 700, mx: "auto" }}>
              {renderEditableText(editable.subtitle, ["subtitle"])}
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 4,
              }}
            >
              {asArray(editable.products).map((product: any, idx: number) => (
                <Box
                  key={idx}
                  sx={{
                    bgcolor: "white",
                    borderRadius: 2,
                    overflow: "hidden",
                    boxShadow: "0 5px 18px rgba(0,0,0,0.08)",
                  }}
                >
                  <Box
                    sx={{
                      background: product.gradient,
                      color: "white",
                      p: 3,
                      textAlign: "center",
                    }}
                  >
                    <Box sx={{ fontSize: "2.5rem", mb: 1 }}>{getIcon(product, "•")}</Box>
                    {renderEditableText(product.name, ["products", idx.toString(), "name"])}
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "inline-block",
                        px: 2,
                        py: 0.5,
                        borderRadius: 20,
                        bgcolor: product.tag.background,
                        mb: 2,
                      }}
                    >
                      {renderEditableText(product.tag, ["products", idx.toString(), "tag"])}
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      {renderEditableText(product.description, ["products", idx.toString(), "description"])}
                    </Box>
                    <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                      {asArray(product.features).map((feature: string, fIdx: number) => (
                        <Box component="li" key={fIdx} sx={{ mb: 1, fontSize: "0.9rem" }}>
                          {feature}
                        </Box>
                      ))}
                    </Box>
                    <Box
                      sx={{
                        bgcolor: "#f0f7ef",
                        p: 1.5,
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Box>{getIcon(product?.stat, "•")}</Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#1c5d15" }}>
                        {product.stat.text}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        );

      case "sectors-grid":
        return (
          <Box sx={style}>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              {renderEditableText(editable.title, ["title"])}
            </Box>
            <Box sx={{ textAlign: "center", mb: 4, maxWidth: 680, mx: "auto" }}>
              {renderEditableText(editable.subtitle, ["subtitle"])}
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 2,
              }}
            >
              {asArray(editable.sectors).map((sector: any, idx: number) => (
                <Box
                  key={idx}
                  sx={{
                    p: 2.5,
                    textAlign: "center",
                    border: "1px solid #e0e0e0",
                    borderRadius: 1.5,
                    bgcolor: "white",
                    transition: "all 0.2s",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <Box sx={{ fontSize: "2rem", mb: 1 }}>{getIcon(sector, "•")}</Box>
                  {renderEditableText(sector.name, ["sectors", idx.toString(), "name"])}
                </Box>
              ))}
            </Box>
          </Box>
        );

      case "transformation-comparison":
        return (
          <Box sx={style}>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              {renderEditableText(editable.title, ["title"])}
            </Box>
            <Box sx={{ textAlign: "center", mb: 4, maxWidth: 700, mx: "auto" }}>
              {renderEditableText(editable.subtitle, ["subtitle"])}
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                gap: 3,
              }}
            >
              {asArray(editable.comparisons).map((comp: any, idx: number) => (
                <Box
                  key={idx}
                  sx={{
                    p: 3,
                    bgcolor: "white",
                    borderRadius: 2,
                    boxShadow: "0 4px 15px rgba(0,0,0,0.07)",
                    borderTop: "4px solid #1c5d15",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Box sx={{ fontSize: "1.5rem" }}>{getIcon(comp, "•")}</Box>
                    {renderEditableText(comp.title, ["comparisons", idx.toString(), "title"])}
                  </Box>
                  
                  {/* Before bar */}
                  <Box sx={{ mb: 1.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="body2" sx={{ color: comp.before.color }}>
                        ❌ {comp.before.label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: comp.before.color }}>
                        {comp.before.value}%
                      </Typography>
                    </Box>
                    <Box sx={{ height: 10, bgcolor: "#f0f0f0", borderRadius: 1, overflow: "hidden" }}>
                      <Box
                        sx={{
                          width: `${comp.before.value}%`,
                          height: "100%",
                          background: `linear-gradient(90deg, #ef9a9a, ${comp.before.color})`,
                        }}
                      />
                    </Box>
                  </Box>

                  {/* After bar */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="body2" sx={{ color: comp.after.color }}>
                        ✅ {comp.after.label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: comp.after.color }}>
                        {comp.after.value}%
                      </Typography>
                    </Box>
                    <Box sx={{ height: 10, bgcolor: "#f0f0f0", borderRadius: 1, overflow: "hidden" }}>
                      <Box
                        sx={{
                          width: `${comp.after.value}%`,
                          height: "100%",
                          background: `linear-gradient(90deg, #81c784, ${comp.after.color})`,
                        }}
                      />
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      bgcolor: "#f0f7ef",
                      p: 1.5,
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box>{getIcon(comp?.summary, "•")}</Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#1c5d15" }}>
                      {typeof comp?.summary?.text === "string"
                        ? comp.summary.text
                        : typeof comp?.result === "string"
                          ? comp.result
                          : "Resultado disponible"}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        );

      case "buyer-personas":
        return (
          <Box sx={style}>
            <Box sx={{ textAlign: "center", mb: 5 }}>
              {renderEditableText(editable.title, ["title"])}
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                gap: 4,
              }}
            >
              {asArray(editable.personas).map((persona: any, idx: number) => (
                <Box
                  key={idx}
                  sx={{
                    p: 3,
                    bgcolor: "white",
                     borderLeft: `5px solid ${getBorderColor(persona)}`,
                    borderRadius: "0 12px 12px 0",
                    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        bgcolor: "#eee",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                        mr: 2,
                      }}
                    >
                      {getIcon(persona, "•")}
                    </Box>
                    {renderEditableText(persona.name, ["personas", idx.toString(), "name"])}
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" component="strong" sx={{ fontWeight: 700 }}>
                      Perfil:
                    </Typography>{" "}
                    {renderEditableText(persona.profile || { text: "" }, ["personas", idx.toString(), "profile"])}
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" component="strong" sx={{ fontWeight: 700 }}>
                      Dolor:
                    </Typography>{" "}
                    {renderEditableText(persona.pain, ["personas", idx.toString(), "pain"])}
                  </Box>
                  <Box>
                    <Typography variant="body2" component="strong" sx={{ fontWeight: 700 }}>
                      Cómo ayudamos:
                    </Typography>{" "}
                    {renderEditableText(persona.solution, ["personas", idx.toString(), "solution"])}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        );

      case "implementation-steps":
        return (
          <Box sx={style}>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              {renderEditableText(editable.title, ["title"])}
            </Box>
            <Box sx={{ textAlign: "center", mb: 4, maxWidth: 700, mx: "auto" }}>
              {renderEditableText(editable.subtitle, ["subtitle"])}
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 2,
              }}
            >
              {asArray(editable.steps).map((step: any, idx: number) => (
                <Box
                  key={idx}
                  sx={{
                    p: 2.5,
                    bgcolor: "white",
                    border: "1px solid #e6efe5",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ color: "#1c5d15", mb: 1 }}>
                    {step.number}) {renderEditableText(step.title, ["steps", idx.toString(), "title"])}
                  </Typography>
                  {renderEditableText(step.description, ["steps", idx.toString(), "description"])}
                </Box>
              ))}
            </Box>
          </Box>
        );

      case "impact-stats-circular":
        return (
          <Box sx={style}>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              {renderEditableText(editable.title, ["title"])}
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: 1.5,
                mb: 4,
              }}
            >
              {asArray(editable.badges).map((badge: any, idx: number) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: "#f0f7ef",
                    px: 2,
                    py: 1,
                    borderRadius: 20,
                    border: "1px solid #abc685",
                  }}
                >
                  <Box>{getIcon(badge, "•")}</Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#1c5d15" }}>
                    {badge.text}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 3,
              }}
            >
              {asArray(editable.stats).map((stat: any, idx: number) => (
                <Box
                  key={idx}
                  sx={{
                    width: 150,
                    height: 150,
                    mx: "auto",
                    bgcolor: "white",
                    border: `4px solid ${stat.borderColor}`,
                    borderRadius: "50%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                  }}
                >
                  {renderEditableText(stat.value, ["stats", idx.toString(), "value"])}
                  <Box sx={{ textAlign: "center", px: 1, mt: 1 }}>
                    {renderEditableText(stat.label, ["stats", idx.toString(), "label"])}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        );

      case "timeline-history":
        return (
          <Box sx={style}>
            <Box sx={{ textAlign: "center", mb: 5 }}>
              {renderEditableText(editable.title, ["title"])}
            </Box>
            <Box sx={{ maxWidth: 780, mx: "auto", position: "relative" }}>
              {/* Timeline line */}
              <Box
                sx={{
                  position: "absolute",
                  width: 4,
                  bgcolor: editable.lineColor,
                  top: 0,
                  bottom: 0,
                  left: "50%",
                  ml: "-2px",
                }}
              />
              {asArray(editable.events).map((event: any, idx: number) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    justifyContent: idx % 2 === 0 ? "flex-end" : "flex-start",
                    mb: 3,
                    position: "relative",
                  }}
                >
                  <Box
                    sx={{
                      width: "45%",
                      p: 2,
                      bgcolor: "white",
                      borderRadius: 1.5,
                      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                      textAlign: idx % 2 === 0 ? "right" : "left",
                    }}
                  >
                    {renderEditableText(event.year, ["events", idx.toString(), "year"])}
                    <Box sx={{ mt: 1 }}>
                      {renderEditableText(event.description, ["events", idx.toString(), "description"])}
                    </Box>
                  </Box>
                  {/* Dot */}
                  <Box
                    sx={{
                      position: "absolute",
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      bgcolor: "white",
                      border: "4px solid #1c5d15",
                      left: "50%",
                      ml: "-9px",
                      top: 15,
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        );

      case "team-grid":
        return (
          <Box sx={style}>
            <Box sx={{ textAlign: "center", mb: 5 }}>
              {renderEditableText(editable.title, ["title"])}
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: 4,
              }}
            >
              {asArray(editable.members).map((member: any, idx: number) => (
                <Box key={idx} sx={{ textAlign: "center" }}>
                  <Box
                    component="img"
                    src={member.imageUrl}
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      mx: "auto",
                      mb: 2,
                      border: `3px solid ${member.borderColor}`,
                      objectFit: "cover",
                    }}
                  />
                  {renderEditableText(member.name, ["members", idx.toString(), "name"])}
                  <Box sx={{ mt: 1 }}>
                    {renderEditableText(member.role, ["members", idx.toString(), "role"])}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        );

      case "certifications-grid":
        return (
          <Box sx={style}>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              {renderEditableText(editable.title, ["title"])}
            </Box>
            <Box sx={{ textAlign: "center", mb: 4, maxWidth: 700, mx: "auto" }}>
              {renderEditableText(editable.subtitle, ["subtitle"])}
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 3,
              }}
            >
              {asArray(editable.certifications).map((cert: any, idx: number) => (
                <Box
                  key={idx}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    bgcolor: "white",
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  <Box sx={{ fontSize: "3rem", mb: 1 }}>{getIcon(cert, "•")}</Box>
                  {renderEditableText(cert.name, ["certifications", idx.toString(), "name"])}
                  <Box sx={{ mt: 1 }}>
                    {renderEditableText(cert.description, ["certifications", idx.toString(), "description"])}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        );

      case "testimonials-cards":
        return (
          <Box sx={style}>
            <Box sx={{ textAlign: "center", mb: 5 }}>
              {renderEditableText(editable.title, ["title"])}
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 4,
              }}
            >
              {asArray(editable.testimonials).map((testimonial: any, idx: number) => (
                <Box
                  key={idx}
                  sx={{
                    p: 3,
                    bgcolor: "#f8f9fa",
                    borderRadius: 2,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                >
                  <Box sx={{ mb: 2 }}>
                    {renderEditableText(testimonial.quote, ["testimonials", idx.toString(), "quote"])}
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      component="img"
                      src={testimonial.avatar}
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                    <Box>
                      {renderEditableText(testimonial.author, ["testimonials", idx.toString(), "author"])}
                      <Box sx={{ mt: 0.5 }}>
                        {renderEditableText(testimonial.position, ["testimonials", idx.toString(), "position"])}
                      </Box>
                      <Box sx={{ mt: 0.5, color: "#f7b500" }}>
                        {"⭐".repeat(testimonial.rating)}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        );

      case "faq-accordion":
        return (
          <Box sx={style}>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              {renderEditableText(editable.title, ["title"])}
            </Box>
            <Box sx={{ textAlign: "center", mb: 4, maxWidth: 700, mx: "auto" }}>
              {renderEditableText(editable.subtitle, ["subtitle"])}
            </Box>
            <Box sx={{ maxWidth: 800, mx: "auto" }}>
              {asArray(editable.faqs).map((faq: any, idx: number) => (
                <Box
                  key={idx}
                  sx={{
                    mb: 2,
                    p: 2.5,
                    bgcolor: "white",
                    borderRadius: 1.5,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  {renderEditableText(faq.question, ["faqs", idx.toString(), "question"])}
                  <Box sx={{ mt: 1.5 }}>
                    {renderEditableText(faq.answer, ["faqs", idx.toString(), "answer"])}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        );

      case "cta-action":
        return (
          <Box
            sx={{
              ...style,
              backgroundImage: `url(${editable.backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {renderEditableText(editable.title, ["title"])}
            <Box sx={{ mt: 3, maxWidth: 700, mx: "auto" }}>
              {renderEditableText(editable.subtitle, ["subtitle"])}
            </Box>
            <Box
              sx={{
                mt: 4,
                display: "inline-block",
                px: 4,
                py: 2,
                bgcolor: editable.buttonBackground,
                borderRadius: 20,
                cursor: "pointer",
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                },
              }}
            >
              {renderEditableText(editable.buttonText, ["buttonText"])}
            </Box>
          </Box>
        );

      case "case-studies":
        return (
          <Box sx={style}>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              {renderEditableText(editable.title, ["title"])}
            </Box>
            <Box sx={{ textAlign: "center", mb: 5, maxWidth: 700, mx: "auto" }}>
              {renderEditableText(editable.subtitle, ["subtitle"])}
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {asArray(editable.cases).map((caseStudy: any, idx: number) => (
                <Box
                  key={idx}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 4,
                    p: 3,
                    bgcolor: "#f8f9fa",
                    borderRadius: 2,
                  }}
                >
                  <Box>
                    <Box
                      component="img"
                      src={caseStudy.imageUrl}
                      sx={{
                        width: "100%",
                        height: 250,
                        objectFit: "cover",
                        borderRadius: 2,
                      }}
                    />
                  </Box>
                  <Box>
                    {renderEditableText(caseStudy.company, ["cases", idx.toString(), "company"])}
                    <Box sx={{ mt: 1 }}>
                      {renderEditableText(caseStudy.industry, ["cases", idx.toString(), "industry"])}
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" component="strong" sx={{ fontWeight: 700 }}>
                        Desafío:
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        {renderEditableText(caseStudy.challenge, ["cases", idx.toString(), "challenge"])}
                      </Box>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" component="strong" sx={{ fontWeight: 700 }}>
                        Solución:
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        {renderEditableText(caseStudy.solution, ["cases", idx.toString(), "solution"])}
                      </Box>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" component="strong" sx={{ fontWeight: 700 }}>
                        Resultados:
                      </Typography>
                      <Box component="ul" sx={{ mt: 0.5, pl: 2 }}>
                        {asArray(caseStudy.results).map((result: string, rIdx: number) => (
                          <Box component="li" key={rIdx} sx={{ mb: 0.5, fontSize: "0.9rem", color: "#1c5d15" }}>
                            {result}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        );

      default:
        if ((section as any).htmlCode) {
          return (
            <Box sx={{ p: 0 }}>
              {(section as any).cssCode ? <style>{(section as any).cssCode}</style> : null}
              <Box dangerouslySetInnerHTML={{ __html: (section as any).htmlCode }} />
            </Box>
          );
        }
        return (
          <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
            Tipo de sección no soportado: {type}
          </Box>
        );
    }
  };

  return (
    <>
      <Paper
        elevation={isHovered ? 8 : 2}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          position: "relative",
          mb: 3,
          overflow: "hidden",
          transition: "all 0.3s",
          border: isHovered ? "2px solid #1c5d15" : "2px solid transparent",
        }}
      >
        {/* Control buttons */}
        {isHovered && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 100,
              display: "flex",
              gap: 1,
              bgcolor: "white",
              borderRadius: 1,
              p: 0.5,
              boxShadow: 3,
            }}
          >
            <Tooltip title="Generar contenido con IA">
              <IconButton size="small" onClick={() => onGenerateAI?.(section)}>
                <PsychologyIcon sx={{ color: "#1c5d15" }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Arrastrar para reordenar">
              <IconButton size="small" {...dragHandleProps}>
                <DragIndicatorIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar sección">
              <IconButton size="small" color="error" onClick={() => onDelete(index)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}

  
        {/* Section content */}
        <Box onClick={() => setSelectedElement(null)}>
          {renderSectionContent()}
        </Box>

        {/* Section label */}
        {isHovered && (
          <Box
            sx={{
              position: "absolute",
              bottom: 8,
              left: 8,
              bgcolor: "#1c5d15",
              color: "white",
              px: 2,
              py: 0.5,
              borderRadius: 1,
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            {section.name}
          </Box>
        )}
      </Paper>

      {/* Color Picker Popover */}
      <Popover
        open={Boolean(colorPickerAnchor)}
        anchorEl={colorPickerAnchor}
        onClose={() => setColorPickerAnchor(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box sx={{ p: 2 }}>
          <ChromePicker color={activeColor} onChange={handleColorChange} />
        </Box>
      </Popover>
    </>
  );
}
