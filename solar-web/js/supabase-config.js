// js/supabase-config.js
// Conexión real a BD Supabase con operaciones COMPLETAS

const supabaseUrl = 'https://ojswxnqgqikzmzihtmfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qc3d4bnFncWlrem16aWh0bWZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0OTU1NTksImV4cCI6MjA5MDA3MTU1OX0.K5LpkBcAN04yNfANiyBjiVSWZlQyGGtftVgVyt2MTEA';

// Hacerlos globales explícitamente
window.supabaseUrl = supabaseUrl;
window.supabaseKey = supabaseKey;
window.supabaseClient = null;

// Inicializar cliente Supabase
if (window.supabase) {
    try {
        window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
        console.log('✅ Supabase Client inicializado correctamente.');
        
        // Sobrescribir auth con sistema personalizado
        window.supabaseClient.auth = {
            signInWithPassword: async ({ email, password }) => {
                const ADMIN_EMAIL    = 'pcnet_pn@hotmail.com';
                const ADMIN_PASSWORD = 'Admin123!';
                
                if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                    const session = {
                        user: { email },
                        expires_at: Date.now() + 8 * 60 * 60 * 1000
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
    } catch (err) {
        console.error('❌ Error creando el cliente de Supabase:', err);
    }
} else {
    console.error("❌ Supabase CDN no cargada o inaccesible!");
}

async function checkSession() {
    if (!window.supabaseClient) return null;
    const { data } = await window.supabaseClient.auth.getSession();
    return data.session;
}

// Mantener variable global para scripts que no usen window.
var supabaseClient = window.supabaseClient;
var supabaseUrlGlobal = supabaseUrl;
var supabaseKeyGlobal = supabaseKey;
