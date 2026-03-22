# Sistema de Edición de Secciones Interactivas

## Visión General

Este sistema permite a los usuarios crear y editar documentos interactivos mediante una interfaz visual basada en secciones. Cada usuario tiene su propia colección de secciones personalizadas que pueden ser reutilizadas en diferentes documentos y convertidas a PDF.

## Arquitectura del Sistema

### Base de Datos (Supabase)

#### Tablas Principales

1. **users** - Información de usuarios
   - `id` (UUID) - Identificador único
   - `email` - Correo electrónico
   - `name` - Nombre del usuario
   - `created_at` - Fecha de creación

2. **sections** - Secciones personalizadas de cada usuario
   - `id` (UUID) - Identificador único
   - `user_id` (UUID) - Relación con el usuario
   - `title` - Título de la sección
   - `content` - Contenido HTML de la sección
   - `styles` - Estilos CSS asociados
   - `type` - Tipo de sección (header, content, footer, etc.)
   - `created_at` - Fecha de creación
   - `updated_at` - Fecha de última actualización

3. **templates** - Plantillas completas creadas a partir de secciones
   - `id` (UUID) - Identificador único
   - `user_id` (UUID) - Relación con el usuario
   - `name` - Nombre de la plantilla
   - `description` - Descripción de la plantilla
   - `sections` - Array de IDs de secciones que componen la plantilla
   - `created_at` - Fecha de creación

4. **documents** - Documentos creados por los usuarios
   - `id` (UUID) - Identificador único
   - `user_id` (UUID) - Relación con el usuario
   - `title` - Título del documento
   - `content` - Contenido HTML completo del documento
   - `template_id` (UUID) - Plantilla base utilizada (opcional)
   - `created_at` - Fecha de creación
   - `updated_at` - Fecha de última actualización

### Backend API

#### Endpoints Principales

1. **Secciones**
   - `GET /api/sections` - Listar secciones del usuario
   - `POST /api/sections` - Crear nueva sección
   - `PUT /api/sections/:id` - Actualizar sección
   - `DELETE /api/sections/:id` - Eliminar sección

2. **Plantillas**
   - `GET /api/templates` - Listar plantillas del usuario
   - `POST /api/templates` - Crear nueva plantilla
   - `PUT /api/templates/:id` - Actualizar plantilla
   - `DELETE /api/templates/:id` - Eliminar plantilla

3. **Documentos**
   - `GET /api/documents` - Listar documentos del usuario
   - `POST /api/documents` - Crear nuevo documento
   - `PUT /api/documents/:id` - Actualizar documento
   - `DELETE /api/documents/:id` - Eliminar documento
   - `POST /api/documents/:id/export` - Exportar documento a PDF

### Frontend (React + TypeScript)

#### Componentes Principales

1. **Editor** (`src/app/components/Editor.tsx`)
   - Interfaz principal de edición
   - Gestión de secciones arrastrables
   - Vista previa en tiempo real
   - Herramientas de edición visual

2. **EditableSection** (`src/app/components/EditableSection.tsx`)
   - Componente individual de sección editable
   - Soporte para edición de texto, estilos y contenido
   - Integración con el editor de código

3. **SectionLibraryModal** (`src/app/components/SectionLibraryModal.tsx`)
   - Biblioteca de secciones del usuario
   - Creación y gestión de secciones
   - Búsqueda y filtrado de secciones

4. **CreateTemplate** (`src/app/components/CreateTemplate.tsx`)
   - Interfaz para crear plantillas a partir de secciones
   - Selección múltiple de secciones
   - Gestión de nombres y descripciones

## Flujo de Trabajo

### 1. Creación de Secciones

1. El usuario accede a la biblioteca de secciones
2. Puede crear una nueva sección con:
   - Título descriptivo
   - Contenido HTML
   - Estilos CSS personalizados
   - Tipo de sección (header, content, footer, etc.)

3. Las secciones se guardan en la base de datos asociadas al usuario

### 2. Edición de Documentos

1. El usuario abre el editor principal
2. Puede arrastrar secciones de su biblioteca al área de edición
3. Cada sección es editable individualmente con herramientas profesionales:
   - **Editor de texto enriquecido**: Edición inline con controles de fuente, tamaño, color, negrita
   - **Selector de colores avanzado**: Paleta de colores completa con ChromePicker
   - **Modificación de estilos CSS**: Cambio de estilos en tiempo real
   - **Cambio de contenido HTML**: Edición directa del código HTML
   - **Controles de zoom**: Vista de canvas con zoom para edición precisa
   - **Gestor de capas**: Control de orden y visibilidad de secciones
   - **Panel de propiedades**: Configuración avanzada de estilos y apariencia

4. El contenido se actualiza en tiempo real con vista previa instantánea

### 3. Creación de Plantillas

1. El usuario selecciona secciones de su biblioteca
2. Organiza las secciones en el orden deseado
3. Asigna un nombre y descripción a la plantilla
4. La plantilla se guarda como una colección de IDs de secciones

### 4. Exportación a PDF

1. El usuario selecciona el documento a exportar
2. El sistema genera el HTML completo del documento
3. Se utiliza Puppeteer para convertir el HTML a PDF
4. El PDF se descarga automáticamente

## Características Principales

### Edición Visual
- Interfaz intuitiva basada en arrastrar y soltar
- Edición en tiempo real del contenido y estilos
- Vista previa instantánea de los cambios

### Gestión de Contenido
- Sistema de secciones reutilizables
- Biblioteca personalizada para cada usuario
- Organización por tipos y categorías

### Personalización
- Edición de HTML y CSS directamente
- Estilos personalizados para cada sección
- Plantillas configurables

### Exportación
- Conversión a PDF de alta calidad
- Mantenimiento de estilos y formato
- Descarga automática

## Tecnologías Utilizadas

### Frontend
- **React 19** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos y diseño
- **Radix UI** - Componentes base
- **React DnD** - Funcionalidad de arrastrar y soltar
- **Monaco Editor** - Editor de código integrado
- **React Query** - Gestión de estado y caché

### Backend
- **Supabase** - Base de datos y autenticación
- **PostgreSQL** - Base de datos relacional
- **Edge Functions** - Funciones serverless
- **Puppeteer** - Generación de PDF

### Desarrollo
- **Vite** - Entorno de desarrollo
- **ESLint + Prettier** - Calidad de código
- **TypeScript** - Tipado estático

## Instalación y Configuración

### Requisitos Previos
- Node.js 18+
- npm o yarn
- Cuenta en Supabase

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd brochure-interactivo
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   Crear un archivo `.env` en la raíz del proyecto:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Configurar Supabase**
   - Crear proyecto en Supabase
   - Ejecutar migraciones SQL
   - Configurar políticas de RLS
   - Desplegar funciones Edge

5. **Iniciar el desarrollo**
   ```bash
   npm run dev
   ```

## Uso del Sistema

### Para Usuarios Finales

1. **Registro e Inicio de Sesión**
   - Crear cuenta o iniciar sesión con credenciales
   - Acceder al dashboard principal

2. **Crear Secciones**
   - Ir a "Biblioteca de Secciones"
   - Crear nueva sección con contenido HTML/CSS
   - Guardar y organizar en categorías

3. **Editar Documentos**
   - Abrir el editor principal
   - Arrastrar secciones desde la biblioteca
   - Editar contenido y estilos según necesidad
   - Guardar cambios automáticamente

4. **Crear Plantillas**
   - Seleccionar secciones deseadas
   - Organizar en el orden correcto
   - Guardar como plantilla para reutilización

5. **Exportar Documentos**
   - Seleccionar documento a exportar
   - Elegir formato de exportación (PDF)
   - Descargar el archivo generado

### Para Desarrolladores

1. **Extender Funcionalidades**
   - Añadir nuevos tipos de secciones
   - Implementar nuevos editores de contenido
   - Crear plugins de exportación

2. **Personalizar Estilos**
   - Modificar estilos en `src/styles/`
   - Ajustar componentes en `src/app/components/`
   - Configurar temas en `src/app/App.tsx`

3. **Agregar Integraciones**
   - Conectar con APIs externas
   - Implementar sistemas de autenticación adicionales
   - Añadir funcionalidades de colaboración

## API Reference

### Secciones

#### GET /api/sections
Obtiene todas las secciones del usuario autenticado.

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Título de la sección",
    "content": "<div>Contenido HTML</div>",
    "styles": "div { color: red; }",
    "type": "content",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /api/sections
Crea una nueva sección.

**Request:**
```json
{
  "title": "Nuevo título",
  "content": "<div>Contenido HTML</div>",
  "styles": "div { color: blue; }",
  "type": "header"
}
```

#### PUT /api/sections/:id
Actualiza una sección existente.

**Request:**
```json
{
  "title": "Título actualizado",
  "content": "<div>Contenido modificado</div>",
  "styles": "div { color: green; }"
}
```

### Plantillas

#### POST /api/templates
Crea una nueva plantilla.

**Request:**
```json
{
  "name": "Nombre de la plantilla",
  "description": "Descripción de la plantilla",
  "sections": ["uuid1", "uuid2", "uuid3"]
}
```

### Documentos

#### POST /api/documents/:id/export
Exporta un documento a PDF.

**Response:**
Archivo PDF descargable con el contenido del documento.

## Seguridad

- **Autenticación JWT** - Validación de tokens en todas las rutas protegidas
- **RLS (Row Level Security)** - Control de acceso a nivel de fila en Supabase
- **Validación de Entrada** - Sanitización de HTML y validación de datos
- **HTTPS** - Comunicación segura en producción

## Escalabilidad

- **Supabase** - Base de datos escalable con replicación automática
- **Edge Functions** - Funciones serverless distribuidas globalmente
- **CDN** - Distribución de recursos estáticos
- **Caché** - Gestión de caché con React Query

## Mantenimiento

### Actualizaciones de Base de Datos
Las migraciones SQL se encuentran en `supabase/migrations/` y deben ejecutarse en orden.

### Monitoreo
- Métricas de uso en Supabase
- Logs de funciones Edge
- Monitoreo de rendimiento del frontend

### Copias de Seguridad
- Supabase proporciona copias de seguridad automáticas
- Exportación manual de datos mediante pg_dump

## Soporte y Contribución

Para reportar bugs, solicitar características o contribuir al proyecto:

1. Crear un issue en el repositorio
2. Describir el problema o solicitud claramente
3. Proporcionar pasos para reproducir (si aplica)
4. Para contribuciones, seguir las directrices de desarrollo

## Licencia

Este proyecto está bajo la Licencia MIT. Consulte el archivo LICENSE para más detalles.