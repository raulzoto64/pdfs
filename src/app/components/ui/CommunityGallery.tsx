import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Pagination,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { Section } from '../../types/pdfCreator';

interface CommunityGalleryProps {
  onUseTemplate: (section: Section) => void;
  currentUser?: {
    id: string;
    isAdmin: boolean;
  };
}

const COMMUNITY_SECTIONS = [
  {
    id: 'community-hero-1',
    name: 'Hero Impactante - Negocios',
    description: 'Sección hero profesional para páginas de negocios con tipografía moderna',
    category: 'Hero',
    type: 'hero',
    author: 'Diseñador Pro',
    isPublic: true,
    isFeatured: true,
    downloads: 1542,
    rating: 4.8,
    tags: ['negocios', 'profesional', 'moderno'],
    content: {
      type: 'hero',
      editable: {
        title: 'Soluciones Empresariales de Vanguardia',
        subtitle: 'Impulsamos el crecimiento de tu negocio con tecnología de punta',
        buttonText: 'Descubre Más'
      },
      style: {
        backgroundColor: '#1c5d15',
        textColor: '#ffffff',
        padding: '80px 20px',
        fontFamily: 'Poppins',
        fontSize: 18,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'center'
      }
    },
    createdAt: '2024-03-15T10:30:00Z',
    lastModified: '2024-03-15T10:30:00Z'
  },
  {
    id: 'community-text-1',
    name: 'Texto Elegante - Minimalista',
    description: 'Sección de texto con diseño minimalista y tipografía elegante',
    category: 'Content',
    type: 'text',
    author: 'Minimal Design',
    isPublic: true,
    isFeatured: false,
    downloads: 891,
    rating: 4.5,
    tags: ['minimalista', 'elegante', 'texto'],
    content: {
      type: 'text',
      editable: {
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
      },
      style: {
        backgroundColor: '#ffffff',
        textColor: '#333333',
        padding: '40px 20px',
        fontFamily: 'Georgia',
        fontSize: 16,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'left'
      }
    },
    createdAt: '2024-03-14T14:20:00Z',
    lastModified: '2024-03-14T14:20:00Z'
  },
  {
    id: 'community-grid-1',
    name: 'Grid Creativo - Portafolio',
    description: 'Grid moderno para mostrar proyectos o servicios',
    category: 'Grid',
    type: 'grid',
    author: 'Creative Studio',
    isPublic: true,
    isFeatured: true,
    downloads: 2156,
    rating: 4.9,
    tags: ['grid', 'portafolio', 'creativo'],
    content: {
      type: 'grid',
      editable: {
        content: 'Sección de grid para mostrar múltiples elementos'
      },
      style: {
        backgroundColor: '#f8f9fa',
        textColor: '#000000',
        padding: '60px 20px',
        fontFamily: 'Arial',
        fontSize: 14,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'center'
      }
    },
    createdAt: '2024-03-13T09:15:00Z',
    lastModified: '2024-03-13T09:15:00Z'
  }
];

export function CommunityGallery({
  onUseTemplate,
  currentUser
}: CommunityGalleryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [sortBy, setSortBy] = useState('featured');
  const [page, setPage] = useState(1);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'info' | 'warning'>('info');

  const [sections] = useState<Section[]>(COMMUNITY_SECTIONS);

  const categories = ['Todas', ...Array.from(new Set(sections.map(s => s.category)))];

  useEffect(() => {
    // Cargar favoritos del localStorage
    const savedFavorites = localStorage.getItem('community_favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const filteredSections = sections.filter(section => {
    const matchesSearch = section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'Todas' || section.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const sortedSections = [...filteredSections].sort((a, b) => {
    switch (sortBy) {
      case 'featured':
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      case 'downloads':
        return (b.downloads || 0) - (a.downloads || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      default:
        return 0;
    }
  });

  const itemsPerPage = 6;
  const totalPages = Math.ceil(sortedSections.length / itemsPerPage);
  const paginatedSections = sortedSections.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleFavorite = (sectionId: string) => {
    const newFavorites = favorites.includes(sectionId)
      ? favorites.filter(id => id !== sectionId)
      : [...favorites, sectionId];
    
    setFavorites(newFavorites);
    localStorage.setItem('community_favorites', JSON.stringify(newFavorites));
    
    setSnackbarMessage(favorites.includes(sectionId) ? 'Eliminado de favoritos' : 'Añadido a favoritos');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  const handleUseTemplate = (section: Section) => {
    const enhancedSection = {
      ...section,
      id: `${section.id}-community-${Date.now()}`,
      author: currentUser?.id || 'Usuario',
      createdAt: new Date().toISOString()
    };
    
    onUseTemplate(enhancedSection);
    
    setSnackbarMessage('Sección añadida a tu documento');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleShare = async (section: Section) => {
    try {
      await navigator.share({
        title: section.name,
        text: section.description,
        url: window.location.href
      });
    } catch (error) {
      // Compartir no soportado o cancelado
      setSnackbarMessage('Compartir no disponible en este navegador');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Encabezado */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Galería Comunitaria
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Descubre y comparte secciones creadas por la comunidad de diseñadores
        </Typography>
      </Box>

      {/* Controles de Búsqueda y Filtros */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Buscar secciones, autores o tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          sx={{ minWidth: 300 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Categoría</InputLabel>
          <Select
            value={selectedCategory}
            label="Categoría"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Ordenar por</InputLabel>
          <Select
            value={sortBy}
            label="Ordenar por"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="featured">Destacados</MenuItem>
            <MenuItem value="downloads">Más Descargados</MenuItem>
            <MenuItem value="rating">Mejor Calificados</MenuItem>
            <MenuItem value="newest">Más Nuevos</MenuItem>
            <MenuItem value="oldest">Más Antiguos</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FilterIcon color="action" />
          <Typography variant="caption" color="text.secondary">
            {filteredSections.length} resultados
          </Typography>
        </Box>
      </Box>

      {/* Secciones Destacadas */}
      {sortedSections.some(s => s.isFeatured) && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StarIcon color="primary" />
            Destacados de la Comunidad
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {sortedSections
              .filter(s => s.isFeatured)
              .slice(0, 3)
              .map((section) => (
                <Box key={section.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Chip
                          label="DESTACADO"
                          color="primary"
                          size="small"
                          variant="outlined"
                        />
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleFavorite(section.id)}
                            color={favorites.includes(section.id) ? "primary" : "default"}
                          >
                            {favorites.includes(section.id) ? <StarIcon /> : <StarBorderIcon />}
                          </IconButton>
                          <IconButton size="small" onClick={() => handleShare(section)}>
                            <ShareIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Typography variant="h6" component="h3" gutterBottom>
                        {section.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {section.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {section.tags?.map(tag => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Por {section.author}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            ⭐ {section.rating}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            📥 {section.downloads}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Vista Previa */}
                      <Box
                        sx={{
                          bgcolor: section.content.style.backgroundColor || '#f5f5f5',
                          color: section.content.style.textColor || '#000000',
                          p: 2,
                          borderRadius: 1,
                          minHeight: 80,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.875rem',
                          border: '1px dashed #ccc'
                        }}
                      >
                        Vista previa de la sección...
                      </Box>
                    </CardContent>
                    
                    <CardActions sx={{ justifyContent: 'space-between' }}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleUseTemplate(section)}
                      >
                        Usar en mi PDF
                      </Button>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(section.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardActions>
                  </Card>
                </Box>
              ))}
          </Box>
        </Box>
      )}

      {/* Todas las Secciones */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Todas las Secciones Comunitarias
        </Typography>
        
        {paginatedSections.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No se encontraron secciones
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Intenta con otro término de búsqueda o filtro
            </Typography>
          </Box>
        ) : (
          <>
            <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={3}>
              {paginatedSections.map((section) => (
                <Box key={section.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Chip
                          label={section.category}
                          size="small"
                          color={section.isFeatured ? "primary" : "default"}
                          variant="outlined"
                        />
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleFavorite(section.id)}
                            color={favorites.includes(section.id) ? "primary" : "default"}
                          >
                            {favorites.includes(section.id) ? <StarIcon /> : <StarBorderIcon />}
                          </IconButton>
                          <IconButton size="small" onClick={() => handleShare(section)}>
                            <ShareIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Typography variant="subtitle1" component="h3" gutterBottom>
                        {section.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {section.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {section.tags?.map(tag => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Por {section.author}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            ⭐ {section.rating}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            📥 {section.downloads}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Vista Previa */}
                      <Box
                        sx={{
                          bgcolor: section.content.style.backgroundColor || '#f5f5f5',
                          color: section.content.style.textColor || '#000000',
                          p: 2,
                          borderRadius: 1,
                          minHeight: 60,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.875rem',
                          border: '1px dashed #ccc'
                        }}
                      >
                        Vista previa...
                      </Box>
                    </CardContent>
                    
                    <CardActions sx={{ justifyContent: 'space-between' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleUseTemplate(section)}
                      >
                        Usar
                      </Button>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(section.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardActions>
                  </Card>
                </Box>
              ))}
            </Box>

            {/* Paginación */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, newPage) => setPage(newPage)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}