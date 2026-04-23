// js/auth-config.js - Admin authentication via backend session cookie

async function parseAuthResponse(response) {
    let payload = {};

    try {
        payload = await response.json();
    } catch (error) {
        payload = {};
    }

    if (!response.ok) {
        return {
            data: null,
            error: {
                message: payload.error || payload.message || 'No se pudo completar la autenticacion'
            }
        };
    }

    return { data: payload, error: null };
}

async function parseJsonSafely(response) {
    try {
        return await response.json();
    } catch (error) {
        return null;
    }
}

async function adminApiRequest(url, options = {}) {
    const headers = {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {})
    };

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'same-origin'
    });

    const payload = await parseJsonSafely(response);

    if (response.status === 401) {
        window.location.replace('login.html');
        throw new Error('Sesion expirada');
    }

    if (!response.ok) {
        throw new Error((payload && (payload.error || payload.message)) || 'Error en la solicitud');
    }

    return payload;
}

const authClient = {
    signInWithPassword: async ({ email, password }) => {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        return parseAuthResponse(response);
    },

    getSession: async () => {
        const response = await fetch('/api/admin/session', {
            method: 'GET',
            cache: 'no-store'
        });

        if (!response.ok) {
            return { data: { session: null }, error: { message: 'No se pudo comprobar la sesion' } };
        }

        const payload = await response.json();
        return { data: { session: payload.session || null, configured: payload.configured !== false }, error: null };
    },

    signOut: async () => {
        const response = await fetch('/api/admin/logout', {
            method: 'POST'
        });

        if (!response.ok) {
            return { error: { message: 'No se pudo cerrar la sesion' } };
        }

        return { error: null };
    }
};

// Check if user has valid session
async function checkSession() {
    const { data } = await authClient.getSession();
    return data.session;
}

window.adminApiRequest = adminApiRequest;
