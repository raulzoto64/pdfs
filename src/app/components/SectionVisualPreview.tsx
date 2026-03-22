import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Chip, Typography } from "@mui/material";
import { getDefaultSectionDimensions, type Section } from "../types/pdfCreator";

interface SectionVisualPreviewProps {
  section: Section;
  preferredWidth?: number;
  height?: number;
  scale?: number;
  showDimensionChip?: boolean;
}

function pickText(editable: any, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = editable?.[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
    if (value && typeof value === "object" && typeof value.text === "string" && value.text.trim()) {
      return value.text;
    }
  }
  return fallback;
}

function pickTags(editable: any) {
  const sources = [
    editable?.badges,
    editable?.stats,
    editable?.sectors,
    editable?.services,
    editable?.cards,
    editable?.products,
    editable?.values,
    editable?.steps,
  ];

  const source = sources.find((value) => Array.isArray(value) && value.length > 0) || [];

  return source
    .slice(0, 3)
    .map((item: any) => pickText(item, ["text", "name", "title"], item?.label || item?.result || "Bloque"));
}

export function SectionVisualPreview({
  section,
  preferredWidth,
  height,
  scale,
  showDimensionChip = true,
}: SectionVisualPreviewProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const dimensions = section.dimensions || getDefaultSectionDimensions(section.type);
  const editable = section.content?.editable || {};
  const style = section.content?.style || {};

  const fallbackWidth = useMemo(() => {
    if (preferredWidth) {
      return preferredWidth;
    }

    if (height && scale) {
      return Math.round(dimensions.width * scale);
    }

    return 340;
  }, [dimensions.width, height, preferredWidth, scale]);

  useEffect(() => {
    if (!hostRef.current) {
      return;
    }

    const node = hostRef.current;
    const update = () => setContainerWidth(node.clientWidth || fallbackWidth);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(node);

    return () => observer.disconnect();
  }, [fallbackWidth]);

  const frameWidth = Math.max(220, Math.min(containerWidth || fallbackWidth, fallbackWidth));
  const frameHeight = Math.max(120, Math.round((frameWidth / dimensions.width) * dimensions.height));
  const frameScale = frameWidth / dimensions.width;

  const title = pickText(editable, ["title", "name", "text"], section.name);
  const subtitle = pickText(
    editable,
    ["subtitle", "description", "tagline", "role"],
    section.description || "Vista previa de la seccion"
  );
  const tags = pickTags(editable);

  return (
    <Box
      ref={hostRef}
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        p: 2,
        bgcolor: "#eef2eb",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <Box
        sx={{
          width: frameWidth,
          maxWidth: "100%",
        }}
      >
        <Box
          sx={{
            width: frameWidth,
            height: frameHeight,
            position: "relative",
            overflow: "hidden",
            borderRadius: 2,
            bgcolor: "#ffffff",
            boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: dimensions.width,
              height: dimensions.height,
              transform: `scale(${frameScale})`,
              transformOrigin: "top left",
              overflow: "hidden",
              pointerEvents: "none",
              bgcolor: "#ffffff",
            }}
          >
            {section.htmlCode ? (
              <>
                {section.cssCode ? <style>{section.cssCode}</style> : null}
                <Box
                  sx={{
                    width: dimensions.width,
                    minHeight: dimensions.height,
                  }}
                  dangerouslySetInnerHTML={{ __html: section.htmlCode }}
                />
              </>
            ) : (
              <Box
                sx={{
                  width: dimensions.width,
                  minHeight: dimensions.height,
                  p: 5,
                  background: style.background || "linear-gradient(135deg, #edf4ec 0%, #dfead9 100%)",
                  color: style.color || "#17201a",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 20,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      opacity: 0.82,
                      mb: 3,
                    }}
                  >
                    {section.category || section.type || "Seccion"}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 52,
                      fontWeight: 700,
                      lineHeight: 1.05,
                      mb: 3,
                    }}
                  >
                    {title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 24,
                      lineHeight: 1.5,
                      opacity: 0.88,
                    }}
                  >
                    {subtitle}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 4 }}>
                  {tags.length > 0
                    ? tags.map((tag: string) => (
                        <Box
                          key={tag}
                          sx={{
                            px: 2.2,
                            py: 0.9,
                            borderRadius: 999,
                            bgcolor: "rgba(255,255,255,0.22)",
                            border: "1px solid rgba(255,255,255,0.3)",
                            fontSize: 18,
                            fontWeight: 600,
                          }}
                        >
                          {tag}
                        </Box>
                      ))
                    : (
                      <Box
                        sx={{
                          px: 2.2,
                          py: 0.9,
                          borderRadius: 999,
                          bgcolor: "rgba(255,255,255,0.22)",
                          border: "1px solid rgba(255,255,255,0.3)",
                          fontSize: 18,
                          fontWeight: 600,
                        }}
                      >
                        {dimensions.label}
                      </Box>
                    )}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {showDimensionChip ? (
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1.25, gap: 1 }}>
            <Chip
              label={dimensions.label}
              size="small"
              sx={{
                bgcolor: "#e8ff99",
                color: "#1c5d15",
                fontWeight: 700,
              }}
            />
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
              {dimensions.width} x {dimensions.height}
            </Typography>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
