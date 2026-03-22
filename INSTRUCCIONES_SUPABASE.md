# Instrucciones Supabase

## Proyecto actual

- Project ref: `xsuauybjzhipyigoveko`
- URL: `https://xsuauybjzhipyigoveko.supabase.co`
- Funcion: `make-server-e4166826`

El frontend local ya esta apuntando a este proyecto en:

- [info.tsx](/D:/Softwares/brochure%20interactivo/utils/supabase/info.tsx)

## 🎨 Editor Visual Avanzado

Este proyecto incluye un editor visual tipo Canva/Photoshop con las siguientes características:

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

## SQL que debes ejecutar

Ejecuta completo este archivo en Supabase SQL Editor:

- [schema.sql](/D:/Softwares/brochure%20interactivo/src/database/schema.sql)

Ese script:

- elimina el esquema viejo
- crea `users_pdf_creator`
- crea `kv_store_pdf_creator`
- deja permisos abiertos para desarrollo
- inserta usuarios, secciones, plantilla y documento demo

## Variables de entorno para la Edge Function

Debes crear estas variables en:

- `Edge Functions`
- `Secrets`

### Variables requeridas

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`

### Valores

`SUPABASE_URL`

```txt
https://xsuauybjzhipyigoveko.supabase.co
```

`SUPABASE_SERVICE_ROLE_KEY`

```txt
usa la service_role key de tu proyecto en:
Settings > API Keys > Secret keys
```

`GEMINI_API_KEY`

```txt
usa tu API key real de Google AI Studio / Gemini
```

`GEMINI_MODEL`

```txt
gemini-2.5-flash
```

## Configuracion de la funcion

En la funcion `make-server-e4166826`:

- `Verify JWT with legacy secret`: `OFF`

## Archivos que debe tener la funcion web

Dentro del editor web de la funcion deben existir:

- `index.ts`
- `kv_store.ts`

`index.ts` debe importar:

```ts
import * as kv from "./kv_store.ts";
```

## Despues de crear los secrets

Tienes que volver a desplegar la funcion.

## Pruebas rapidas

### Diagnostico de storage

Abre:

```txt
https://xsuauybjzhipyigoveko.supabase.co/functions/v1/make-server-e4166826/diagnostics/storage
```

### Generacion IA

Haz un POST a:

```txt
https://xsuauybjzhipyigoveko.supabase.co/functions/v1/make-server-e4166826/ai/generate-section
```

Body:

```json
{
  "prompt": "crea una seccion con 3 cajas de productos, vietas, imagen lateral y fondo elegante #f4f4f4",
  "sectionType": "dynamic",
  "sectionTitle": "Nueva seccion IA"
}
```

## Login demo

- email: `demo@hitpoly.com`
- password: `123456`

## Archivos reales conectados

Frontend:

- [auth.ts](/D:/Softwares/brochure%20interactivo/src/app/utils/auth.ts)
- [geminiService.ts](/D:/Softwares/brochure%20interactivo/src/app/utils/geminiService.ts)
- [pdfCreatorApi.ts](/D:/Softwares/brochure%20interactivo/src/app/utils/pdfCreatorApi.ts)

Backend:

- [index.tsx](/D:/Softwares/brochure%20interactivo/supabase/functions/server/index.tsx)
- [kv_store.tsx](/D:/Softwares/brochure%20interactivo/supabase/functions/server/kv_store.tsx)

## Lo que ya revise

- el frontend local ya usa `xsuauybjzhipyigoveko`
- la funcion objetivo sigue siendo `make-server-e4166826`
- la documentacion era lo unico que seguia apuntando al proyecto viejo
