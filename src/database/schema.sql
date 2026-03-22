-- ==================================================
-- HITPOLY PDFS / AI SECTIONS
-- REINICIO COMPLETO DE ESQUEMA
-- ==================================================
-- Copia y pega este archivo completo en Supabase SQL Editor.
--
-- Que hace:
-- 1. Elimina vistas, relaciones y tablas viejas del sistema anterior.
-- 2. Elimina las tablas del backend actual si ya existian.
-- 3. Crea solo las tablas usadas hoy por el backend real:
--    - public.users_pdf_creator
--    - public.kv_store_pdf_creator
-- 4. Activa RLS y deja permisos abiertos para desarrollo.
-- 5. Inserta datos minimos funcionales para login, comunidad,
--    plantillas, editor y documentos.
--
-- IMPORTANTE:
-- Este script elimina estructuras previas del proyecto anterior.
-- Si tienes datos importantes, respalda antes de ejecutarlo.
-- ==================================================

begin;

create extension if not exists "pgcrypto";

-- ==================================================
-- LIMPIEZA TOTAL DEL SISTEMA ANTERIOR
-- ==================================================

drop view if exists public.templates_with_sections cascade;
drop view if exists public.sections_with_elements cascade;

drop table if exists public.document_template_relations cascade;
drop table if exists public.template_section_relations cascade;
drop table if exists public.element_section_relations cascade;
drop table if exists public.ai_responses cascade;
drop table if exists public.ai_messages cascade;
drop table if exists public.comments cascade;
drop table if exists public.likes cascade;
drop table if exists public.canva_elements cascade;
drop table if exists public.documents cascade;
drop table if exists public.templates cascade;
drop table if exists public.sections cascade;
drop table if exists public.users cascade;

-- ==================================================
-- LIMPIEZA DE TABLAS ACTUALES SI YA EXISTIAN
-- ==================================================

drop table if exists public.kv_store_pdf_creator cascade;
drop table if exists public.users_pdf_creator cascade;

-- ==================================================
-- TABLAS REALES DEL BACKEND ACTUAL
-- ==================================================

create table public.users_pdf_creator (
  id text primary key,
  email text not null unique,
  password text not null,
  name text,
  created_at timestamptz not null default now()
);

create table public.kv_store_pdf_creator (
  key text primary key,
  value jsonb not null
);

create index idx_users_pdf_creator_email
  on public.users_pdf_creator (email);

create index idx_kv_store_pdf_creator_key
  on public.kv_store_pdf_creator (key);

-- ==================================================
-- RLS
-- ==================================================

alter table public.users_pdf_creator enable row level security;
alter table public.kv_store_pdf_creator enable row level security;

-- ==================================================
-- POLITICAS ABIERTAS PARA DESARROLLO
-- ==================================================
-- Dejan crear, leer, editar y eliminar sin bloqueo.
-- Luego podras cerrarlas cuando pases a produccion real.

create policy users_public_select
on public.users_pdf_creator
for select
using (true);

create policy users_public_insert
on public.users_pdf_creator
for insert
with check (true);

create policy users_public_update
on public.users_pdf_creator
for update
using (true)
with check (true);

create policy users_public_delete
on public.users_pdf_creator
for delete
using (true);

create policy kv_store_public_select
on public.kv_store_pdf_creator
for select
using (true);

create policy kv_store_public_insert
on public.kv_store_pdf_creator
for insert
with check (true);

create policy kv_store_public_update
on public.kv_store_pdf_creator
for update
using (true)
with check (true);

create policy kv_store_public_delete
on public.kv_store_pdf_creator
for delete
using (true);

-- ==================================================
-- USUARIO DEMO
-- ==================================================

insert into public.users_pdf_creator (id, email, password, name)
values
  ('user-demo-001', 'demo@hitpoly.com', '123456', 'Usuario Demo'),
  ('user-demo-002', 'editor@hitpoly.com', '123456', 'Editor IA')
on conflict (id) do update set
  email = excluded.email,
  password = excluded.password,
  name = excluded.name;

-- ==================================================
-- DATOS MINIMOS DEL SISTEMA DINAMICO
-- ==================================================

insert into public.kv_store_pdf_creator (key, value)
values
(
  'section:section-demo-split',
  jsonb_build_object(
    'id', 'section-demo-split',
    'name', 'Productos Organicos',
    'description', 'Seccion generada con layout dividido, tres cards y bloque visual lateral.',
    'category', 'AI Generated',
    'type', 'ai-layout-split',
    'thumbnail', 'AI',
    'author', 'user-demo-001',
    'userId', 'user-demo-001',
    'isPublic', true,
    'createdAt', '2026-03-21T00:00:00Z',
    'updatedAt', '2026-03-21T00:00:00Z',
    'htmlCode', '<section class="ai-split-section"><div class="ai-split-copy"><span class="ai-eyebrow">Coleccion destacada</span><h2>Soluciones organizadas con enfoque comercial</h2><p>Tres productos organizados en cajas con apoyo visual lateral y composicion limpia.</p><div class="ai-product-grid"><article class="ai-product-card"><h3>Producto 01</h3><ul><li>Caracteristica principal</li><li>Beneficio operativo</li><li>Aplicacion destacada</li></ul></article><article class="ai-product-card"><h3>Producto 02</h3><ul><li>Caracteristica principal</li><li>Beneficio operativo</li><li>Aplicacion destacada</li></ul></article><article class="ai-product-card"><h3>Producto 03</h3><ul><li>Caracteristica principal</li><li>Beneficio operativo</li><li>Aplicacion destacada</li></ul></article></div></div><div class="ai-split-media"><img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80" alt="Imagen lateral de la seccion generada" /></div></section>',
    'cssCode', '.ai-split-section{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(320px,1fr);gap:32px;padding:56px;border-radius:28px;background:#f4f4f4;align-items:stretch}.ai-eyebrow{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#46614a;margin-bottom:14px}.ai-split-copy h2{font-size:40px;line-height:1.05;color:#17201a;margin:0 0 14px}.ai-split-copy p{font-size:17px;line-height:1.7;color:#49534a;margin:0 0 26px}.ai-product-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.ai-product-card{background:#fff;border:1px solid rgba(23,32,26,.08);border-radius:20px;padding:22px;box-shadow:0 12px 30px rgba(23,32,26,.06)}.ai-product-card h3{font-size:18px;margin:0 0 12px;color:#17201a}.ai-product-card ul{margin:0;padding-left:18px;color:#49534a;display:grid;gap:8px}.ai-split-media img{width:100%;height:100%;min-height:360px;object-fit:cover;border-radius:22px;display:block}@media (max-width:960px){.ai-split-section{grid-template-columns:1fr;padding:28px}.ai-product-grid{grid-template-columns:1fr}}',
    'jsCode', '',
    'content', jsonb_build_object(
      'type', 'ai-layout-split',
      'editable', jsonb_build_object(
        'eyebrow', jsonb_build_object(
          'text', 'Coleccion destacada',
          'fontSize', 12,
          'fontWeight', 700,
          'color', '#46614a',
          'letterSpacing', '0.14em'
        ),
        'title', jsonb_build_object(
          'text', 'Soluciones organizadas con enfoque comercial',
          'fontSize', 40,
          'fontWeight', 700,
          'color', '#17201a'
        ),
        'description', jsonb_build_object(
          'text', 'Tres productos organizados en cajas con apoyo visual lateral y composicion limpia.',
          'fontSize', 17,
          'fontWeight', 400,
          'color', '#49534a',
          'lineHeight', 1.7
        ),
        'imageUrl', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
        'cards', jsonb_build_array(
          jsonb_build_object(
            'title', jsonb_build_object('text', 'Producto 01', 'fontSize', 18, 'fontWeight', 700, 'color', '#17201a'),
            'bullets', jsonb_build_array(
              jsonb_build_object('text', 'Caracteristica principal', 'fontSize', 14, 'fontWeight', 400, 'color', '#49534a'),
              jsonb_build_object('text', 'Beneficio operativo', 'fontSize', 14, 'fontWeight', 400, 'color', '#49534a'),
              jsonb_build_object('text', 'Aplicacion destacada', 'fontSize', 14, 'fontWeight', 400, 'color', '#49534a')
            )
          ),
          jsonb_build_object(
            'title', jsonb_build_object('text', 'Producto 02', 'fontSize', 18, 'fontWeight', 700, 'color', '#17201a'),
            'bullets', jsonb_build_array(
              jsonb_build_object('text', 'Caracteristica principal', 'fontSize', 14, 'fontWeight', 400, 'color', '#49534a'),
              jsonb_build_object('text', 'Beneficio operativo', 'fontSize', 14, 'fontWeight', 400, 'color', '#49534a'),
              jsonb_build_object('text', 'Aplicacion destacada', 'fontSize', 14, 'fontWeight', 400, 'color', '#49534a')
            )
          ),
          jsonb_build_object(
            'title', jsonb_build_object('text', 'Producto 03', 'fontSize', 18, 'fontWeight', 700, 'color', '#17201a'),
            'bullets', jsonb_build_array(
              jsonb_build_object('text', 'Caracteristica principal', 'fontSize', 14, 'fontWeight', 400, 'color', '#49534a'),
              jsonb_build_object('text', 'Beneficio operativo', 'fontSize', 14, 'fontWeight', 400, 'color', '#49534a'),
              jsonb_build_object('text', 'Aplicacion destacada', 'fontSize', 14, 'fontWeight', 400, 'color', '#49534a')
            )
          )
        )
      ),
      'style', jsonb_build_object(
        'background', '#f4f4f4',
        'padding', '56px',
        'borderRadius', '28px'
      ),
      'generatedFromPrompt', 'Crea una seccion con tres cajas de productos, bullets, imagen lateral y fondo elegante.'
    )
  )
),
(
  'section:section-demo-hero',
  jsonb_build_object(
    'id', 'section-demo-hero',
    'name', 'Hero de Presentacion',
    'description', 'Bloque simple de cabecera persistido en el sistema dinamico.',
    'category', 'General',
    'type', 'hero',
    'thumbnail', 'DOC',
    'author', 'user-demo-002',
    'userId', 'user-demo-002',
    'isPublic', true,
    'createdAt', '2026-03-21T00:00:00Z',
    'updatedAt', '2026-03-21T00:00:00Z',
    'htmlCode', '<section class="hero-demo"><div class="hero-demo__inner"><h1>Presenta tus soluciones</h1><p>Secciones dinamicas con IA, codigo persistente y edicion visual.</p><span>Todo sincronizado desde base de datos</span></div></section>',
    'cssCode', '.hero-demo{background:linear-gradient(135deg,#1c5d15 0%,#0d350b 100%);color:#fff;padding:120px 40px;text-align:center}.hero-demo__inner{max-width:900px;margin:0 auto}.hero-demo h1{font-size:48px;font-weight:700;margin:0 0 16px}.hero-demo p{font-size:24px;margin:0 0 12px}.hero-demo span{font-size:16px;opacity:.9}',
    'jsCode', '',
    'content', jsonb_build_object(
      'type', 'hero',
      'editable', jsonb_build_object(
        'title', jsonb_build_object('text', 'Presenta tus soluciones', 'fontSize', 48, 'fontWeight', 700, 'color', '#ffffff', 'fontFamily', 'Poppins', 'lineHeight', 1.2),
        'subtitle', jsonb_build_object('text', 'Secciones dinamicas con IA, codigo persistente y edicion visual.', 'fontSize', 24, 'fontWeight', 400, 'color', '#ffffff', 'fontFamily', 'Poppins', 'lineHeight', 1.5),
        'tagline', jsonb_build_object('text', 'Todo sincronizado desde base de datos', 'fontSize', 16, 'fontWeight', 400, 'color', '#ffffff', 'fontFamily', 'Poppins', 'lineHeight', 1.4)
      ),
      'style', jsonb_build_object(
        'background', 'linear-gradient(135deg, #1c5d15 0%, #0d350b 100%)',
        'padding', '120px 40px',
        'textAlign', 'center'
      )
    )
  )
),
(
  'template:template-demo-001',
  jsonb_build_object(
    'id', 'template-demo-001',
    'name', 'Landing IA Demo',
    'description', 'Plantilla base para probar el editor con secciones dinamicas persistidas.',
    'thumbnail', 'TPL',
    'author', 'user-demo-001',
    'userId', 'user-demo-001',
    'isPublic', true,
    'createdAt', '2026-03-21T00:00:00Z',
    'updatedAt', '2026-03-21T00:00:00Z',
    'sections', jsonb_build_array(
      (
        select value from public.kv_store_pdf_creator where key = 'section:section-demo-hero'
      ),
      (
        select value from public.kv_store_pdf_creator where key = 'section:section-demo-split'
      )
    )
  )
),
(
  'document:user-demo-001:document-demo-001',
  jsonb_build_object(
    'id', 'document-demo-001',
    'userId', 'user-demo-001',
    'templateId', 'template-demo-001',
    'name', 'Documento Demo IA',
    'customContent', jsonb_build_array(
      (
        select value from public.kv_store_pdf_creator where key = 'section:section-demo-hero'
      ),
      (
        select value from public.kv_store_pdf_creator where key = 'section:section-demo-split'
      )
    ),
    'lastModified', '2026-03-21T00:00:00Z'
  )
)
on conflict (key) do update set
  value = excluded.value;

commit;

-- ==================================================
-- VERIFICACION RAPIDA
-- ==================================================
-- select * from public.users_pdf_creator;
-- select key from public.kv_store_pdf_creator order by key;
-- select value->>'name' as name from public.kv_store_pdf_creator where key like 'section:%';
-- select value->>'name' as name from public.kv_store_pdf_creator where key like 'template:%';
-- select value->>'name' as name from public.kv_store_pdf_creator where key like 'document:%';
--
-- LOGIN DEMO:
-- email: demo@hitpoly.com
-- password: 123456
