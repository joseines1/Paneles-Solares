-- ==============================================================================
-- DATOS DE EJEMPLO PARA PANEL DE ADMINISTRACIÓN SOLAR WEB
-- ==============================================================================
-- Instrucciones:
-- 1. Ejecutar después de haber creado el esquema completo
-- 2. Estos datos poblarán todas las tablas con información realista
-- ==============================================================================

-- 1. CLIENTES/MENSAJES DE CONTACTO (20 CLIENTES REALISTAS)
INSERT INTO public.contact_messages (nombre, empresa, email, telefono, servicio, factura, mensaje, status, crmNote, created_at) VALUES
('Carlos Rodríguez', 'Manufacturas del Norte S.A. de C.V.', 'carlos.rodriguez@manufacturasnorte.com', '5512345678', 'Instalación Comercial', 'Factura A', 'Necesitamos una solución solar para nuestra planta de 5,000m². Consumo mensual aproximado de 15,000 kWh.', 'Cerrado', 'Cliente VIP - Instalación completada en Febrero 2024. Muy satisfecho con los resultados.', '2024-01-15 10:30:00'),
('María González', NULL, 'maria.gonzalez@email.com', '5523456789', 'Instalación Residencial', 'Factura C', 'Vivo en una casa de 200m² en CDMX, quiero reducir mi recibo de luz que es de $2,500 mensuales.', 'Cerrado', 'Instalación residencial completa. Cliente referirá a familiares.', '2024-01-20 14:15:00'),
('Roberto Silva', 'Logística Veloz Express', 'roberto.silva@logisticaveloz.com', '5534567890', 'Instalación Comercial', 'Factura A', 'Empresa de transporte con flota de 50 vehículos. Buscamos energía solar para nuestras oficinas y bodegas.', 'En Proceso', 'En espera de aprobación de financiamiento. Seguimiento programado para la próxima semana.', '2024-02-01 09:45:00'),
('Ana Patricia Martínez', NULL, 'ana.martinez@doctora.com', '5545678901', 'Instalación Residencial', 'Factura C', 'Médica con consultorio en Guadalajara. Necesito energía confiable para mi equipo médico.', 'Cerrado', 'Instalación con sistema de respaldo. Cliente muy contenta.', '2024-02-05 16:20:00'),
('Luis Fernando Vargas', 'Vargas Alimentos S.A.', 'luis.vargas@vargasalimentos.com', '5556789012', 'Instalación Industrial', 'Factura A', 'Empresa procesadora de alimentos. Requerimos sistema solar para línea de producción.', 'En Proceso', 'Visita técnica realizada. Elaborando propuesta a medida.', '2024-02-10 11:30:00'),
('Patricia Morales', NULL, 'paty.morales.arq@gmail.com', '5567890123', 'Instalación Residencial', 'Factura C', 'Arquitecta con casa en Querétaro. Diseño ecológico con energía solar integrada.', 'Cerrado', 'Proyecto de diseño personalizado. Instalación estética.', '2024-02-15 13:45:00'),
('Javier Hernández', 'Distribuidora Central del Norte', 'javier.hernandez@distcentral.com', '5578901234', 'Instalación Comercial', 'Factura A', 'Distribuidora con 3 sucursales. Cotización para todas las ubicaciones.', 'Nuevo', 'Cliente potencial grande. Necesita cotización corporativa.', '2024-02-20 10:00:00'),
('Carmen López', NULL, 'carmen.lopez.cafe@gmail.com', '5589012345', 'Instalación Residencial', 'Factura C', 'Dueña de cafetería en Monterrey. Busco reducir costos operativos.', 'En Proceso', 'Interesada en sistema con baterías. Enviando información adicional.', '2024-02-25 15:30:00'),
('Miguel Ángel Castro', 'Castro Construcciones', 'miguel.castro@castroconstrucciones.com', '5590123456', 'Instalación Comercial', 'Factura A', 'Desarrolladora inmobiliaria. Proyectos de fraccionamientos con energía solar.', 'Cerrado', 'Acuerdo marco para 5 desarrollos. Cliente estratégico.', '2024-03-01 09:15:00'),
('Sofía Ramírez', NULL, 'sofia.ramirez@abogada.com', '5501234567', 'Instalación Residencial', 'Factura C', 'Abogada con oficina en casa. Necesito energía estable para trabajo remoto.', 'Cerrado', 'Instalación con sistema híbrido. Muy profesional.', '2024-03-05 14:20:00'),
('Diego Torres', 'Torres Distribuidores', 'diego.torres@torresdist.com', '5512345678', 'Instalación Comercial', 'Factura A', 'Distribuidor de autopartes. 3 almacenes en el Estado de México.', 'En Proceso', 'Análisis de consumo en proceso. Propuesta preliminar enviada.', '2024-03-10 11:45:00'),
('Gabriela Ortiz', NULL, 'gabriela.ortiz.tierra@gmail.com', '5523456789', 'Instalación Residencial', 'Factura C', 'Agrónoma con rancho en Puebla. Sistema para bomba de agua y vivienda.', 'Nuevo', 'Requiere sistema especial para bombeo. Cotizando componentes.', '2024-03-15 16:00:00'),
('Ricardo Mendoza', 'Mendoza Textiles S.A.', 'ricardo.mendoza@mendozatextiles.com', '5534567890', 'Instalación Industrial', 'Factura A', 'Fábrica textil con maquinaria pesada. Alto consumo energético.', 'En Proceso', 'Estudio de factibilidad en curso. Requiere sistema grande.', '2024-03-20 10:30:00'),
('Valentina Jiménez', NULL, 'valentina.jimenez.diseno@gmail.com', '5545678901', 'Instalación Residencial', 'Factura C', 'Diseñadora gráfica. Departamento en Polanco con alto consumo por equipos.', 'Cerrado', 'Instalación elegante en terraza. Cliente satisfecha.', '2024-03-25 13:15:00'),
('Alejandro Núñez', 'Núñez Transporte', 'alejandro.nunez@nuneztransporte.com', '5556789012', 'Instalación Comercial', 'Factura A', 'Empresa de transporte con terminal en Guadalajara.', 'Nuevo', 'Primera cotización enviada. Esperando respuesta.', '2024-03-28 09:45:00'),
('Lucía Fernández', NULL, 'lucia.fernandez.fotos@gmail.com', '5567890123', 'Instalación Residencial', 'Factura C', 'Fotógrafa profesional. Estudio en casa con equipos de alto consumo.', 'En Proceso', 'Interesada en sistema portátil para sesiones externas.', '2024-04-01 15:20:00'),
('Pedro Gómez', 'Gómez y Asociados', 'pedro.gomez@gomezasociados.com', '5578901234', 'Instalación Comercial', 'Factura A', 'Bufete de abogados. Edificio de 5 pisos en CDMX.', 'Cerrado', 'Instalación corporativa completa. Cliente recurrente para mantenimiento.', '2024-04-05 11:30:00'),
('Marina Castro', NULL, 'marina.castro.rest@gmail.com', '5589012345', 'Instalación Residencial', 'Factura C', 'Chef con restaurante en casa. Consumo elevado por equipo de cocina.', 'En Proceso', 'Requiere sistema con capacidad extra para futura expansión.', '2024-04-10 14:45:00'),
('Fernando Ruiz', 'Ruiz Automotriz', 'fernando.ruiz@ruizautomotriz.com', '5590123456', 'Instalación Comercial', 'Factura A', 'Agencia de autos y taller mecánico. 2 sucursales.', 'Nuevo', 'Solicitó cotización para ambas sucursales. Potencial cliente grande.', '2024-04-15 10:15:00'),
('Daniela Herrera', NULL, 'daniela.herrera.arte@gmail.com', '5501234567', 'Instalación Residencial', 'Factura C', 'Artista plástica con taller en casa. Horarios irregulares de consumo.', 'Cerrado', 'Sistema flexible con almacenamiento. Cliente muy creativa y exigente.', '2024-04-20 16:30:00')
ON CONFLICT DO NOTHING;

-- 2. PROYECTOS (EJEMPLOS DE INSTALACIONES)
INSERT INTO public.projects (contact_id, project_name, service_type, status, estimated_cost, actual_cost, start_date, completion_date, address, city, state, notes) VALUES
(1, 'Instalación Planta Manufacturas del Norte', 'Instalación Comercial', 'Completado', 350000.00, 342000.00, '2024-01-20', '2024-02-15', 'Av. Industrial 1234', 'Monterrey', 'Nuevo León', 'Sistema de 50kW con 120 paneles'),
(3, 'Sistema Logística Veloz Express', 'Instalación Comercial', 'En Progreso', 280000.00, NULL, '2024-02-15', NULL, 'Carretera a Saltillo Km 15', 'Saltillo', 'Coahuila', 'Instalación en 2 fases'),
(5, 'Planta Industrial Vargas Alimentos', 'Instalación Industrial', 'Planificación', 750000.00, NULL, NULL, NULL, 'Zona Industrial 456', 'León', 'Guanajuato', 'Sistema de 100kW con baterías'),
(9, 'Fraccionamiento Solar Verde', 'Instalación Comercial', 'Completado', 1250000.00, 1198000.00, '2024-02-01', '2024-03-30', 'Fraccionamiento Las Lomas', 'Querétaro', 'Querétaro', '50 casas con sistemas de 5kW'),
(16, 'Terminal Núñez Transporte', 'Instalación Comercial', 'Planificación', 420000.00, NULL, NULL, NULL, 'Calzada del Sol 789', 'Guadalajara', 'Jalisco', 'Sistema para terminal de carga'),
(17, 'Edificio Gómez y Asociados', 'Instalación Comercial', 'Completado', 180000.00, 176500.00, '2024-03-10', '2024-04-05', 'Av. Reforma 321', 'Ciudad de México', 'Ciudad de México', 'Sistema integrado con arquitectura')
ON CONFLICT DO NOTHING;

-- 3. CITAS/REUNIONES
INSERT INTO public.appointments (contact_id, project_id, title, description, appointment_date, duration_minutes, status, location, notes) VALUES
(1, 1, 'Visita de seguimiento post-instalación', 'Verificación de rendimiento del sistema', '2024-02-20 10:00:00', 120, 'Completada', 'Av. Industrial 1234, Monterrey', 'Sistema operando al 98% de capacidad'),
(3, 2, 'Reunión de aprobación de proyecto', 'Presentación de propuesta final', '2024-02-25 14:30:00', 90, 'Completada', 'Oficinas Logística Veloz', 'Cliente aprobó propuesta'),
(5, 3, 'Estudio de factibilidad técnica', 'Análisis de consumo y viabilidad', '2024-03-05 09:00:00', 180, 'Completada', 'Planta Vargas Alimentos', 'Se requiere sistema robusto'),
(8, NULL, 'Demostración de sistema con baterías', 'Presentación de opciones de almacenamiento', '2024-03-15 11:00:00', 60, 'Programada', 'Cafetería de Carmen', 'Cliente muy interesado'),
(9, 4, 'Reunión de avance de obra', 'Seguimiento de instalación en fraccionamiento', '2024-03-20 15:00:00', 120, 'Completada', 'Fraccionamiento Las Lomas', 'Avance: 60% completado'),
(12, NULL, 'Cotización para sistema de bombeo', 'Evaluación de necesidades agrícolas', '2024-03-25 10:30:00', 90, 'Programada', 'Rancho de Gabriela', 'Requiere bomba de 3HP'),
(16, 5, 'Visita técnica a terminal', 'Medición de área y evaluación estructural', '2024-04-02 13:00:00', 120, 'Programada', 'Terminal Núñez Transporte', 'Primera visita al sitio'),
(19, NULL, 'Presentación de soluciones para agencia', 'Propuesta para 2 sucursales', '2024-04-18 16:00:00', 90, 'Programada', 'Oficinas Ruiz Automotriz', 'Cliente potencial importante')
ON CONFLICT DO NOTHING;

-- 4. COMUNICACIONES (HISTORIAL DE CONTACTO)
INSERT INTO public.communications (contact_id, type, subject, content, direction, status, next_follow_up) VALUES
(1, 'Email', 'Propuesta inicial - Manufacturas del Norte', 'Adjunto propuesta detallada para sistema de 50kW', 'Saliente', 'Enviado', '2024-01-16'),
(1, 'Llamada', 'Seguimiento propuesta', 'Cliente interesado, solicita visita técnica', 'Entrante', 'Recibido', '2024-01-17'),
(1, 'Email', 'Confirmación visita técnica', 'Agendada visita para el 20 de enero a las 10am', 'Saliente', 'Enviado', '2024-01-20'),
(1, 'Visita', 'Visita técnica y medición', 'Realizada medición del sitio y evaluación estructural', 'Saliente', 'Completado', '2024-01-21'),
(3, 'WhatsApp', 'Envío de cotización', 'Cliente solicita cotización por WhatsApp', 'Entrante', 'Recibido', '2024-02-01'),
(3, 'Email', 'Propuesta Logística Veloz', 'Envío propuesta para sistema de 40kW', 'Saliente', 'Enviado', '2024-02-05'),
(5, 'Llamada', 'Requerimientos industriales', 'Cliente explica necesidades específicas de planta', 'Entrante', 'Recibido', '2024-02-10'),
(5, 'Email', 'Información técnica', 'Envío de especificaciones técnicas para sistema industrial', 'Saliente', 'Enviado', '2024-02-12'),
(8, 'Visita', 'Demostración en cafetería', 'Presentación de sistema con baterías', 'Saliente', 'Completado', '2024-03-15'),
(9, 'Email', 'Acuerdo marco', 'Confirmación de acuerdo para 5 desarrollos', 'Saliente', 'Enviado', '2024-03-02'),
(16, 'Llamada', 'Solicitud de cotización', 'Cliente solicita cotización para terminal', 'Entrante', 'Recibido', '2024-04-15'),
(19, 'Email', 'Propuesta para agencia automotriz', 'Envío de cotización para 2 sucursales', 'Saliente', 'Enviado', '2024-04-16')
ON CONFLICT DO NOTHING;

-- 5. DOCUMENTOS (EJEMPLOS DE ARCHIVOS)
INSERT INTO public.documents (contact_id, project_id, document_type, title, file_url, file_name, file_size, mime_type, description, is_public) VALUES
(1, 1, 'Contrato', 'Contrato de servicios - Manufacturas del Norte', '/documents/contratos/contrato_manufacturas.pdf', 'contrato_manufacturas.pdf', 245760, 'application/pdf', 'Contrato firmado para instalación de 50kW', false),
(1, 1, 'Cotización', 'Cotización inicial - Manufacturas del Norte', '/documents/cotizaciones/cotizacion_manufacturas.pdf', 'cotizacion_manufacturas.pdf', 153600, 'application/pdf', 'Cotización detallada con especificaciones', true),
(3, 2, 'Factura', 'Factura F001 - Logística Veloz', '/documents/facturas/factura_logistica_veloz.pdf', 'factura_logistica_veloz.pdf', 131072, 'application/pdf', 'Factura por estudio de factibilidad', false),
(5, 3, 'Cotización', 'Cotización sistema industrial - Vargas Alimentos', '/documents/cotizaciones/cotizacion_vargas_alimentos.pdf', 'cotizacion_vargas_alimentos.pdf', 307200, 'application/pdf', 'Cotización para sistema de 100kW', true),
(9, 4, 'Contrato', 'Contrato marco - Fraccionamiento Solar Verde', '/documents/contratos/contrato_fraccionamiento.pdf', 'contrato_fraccionamiento.pdf', 393216, 'application/pdf', 'Contrato para 50 viviendas', false),
(9, 4, 'Manual', 'Manual de usuario - Sistema residencial', '/documents/manuales/manual_residencial.pdf', 'manual_residencial.pdf', 204800, 'application/pdf', 'Manual para residentes del fraccionamiento', true),
(17, 6, 'Certificado', 'Certificado de instalación - Edificio Gómez', '/documents/certificados/certificado_gomez.pdf', 'certificado_gomez.pdf', 98304, 'application/pdf', 'Certificado de cumplimiento normativo', false)
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- ESTADÍSTICAS GENERADAS AUTOMÁTICAMENTE
-- ==============================================================================
-- Para verificar los datos, puedes ejecutar:
-- SELECT * FROM public.get_dashboard_stats();

-- Para ver resumen de clientes:
-- SELECT * FROM public.client_dashboard LIMIT 10;

-- Para ver proyectos activos:
-- SELECT * FROM public.project_dashboard WHERE status IN ('Planificación', 'En Progreso');

-- ==============================================================================
-- TOTAL DE REGISTROS CREADOS:
-- - 20 clientes con información realista
-- - 6 proyectos en diferentes estados
-- - 8 citas programadas/completadas
-- - 12 comunicaciones registradas
-- - 7 documentos de diferentes tipos
-- ==============================================================================
