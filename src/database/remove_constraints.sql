-- ===============================================
-- SCRIPT PARA ELIMINAR TODAS LAS RESTRICCIONES
-- ===============================================

-- 1. ELIMINAR TRIGGERS
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_canva_elements_updated_at ON canva_elements;
DROP TRIGGER IF EXISTS update_sections_updated_at ON sections;
DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;

-- 2. ELIMINAR FUNCIONES AUXILIARES
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 3. ELIMINAR ÍNDICES
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_canva_elements_user_id;
DROP INDEX IF EXISTS idx_sections_user_id;
DROP INDEX IF EXISTS idx_templates_user_id;
DROP INDEX IF EXISTS idx_documents_user_id;
DROP INDEX IF EXISTS idx_ai_messages_user_id;
DROP INDEX IF EXISTS idx_ai_responses_message_id;
DROP INDEX IF EXISTS idx_sections_public;
DROP INDEX IF EXISTS idx_templates_public;
DROP INDEX IF EXISTS idx_element_section_element;
DROP INDEX IF EXISTS idx_element_section_section;

-- 4. ELIMINAR RESTRICCIONES DE CLAVES FORÁNEAS
-- Tabla canva_elements
ALTER TABLE canva_elements DROP CONSTRAINT IF EXISTS canva_elements_user_id_fkey;

-- Tabla sections
ALTER TABLE sections DROP CONSTRAINT IF EXISTS sections_user_id_fkey;

-- Tabla templates
ALTER TABLE templates DROP CONSTRAINT IF EXISTS templates_user_id_fkey;

-- Tabla documents
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_user_id_fkey;

-- Tabla ai_messages
ALTER TABLE ai_messages DROP CONSTRAINT IF EXISTS ai_messages_user_id_fkey;

-- Tabla ai_responses
ALTER TABLE ai_responses DROP CONSTRAINT IF EXISTS ai_responses_ai_message_id_fkey;

-- Tabla element_section_relations
ALTER TABLE element_section_relations DROP CONSTRAINT IF EXISTS element_section_relations_element_id_fkey;
ALTER TABLE element_section_relations DROP CONSTRAINT IF EXISTS element_section_relations_section_id_fkey;

-- Tabla likes
ALTER TABLE likes DROP CONSTRAINT IF EXISTS likes_user_id_fkey;
ALTER TABLE likes DROP CONSTRAINT IF EXISTS likes_section_id_fkey;
ALTER TABLE likes DROP CONSTRAINT IF EXISTS likes_template_id_fkey;

-- Tabla comments
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_section_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_template_id_fkey;

-- Tabla template_section_relations
ALTER TABLE template_section_relations DROP CONSTRAINT IF EXISTS template_section_relations_template_id_fkey;
ALTER TABLE template_section_relations DROP CONSTRAINT IF EXISTS template_section_relations_section_id_fkey;

-- Tabla document_template_relations
ALTER TABLE document_template_relations DROP CONSTRAINT IF EXISTS document_template_relations_document_id_fkey;
ALTER TABLE document_template_relations DROP CONSTRAINT IF EXISTS document_template_relations_template_id_fkey;

-- 5. ELIMINAR RESTRICCIONES UNIQUE
-- Tabla element_section_relations
ALTER TABLE element_section_relations DROP CONSTRAINT IF EXISTS element_section_relations_element_id_section_id_key;

-- Tabla likes
ALTER TABLE likes DROP CONSTRAINT IF EXISTS likes_user_id_section_id_template_id_key;

-- Tabla template_section_relations
ALTER TABLE template_section_relations DROP CONSTRAINT IF EXISTS template_section_relations_template_id_section_id_key;

-- Tabla document_template_relations
ALTER TABLE document_template_relations DROP CONSTRAINT IF EXISTS document_template_relations_document_id_template_id_key;

-- 6. ELIMINAR RESTRICCIONES CHECK
-- Tabla canva_elements
ALTER TABLE canva_elements DROP CONSTRAINT IF EXISTS canva_elements_type_check;

-- 7. ELIMINAR VISTAS
DROP VIEW IF EXISTS sections_with_elements;
DROP VIEW IF EXISTS templates_with_sections;

-- ===============================================
-- VERIFICACIÓN DE RESTRICCIONES RESTANTES
-- ===============================================

-- Consulta para verificar si quedan restricciones
SELECT 
    table_name,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
    AND constraint_type IN ('FOREIGN KEY', 'UNIQUE', 'CHECK')
    AND table_name IN (
        'users', 'canva_elements', 'sections', 'templates', 
        'documents', 'ai_messages', 'ai_responses', 
        'element_section_relations', 'likes', 'comments',
        'template_section_relations', 'document_template_relations'
    )
ORDER BY table_name, constraint_type;

-- ===============================================
-- RECOMENDACIONES
-- ===============================================

/*
ESTE SCRIPT ELIMINA:

1. **TRIGGERS**: Funciones automáticas de actualización
2. **FUNCIONES**: Funciones auxiliares de base de datos
3. **ÍNDICES**: Índices para mejorar el rendimiento
4. **CLAVES FORÁNEAS**: Relaciones entre tablas
5. **RESTRICCIONES UNIQUE**: Validaciones de unicidad
6. **RESTRICCIONES CHECK**: Validaciones de valores
7. **VISTAS**: Consultas predefinidas

ADVERTENCIAS:
- ⚠️  **Pérdida de integridad referencial**: Las relaciones entre tablas ya no están protegidas
- ⚠️  **Pérdida de validaciones**: No se validarán tipos de datos ni unicidad
- ⚠️  **Pérdida de rendimiento**: Las consultas pueden ser más lentas sin índices
- ⚠️  **Pérdida de funcionalidades automáticas**: No se actualizarán fechas automáticamente

USO:
- Este script es útil para desarrollo o pruebas
- No se recomienda usar en producción
- Si necesitas restringir acceso, considera usar permisos de usuario en lugar de eliminar restricciones
*/