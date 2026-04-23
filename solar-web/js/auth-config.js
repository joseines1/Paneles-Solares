// js/auth-config.js - Simple localStorage authentication
// No external dependencies, pure local auth for demo purposes

const AUTH_CONFIG = {
    ADMIN_EMAIL: 'pcnet_pn@hotmail.com',
    ADMIN_PASSWORD: 'Admin123!',
    SESSION_KEY: 'solar_admin_session',
    SESSION_DURATION: 8 * 60 * 60 * 1000 // 8 hours
};

// Simple auth object mimicking Supabase interface
const authClient = {
    signInWithPassword: async ({ email, password }) => {
        if (email === AUTH_CONFIG.ADMIN_EMAIL && password === AUTH_CONFIG.ADMIN_PASSWORD) {
            const session = {
                user: { email },
                expires_at: Date.now() + AUTH_CONFIG.SESSION_DURATION
            };
            localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify(session));
            return { data: { session }, error: null };
        }
        return { data: null, error: { message: 'Credenciales inválidas' } };
    },
    
    getSession: async () => {
        const raw = localStorage.getItem(AUTH_CONFIG.SESSION_KEY);
        if (!raw) return { data: { session: null } };
        try {
            const session = JSON.parse(raw);
            if (Date.now() > session.expires_at) {
                localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
                return { data: { session: null } };
            }
            return { data: { session } };
        } catch(e) { 
            return { data: { session: null } }; 
        }
    },
    
    signOut: async () => {
        localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
        return { error: null };
    }
};

// Check if user has valid session
async function checkSession() {
    const { data } = await authClient.getSession();
    return data.session;
}
