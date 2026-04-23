// admin-init.js - Inicialización del panel de administración

window.quotes = [];

function normalizeContact(contact) {
    return {
        id: contact.id,
        nombre: contact.nombre,
        empresa: contact.empresa || '',
        email: contact.email,
        telefono: contact.telefono,
        servicio: contact.servicio,
        factura: contact.factura || '',
        mensaje: contact.mensaje,
        status: contact.status || 'Nuevo',
        crmNote: contact.crm_note || contact.crmNote || '',
        created_at: contact.created_at,
        progress: contact.progress || getProgressFromStatus(contact.status)
    };
}

async function loadContacts() {
    const data = await window.adminApiRequest('/api/admin/contacts');
    window.quotes = Array.isArray(data) ? data.map(normalizeContact) : [];
    renderAllData();
}

async function initAdmin() {
    const { data: { session } } = await authClient.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

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
