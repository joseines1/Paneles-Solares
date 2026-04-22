// admin-init.js - Inicialización del panel de administración

// Variable global de cotizaciones/contactos usada por admin-search-filter.js
window.quotes = [];

// Cargar contactos desde Supabase, con fallback a localStorage
async function loadContacts() {
    const client = window.supabaseClient;

    if (client) {
        try {
            const { data, error } = await client
                .from('contacts')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                // Normalizar campos de Supabase al formato esperado por la UI
                window.quotes = data.map(c => ({
                    id: c.id,
                    nombre: c.nombre,
                    empresa: c.empresa || '',
                    email: c.email,
                    telefono: c.telefono,
                    servicio: c.servicio,
                    factura: c.factura || '',
                    mensaje: c.mensaje,
                    status: c.status || 'Nuevo',
                    crmNote: c.crm_note || c.crmNote || '',
                    created_at: c.created_at,
                    progress: c.progress || getProgressFromStatus(c.status)
                }));
                console.log(`✅ ${window.quotes.length} contactos cargados desde Supabase`);
                renderAllData();
                return;
            } else {
                console.warn('⚠️ Error cargando contactos de Supabase:', error);
            }
        } catch (err) {
            console.warn('⚠️ Supabase no disponible para contactos:', err);
        }
    }

    // Fallback a localStorage
    const stored = JSON.parse(localStorage.getItem('solar_quotes') || '[]');
    window.quotes = stored;
    console.log(`📦 ${window.quotes.length} contactos cargados desde localStorage`);
    renderAllData();
}

// Función de inicialización del panel
async function initAdmin() {
    // Verificar sesión
    const { data: { session } } = await authClient.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    // Esperar a que Supabase esté listo
    let retries = 0;
    while (!window.supabaseClient && retries < 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        retries++;
    }

    // Cargar datos en paralelo
    await Promise.all([
        loadContacts(),
        typeof loadKits === 'function' ? loadKits() : Promise.resolve(),
        typeof loadPromos === 'function' ? loadPromos() : Promise.resolve()
    ]);
}

// Alias para compatibilidad con admin.html
window.initializeAdmin = initAdmin;
window.loadContacts = loadContacts;

document.addEventListener('DOMContentLoaded', initAdmin);
