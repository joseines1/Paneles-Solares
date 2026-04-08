// js/supabase-config.js
// Reemplazado: ya no usa Supabase. Auth y datos viven en localStorage.

// Credenciales de admin (solo locales, nunca se envían a ningún servidor)
const ADMIN_EMAIL    = 'admin@solarweb.com';
const ADMIN_PASSWORD = 'solar2024';
const SESSION_KEY    = 'solar_admin_session';

// Simula la API de Supabase que usaba el sitio
const supabaseClient = {
    auth: {
        signInWithPassword: async ({ email, password }) => {
            if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                const session = {
                    user: { email },
                    expires_at: Date.now() + 8 * 60 * 60 * 1000 // 8 horas
                };
                localStorage.setItem(SESSION_KEY, JSON.stringify(session));
                return { data: { session }, error: null };
            }
            return { data: null, error: { message: 'Invalid login credentials' } };
        },
        getSession: async () => {
            const raw = localStorage.getItem(SESSION_KEY);
            if (!raw) return { data: { session: null }, error: null };
            const session = JSON.parse(raw);
            if (Date.now() > session.expires_at) {
                localStorage.removeItem(SESSION_KEY);
                return { data: { session: null }, error: null };
            }
            return { data: { session }, error: null };
        },
        signOut: async () => {
            localStorage.removeItem(SESSION_KEY);
            return { error: null };
        }
    },
    from: (table) => ({
        select: (cols) => ({
            order: (col, opts) => Promise.resolve({ data: JSON.parse(localStorage.getItem('solar_quotes') || '[]'), error: null })
        }),
        insert: (rows) => {
            const existing = JSON.parse(localStorage.getItem('solar_quotes') || '[]');
            const newRows = rows.map(r => ({ ...r, id: Date.now() + Math.random(), created_at: new Date().toISOString() }));
            localStorage.setItem('solar_quotes', JSON.stringify([...newRows, ...existing]));
            return Promise.resolve({ data: newRows, error: null });
        },
        update: (changes) => ({
            eq: (col, val) => {
                const items = JSON.parse(localStorage.getItem('solar_quotes') || '[]');
                const updated = items.map(i => i.id == val ? { ...i, ...changes } : i);
                localStorage.setItem('solar_quotes', JSON.stringify(updated));
                return Promise.resolve({ data: updated, error: null });
            }
        }),
        delete: () => ({
            eq: (col, val) => {
                const items = JSON.parse(localStorage.getItem('solar_quotes') || '[]');
                const filtered = items.filter(i => i.id != val);
                localStorage.setItem('solar_quotes', JSON.stringify(filtered));
                return Promise.resolve({ data: filtered, error: null });
            }
        })
    })
};

// Función que usaba el sitio para verificar sesión
async function checkSession() {
    const { data } = await supabaseClient.auth.getSession();
    return data.session;
}
