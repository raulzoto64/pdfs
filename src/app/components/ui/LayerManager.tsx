import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Chip,
  Divider,
  Button,
  Collapse,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  TextFields as TextIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useDrag, useDrop } from 'react-dnd';
import { Section } from '../../types/pdfCreator';

interface LayerManagerProps {
  sections: Section[];
  selectedSectionId: string | null;
  onSectionSelect: (sectionId: string, elementPath?: string) => void;
  onSectionDelete: (index: number) => void;
  onSectionDuplicate: (index: number) => void;
  onSectionReorder: (fromIndex: number, toIndex: number) => void;
}

interface LayerItemProps {
  section: Section;
  index: number;
  selected: boolean;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onSelect: (sectionId: string) => void;
  onDelete: (index: number) => void;
  onDuplicate: (index: number) => void;
}

const LayerItem: React.FC<LayerItemProps> = ({
  section,
  index,
  selected,
  onReorder,
  onSelect,
  onDelete,
  onDuplicate
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: 'SECTION',
    item: { id: section.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'SECTION',
    hover: (item: { id: string; index: number }) => {
      if (item.index !== index) {
        onReorder(item.index, index);
        item.index = index;
      }
    },
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'hero':
        return <ImageIcon color="primary" />;
      case 'heading':
        return <TextIcon color="secondary" />;
      case 'text':
      case 'simple-text':
        return <TextIcon color="action" />;
      default:
        return <TextIcon color="disabled" />;
    }
  };

  return (
    <div ref={(node) => {
      drag(drop(node));
    }}>
      <ListItem
        component="li"
        sx={{
          borderLeft: selected ? '3px solid #1c5d15' : '3px solid transparent',
          bgcolor: isDragging ? 'action.hover' : 'inherit',
          cursor: 'move',
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
      >
        {/* Drag Handle */}
        <ListItemIcon>
          <DragIcon sx={{ color: '#666', fontSize: '1rem' }} />
        </ListItemIcon>

        {/* Content */}
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getIconForType(section.type)}
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {section.name}
              </Typography>
              <Chip
                label={section.type}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: '0.6rem' }}
              />
            </Box>
          }
          secondary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Chip
                label={section.category}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.6rem' }}
              />
              <Typography variant="caption" color="text.secondary">
                Por: {section.author}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(section.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          }
        />

        {/* Actions */}
        <ListItemSecondaryAction>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton size="small" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            
            <IconButton size="small" onClick={() => onDuplicate(index)}>
              <CopyIcon />
            </IconButton>

            <IconButton size="small" onClick={() => onDelete(index)} color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        </ListItemSecondaryAction>
      </ListItem>

      {/* Elementos Internos (si expandido) */}
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ pl: 4 }}>
          {Object.keys(section.content.editable || {}).map((key) => (
            <ListItem
              key={key}
              dense
              component="li"
              onClick={() => onSelect(`${section.id}.${key}`)}
              sx={{
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <ListItemIcon>
                <TextIcon sx={{ fontSize: '1rem', color: '#666' }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {typeof section.content.editable[key] === 'string' 
                      ? section.content.editable[key].substring(0, 50) + '...'
                      : JSON.stringify(section.content.editable[key])
                    }
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Collapse>

      <Divider />
    </div>
  );
};

export function LayerManager({
  sections,
  selectedSectionId,
  onSectionSelect,
  onSectionDelete,
  onSectionDuplicate,
  onSectionReorder
}: LayerManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showHidden, setShowHidden] = useState(false);

  const filteredSections = sections.filter(section => {
    const matchesSearch = section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || section.type === filterType;
    
    const isHidden = section.content.style?.display === 'none';
    const matchesVisibility = showHidden || !isHidden;

    return matchesSearch && matchesType && matchesVisibility;
  });

  const sectionTypes = Array.from(new Set(sections.map(s => s.type)));

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Encabezado */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" gutterBottom>
          Gestor de Capas
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {sections.length} sección{sections.length !== 1 ? 'es' : ''} en tu documento
        </Typography>
      </Box>

      {/* Controles de Filtro */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#f5f5f5' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar secciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 1 }}
        />

        <FormControl fullWidth size="small" sx={{ mb: 1 }}>
          <InputLabel>Tipo de Sección</InputLabel>
          <Select
            value={filterType}
            label="Tipo de Sección"
            onChange={(e) => setFilterType(e.target.value)}
          >
            <MenuItem value="all">Todas las secciones</MenuItem>
            {sectionTypes.map(type => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={showHidden}
              onChange={(e) => setShowHidden(e.target.checked)}
            />
          }
          label="Mostrar secciones ocultas"
        />
      </Box>

      {/* Lista de Capas */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        {filteredSections.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary" gutterBottom>
              No se encontraron secciones
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Intenta con otro término de búsqueda' : 'Añade una sección para comenzar'}
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredSections.map((section) => (
              <LayerItem
                key={section.id}
                section={section}
                index={sections.findIndex(s => s.id === section.id)}
                selected={selectedSectionId === section.id}
                onReorder={onSectionReorder}
                onSelect={onSectionSelect}
                onDelete={onSectionDelete}
                onDuplicate={onSectionDuplicate}
              />
            ))}
          </List>
        )}
      </Box>

      {/* Acciones Rápidas */}
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', bgcolor: '#f5f5f5' }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => {}}
          sx={{ mb: 1 }}
        >
          Añadir Sección
        </Button>
        
        <Button
          fullWidth
          variant="outlined"
          onClick={() => {}}
        >
          Organizar Capas
        </Button>
      </Box>
    </Box>
  );
}