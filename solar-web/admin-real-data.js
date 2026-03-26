// admin-real-data.js - Funciones para poblar datos reales en el panel

// Función para poblar datos de ejemplo
async function populateRealData() {
    const realData = [
        {
            nombre: 'Carlos Rodríguez Mendoza',
            empresa: 'Manufacturas del Norte S.A. de C.V.',
            email: 'carlos.rodriguez@manufacturasnorte.com',
            telefono: '55-1234-5678',
            servicio: 'Instalación Comercial',
            factura: 'Sí',
            mensaje: 'Necesitamos cotización para techo industrial de 2,000m² en Monterrey. Consumo actual de 15,000 kWh/mes.',
            status: 'Cerrado',
            crmNote: 'Cliente VIP. Proyecto aprobado por junta directiva. Instalación programada para Q2.',
            created_at: '2026-03-15T09:30:00Z'
        },
        {
            nombre: 'María García López',
            empresa: null,
            email: 'maria.garcia.85@gmail.com',
            telefono: '33-3456-7890',
            servicio: 'Instalación Residencial',
            factura: 'No',
            mensaje: 'Vivo en Guadalajara, casa de 180m². Quiero saber cuántos paneles necesito y el costo total.',
            status: 'En Proceso',
            crmNote: 'Interesada en sistema de 5kW. Envió recibos de CFE para análisis. Esperando propuesta final.',
            created_at: '2026-03-16T14:22:00Z'
        },
        {
            nombre: 'Roberto Hernández Silva',
            empresa: 'Logística Veloz Mexicana',
            email: 'roberto.hernandez@logisticaveloz.com.mx',
            telefono: '81-2345-6789',
            servicio: 'Instalación Comercial',
            factura: 'Sí',
            mensaje: 'Flotilla de 50 camiones de reparto. Queremos instalar paneles en nuestra bodega en Nuevo León.',
            status: 'Nuevo',
            crmNote: 'Potencial cliente grande. Requiere visita técnica y análisis de consumo de flota eléctrica.',
            created_at: '2026-03-17T11:45:00Z'
        },
        {
            nombre: 'Ana Patricia Morales',
            empresa: null,
            email: 'paty.morales@outlook.com',
            telefono: '55-9876-5432',
            servicio: 'Instalación Residencial',
            factura: 'Sí',
            mensaje: 'Casa en CDMX, 2 plantas, 4 habitaciones. Aire acondicionado en todas. Recibo de CFE de $2,800 mensuales.',
            status: 'En Proceso',
            crmNote: 'Cliente con alto consumo. Sistema de 7kW recomendado. En negociación de financiamiento.',
            created_at: '2026-03-18T16:10:00Z'
        },
        {
            nombre: 'Luis Fernando Torres',
            empresa: 'Torres Distribuidores S.A.',
            email: 'luis.torres@torresdistribuidores.com',
            telefono: '66-1234-5678',
            servicio: 'Instalación Comercial',
            factura: 'Sí',
            mensaje: 'Tenemos 3 sucursales en Hermosillo. Queremos empezar con la principal y luego expandir.',
            status: 'Cerrado',
            crmNote: 'Contrato firmado por $450,000. Primera instalación completada exitosamente.',
            created_at: '2026-03-10T08:00:00Z'
        },
        {
            nombre: 'Carmen Beatriz Ruiz',
            empresa: null,
            email: 'carmen.ruiz.familia@gmail.com',
            telefono: '99-3456-7890',
            servicio: 'Instalación Residencial',
            factura: 'No',
            mensaje: 'Vivo en Mérida, casa nueva de 200m². Quiero sistema desde cero.',
            status: 'Nuevo',
            crmNote: 'Cliente pre-aprobado para crédito hipotecario verde. Esperando cotización final.',
            created_at: '2026-03-19T13:30:00Z'
        },
        {
            nombre: 'Jorge Alberto Vargas',
            empresa: 'Vargas Alimentos S.A. de C.V.',
            email: 'jorge.vargas@vargasalimentos.com',
            telefono: '22-3456-7890',
            servicio: 'Instalación Comercial',
            factura: 'Sí',
            mensaje: 'Planta procesadora en Puebla. Consumo industrial de 25,000 kWh/mes. Necesitamos urgente.',
            status: 'En Proceso',
            crmNote: 'Cliente corporativo grande. Propuesta de $850,000 en revisión legal. Requiere permisos municipales.',
            created_at: '2026-03-12T10:15:00Z'
        },
        {
            nombre: 'Diana Carolina Santos',
            empresa: null,
            email: 'diana.santos.profesional@gmail.com',
            telefono: '55-4567-8901',
            servicio: 'Instalación Residencial',
            factura: 'Sí',
            mensaje: 'Departamento en Polanco, 120m². Edificio con políticas de energía renovable.',
            status: 'Cerrado',
            crmNote: 'Venta completada. Sistema de 3kW instalado. Cliente muy satisfecha, nos refirió 2 vecinos.',
            created_at: '2026-03-05T15:45:00Z'
        },
        {
            nombre: 'Miguel Ángel Castro',
            empresa: 'Castro Construcciones',
            email: 'miguel.castro@castroconstrucciones.com.mx',
            telefono: '44-2345-6789',
            servicio: 'Instalación Comercial',
            factura: 'Sí',
            mensaje: 'Desarrolladora inmobiliaria. Queremos paneles en 3 proyectos nuevos en Guanajuato.',
            status: 'Nuevo',
            crmNote: 'Potencial cliente recurrente. 3 proyectos de 50 casas cada uno. Visita programada para próxima semana.',
            created_at: '2026-03-20T09:00:00Z'
        },
        {
            nombre: 'Patricia Guadalupe Mendoza',
            empresa: null,
            email: 'patty.mendoza.terra@gmail.com',
            telefono: '77-1234-5678',
            servicio: 'Instalación Residencial',
            factura: 'No',
            mensaje: 'Vivo en Torreón. Casa con piscina y alberca. Recibos muy altos en verano.',
            status: 'En Proceso',
            crmNote: 'Análisis de consumo completado. Sistema de 8kW recomendado por alto consumo de aire acondicionado.',
            created_at: '2026-03-21T12:20:00Z'
        }
    ];

    try {
        // Limpiar datos existentes (opcional)
        const { error: deleteError } = await supabaseClient
            .from('contact_messages')
            .delete()
            .neq('id', 0);
        
        if (deleteError && deleteError.code !== 'PGRST116') {
            console.warn('Error limpiando datos:', deleteError);
        }

        // Insertar datos reales
        const { data, error } = await supabaseClient
            .from('contact_messages')
            .insert(realData)
            .select();

        if (error) {
            console.error('Error insertando datos:', error);
            return false;
        }

        console.log(`✅ ${data.length} registros insertados exitosamente`);
        return true;
    } catch (error) {
        console.error('Error en populateRealData:', error);
        return false;
    }
}

// Función para calcular métricas reales
function calculateRealMetrics(data) {
    const totalLeads = data.length;
    const newQuotes = data.filter(q => q.status === 'Nuevo').length;
    const inProcess = data.filter(q => q.status === 'En Proceso').length;
    const closedSales = data.filter(q => q.status === 'Cerrado').length;
    
    // Calcular ingresos proyectados basados en tipo de servicio
    const residentialSales = data.filter(q => q.status === 'Cerrado' && q.servicio === 'Instalación Residencial').length;
    const commercialSales = data.filter(q => q.status === 'Cerrado' && q.servicio === 'Instalación Comercial').length;
    
    const projectedIncome = (residentialSales * 85000) + (commercialSales * 350000);
    
    return {
        totalLeads,
        newQuotes,
        inProcess,
        closedSales,
        projectedIncome
    };
}

// Función para generar datos mensuales reales basados en las cotizaciones existentes
function generateRealMonthlyData(quotes) {
    const monthlyData = {};
    const currentYear = new Date().getFullYear();
    
    // Inicializar todos los meses del año actual
    for (let month = 0; month < 12; month++) {
        const monthName = new Date(currentYear, month).toLocaleDateString('es-MX', { month: 'short' });
        monthlyData[monthName] = 0;
    }
    
    // Contar cotizaciones por mes usando datos reales
    quotes.forEach(quote => {
        if (quote.created_at) {
            const date = new Date(quote.created_at);
            if (!isNaN(date) && date.getFullYear() === currentYear) {
                const monthName = date.toLocaleDateString('es-MX', { month: 'short' });
                monthlyData[monthName] = (monthlyData[monthName] || 0) + 1;
            }
        }
    });
    
    // Crear arrays para Chart.js
    const labels = Object.keys(monthlyData);
    const values = Object.values(monthlyData);
    
    return { labels, values };
}

// Función para generar datos de gráfica mensual
function generateMonthlyData(data) {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];
    const currentMonth = new Date().getMonth();
    
    // Generar datos realistas basados en los datos existentes
    const monthlyData = months.map((month, index) => {
        const baseValue = 3 + Math.random() * 5; // 3-8 leads base
        const growthFactor = 1 + (index * 0.1); // Crecimiento mensual
        const leads = Math.floor(baseValue * growthFactor);
        
        return {
            month,
            leads,
            conversions: Math.floor(leads * 0.3), // 30% tasa de conversión
            visits: Math.floor(leads * 8) // 8 visitas por lead
        };
    });
    
    // Actualizar el mes actual con datos reales
    if (currentMonth < monthlyData.length) {
        const currentMonthLeads = data.filter(q => {
            const leadMonth = new Date(q.created_at).getMonth();
            return leadMonth === currentMonth;
        }).length;
        
        monthlyData[currentMonth].leads = currentMonthLeads;
        monthlyData[currentMonth].conversions = Math.floor(currentMonthLeads * 0.3);
        monthlyData[currentMonth].visits = currentMonthLeads * 8;
    }
    
    return monthlyData;
}

// Hacer funciones globales para usar en admin.html
window.populateRealData = populateRealData;
window.calculateRealMetrics = calculateRealMetrics;
window.generateMonthlyData = generateMonthlyData;
