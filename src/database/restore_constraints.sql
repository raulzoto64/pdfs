-- ===============================================
-- SCRIPT PARA RESTAURAR RESTRICCIONES (OPCIONAL)
-- ===============================================

-- Este script restaura las restricciones después de usar remove_constraints.sql
-- Úsalo solo si necesitas volver a tener las restricciones en tu base de datos

-- 1. RESTAURAR FUNCIONES AUXILIARES
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. RESTAURAR TRIGGERS
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_canva_elements_updated_at BEFORE UPDATE ON canva_elements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. RESTAURAR ÍNDICES
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_canva_elements_user_id ON canva_elements(user_id);
CREATE INDEX idx_sections_user_id ON sections(user_id);
CREATE INDEX idx_templates_user_id ON templates(user_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_ai_messages_user_id ON ai_messages(user_id);
CREATE INDEX idx_ai_responses_message_id ON ai_responses(ai_message_id);
CREATE INDEX idx_sections_public ON sections(is_public) WHERE is_public = true;
CREATE INDEX idx_templates_public ON templates(is_public) WHERE is_public = true;
CREATE INDEX idx_element_section_element ON element_section_relations(element_id);
CREATE INDEX idx_element_section_section ON element_section_relations(section_id);

-- 4. RESTAURAR RESTRICCIONES DE CLAVES FORÁNEAS
-- Tabla canva_elements
ALTER TABLE canva_elements ADD CONSTRAINT canva_elements_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Tabla sections
ALTER TABLE sections ADD CONSTRAINT sections_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Tabla templates
ALTER TABLE templates ADD CONSTRAINT templates_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Tabla documents
ALTER TABLE documents ADD CONSTRAINT documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Tabla ai_messages
ALTER TABLE ai_messages ADD CONSTRAINT ai_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Tabla ai_responses
ALTER TABLE ai_responses ADD CONSTRAINT ai_responses_ai_message_id_fkey FOREIGN KEY (ai_message_id) REFERENCES ai_messages(id) ON DELETE CASCADE;

-- Tabla element_section_relations
ALTER TABLE element_section_relations ADD CONSTRAINT element_section_relations_element_id_fkey FOREIGN KEY (element_id) REFERENCES canva_elements(id) ON DELETE CASCADE;
ALTER TABLE element_section_relations ADD CONSTRAINT element_section_relations_section_id_fkey FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE;

-- Tabla likes
ALTER TABLE likes ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE likes ADD CONSTRAINT likes_section_id_fkey FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE;
ALTER TABLE likes ADD CONSTRAINT likes_template_id_fkey FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE;

-- Tabla comments
ALTER TABLE comments ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE comments ADD CONSTRAINT comments_section_id_fkey FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE;
ALTER TABLE comments ADD CONSTRAINT comments_template_id_fkey FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE;

-- Tabla template_section_relations
ALTER TABLE template_section_relations ADD CONSTRAINT template_section_relations_template_id_fkey FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE;
ALTER TABLE template_section_relations ADD CONSTRAINT template_section_relations_section_id_fkey FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE;

-- Tabla document_template_relations
ALTER TABLE document_template_relations ADD CONSTRAINT document_template_relations_document_id_fkey FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE;
ALTER TABLE document_template_relations ADD CONSTRAINT document_template_relations_template_id_fkey FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE;

-- 5. RESTAURAR RESTRICCIONES UNIQUE
-- Tabla element_section_relations
ALTER TABLE element_section_relations ADD CONSTRAINT element_section_relations_element_id_section_id_key UNIQUE (element_id, section_id);

-- Tabla likes
ALTER TABLE likes ADD CONSTRAINT likes_user_id_section_id_template_id_key UNIQUE (user_id, section_id, template_id);

-- Tabla template_section_relations
ALTER TABLE template_section_relations ADD CONSTRAINT template_section_relations_template_id_section_id_key UNIQUE (template_id, section_id);

-- Tabla document_template_relations
ALTER TABLE document_template_relations ADD CONSTRAINT document_template_relations_document_id_template_id_key UNIQUE (document_id, template_id);

-- 6. RESTAURAR RESTRICCIONES CHECK
-- Tabla canva_elements
ALTER TABLE canva_elements ADD CONSTRAINT canva_elements_type_check CHECK (type IN ('text', 'rectangle', 'circle'));

-- 7. RESTAURAR VISTAS
CREATE VIEW sections_with_elements AS
SELECT 
    s.id as section_id,
    s.name as section_name,
    s.description,
    s.user_id,
    u.name as user_name,
    s.is_public,
    s.created_at,
    s.updated_at,
    COUNT(esr.element_id) as element_count,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'id', ce.id,
            'type', ce.type,
            'x', ce.x,
            'y', ce.y,
            'width', ce.width,
            'height', ce.height,
            'properties', ce.properties,
            'z_index', ce.z_index
        )
    ) as elements
FROM sections s
LEFT JOIN element_section_relations esr ON s.id = esr.section_id
LEFT JOIN canva_elements ce ON esr.element_id = ce.id
LEFT JOIN users u ON s.user_id = u.id
GROUP BY s.id, s.name, s.description, s.user_id, u.name, s.is_public, s.created_at, s.updated_at;

CREATE VIEW templates_with_sections AS
SELECT 
    t.id as template_id,
    t.name as template_name,
    t.description,
    t.user_id,
    u.name as user_name,
    t.is_public,
    t.thumbnail_url,
    t.created_at,
    t.updated_at,
    COUNT(tsr.section_id) as section_count,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'id', s.id,
            'name', s.name,
            'description', s.description,
            'is_public', s.is_public,
            'element_count', s_element_count
        )
    ) as sections
FROM templates t
LEFT JOIN template_section_relations tsr ON t.id = tsr.template_id
LEFT JOIN sections s ON tsr.section_id = s.id
LEFT JOIN (
    SELECT section_id, COUNT(element_id) as s_element_count
    FROM element_section_relations
    GROUP BY section_id
) esr ON s.id = esr.section_id
LEFT JOIN users u ON t.user_id = u.id
GROUP BY t.id, t.name, t.description, t.user_id, u.name, t.is_public, t.thumbnail_url, t.created_at, t.updated_at;

-- ===============================================
-- VERIFICACIÓN DE RESTRICCIONES RESTAURADAS
-- ===============================================

-- Consulta para verificar que las restricciones se restauraron correctamente
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
-- RESUMEN DE RESTRICCIONES RESTAURADAS
-- ===============================================

/*
ESTE SCRIPT RESTAURA:

1. **FUNCIONES**: Función para actualizar fechas automáticamente
2. **TRIGGERS**: Actualización automática de campos updated_at
3. **ÍNDICES**: Índices para mejorar el rendimiento de consultas
4. **CLAVES FORÁNEAS**: Relaciones entre tablas con eliminación en cascada
5. **RESTRICCIONES UNIQUE**: Validaciones de unicidad en relaciones
6. **RESTRICCIONES CHECK**: Validaciones de tipos de datos permitidos
7. **VISTAS**: Consultas predefinidas para obtener datos relacionados

BENEFICIOS DE RESTAURAR RESTRICCIONES:
- ✅ **Integridad referencial**: Las relaciones entre tablas están protegidas
- ✅ **Validaciones automáticas**: Se validan tipos de datos y unicidad
- ✅ **Rendimiento optimizado**: Las consultas son más rápidas con índices
- ✅ **Funcionalidades automáticas**: Las fechas se actualizan automáticamente
- ✅ **Consistencia de datos**: Se evitan datos huérfanos o inconsistentes

USO:
- Este script es útil para entornos de producción
- Restaura todas las restricciones eliminadas por remove_constraints.sql
- Asegura la integridad y consistencia de la base de datos
*/