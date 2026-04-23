// js/auth-config.js - LocalStorage Mock API Backend

const MOCK_DELAY = 200;
const delay = ms => new Promise(res => setTimeout(res, ms));

function getLocalData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function setLocalData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

async function adminApiRequest(url, options = {}) {
    await delay(MOCK_DELAY);
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : null;

    // KITS & PRODUCTOS
    if (url.startsWith('/api/admin/kits')) {
        let kits = getLocalData('solar_kits');
        const idMatch = url.match(/\/api\/admin\/kits\/(\d+)/);
        const id = idMatch ? parseInt(idMatch[1]) : null;

        if (method === 'GET') return kits;
        
        if (method === 'POST') {
            const newItem = { id: Date.now(), ...body };
            kits.push(newItem);
            setLocalData('solar_kits', kits);
            return newItem;
        }
        
        if (method === 'PATCH' && id) {
            const index = kits.findIndex(k => k.id === id);
            if (index !== -1) {
                kits[index] = { ...kits[index], ...body };
                setLocalData('solar_kits', kits);
                return kits[index];
            }
        }
        
        if (method === 'DELETE' && id) {
            kits = kits.filter(k => k.id !== id);
            setLocalData('solar_kits', kits);
            return { success: true };
        }
    }

    // PROMOCIONES
    if (url.startsWith('/api/admin/promos')) {
        let promos = getLocalData('solar_promos');
        const idMatch = url.match(/\/api\/admin\/promos\/(\d+)/);
        const id = idMatch ? parseInt(idMatch[1]) : null;

        if (method === 'GET') return promos;
        
        if (method === 'POST') {
            const newItem = { id: Date.now(), ...body };
            promos.push(newItem);
            setLocalData('solar_promos', promos);
            return newItem;
        }
        
        if (method === 'PATCH' && id) {
            const index = promos.findIndex(p => p.id === id);
            if (index !== -1) {
                promos[index] = { ...promos[index], ...body };
                setLocalData('solar_promos', promos);
                return promos[index];
            }
        }
        
        if (method === 'DELETE' && id) {
            promos = promos.filter(p => p.id !== id);
            setLocalData('solar_promos', promos);
            return { success: true };
        }
    }

    // CONTACTOS (CRM)
    if (url.startsWith('/api/admin/contacts')) {
        let contacts = getLocalData('solar_contacts');
        const idMatch = url.match(/\/api\/admin\/contacts\/(\d+)/);
        const id = idMatch ? parseInt(idMatch[1]) : null;

        if (method === 'GET') return contacts;
        
        if (method === 'POST') {
            const newItem = { id: Date.now(), created_at: new Date().toISOString(), ...body };
            contacts.push(newItem);
            setLocalData('solar_contacts', contacts);
            return newItem;
        }
        
        if (method === 'PATCH' && id) {
            const index = contacts.findIndex(c => c.id === id);
            if (index !== -1) {
                contacts[index] = { ...contacts[index], ...body };
                setLocalData('solar_contacts', contacts);
                return contacts[index];
            }
        }
    }

    // OTHERS
    if (url === '/api/email-status') {
        return { configured: false };
    }

    if (url === '/api/send-quote') {
        return { success: true };
    }

    return [];
}

const authClient = {
    signInWithPassword: async () => {
        localStorage.setItem('local_admin_session', 'true');
        return { data: { session: { user: { email: 'admin' } } }, error: null };
    },
    getSession: async () => {
        const active = localStorage.getItem('local_admin_session');
        return { data: { session: active ? { user: { email: 'admin' } } : null }, error: null };
    },
    signOut: async () => {
        localStorage.removeItem('local_admin_session');
        return { error: null };
    }
};

async function checkSession() {
    const active = localStorage.getItem('local_admin_session');
    return active ? { user: { email: 'admin' } } : null;
}

window.adminApiRequest = adminApiRequest;
window.authClient = authClient;
window.checkSession = checkSession;
