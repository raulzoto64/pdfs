export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface Section {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  author: string;
  isPublic: boolean;
  isFeatured?: boolean;
  downloads?: number;
  rating?: number;
  tags?: string[];
  content: {
    type: string;
    editable: any;
    style: any;
  };
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  sections: Section[];
  userId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  userId: string;
  templateId: string | null;
  name: string;
  customContent: Section[];
  lastModified: string;
}

export interface AIRequest {
  prompt: string;
  sectionType: string;
  sectionTitle: string;
}

export interface AIResponse {
  success: boolean;
  content?: any;
  message?: string;
  error?: string;
}

export interface EditorState {
  sections: Section[];
  selectedSectionId: string | null;
  isEditing: boolean;
  showGrid: boolean;
  zoomLevel: number;
  selectedElement: string | null;
}

export type SectionType = 'hero' | 'heading' | 'text' | 'simple-text' | 'mission-cards' | 'value-props' | 'grid' | 'cards' | 'services' | 'testimonials' | 'cta' | 'footer';

export type SectionCategory = 'Hero' | 'About' | 'Services' | 'Contact' | 'Content' | 'Values' | 'Grid' | 'Cards' | 'Testimonials' | 'CTA' | 'Footer';

export interface SectionDimensions {
  preset: string;
  width: number;
  height: number;
  label: string;
}

export const SECTION_DIMENSION_PRESETS = {
  hero: {
    preset: 'hero',
    width: 1200,
    height: 600,
    label: 'Hero Section',
  },
  heading: {
    preset: 'heading',
    width: 800,
    height: 120,
    label: 'Heading Section',
  },
  text: {
    preset: 'text',
    width: 800,
    height: 300,
    label: 'Text Section',
  },
  'simple-text': {
    preset: 'text',
    width: 800,
    height: 300,
    label: 'Text Section',
  },
  'mission-cards': {
    preset: 'cards',
    width: 1200,
    height: 400,
    label: 'Mission Cards',
  },
  'value-props': {
    preset: 'grid',
    width: 1200,
    height: 500,
    label: 'Value Props',
  },
  grid: {
    preset: 'grid',
    width: 1200,
    height: 600,
    label: 'Grid Layout',
  },
  cards: {
    preset: 'cards',
    width: 1200,
    height: 400,
    label: 'Card Grid',
  },
  services: {
    preset: 'services',
    width: 1200,
    height: 600,
    label: 'Services',
  },
  testimonials: {
    preset: 'testimonials',
    width: 1200,
    height: 500,
    label: 'Testimonials',
  },
  cta: {
    preset: 'cta',
    width: 1200,
    height: 300,
    label: 'Call to Action',
  },
  footer: {
    preset: 'footer',
    width: 1200,
    height: 200,
    label: 'Footer',
  },
  default: {
    preset: 'default',
    width: 800,
    height: 300,
    label: 'Default Section',
  },
};

export function getDefaultSectionDimensions(type: string): SectionDimensions {
  return SECTION_DIMENSION_PRESETS[type as keyof typeof SECTION_DIMENSION_PRESETS] || SECTION_DIMENSION_PRESETS.default;
}
