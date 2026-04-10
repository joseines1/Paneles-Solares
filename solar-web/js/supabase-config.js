// js/supabase-config.js
// Conexión real a BD Supabase

const supabaseUrl = 'https://ojswxnqgqikzmzihtmfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qc3d4bnFncWlrem16aWh0bWZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0OTU1NTksImV4cCI6MjA5MDA3MTU1OX0.K5LpkBcAN04yNfANiyBjiVSWZlQyGGtftVgVyt2MTEA';

let supabaseClient = null;

if (window.supabase) {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
    
    // Sistema de auth sencillo (sin base de datos)
    supabaseClient.auth = {
        signInWithPassword: async ({ email, password }) => {
            const ADMIN_EMAIL    = 'joseines@gmail.es';
            const ADMIN_PASSWORD = 'ines123';
            
            if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                const session = {
                    user: { email },
                    expires_at: Date.now() + 8 * 60 * 60 * 1000 // 8 horas
                };
                localStorage.setItem('solar_admin_session', JSON.stringify(session));
                return { data: { session }, error: null };
            }
            return { data: null, error: { message: 'Credenciales inválidas' } };
        },
        getSession: async () => {
            const raw = localStorage.getItem('solar_admin_session');
            if (!raw) return { data: { session: null } };
            try {
                const session = JSON.parse(raw);
                if (Date.now() > session.expires_at) {
                    localStorage.removeItem('solar_admin_session');
                    return { data: { session: null } };
                }
                return { data: { session } };
            } catch(e) { return { data: { session: null } }; }
        },
        signOut: async () => {
            localStorage.removeItem('solar_admin_session');
            return { error: null };
        }
    };
} else {
    console.error("Supabase CDN not loaded!");
}

async function checkSession() {
    if (!supabaseClient) return null;
    const { data } = await supabaseClient.auth.getSession();
    return data.session;
}
