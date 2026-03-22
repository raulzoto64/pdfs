# Sistema de Creacion Colaborativa de PDFs

## Descripcion

Sistema de creacion y edicion de PDFs por secciones con editor visual tipo Canva. Permite consumir plantillas y secciones reales desde la base de datos, guardar documentos por usuario y exportar PDFs profesionales.

## Caracteristicas Principales

### 1. Editor Visual Tipo Canva/Photoshop
- **Interfaz tipo Canva/Photoshop**: Editor visual completo con arrastrar y soltar
- **Edición de elementos internos**: Edita texto, colores, tamaños, fuentes, estilos de cada elemento
- **Controles de edición en tiempo real**: Cambia colores, tamaños, estilos mientras ves los cambios
- **Barra de herramientas flotante**: Acceso rápido a herramientas de edición (negrita, color, tamaño)
- **Selector de colores avanzado**: Paleta de colores completa con selector visual
- **Editor de texto enriquecido**: Edición inline con controles de fuente, tamaño, color, negrita
- **Selector de colores ChromePicker**: Paleta de colores profesional con selector visual
- **Gestor de capas**: Control de orden y visibilidad de secciones
- **Panel de propiedades**: Configuración avanzada de estilos y apariencia
- **Controles de zoom**: Vista de canvas con zoom para edición precisa
- **Cuadrícula de ayuda**: Guías visuales para alineación perfecta
- **Vista previa en tiempo real**: Ve cómo quedará tu documento final mientras lo editas
- **Reordenamiento de secciones**: Cambia el orden de las secciones arrastrándolas fácilmente
- **Exportación a PDF**: Conversión profesional con alta calidad
- **Guardado de documentos en base de datos**: Persistencia segura de tus creaciones

### 2. Sistema de Plantillas
- Plantillas publicas y privadas
- Carga de plantillas desde backend
- Edicion de plantillas a partir de secciones persistidas

### 3. Biblioteca Comunitaria
- Secciones reutilizables
- Compartir secciones con la comunidad
- Crear nuevas secciones y guardarlas en base de datos
- Secciones publicas y privadas

### 4. Gestion de Documentos
- Guardar documentos con ID de usuario
- Edicion de documentos guardados
- Historial de modificaciones
- Almacenamiento en base de datos

## Arquitectura

### Frontend (React + Material UI)
```text
/src/app/
|-- components/
|   |-- Root.tsx
|   |-- Home.tsx
|   |-- Editor.tsx
|   |-- Templates.tsx
|   |-- MyDocuments.tsx
|   |-- CommunitySections.tsx
|   |-- SectionLibraryModal.tsx
|   `-- EditableSection.tsx
|-- types/
|   `-- pdfCreator.ts
|-- utils/
|   |-- auth.ts
|   `-- pdfCreatorApi.ts
`-- routes.tsx
```

### Backend (Supabase Edge Function + Hono)
```text
/supabase/functions/server/
|-- index.tsx
`-- kv_store.tsx
```

## Rutas de la API

### Autenticacion
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesion
- `GET /auth/me/:id` - Obtener usuario actual

### Plantillas
- `GET /templates` - Obtener plantillas visibles para el usuario
- `GET /templates/:id` - Obtener plantilla por ID
- `POST /templates` - Crear nueva plantilla
- `PUT /templates/:id` - Actualizar plantilla
- `DELETE /templates/:id` - Eliminar plantilla

### Secciones
- `GET /sections` - Obtener secciones visibles para el usuario
- `POST /sections` - Crear nueva seccion
- `PUT /sections/:id` - Actualizar seccion

### Documentos
- `GET /documents` - Obtener documentos del usuario
- `GET /documents/:id` - Obtener documento por ID
- `POST /documents` - Guardar o actualizar documento
- `DELETE /documents/:id` - Eliminar documento

## Base de Datos

La persistencia activa del sistema de PDFs usa:

- `kv_store_pdf_creator`
- `users_pdf_creator`

### Estructura de Datos

**Template**
```ts
{
  id: string,
  name: string,
  description: string,
  sections: Section[],
  userId: string,
  isPublic: boolean,
  createdAt: string,
  updatedAt: string
}
```

**Section**
```ts
{
  id: string,
  name: string,
  description: string,
  category: string,
  type: string,
  content: any,
  author: string,
  userId?: string,
  isPublic: boolean,
  createdAt: string
}
```

**Document**
```ts
{
  id: string,
  userId: string,
  templateId: string | null,
  name: string,
  customContent: Section[],
  lastModified: string
}
```

### Prefijos de Almacenamiento
- `template:` - Plantillas completas
- `section:` - Secciones individuales
- `document:{userId}:` - Documentos de usuarios

## Flujo de Trabajo del Usuario

### 1. Crear Nuevo PDF
```text
Usuario -> Inicio -> "Crear Nuevo PDF"
       -> Editor -> Anadir secciones
       -> Editar contenido
       -> Guardar
       -> Exportar PDF
```

### 2. Usar Plantilla Existente
```text
Usuario -> Plantillas -> Seleccionar plantilla
       -> Editor (pre-cargado)
       -> Personalizar contenido
       -> Guardar
       -> Exportar PDF
```

### 3. Compartir Seccion con Comunidad
```text
Usuario -> Comunidad -> Crear seccion
       -> Marcar como publica
       -> Guardar
       -> Aparece en Comunidad
```

## Tipos de Secciones

El editor actualmente normaliza y renderiza correctamente estos tipos persistidos:

- `hero`
- `heading`
- `text`
- `simple-text`

Los tipos adicionales dependen del formato guardado en `content.editable` y `content.style`.

## Estado Actual del Sistema

- El front ya no depende de `mockData` para plantillas, secciones o documentos.
- La autenticacion ya no cae a usuarios mock en `localStorage`.
- El backend ya no realiza seed automatico de datos de prueba.
- Los documentos se cargan y guardan contra la base de datos real del proyecto.

## Tecnologias Utilizadas

### Frontend
- React 18.3.1
- Material UI 7.3.5
- React Router 7.13.0
- React DnD 16.0.1
- html2canvas
- jsPDF
- Sonner

### Backend
- Supabase Edge Functions
- Hono
- Deno Runtime
- KV Store sobre Supabase

## Navegacion del Sistema

```text
Inicio | Plantillas | Crear PDF | Mis PDFs | Comunidad
```

- **Inicio**: entrada principal del sistema
- **Plantillas**: listado de plantillas disponibles desde base de datos
- **Crear PDF**: editor visual
- **Mis PDFs**: documentos guardados por el usuario autenticado
- **Comunidad**: secciones compartidas y creacion de nuevas secciones

## Guia de Uso Rapido

### Para Usuarios

1. Crear un PDF
   - Ir a `Crear PDF`
   - Abrir biblioteca de secciones
   - Agregar secciones
   - Editar contenido
   - Guardar
   - Exportar

2. Usar una plantilla
   - Ir a `Plantillas`
   - Seleccionar una plantilla
   - Editar contenido
   - Guardar y exportar

3. Crear una seccion comunitaria
   - Ir a `Comunidad`
   - Click en `Crear Seccion`
   - Completar contenido
   - Marcar como publica si corresponde

### Para Desarrolladores

**Anadir nuevo tipo de seccion**
```ts
// 1. Extender la normalizacion en src/app/utils/pdfCreatorApi.ts
// 2. Agregar renderizado en src/app/components/EditableSection.tsx
// 3. Agregar opcion de creacion si aplica en src/app/components/CommunitySections.tsx
```

**Personalizar exportacion PDF**
```ts
// En src/app/components/Editor.tsx, funcion exportToPDF()
const pdf = new jsPDF({
  orientation: "portrait",
  unit: "mm",
  format: "a4",
});
```

## Gestion de Usuarios

El sistema usa autenticacion propia contra el backend del proyecto:

1. Registro con `POST /auth/register`
2. Login con `POST /auth/login`
3. Persistencia del usuario actual en `localStorage`
4. Asociacion de documentos y secciones al `userId`

## Proximas Funcionalidades

- Chat AI para generar contenido mas estructurado
- Mas tipos de secciones
- Temas y estilos reutilizables
- Colaboracion en tiempo real
- Versionado de documentos

## Notas Tecnicas

- Estado local de edicion con `useState`
- Persistencia manual con boton `Guardar`
- Drag and drop con React DnD
- Exportacion con `html2canvas` y `jsPDF`
- Adaptacion de datos de backend en `pdfCreatorApi.ts`

---

Documento actualizado al flujo real del proyecto, sin referencias activas a mocks o seeds automaticos.
