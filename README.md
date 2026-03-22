# Sistema de Edición de Secciones Interactivas

## 🎯 Visión General

Este proyecto implementa un sistema completo para la creación y edición de documentos interactivos mediante una interfaz visual basada en secciones reutilizables. Los usuarios pueden crear, editar y organizar contenido mediante un editor visual avanzado con integración de IA para generación de contenido.

## 🚀 Características Principales

### 🎨 Editor Visual Avanzado
- **Interfaz tipo Canva/Photoshop**: Editor visual completo con arrastrar y soltar
- **Edición de elementos internos**: Edita texto, colores, tamaños, fuentes, estilos de cada elemento
- **Controles de edición en tiempo real**: Cambia colores, tamaños, estilos mientras ves los cambios
- **Barra de herramientas flotante**: Acceso rápido a herramientas de edición (negrita, color, tamaño)
- **Selector de colores avanzado**: Paleta de colores completa con selector visual
- **Reordenación flexible**: Cambia el orden de las secciones arrastrándolas fácilmente
- **Vista previa instantánea**: Ve cómo quedará tu documento final mientras lo editas

### 🤖 Integración con IA (Gemini)
- **Generación de contenido**: Pregunta a la IA qué contenido deseas para cada sección
- **Edición colaborativa**: Si no te gusta el resultado, edítalo directamente en el editor visual
- **Personalización inteligente**: La IA sugiere contenido basado en el tipo de sección y tu estilo
- **Dos modos de generación**: Sección individual o documento completo
- **Fusión IA + Editor**: Combina generación automática con edición manual precisa

### 📋 Gestión de Secciones Avanzada
- **Sistema de secciones reutilizables**: Cada usuario tiene su propia colección de secciones clasificadas por categorías
- **Biblioteca organizada**: Secciones clasificadas por categorías (Hero, Grid, Cards, Services, etc.)
- **Edición HTML/CSS completa**: Control total sobre el contenido y estilos de cada sección
- **Dimensiones personalizables**: Secciones con diferentes tamaños (Hero, Banner, Content, Story, Footer)
- **Vista previa de secciones**: Previsualización en tamaño real antes de usar

### 🛠️ Herramientas de Edición Profesional
- **Editor de texto enriquecido**: Edición inline con controles de fuente, tamaño, color, negrita
- **Selector de colores ChromePicker**: Paleta de colores profesional con selector visual
- **Gestor de capas**: Control de orden y visibilidad de secciones
- **Panel de propiedades**: Configuración avanzada de estilos y apariencia
- **Controles de zoom**: Vista de canvas con zoom para edición precisa
- **Cuadrícula de ayuda**: Guías visuales para alineación perfecta

### 📄 Exportación Profesional
- **Conversión a PDF de alta calidad**: Exporta tus documentos manteniendo todos los estilos y formato
- **Formato profesional**: Resultados listos para impresión o compartir
- **Descarga automática**: Genera y descarga tus PDFs con un solo clic
- **Multi-página**: Soporte para documentos largos con múltiples páginas

### 🔐 Seguridad y Privacidad
- **Datos personales**: Cada usuario tiene acceso solo a sus propias secciones y documentos
- **Autenticación segura**: Sistema de login robusto con validación JWT
- **Base de datos protegida**: Uso de políticas RLS para control de acceso
- **Almacenamiento seguro**: Persistencia en Supabase con encriptación

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 19** + TypeScript
- **Tailwind CSS** + Radix UI
- **React DnD** para funcionalidad de arrastrar y soltar
- **Monaco Editor** para edición de código
- **React Query** para gestión de estado y caché

### Backend
- **Supabase** (PostgreSQL + Auth)
- **Edge Functions** serverless
- **Puppeteer** para generación de PDF

### Desarrollo
- **Vite** para entorno de desarrollo
- **ESLint + Prettier** para calidad de código

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── components/          # Componentes React
│   │   ├── Editor.tsx      # Editor principal con arrastrar y soltar
│   │   ├── EditableSection.tsx  # Sección editable individual
│   │   ├── SectionLibraryModal.tsx  # Biblioteca de secciones
│   │   └── CreateTemplate.tsx  # Creación de plantillas
│   ├── utils/              # Utilidades
│   │   ├── supabase.ts     # Configuración Supabase
│   │   └── api.ts         # Clientes API
│   └── App.tsx            # Componente principal
├── styles/                # Estilos CSS
└── main.tsx              # Punto de entrada

supabase/
├── migrations/           # Migraciones SQL
└── functions/            # Funciones serverless

utils/
└── supabase/            # Scripts de utilidad
```

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js 18+
- npm o yarn
- Cuenta en Supabase

### Pasos de Instalación

1. **Clonar y configurar**
   ```bash
   git clone <repository-url>
   cd brochure-interactivo
   npm install
   ```

2. **Configurar variables de entorno**
   Crear un archivo `.env` en la raíz del proyecto:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Configurar Supabase**
   - Crear proyecto en Supabase
   - Ejecutar migraciones SQL
   - Configurar políticas de RLS
   - Desplegar funciones Edge

4. **Iniciar desarrollo**
   ```bash
   npm run dev
   ```

## 🎨 Flujo de Trabajo

### 1. Creación de Secciones
1. Accede a la biblioteca de secciones
2. Crea una nueva sección con:
   - Título descriptivo
   - Contenido HTML
   - Estilos CSS personalizados
   - Tipo de sección (header, content, footer, etc.)

### 2. Edición de Documentos
1. Abre el editor principal
2. Arrastra secciones desde la biblioteca al área de edición
3. Edita cada sección individualmente:
   - Contenido de texto
   - Estilos CSS
   - Elementos HTML
4. Reordena secciones arrastrándolas

### 3. Integración con IA
1. Selecciona una sección para editar
2. Pregunta a la IA qué contenido deseas generar
3. Si no te gusta el resultado, edítalo manualmente con arrastrar y soltar
4. Personaliza el contenido según tus necesidades

### 4. Exportación
1. Selecciona el documento a exportar
2. El sistema genera el HTML completo
3. Convierte a PDF manteniendo estilos y formato
4. Descarga el archivo generado

## 📖 Documentación Completa

Para una guía detallada de instalación, configuración y uso:

- **[SISTEMA_COMPLETO.md](./SISTEMA_COMPLETO.md)** - Documentación completa del sistema
- **[README_SISTEMA.md](./README_SISTEMA.md)** - Resumen y guía rápida

## 🎯 Objetivos Cumplidos

✅ Sistema de gestión de secciones personalizadas  
✅ Editor visual con arrastrar y soltar  
✅ Biblioteca de secciones por usuario  
✅ Integración con IA para generación de contenido  
✅ Edición colaborativa (IA + arrastrar y soltar)  
✅ Exportación a PDF de documentos  
✅ Autenticación y seguridad robusta  
✅ Documentación completa del sistema  

## 🚀 Próximos Pasos

- Implementar colaboración en tiempo real
- Añadir más tipos de secciones predefinidas
- Integrar con APIs externas (Google Drive, Dropbox)
- Sistema de versiones de documentos
- Plantillas premium y marketplace

---

**Nota**: Este sistema está diseñado para ser simple, escalable y fácil de mantener. Cada usuario tiene su propia colección de secciones y plantillas, permitiendo una experiencia personalizada y segura basada en arrastrar y soltar."# pdfs" 
