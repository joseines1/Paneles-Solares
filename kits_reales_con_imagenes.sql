-- Eliminar todos los kits existentes y agregar nuevos productos solares reales
-- Ejecutar en Supabase Dashboard -> SQL Editor

-- 1. Eliminar todos los kits existentes
DELETE FROM kits;

-- 2. Resetear secuencia de IDs
ALTER SEQUENCE kits_id_seq RESTART WITH 1;

-- 3. Insertar nuevos kits solares reales con imágenes
INSERT INTO kits (name, category, capacity, price, stock, description, panels, inverter, battery, warranty, image_url, is_active) VALUES
-- KITS RESIDENCIALES
(
    'Kit Residencial Básico 2.5 kW',
    'Residencial',
    2500,
    35000.00,
    15,
    'Kit ideal para viviendas pequeñas con consumo moderado. Incluye 6 paneles monocristalinos de 415W, inversor híbrido de 2.5kW con monitoreo WiFi, estructura de aluminio anodizada y cableado certificado. Perfecto para reducir significativamente el recibo de luz.',
    6,
    2.5,
    NULL,
    25,
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
    true
),
(
    'Kit Residencial Estándar 5 kW',
    'Residencial',
    5000,
    65000.00,
    12,
    'Nuestro kit más popular para familias. Sistema completo con 12 paneles de alta eficiencia 415W, inversor de 5kW con tecnología German, batería de litio 5kWh para almacenamiento, estructura resistente y instalación profesional incluida.',
    12,
    5.0,
    5.0,
    25,
    'https://images.unsplash.com/photo-1559302985-f1e932c6a6a5?w=400&h=300&fit=crop',
    true
),
(
    'Kit Residencial Premium 8 kW',
    'Residencial',
    8000,
    95000.00,
    8,
    'Sistema de alto rendimiento para grandes residencias. 19 paneles bifaciales de 420W, inversor trifásico 8kW con eficiencia >98%, batería 10kWh, montaje premium con seguimiento solar, monitor avanzado y garantía extendida.',
    19,
    8.0,
    10.0,
    30,
    'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&h=300&fit=crop',
    true
),

-- KITS COMERCIALES
(
    'Kit Comercial Pequeño 10 kW',
    'Comercial',
    10000,
    145000.00,
    6,
    'Solución perfecta para pequeños negocios y oficinas. 24 paneles monocristalinos 420W, inversor comercial 10kV con monitoreo 4G, estructura comercial pesada, sistema de puesta a tierra, protecciones eléctricas y certificación de interconexión.',
    24,
    10.0,
    NULL,
    25,
    'https://images.unsplash.com/photo-1497445465247-9e8e768eda94?w=400&h=300&fit=crop',
    true
),
(
    'Kit Comercial Mediano 25 kW',
    'Comercial',
    25000,
    320000.00,
    4,
    'Sistema robusto para medianas empresas. 60 paneles bifaciales 420W, 3 inversores comerciales 8.3kW en paralelo, batería 25kWh, estructura industrial con seguimiento, sistema de monitoreo avanzado y mantenimiento preventivo incluido.',
    60,
    25.0,
    25.0,
    25,
    'https://images.unsplash.com/photo-1519124325405-f0a9a5a5f7e0?w=400&h=300&fit=crop',
    true
),
(
    'Kit Comercial Grande 50 kW',
    'Comercial',
    50000,
    580000.00,
    3,
    'Solución industrial para grandes consumidores. 120 paneles bifaciales 420W, 6 inversores comerciales 8.5kW, sistema de almacenamiento 50kWh, estructura con seguimiento dual-eje, monitor de producción en tiempo real y garantía de rendimiento 25 años.',
    120,
    50.0,
    50.0,
    25,
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop',
    true
),

-- KITS INDUSTRIALES
(
    'Kit Industrial 100 kW',
    'Industrial',
    100000,
    1100000.00,
    2,
    'Sistema de gran escala para fábricas e industrias. 240 paneles bifaciales 420W, 12 inversores comerciales 8.5kW, almacenamiento 100kWh, estructura con seguimiento solar, sistema SCADA, monitor de rendimiento y mantenimiento predictivo.',
    240,
    100.0,
    100.0,
    25,
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
    true
),
(
    'Kit Industrial 250 kW',
    'Industrial',
    250000,
    2650000.00,
    1,
    'Planta solar de alta capacidad para parques industriales. 600 paneles bifaciales 420W, 30 inversores comerciales 8.5kW, sistema de almacenamiento 250kWh, estructura con seguimiento automático, sistema de gestión energética completo y garantía de producción.',
    600,
    250.0,
    250.0,
    25,
    'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400&h=300&fit=crop',
    true
),

-- KITS ESPECIALIZADOS
(
    'Kit Agrícola 15 kW',
    'Comercial',
    15000,
    185000.00,
    5,
    'Sistema diseñado para bombas de agua y riego agrícola. 36 paneles resistentes a condiciones extremas, inversor especializado 15kV para bombeo, estructura elevada para evitar sombras, sistema de control automático y protección contra sobretensiones.',
    36,
    15.0,
    NULL,
    25,
    'https://images.unsplash.com/photo-1592984397309-02b511e9b8f9?w=400&h=300&fit=crop',
    true
),
(
    'Kit Híbrido con Batería 6 kW',
    'Residencial',
    6000,
    125000.00,
    7,
    'Sistema híbrido completo con almacenamiento. 15 paneles monocristalinos 400W, inversor híbrido 6kW, batería de litio 12kWh, sistema de gestión energética, backup automático y aplicación móvil para monitoreo. Ideal para zonas con intermitencia.',
    15,
    6.0,
    12.0,
    25,
    'https://images.unsplash.com/photo-1593941707882-a5bac674b2fd?w=400&h=300&fit=crop',
    true
),
(
    'Kit para Techo Plano 12 kW',
    'Comercial',
    12000,
    175000.00,
    4,
    'Sistema optimizado para techos planos comerciales. 30 paneles con montaje especial para máxima inclinación, inversor 12kW, estructura de acero galvanizado, sistema de drenaje integrado y mantenimiento incluido por 2 años.',
    30,
    12.0,
    NULL,
    25,
    'https://images.unsplash.com/photo-1542361347-9d526b4bd5b5?w=400&h=300&fit=crop',
    true
);

COMMIT;

-- Mostrar resultado
SELECT 'Kits solares reales insertados correctamente' as resultado;
SELECT COUNT(*) as total_kits FROM kits WHERE is_active = true;
