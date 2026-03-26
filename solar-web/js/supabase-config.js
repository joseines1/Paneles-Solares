// js/supabase-config.js

const supabaseUrl = 'https://ojswxnqgqikzmzihtmfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qc3d4bnFncWlrem16aWh0bWZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0OTU1NTksImV4cCI6MjA5MDA3MTU1OX0.K5LpkBcAN04yNfANiyBjiVSWZlQyGGtftVgVyt2MTEA';

// Inicializar el cliente de Supabase
const { createClient } = window.supabase;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Función para verificar sesión actual
async function checkSession() {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) {
        console.error("Error comprobando sesión:", error.message);
        return null;
    }
    return data.session;
}
