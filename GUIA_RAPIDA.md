# 🚀 Guía Rápida - Sistema de Creación de PDFs

## 📋 ¿Qué acabas de crear?

Un **sistema completo de creación colaborativa de PDFs** con editor visual tipo Canva/Photoshop que permite:

- ✅ Crear PDFs por secciones arrastrables
- ✅ Usar plantillas profesionales pre-diseñadas
- ✅ Compartir secciones con la comunidad
- ✅ Editar contenido en tiempo real
- ✅ Exportar a PDF de alta calidad
- ✅ Guardar documentos con ID de usuario

---

## 🎯 Primeros Pasos

### 1. **Explora la Aplicación**

Al abrir la aplicación verás:

```
📄 PDF Creator Pro
├── 🏠 Inicio - Descripción del sistema
├── 📄 Plantillas - 3 plantillas pre-cargadas
├── ✏️ Crear PDF - Editor visual
├── 📁 Mis PDFs - Documentos guardados
└── 👥 Comunidad - Secciones compartidas
```

### 2. **Prueba el Editor Visual**

**Opción A: Usar la plantilla de ejemplo**
```
1. Click en "Comenzar con la Plantilla" (botón verde)
2. Verás el editor con el Brochure de A&T BioNano pre-cargado
3. Edita el texto directamente en los campos del panel izquierdo
4. Edita colores, tamaños y estilos con la barra de herramientas flotante
5. Usa el selector de colores para cambiar paletas de color
6. Arrastra las secciones para reordenarlas
7. Usa el gestor de capas para controlar visibilidad
8. Observa los cambios en tiempo real en el panel derecho
9. Click "Guardar" y luego "Exportar PDF"
```

**Opción B: Crear desde cero**
```
1. Click en "Crear Nuevo PDF"
2. Añade secciones con los botones: Hero, Título, Texto
3. Edita el contenido con el editor de texto enriquecido
4. Personaliza colores, fuentes y estilos con el panel de propiedades
5. Usa el zoom para edición precisa
6. Arrastra para reordenar y alinea con la cuadrícula de ayuda
7. Exporta tu PDF profesional
```

### 3. **Explora las Plantillas**

```
1. Ve a "Plantillas"
2. Verás 3 plantillas:
   - Brochure Corporativo A&T BioNano
   - Propuesta Comercial
   - Folleto de Marketing
3. Click en "Usar Plantilla" en cualquiera
4. Personaliza y exporta
```

### 4. **Comparte con la Comunidad**

```
1. Ve a "Comunidad"
2. Click en "Crear Sección"
3. Llena el formulario:
   - Nombre: "Mi Sección Personalizada"
   - Tipo: Texto
   - Contenido: "Tu contenido aquí"
   - ✓ Marcar "Compartir públicamente"
4. Click "Crear Sección"
5. La sección aparecerá en la biblioteca comunitaria
```

---

## 🎨 Tipos de Secciones Disponibles

| Tipo | Descripción | Uso |
|------|-------------|-----|
| **Hero** 🎯 | Portada con título y subtítulo | Inicio de documentos |
| **Heading** 📌 | Encabezado de sección | Títulos principales |
| **Text** 📝 | Párrafo de texto | Contenido descriptivo |
| **Mission Cards** 🎴 | Tarjetas con ícono + texto | Misión, visión, valores |
| **Value Props** 💎 | Propuestas de valor | Beneficios, características |

---

## 🔧 Funcionalidades del Editor

### Panel Izquierdo (Edición)
- **Drag & Drop**: Arrastra para reordenar secciones
- **Edición inline**: Campos de texto para editar contenido
- **Eliminar**: Botón 🗑️ en cada sección
- **Selección**: Click en una sección para seleccionarla

### Panel Derecho (Vista Previa)
- **Vista en tiempo real**: Cambios inmediatos
- **Formato PDF**: Tamaño A4 (794px × 1123px)
- **Estilos profesionales**: Colores, tipografía, espaciado

### Toolbar Superior
- **Añadir secciones**: Hero, Título, Texto
- **Guardar**: Guarda tu documento en la base de datos
- **Exportar PDF**: Descarga como PDF

---

## 💾 Gestión de Documentos

### Guardar Documento
```
1. En el Editor, click "Guardar"
2. Escribe un nombre: "Mi Primer PDF"
3. Click "Guardar"
4. El documento se guarda en la base de datos
```

### Ver Mis Documentos
```
1. Ve a "Mis PDFs"
2. Verás todos tus documentos guardados
3. Click "Editar" para continuar trabajando
4. Click 🗑️ para eliminar
```

---

## 📊 Datos de Prueba Incluidos

### Plantillas (3)
1. **Brochure Corporativo A&T BioNano**
   - 6 secciones profesionales
   - Hero, texto, tarjetas, propuestas de valor
   - Temática: Bionanotecnología

2. **Propuesta Comercial**
   - 3 secciones básicas
   - Para presentaciones de negocios

3. **Folleto de Marketing**
   - 3 secciones básicas
   - Para campañas promocionales

### Secciones Comunitarias (4)
- Hero Tecnología
- Texto Sobre Nosotros
- Título Nuestros Servicios
- Texto Contacto

---

## 🎓 Casos de Uso

### 1. **Brochure Corporativo**
```
Usar: Plantilla "Brochure Corporativo A&T BioNano"
Personalizar: Logo, texto, colores
Ideal para: Presentaciones empresariales, ferias, clientes
```

### 2. **Propuesta de Servicios**
```
Usar: Plantilla "Propuesta Comercial"
Añadir: Secciones de servicios, precios, contacto
Ideal para: Freelancers, consultores, agencias
```

### 3. **Folleto Promocional**
```
Usar: Plantilla "Folleto de Marketing"
Añadir: Imágenes, ofertas, call-to-action
Ideal para: Campañas, lanzamientos, eventos
```

### 4. **Reporte o Informe**
```
Crear: Desde cero
Usar: Secciones de texto y títulos
Ideal para: Reportes internos, documentación
```

---

## 🔍 Arquitectura Técnica

### Frontend
- **React 18.3.1** + TypeScript
- **Material UI 7.3.5** para componentes
- **React Router 7.13.0** para navegación
- **React DnD** para drag & drop
- **html2canvas + jsPDF** para exportación

### Backend
- **Supabase Edge Functions** (Deno)
- **Hono** framework web
- **KV Store** para base de datos
- **REST API** completa

### Base de Datos
```
template:atbionano-template
template:business-proposal
template:marketing-brochure
section:section-hero-tech
section:section-text-about
section:section-heading-services
section:section-text-contact
document:guest:12345...
```

---

## 🚀 Próximos Pasos

### Para Usuarios
1. ✅ Crear tu primer PDF con la plantilla
2. ✅ Experimentar con diferentes secciones
3. ✅ Compartir secciones en la comunidad
4. ✅ Exportar y descargar tu PDF

### Para Desarrolladores
1. 📝 Añadir más tipos de secciones (imágenes, tablas)
2. 🎨 Implementar temas y estilos personalizables
3. 🤖 Integrar chat AI para crear PDFs con descripción
4. 👥 Añadir sistema de autenticación de usuarios
5. 📊 Implementar analytics y métricas

---

## ❓ Preguntas Frecuentes

**¿Cómo edito las tarjetas o propuestas de valor?**
Estas secciones complejas se cargan desde la plantilla. Próximamente tendrán editor visual.

**¿Se guardan automáticamente los cambios?**
No, debes hacer click en "Guardar". Esto te da control total sobre cuándo guardar.

**¿Puedo usar secciones de la comunidad en mi PDF?**
Sí, próximamente podrás arrastrarlas directamente al editor.

**¿Los PDFs son de alta calidad?**
Sí, se exportan con scale:2 para resolución óptima.

**¿Cómo funciona el sistema de usuarios?**
Actualmente usa `userId: "guest"`. Puedes implementar autenticación real.

---

## 📞 Soporte

Para más información, consulta:
- `SISTEMA_PDFS.md` - Documentación completa
- Código fuente en `/src/app/`
- Servidor backend en `/supabase/functions/server/`

---

**¡Disfruta creando PDFs increíbles! 🎉**
