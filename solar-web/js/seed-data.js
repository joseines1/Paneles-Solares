// js/seed-data.js - Initial data seed for localStorage
// Populates demo data on first load

const SEED_DATA = {
    kits: [
        {
            id: 'kit-001',
            nombre: 'SolarKit Básico 3kW',
            potencia: 3,
            precio: 24999,
            descripcion: 'Sistema residencial ideal para casas de 150-180m². Incluye 12 paneles de 250W, inversor híbrido y monitoreo.',
            especificaciones: ['12 paneles de 250W', 'Inversor híbrido 3kW', 'Batería 5kWh', 'App de monitoreo', 'Garantía 10 años'],
            imagen: 'img/solar_res_1.png',
            categoria: 'residencial'
        },
        {
            id: 'kit-002',
            nombre: 'SolarKit Plus 5kW',
            potencia: 5,
            precio: 39999,
            descripcion: 'Sistema residencial avanzado para casas de 200-250m² con alto consumo. Incluye 20 paneles, batería ampliada.',
            especificaciones: ['20 paneles de 250W', 'Inversor híbrido 5kW', 'Batería 10kWh', 'App de monitoreo', 'Garantía 10 años', 'Mantenimiento 2 años'],
            imagen: 'img/solar_res_2.png',
            categoria: 'residencial'
        },
        {
            id: 'kit-003',
            nombre: 'SolarKit Comercial 10kW',
            potencia: 10,
            precio: 79999,
            descripcion: 'Sistema comercial para pequeños negocios. Conexión a red de CFE, reducción de 60% en factura eléctrica.',
            especificaciones: ['40 paneles de 250W', 'Inversor trifásico 10kW', 'Sin batería', 'Monitoreo remoto', 'Garantía 15 años'],
            imagen: 'img/solar_com_1.png',
            categoria: 'comercial'
        },
        {
            id: 'kit-004',
            nombre: 'SolarKit Industrial 50kW',
            potencia: 50,
            precio: 349999,
            descripcion: 'Sistema industrial de gran escala para fábricas y almacenes. Ahorro de $50k/mes en consumo eléctrico.',
            especificaciones: ['200 paneles de 250W', 'Inversor industrial 50kW', 'Sistema de monitoreo 24/7', 'Garantía 20 años', 'Instalación en 2-3 semanas'],
            imagen: 'img/panel_comercial.png',
            categoria: 'industrial'
        },
        {
            id: 'kit-005',
            nombre: 'SolarKit Sistema Off-Grid 7kW',
            potencia: 7,
            precio: 129999,
            descripcion: 'Sistema independiente de la red para zonas rurales. Batería de almacenamiento 30kWh incluida.',
            especificaciones: ['28 paneles de 250W', 'Inversor off-grid 7kW', 'Batería 30kWh', 'Controlador MPPT', 'Garantía 10 años'],
            imagen: 'img/solar_sunset_1.png',
            categoria: 'residencial'
        }
    ],
    
    promos: [
        {
            id: 'promo-001',
            titulo: '30% Descuento Residencial',
            descripcion: 'En sistemas básicos y plus. Válido hasta 30 de abril 2026.',
            descuento: 30,
            kitId: 'kit-001',
            condiciones: 'Válido para contratación en abril. Pago 50% adelantado.',
            activo: true
        },
        {
            id: 'promo-002',
            titulo: 'Financiamiento 0% 12 meses',
            descripcion: 'En todos nuestros kits comerciales. Requiere buró de crédito.',
            descuento: 0,
            kitId: 'kit-003',
            condiciones: 'Aprobación inmediata para empresas constituidas. Sin comisiones.',
            activo: true
        },
        {
            id: 'promo-003',
            titulo: 'Regalo: Batería 5kWh',
            descripcion: 'Compra el SolarKit Plus y llévate batería gratis (valor $15k).',
            descuento: 15000,
            kitId: 'kit-002',
            condiciones: 'Marzo-Mayo 2026. Envío incluido en CDMX y área metropolitana.',
            activo: true
        }
    ],
    
    contactos: [
        {
            id: 1,
            nombre: 'Carlos Rodríguez',
            email: 'carlos@example.com',
            telefono: '55-1234-5678',
            empresa: 'Tech Solutions S.A.',
            servicio: 'Instalación Residencial',
            mensaje: 'Interesado en sistema 5kW para casa en Polanco. Consumo promedio 2,500 kWh/mes.',
            status: 'En Proceso',
            progress: 40,
            crmNote: 'Visitó la oficina, muy interesado. Espera a que baje la tasa de interés para financiar.',
            factura: 'Sí',
            created_at: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 2,
            nombre: 'María García López',
            email: 'maria@example.com',
            telefono: '33-3456-7890',
            empresa: null,
            servicio: 'Instalación Comercial',
            mensaje: 'Cotización para oficina de 200m² en Guadalajara. Área de consultoría, requiere energía confiable.',
            status: 'Nuevo',
            progress: 10,
            crmNote: 'Enviada cotización el 8 de abril. Esperando respuesta del cliente.',
            factura: 'No',
            created_at: new Date(Date.now() - 2*24*60*60*1000).toISOString(),
            updated_at: new Date().toISOString()
        }
    ]
};

// Initialize localStorage with seed data if empty
function initializeSeedData() {
    // Check if data already exists
    if (localStorage.getItem('solar_kits')) {
        console.log('✅ Datos ya existen en localStorage');
        return;
    }
    
    try {
        localStorage.setItem('solar_kits', JSON.stringify(SEED_DATA.kits));
        localStorage.setItem('solar_promotions', JSON.stringify(SEED_DATA.promos));
        localStorage.setItem('solar_contactos', JSON.stringify(SEED_DATA.contactos));
        localStorage.setItem('solar_quotes', JSON.stringify(SEED_DATA.contactos));
        console.log('✅ Datos iniciales cargados en localStorage');
    } catch (error) {
        console.error('❌ Error al cargar datos iniciales:', error);
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', initializeSeedData);
