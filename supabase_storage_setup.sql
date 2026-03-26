-- Configurar Storage para imágenes de kits
-- Ejecutar en Supabase Dashboard -> SQL Editor

-- 1. Crear bucket para imágenes de kits
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'kit-images',
    'kit-images',
    true,
    5242880, -- 5MB en bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- 2. Configurar políticas de acceso para el bucket
-- Política pública para leer imágenes
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'kit-images');

-- Política para que usuarios autenticados puedan subir imágenes
CREATE POLICY "Authenticated users can upload kit images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'kit-images' AND 
    auth.role() = 'authenticated'
);

-- Política para que usuarios autenticados puedan actualizar imágenes
CREATE POLICY "Authenticated users can update kit images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'kit-images' AND 
    auth.role() = 'authenticated'
);

-- Política para que usuarios autenticados puedan eliminar imágenes
CREATE POLICY "Authenticated users can delete kit images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'kit-images' AND 
    auth.role() = 'authenticated'
);

-- 3. Agregar columna image_url a la tabla kits si no existe
ALTER TABLE kits 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 4. Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_kits_image_url ON kits(image_url);

COMMIT;
