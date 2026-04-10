-- Crear tabla contacts en Supabase
-- Ejecuta este SQL en Supabase: https://app.supabase.com/project/[tu-project-id]/sql

CREATE TABLE contacts (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  empresa VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  servicio VARCHAR(255) NOT NULL,
  factura VARCHAR(100),
  mensaje TEXT,
  status VARCHAR(50) DEFAULT 'Nueva solicitud',
  progress INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para búsquedas rápidas
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX idx_contacts_status ON contacts(status);

-- Enable Row Level Security (RLS) para seguridad
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Política para leer todos los registros (anon)
CREATE POLICY "Permitir lectura pública" ON contacts
  FOR SELECT USING (true);

-- Política para insertar registros (anon)
CREATE POLICY "Permitir inserción pública" ON contacts
  FOR INSERT WITH CHECK (true);

-- Política para actualizar registros (anon)
CREATE POLICY "Permitir actualización pública" ON contacts
  FOR UPDATE USING (true);

-- Política para eliminar registros (anon)
CREATE POLICY "Permitir eliminación pública" ON contacts
  FOR DELETE USING (true);
