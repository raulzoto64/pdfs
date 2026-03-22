import { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Section, SectionType, SectionCategory } from '../../types/pdfCreator';

interface SectionLibraryModalProps {
  open: boolean;
  onClose: () => void;
  onAddSection: (section: Section) => void;
}

const SECTION_CATEGORIES = [
  'Todas',
  'Hero',
  'About',
  'Services',
  'Contact',
  'Content',
  'Values',
  'Grid',
  'Cards',
  'Testimonials',
  'CTA',
  'Footer'
];

const SECTION_TYPES: SectionType[] = [
  'hero',
  'heading',
  'text',
  'simple-text',
  'mission-cards',
  'value-props',
  'grid',
  'cards',
  'services',
  'testimonials',
  'cta',
  'footer'
];

export function SectionLibraryModal({
  open,
  onClose,
  onAddSection
}: SectionLibraryModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedType, setSelectedType] = useState<SectionType | 'all'>('all');
  const [createMode, setCreateMode] = useState(false);
  const [editMode, setEditMode] = useState<string | null>(null);
  
  // Form states
  const [newSection, setNewSection] = useState({
    name: '',
    description: '',
    category: 'Hero' as SectionCategory,
    type: 'hero' as SectionType,
    content: {
      type: 'hero',
      editable: {
        title: 'Título de la sección',
        subtitle: 'Subtítulo de la sección',
        buttonText: 'Botón de acción'
      },
      style: {
        backgroundColor: '#1c5d15',
        textColor: '#ffffff',
        padding: '60px 20px'
      }
    },
    author: 'Usuario',
    isPublic: false
  });

  const [sections] = useState<Section[]>([
    {
      id: 'hero-default',
      name: 'Hero Principal',
      description: 'Sección de encabezado con título impactante',
      category: 'Hero',
      type: 'hero',
      content: {
        type: 'hero',
        editable: {
          title: 'Título Impactante',
          subtitle: 'Subtítulo descriptivo',
          buttonText: 'Descubrir Más'
        },
        style: {
          backgroundColor: '#1c5d15',
          textColor: '#ffffff',
          padding: '60px 20px'
        }
      },
      author: 'Sistema',
      isPublic: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'text-default',
      name: 'Texto Simple',
      description: 'Párrafo de texto editable',
      category: 'Content',
      type: 'text',
      content: {
        type: 'text',
        editable: {
          content: 'Este es un párrafo de texto editable. Puedes modificar este contenido directamente en el editor.'
        },
        style: {
          backgroundColor: '#ffffff',
          textColor: '#333333',
          padding: '20px'
        }
      },
      author: 'Sistema',
      isPublic: true,
      createdAt: new Date().toISOString()
    }
  ]);

  const filteredSections = sections.filter(section => {
    const matchesSearch = section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Todas' || section.category === selectedCategory;
    
    const matchesType = selectedType === 'all' || section.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  const handleCreateSection = () => {
    const section: Section = {
      ...newSection,
      id: `section-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    onAddSection(section);
    setCreateMode(false);
    setNewSection({
      name: '',
      description: '',
      category: 'Hero',
      type: 'hero',
      content: {
        type: 'hero',
        editable: {
          title: 'Título de la sección',
          subtitle: 'Subtítulo de la sección',
          buttonText: 'Botón de acción'
        },
        style: {
          backgroundColor: '#1c5d15',
          textColor: '#ffffff',
          padding: '60px 20px'
        }
      },
      author: 'Usuario',
      isPublic: false
    });
  };

  const handleEditSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      setNewSection({
        name: section.name,
        description: section.description,
        category: section.category as SectionCategory,
        type: section.type as SectionType,
        content: section.content,
        author: section.author,
        isPublic: section.isPublic
      });
      setEditMode(sectionId);
    }
  };

  const handleUpdateSection = () => {
    // Implementar actualización
    setEditMode(null);
  };

  const handleDeleteSection = (sectionId: string) => {
    // Implementar eliminación
    console.log('Eliminar sección:', sectionId);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 1200,
          maxHeight: '80vh',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h2">
            Biblioteca de Secciones
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setCreateMode(true)}
            >
              Crear Sección
            </Button>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Buscar secciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 250 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={selectedCategory}
              label="Categoría"
            onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {SECTION_CATEGORIES.map(category => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={selectedType}
              label="Tipo"
              onChange={(e) => setSelectedType(e.target.value as SectionType | 'all')}
            >
              <MenuItem value="all">Todos los tipos</MenuItem>
              {SECTION_TYPES.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Tabs */}
        <Tabs value={selectedCategory} onChange={(_, newValue) => setSelectedCategory(newValue)}>
          {SECTION_CATEGORIES.map(category => (
            <Tab key={category} label={category} value={category} />
          ))}
        </Tabs>

        {/* Sections Grid */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 2
          }}
        >
          {filteredSections.map((section) => (
            <Card key={section.id} sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Typography variant="h6" component="div">
                    {section.name}
                  </Typography>
                  <Chip
                    label={section.category}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {section.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip label={section.type} size="small" variant="outlined" />
                  <Chip 
                    label={section.isPublic ? "Pública" : "Privada"} 
                    size="small" 
                    color={section.isPublic ? "success" : "default"}
                  />
                  <Chip label={`Por: ${section.author}`} size="small" variant="outlined" />
                </Box>
                
                {/* Preview */}
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
                    fontSize: '0.875rem'
                  }}
                >
                  Vista previa de la sección...
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => onAddSection(section)}
                  >
                    Usar en mi PDF
                  </Button>
                  <IconButton size="small" onClick={() => handleEditSection(section.id)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteSection(section.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {section.isPublic ? (
                    <VisibilityIcon color="success" />
                  ) : (
                    <VisibilityOffIcon color="disabled" />
                  )}
                </Box>
              </CardActions>
            </Card>
          ))}
        </Box>

        {/* Create/Edit Section Dialog */}
        {(createMode || editMode) && (
          <Dialog
            open={createMode || !!editMode}
            onClose={() => { setCreateMode(false); setEditMode(null); }}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              {editMode ? 'Editar Sección' : 'Crear Nueva Sección'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
                <TextField
                  fullWidth
                  label="Nombre de la sección"
                  value={newSection.name}
                  onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Descripción"
                  value={newSection.description}
                  onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                />
                <FormControl fullWidth>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={newSection.category}
                    label="Categoría"
                    onChange={(e) => setNewSection({ ...newSection, category: e.target.value as SectionCategory })}
                  >
                    {SECTION_CATEGORIES.slice(1).map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={newSection.type}
                    label="Tipo"
                    onChange={(e) => setNewSection({ ...newSection, type: e.target.value as SectionType })}
                  >
                    {SECTION_TYPES.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newSection.isPublic}
                      onChange={(e) => setNewSection({ ...newSection, isPublic: e.target.checked })}
                    />
                  }
                  label="Hacer pública esta sección"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { setCreateMode(false); setEditMode(null); }}>Cancelar</Button>
              <Button
                variant="contained"
                onClick={editMode ? handleUpdateSection : handleCreateSection}
                disabled={!newSection.name || !newSection.description}
              >
                {editMode ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    </Modal>
  );
}