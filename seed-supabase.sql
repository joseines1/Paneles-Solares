-- ===== DATOS DE PRUEBA PARA SUPABASE =====
-- Ejecuta este script en: Supabase Dashboard > SQL Editor

-- 1. LIMPIAR DATOS ANTERIORES (OPCIONAL - comentar si quieres mantener datos)
-- DELETE FROM promotions;
-- DELETE FROM kits;

-- 2. INSERTAR KITS (PRODUCTOS)
INSERT INTO kits (name, category, capacity, price, stock, description, panels, inverter, battery, warranty, is_active, created_at) VALUES
  ('SolarKit Básico 3kW', 'Residencial', 3000, 24999, 10, 'Sistema residencial ideal para casas de 150-180m². Incluye 12 paneles de 250W, inversor híbrido y monitoreo.', 12, 3.0, 5.0, 10, true, NOW()),
  ('SolarKit Plus 5kW', 'Residencial', 5000, 39999, 8, 'Sistema residencial avanzado para casas de 200-250m² con alto consumo. Incluye 20 paneles, batería ampliada.', 20, 5.0, 10.0, 10, true, NOW()),
  ('SolarKit Comercial 10kW', 'Comercial', 10000, 79999, 5, 'Sistema comercial para pequeños negocios. Conexión a red de CFE, reducción de 60% en factura eléctrica.', 40, 10.0, NULL, 15, true, NOW()),
  ('SolarKit Industrial 50kW', 'Industrial', 50000, 349999, 2, 'Sistema industrial de gran escala para fábricas y almacenes. Ahorro de $50k/mes en consumo eléctrico.', 200, 50.0, NULL, 20, true, NOW()),
  ('SolarKit Off-Grid 7kW', 'Residencial', 7000, 129999, 4, 'Sistema independiente de la red para zonas rurales. Batería de almacenamiento 30kWh incluida.', 28, 7.0, 30.0, 10, true, NOW());

-- 3. INSERTAR PROMOCIONES
INSERT INTO promotions (title, description, badge, badge_color, icon, original_price, promo_price, features, kit_ids, is_active, created_at) VALUES
  (
    '30% Descuento en Sistemas Residenciales',
    'Aprovecha este mes para instalar tu sistema solar con descuento especial. Válido para SolarKit Básico y Plus.',
    'DESCUENTO MAYO',
    '#10b981',
    '💰',
    '$39,999',
    '$27,999',
    'Instalación incluida, Garantía 10 años, Monitoreo 24/7, Financiamiento disponible',
    ARRAY[1, 2],
    true,
    NOW()
  ),
  (
    'Financiamiento 0% 12 Meses',
    'En todos nuestros sistemas comerciales. Perfecto para tu negocio sin intereses.',
    'FINANCIAMIENTO',
    '#f59e0b',
    '🏢',
    '$79,999',
    '$79,999',
    'Aprobación inmediata, Sin comisiones, Amortización mensual flexible, Seguimiento técnico',
    ARRAY[3],
    true,
    NOW()
  ),
  (
    'Regalo: Batería 5kWh',
    'Compra el SolarKit Plus y llévate batería gratis. Valor de regalo: $15,000.',
    'OFERTA ESPECIAL',
    '#8b5cf6',
    '🎁',
    '$39,999',
    '$39,999',
    'Batería 5kWh gratis, Instalación express, Garantía extendida 15 años, App premium',
    ARRAY[2],
    true,
    NOW()
  ),
  (
    'Kit Industrial Mega Descuento',
    'Sistema de 50kW para grandes fábricas y almacenes. Recupera inversión en 3 años.',
    'INDUSTRIAL',
    '#ef4444',
    '⚙️',
    '$349,999',
    '$299,999',
    'Monitoreo 24/7, Instalación profesional, Garantía 20 años, Soporte técnico prioritario',
    ARRAY[4],
    true,
    NOW()
  );

-- 4. VERIFICAR INSERCIONES
SELECT COUNT(*) as total_kits FROM kits;
SELECT COUNT(*) as total_promotions FROM promotions;

-- 5. VER DATOS INSERTADOS
SELECT * FROM kits ORDER BY created_at DESC;
SELECT * FROM promotions ORDER BY created_at DESC;
