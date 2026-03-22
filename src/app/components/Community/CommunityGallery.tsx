import { useState } from "react";
import { Box, Paper, Typography, Card, CardContent, CardMedia, Chip, Button, IconButton, TextField, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Badge } from "@mui/material";
import { 
  Search, 
  FilterList, 
  Sort, 
  Favorite, 
  Visibility, 
  Download, 
  Add, 
  Delete, 
  Edit,
  Public,
  Schedule
} from "@mui/icons-material";

interface CommunitySection {
  id: string;
  title: string;
  description: string;
  previewImage: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
  tags: string[];
  likes: number;
  downloads: number;
  createdAt: string;
  isFeatured: boolean;
  isApproved: boolean;
  originalSectionId: string;
}

interface CommunityGalleryProps {
  sections: CommunitySection[];
  onDuplicateSection: (section: CommunitySection) => void;
  onLikeSection: (sectionId: string) => void;
  onDownloadSection: (sectionId: string) => void;
  currentUser?: {
    id: string;
    isAdmin: boolean;
  };
  onModerateSection?: (sectionId: string, action: 'approve' | 'reject') => void;
}

export function CommunityGallery({
  sections,
  onDuplicateSection,
  onLikeSection,
  onDownloadSection,
  currentUser,
  onModerateSection
}: CommunityGalleryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedSection, setSelectedSection] = useState<CommunitySection | null>(null);

  const categories = [
    "all",
    "hero",
    "grid",
    "cards",
    "services",
    "testimonials",
    "cta",
    "footer"
  ];

  const filteredSections = sections
    .filter(section => {
      const matchesSearch = section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           section.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === "all" || section.category === categoryFilter;
      
      const matchesApproval = selectedTab === 0 || (selectedTab === 1 && !section.isApproved);

      return matchesSearch && matchesCategory && matchesApproval;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "popular":
          return b.likes - a.likes;
        case "downloads":
          return b.downloads - a.downloads;
        default:
          return 0;
      }
    });

  const handleDuplicate = (section: CommunitySection) => {
    onDuplicateSection(section);
    // Mostrar notificación de éxito
  };

  const handleLike = (sectionId: string) => {
    onLikeSection(sectionId);
  };

  const handleDownload = (sectionId: string) => {
    onDownloadSection(sectionId);
  };

  const getSectionStats = (section: CommunitySection) => {
    return [
      { label: "Likes", value: section.likes, icon: <Favorite fontSize="small" /> },
      { label: "Descargas", value: section.downloads, icon: <Download fontSize="small" /> },
      { label: "Categoría", value: section.category, icon: <Public fontSize="small" /> }
    ];
  };

  return (
    <Box>
      {/* Encabezado */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Galería de Comunidad
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Descubre y comparte secciones creadas por la comunidad
            </Typography>
          </Box>
          <Button
            startIcon={<Add />}
            variant="contained"
            color="primary"
            onClick={() => {}}
          >
            Subir Sección
          </Button>
        </Box>

        {/* Filtros y búsqueda */}
        <Paper sx={{ p: 2, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Buscar secciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search fontSize="small" sx={{ mr: 1 }} />
            }}
            sx={{ flex: 1, minWidth: 200 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={categoryFilter}
              label="Categoría"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(category => (
                <MenuItem key={category} value={category}>
                  {category === "all" ? "Todas" : category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Ordenar por</InputLabel>
            <Select
              value={sortBy}
              label="Ordenar por"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="newest">Más nuevo</MenuItem>
              <MenuItem value="oldest">Más antiguo</MenuItem>
              <MenuItem value="popular">Más popular</MenuItem>
              <MenuItem value="downloads">Más descargado</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton size="small" color="primary">
              <FilterList />
            </IconButton>
            <IconButton size="small" color="primary">
              <Sort />
            </IconButton>
          </Box>
        </Paper>
      </Box>

      {/* Pestañas para moderación */}
      {currentUser?.isAdmin && (
        <Box sx={{ mb: 3 }}>
          <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
            <Tab label="Secciones Aprobadas" />
            <Tab 
              label={
                <Badge badgeContent={sections.filter(s => !s.isApproved).length} color="error">
                  Moderación Pendiente
                </Badge>
              }
            />
          </Tabs>
        </Box>
      )}

      {/* Grid de secciones */}
      <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={3}>
        {filteredSections.map((section) => (
          <Box key={section.id}>
            <Card 
              sx={{ 
                height: "100%",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4
                }
              }}
              onClick={() => setSelectedSection(section)}
            >
              {/* Imagen de vista previa */}
              <CardMedia
                component="img"
                height="160"
                image={section.previewImage}
                alt={section.title}
                sx={{ objectFit: "cover" }}
              />

              {/* Contenido de la tarjeta */}
              <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Etiquetas y estado */}
                <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
                  {section.isFeatured && (
                    <Chip label="Destacado" size="small" color="primary" variant="outlined" />
                  )}
                  {!section.isApproved && (
                    <Chip label="Pendiente" size="small" color="warning" variant="outlined" />
                  )}
                  <Chip label={section.category} size="small" variant="outlined" />
                </Box>

                {/* Título y descripción */}
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, minHeight: 48 }}>
                  {section.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                  {section.description.substring(0, 80)}...
                </Typography>

                {/* Autor */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <Box
                    component="img"
                    src={section.author.avatar}
                    sx={{ width: 24, height: 24, borderRadius: "50%" }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    por {section.author.name}
                  </Typography>
                  <Box sx={{ flex: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    <Schedule fontSize="small" /> {new Date(section.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>

                {/* Estadísticas */}
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  {getSectionStats(section).map((stat, index) => (
                    <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography variant="caption">{stat.icon}</Typography>
                      <Typography variant="caption">{stat.value}</Typography>
                    </Box>
                  ))}
                </Box>

                {/* Etiquetas */}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  {section.tags.slice(0, 3).map((tag, index) => (
                    <Chip key={index} label={tag} size="small" variant="outlined" />
                  ))}
                  {section.tags.length > 3 && (
                    <Chip label={`+${section.tags.length - 3}`} size="small" variant="outlined" />
                  )}
                </Box>

                {/* Acciones */}
                <Box sx={{ display: "flex", gap: 1, mt: "auto" }}>
                  <Button
                    startIcon={<Edit />}
                    size="small"
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicate(section);
                    }}
                  >
                    Duplicar
                  </Button>
                  <IconButton 
                    size="small" 
                    color={section.likes > 0 ? "primary" : "default"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(section.id);
                    }}
                  >
                    <Favorite fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(section.id);
                    }}
                  >
                    <Download fontSize="small" />
                  </IconButton>
                  
                  {/* Acciones de moderación */}
                  {currentUser?.isAdmin && !section.isApproved && (
                    <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
                      <IconButton 
                        size="small" 
                        color="success"
                        onClick={(e) => {
                          e.stopPropagation();
                          onModerateSection?.(section.id, 'approve');
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          onModerateSection?.(section.id, 'reject');
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {filteredSections.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
          <Typography variant="h6">
            No se encontraron secciones
          </Typography>
          <Typography variant="body2">
            Intenta con otros filtros o busca en otra categoría
          </Typography>
        </Box>
      )}

      {/* Vista de detalle */}
      <Dialog 
        open={!!selectedSection} 
        onClose={() => setSelectedSection(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedSection && (
          <>
            <DialogTitle>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {selectedSection.title}
                </Typography>
                {selectedSection.isFeatured && (
                  <Chip label="Destacado" color="primary" size="small" />
                )}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={3}>
                <Box>
                  <CardMedia
                    component="img"
                    height="300"
                    image={selectedSection.previewImage}
                    alt={selectedSection.title}
                    sx={{ borderRadius: 2 }}
                  />
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    {selectedSection.description}
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Estadísticas
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      {getSectionStats(selectedSection).map((stat, index) => (
                        <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {stat.icon}
                          <Typography variant="body2">{stat.label}: {stat.value}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Autor
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        component="img"
                        src={selectedSection.author.avatar}
                        sx={{ width: 40, height: 40, borderRadius: "50%" }}
                      />
                      <Box>
                        <Typography variant="body1">{selectedSection.author.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(selectedSection.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Etiquetas
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {selectedSection.tags.map((tag: string, index: number) => (
                    <Chip key={index} label={tag} size="small" variant="outlined" />
                  ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedSection(null)}>Cerrar</Button>
              <Button
                startIcon={<Edit />}
                variant="contained"
                onClick={() => {
                  handleDuplicate(selectedSection);
                  setSelectedSection(null);
                }}
              >
                Duplicar y Personalizar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}