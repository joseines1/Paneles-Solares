// server.js - Backend SolarWeb con Express + Supabase
require('dotenv').config();

const crypto = require('crypto');
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;
app.set('trust proxy', 1);

// Supabase config (solo desde variables de entorno)
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Faltan SUPABASE_URL y SUPABASE_KEY en las variables de entorno.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Configuración de email (variables de entorno en producción)
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASS = process.env.EMAIL_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;

// Admin auth config (siempre desde variables de entorno)
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || '';
const SESSION_COOKIE_NAME = 'solar_admin_session';
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LOCK_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const adminSessions = new Map();
const loginAttempts = new Map();

function createTransporter() {
    if (!EMAIL_USER || !EMAIL_PASS) return null;
    return nodemailer.createTransporter({
        service: 'gmail',
        auth: { user: EMAIL_USER, pass: EMAIL_PASS }
    });
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function isAdminAuthConfigured() {
    return Boolean(ADMIN_EMAIL && ADMIN_SESSION_SECRET && (ADMIN_PASSWORD || ADMIN_PASSWORD_HASH));
}

function parseCookies(req) {
    const cookieHeader = req.headers.cookie || '';
    return cookieHeader.split(';').reduce((acc, chunk) => {
        const [rawName, ...rest] = chunk.trim().split('=');
        if (!rawName) return acc;
        acc[rawName] = decodeURIComponent(rest.join('='));
        return acc;
    }, {});
}

function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
        return forwarded.split(',')[0].trim();
    }
    return req.ip || 'unknown';
}

function hashText(value) {
    return crypto.createHash('sha256').update(value).digest('hex');
}

function getSessionFingerprint(req) {
    const userAgent = req.get('user-agent') || 'unknown';
    return hashText(`${ADMIN_SESSION_SECRET}:${userAgent}`);
}

function safeEqualText(a, b) {
    const left = Buffer.from(String(a));
    const right = Buffer.from(String(b));

    if (left.length !== right.length) {
        return false;
    }

    return crypto.timingSafeEqual(left, right);
}

function verifyAdminPassword(password) {
    if (ADMIN_PASSWORD_HASH) {
        const [salt, storedHash] = ADMIN_PASSWORD_HASH.split(':');
        if (!salt || !storedHash) return false;

        const derivedHash = crypto.scryptSync(password, salt, 64).toString('hex');
        return safeEqualText(derivedHash, storedHash);
    }

    if (ADMIN_PASSWORD) {
        return safeEqualText(password, ADMIN_PASSWORD);
    }

    return false;
}

function clearExpiredSessions() {
    const now = Date.now();
    for (const [token, session] of adminSessions.entries()) {
        if (session.expiresAt <= now) {
            adminSessions.delete(token);
        }
    }
}

function getSessionToken(req) {
    const cookies = parseCookies(req);
    return cookies[SESSION_COOKIE_NAME] || null;
}

function getAdminSession(req) {
    clearExpiredSessions();

    const token = getSessionToken(req);
    if (!token) return null;

    const session = adminSessions.get(token);
    if (!session) return null;

    if (session.fingerprint !== getSessionFingerprint(req)) {
        adminSessions.delete(token);
        return null;
    }

    return {
        token,
        session: {
            user: session.user,
            expires_at: session.expiresAt
        }
    };
}

function requireAdminSession(req, res, next) {
    const currentSession = getAdminSession(req);
    if (!currentSession) {
        clearSessionCookie(req, res);
        return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    req.adminSession = currentSession.session;
    next();
}

function asTrimmedString(value, fallback = '') {
    return typeof value === 'string' ? value.trim() : fallback;
}

function asNullableNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function asNullableInteger(value, fallback = 0) {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeIdArray(raw) {
    if (Array.isArray(raw)) {
        return raw
            .map(item => asNullableInteger(item, NaN))
            .filter(item => Number.isFinite(item));
    }

    if (typeof raw === 'string') {
        return raw
            .replace(/[{}[\]]/g, '')
            .split(',')
            .map(item => asNullableInteger(item.trim(), NaN))
            .filter(item => Number.isFinite(item));
    }

    return [];
}

function normalizeContactPayload(body, { isNew = false } = {}) {
    const payload = {
        nombre: asTrimmedString(body.nombre),
        empresa: asTrimmedString(body.empresa) || 'Particular',
        email: asTrimmedString(body.email).toLowerCase(),
        telefono: asTrimmedString(body.telefono),
        servicio: asTrimmedString(body.servicio),
        factura: asTrimmedString(body.factura),
        mensaje: asTrimmedString(body.mensaje),
        status: asTrimmedString(body.status) || 'Nuevo',
        crm_note: asTrimmedString(body.crm_note ?? body.crmNote),
        progress: asNullableInteger(body.progress, 10),
        updated_at: new Date().toISOString()
    };

    if (isNew) {
        payload.created_at = new Date().toISOString();
    }

    return payload;
}

function normalizeKitPayload(body) {
    const capacity = asNullableNumber(body.capacity, 0);
    return {
        name: asTrimmedString(body.name),
        capacity,
        price: asNullableNumber(body.price, 0),
        stock: asNullableInteger(body.stock, 0),
        status: asTrimmedString(body.status) || 'Activo',
        description: asTrimmedString(body.description),
        features: asTrimmedString(body.features),
        image: asTrimmedString(body.image),
        type: asTrimmedString(body.type) || 'kit',
        category: asTrimmedString(body.category) || 'Residencial',
        panels: asNullableInteger(body.panels, Math.max(1, Math.round(capacity / 0.55) || 1)),
        inverter: asNullableNumber(body.inverter, capacity),
        product_ids: normalizeIdArray(body.product_ids)
    };
}

function normalizePromotionPayload(body) {
    return {
        title: asTrimmedString(body.title),
        description: asTrimmedString(body.description),
        original_price: asTrimmedString(body.original_price),
        promo_price: asTrimmedString(body.promo_price),
        badge: asTrimmedString(body.badge),
        badge_color: asTrimmedString(body.badge_color) || '#f97316',
        icon: asTrimmedString(body.icon),
        features: asTrimmedString(body.features),
        image: asTrimmedString(body.image),
        kit_ids: normalizeIdArray(body.kit_ids)
    };
}

function createAdminSession(req, email) {
    const token = crypto.randomBytes(48).toString('base64url');
    const session = {
        user: { email },
        expiresAt: Date.now() + SESSION_DURATION_MS,
        fingerprint: getSessionFingerprint(req)
    };

    adminSessions.set(token, session);
    return { token, session };
}

function setSessionCookie(req, res, token) {
    const isSecureRequest = IS_PRODUCTION || req.secure || req.get('x-forwarded-proto') === 'https';
    const cookieParts = [
        `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Strict',
        `Max-Age=${Math.floor(SESSION_DURATION_MS / 1000)}`
    ];

    if (isSecureRequest) {
        cookieParts.push('Secure');
    }

    res.setHeader('Set-Cookie', cookieParts.join('; '));
}

function clearSessionCookie(req, res) {
    const isSecureRequest = IS_PRODUCTION || req.secure || req.get('x-forwarded-proto') === 'https';
    const cookieParts = [
        `${SESSION_COOKIE_NAME}=`,
        'Path=/',
        'HttpOnly',
        'SameSite=Strict',
        'Max-Age=0'
    ];

    if (isSecureRequest) {
        cookieParts.push('Secure');
    }

    res.setHeader('Set-Cookie', cookieParts.join('; '));
}

function getRateLimitState(key) {
    const now = Date.now();
    const current = loginAttempts.get(key);

    if (!current) {
        return { count: 0, lockUntil: 0 };
    }

    if (current.lockUntil && current.lockUntil > now) {
        return current;
    }

    if (now - current.firstAttemptAt > LOGIN_WINDOW_MS) {
        loginAttempts.delete(key);
        return { count: 0, lockUntil: 0 };
    }

    return current;
}

function registerFailedAttempt(key) {
    const now = Date.now();
    const current = getRateLimitState(key);
    const next = {
        count: current.count + 1,
        firstAttemptAt: current.count === 0 ? now : (current.firstAttemptAt || now),
        lockUntil: 0
    };

    if (next.count >= MAX_LOGIN_ATTEMPTS) {
        next.lockUntil = now + LOGIN_LOCK_MS;
    }

    loginAttempts.set(key, next);
    return next;
}

function clearFailedAttempts(key) {
    loginAttempts.delete(key);
}

function getLoginRateLimitKey(req, email) {
    return `${getClientIp(req)}:${String(email || '').trim().toLowerCase()}`;
}

// ============================================================
// API: Admin Auth
// ============================================================

app.post('/api/admin/login', (req, res) => {
    if (!isAdminAuthConfigured()) {
        return res.status(503).json({
            success: false,
            error: 'ADMIN_AUTH_NOT_CONFIGURED',
            message: 'Configura ADMIN_EMAIL, ADMIN_SESSION_SECRET y ADMIN_PASSWORD o ADMIN_PASSWORD_HASH.'
        });
    }

    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Faltan credenciales' });
    }

    const rateLimitKey = getLoginRateLimitKey(req, email);
    const rateLimitState = getRateLimitState(rateLimitKey);

    if (rateLimitState.lockUntil && rateLimitState.lockUntil > Date.now()) {
        const retryAfter = Math.ceil((rateLimitState.lockUntil - Date.now()) / 1000);
        res.setHeader('Retry-After', String(retryAfter));
        return res.status(429).json({
            success: false,
            error: 'Demasiados intentos. Intenta nuevamente en unos minutos.'
        });
    }

    const isValidLogin = safeEqualText(email, ADMIN_EMAIL) && verifyAdminPassword(password);

    if (!isValidLogin) {
        registerFailedAttempt(rateLimitKey);
        return res.status(401).json({
            success: false,
            error: 'Credenciales inválidas'
        });
    }

    clearFailedAttempts(rateLimitKey);

    const currentToken = getSessionToken(req);
    if (currentToken) {
        adminSessions.delete(currentToken);
    }

    const { token, session } = createAdminSession(req, email);
    setSessionCookie(req, res, token);

    return res.json({
        success: true,
        session: {
            user: session.user,
            expires_at: session.expiresAt
        }
    });
});

app.get('/api/admin/session', (req, res) => {
    if (!isAdminAuthConfigured()) {
        clearSessionCookie(req, res);
        return res.json({ session: null, configured: false });
    }

    const currentSession = getAdminSession(req);
    if (!currentSession) {
        clearSessionCookie(req, res);
        return res.json({ session: null, configured: true });
    }

    return res.json({ session: currentSession.session, configured: true });
});

app.post('/api/admin/logout', (req, res) => {
    const currentToken = getSessionToken(req);
    if (currentToken) {
        adminSessions.delete(currentToken);
    }

    clearSessionCookie(req, res);
    return res.json({ success: true });
});

app.get('/admin.html', (req, res) => {
    if (!getAdminSession(req)) {
        clearSessionCookie(req, res);
        return res.redirect('/login.html');
    }

    return res.sendFile(path.join(__dirname, 'admin.html'));
});

// Servir archivos estáticos desde el directorio actual
app.use(express.static(path.join(__dirname)));

// ============================================================
// API: Admin protegida
// ============================================================

app.get('/api/admin/contacts', requireAdminSession, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        console.error('❌ Error cargando contactos admin:', err.message);
        res.status(500).json({ error: 'No se pudieron cargar los contactos' });
    }
});

app.post('/api/admin/contacts', requireAdminSession, async (req, res) => {
    const payload = normalizeContactPayload(req.body, { isNew: true });
    if (!payload.nombre || !payload.email || !payload.telefono) {
        return res.status(400).json({ error: 'Faltan campos obligatorios del contacto' });
    }

    try {
        const { data, error } = await supabase
            .from('contacts')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        console.error('❌ Error creando contacto admin:', err.message);
        res.status(500).json({ error: 'No se pudo crear el contacto' });
    }
});

app.patch('/api/admin/contacts/:id', requireAdminSession, async (req, res) => {
    const payload = normalizeContactPayload(req.body);

    try {
        const { data, error } = await supabase
            .from('contacts')
            .update(payload)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('❌ Error actualizando contacto admin:', err.message);
        res.status(500).json({ error: 'No se pudo actualizar el contacto' });
    }
});

app.delete('/api/admin/contacts/:id', requireAdminSession, async (req, res) => {
    try {
        const { error } = await supabase
            .from('contacts')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error('❌ Error eliminando contacto admin:', err.message);
        res.status(500).json({ error: 'No se pudo eliminar el contacto' });
    }
});

app.get('/api/admin/kits', requireAdminSession, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('kits')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        console.error('❌ Error cargando kits admin:', err.message);
        res.status(500).json({ error: 'No se pudieron cargar los kits' });
    }
});

app.post('/api/admin/kits', requireAdminSession, async (req, res) => {
    const payload = normalizeKitPayload(req.body);
    if (!payload.name) {
        return res.status(400).json({ error: 'El nombre del kit es obligatorio' });
    }

    try {
        const { data, error } = await supabase
            .from('kits')
            .insert([{ ...payload, created_at: new Date().toISOString() }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        console.error('❌ Error creando kit admin:', err.message);
        res.status(500).json({ error: 'No se pudo crear el kit' });
    }
});

app.patch('/api/admin/kits/:id', requireAdminSession, async (req, res) => {
    const payload = normalizeKitPayload(req.body);

    try {
        const { data, error } = await supabase
            .from('kits')
            .update(payload)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('❌ Error actualizando kit admin:', err.message);
        res.status(500).json({ error: 'No se pudo actualizar el kit' });
    }
});

app.delete('/api/admin/kits/:id', requireAdminSession, async (req, res) => {
    try {
        const { error } = await supabase
            .from('kits')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error('❌ Error eliminando kit admin:', err.message);
        res.status(500).json({ error: 'No se pudo eliminar el kit' });
    }
});

app.get('/api/admin/promotions', requireAdminSession, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('promotions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        console.error('❌ Error cargando promociones admin:', err.message);
        res.status(500).json({ error: 'No se pudieron cargar las promociones' });
    }
});

app.post('/api/admin/promotions', requireAdminSession, async (req, res) => {
    const payload = normalizePromotionPayload(req.body);
    if (!payload.title || !payload.promo_price) {
        return res.status(400).json({ error: 'La promocion requiere titulo y precio promocional' });
    }

    try {
        const { data, error } = await supabase
            .from('promotions')
            .insert([{ ...payload, created_at: new Date().toISOString() }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        console.error('❌ Error creando promoción admin:', err.message);
        res.status(500).json({ error: 'No se pudo crear la promocion' });
    }
});

app.patch('/api/admin/promotions/:id', requireAdminSession, async (req, res) => {
    const payload = normalizePromotionPayload(req.body);

    try {
        const { data, error } = await supabase
            .from('promotions')
            .update(payload)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('❌ Error actualizando promoción admin:', err.message);
        res.status(500).json({ error: 'No se pudo actualizar la promocion' });
    }
});

app.delete('/api/admin/promotions/:id', requireAdminSession, async (req, res) => {
    try {
        const { error } = await supabase
            .from('promotions')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error('❌ Error eliminando promoción admin:', err.message);
        res.status(500).json({ error: 'No se pudo eliminar la promocion' });
    }
});

// ============================================================
// API: Contactos / Cotizaciones
// ============================================================

// POST /api/contact — Guardar nuevo contacto
app.post('/api/contact', async (req, res) => {
    const { nombre, empresa, email, telefono, servicio, factura, mensaje } = req.body;

    // Validación básica
    if (!nombre || !email || !telefono || !servicio) {
        return res.status(400).json({ success: false, error: 'Faltan campos obligatorios' });
    }

    const newContact = {
        nombre:   nombre.trim(),
        empresa:  (empresa || '').trim() || 'Particular',
        email:    email.trim().toLowerCase(),
        telefono: telefono.trim(),
        servicio: servicio.trim(),
        factura:  factura || '',
        mensaje:  (mensaje || '').trim(),
        status:   'Nuevo'
    };

    try {
        const { data, error } = await supabase
            .from('contacts')
            .insert([newContact])
            .select()
            .single();

        if (error) throw error;

        console.log(`✅ Contacto guardado en Supabase: ${nombre} (${email})`);
        res.json({ success: true, contactId: data.id, message: 'Solicitud recibida correctamente' });

    } catch (err) {
        console.error('❌ Error guardando contacto:', err.message);
        res.status(500).json({ success: false, error: 'Error al guardar en base de datos', details: err.message });
    }
});

// ============================================================
// API: Kits / Productos
// ============================================================

// GET /api/kits — Obtener todos los kits activos
app.get('/api/kits', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('kits')
            .select('*')
            .neq('status', 'Oculto')
            .order('capacity', { ascending: true });

        if (error) throw error;

        res.json(data || []);
    } catch (err) {
        console.error('❌ Error cargando kits:', err.message);
        res.status(500).json([]);
    }
});

// GET /api/kits/:id — Obtener un kit por ID
app.get('/api/kits/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('kits')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(404).json({ error: 'Kit no encontrado' });
    }
});

// ============================================================
// API: Promociones
// ============================================================

// GET /api/promotions — Obtener todas las promociones activas
app.get('/api/promotions', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('promotions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data || []);
    } catch (err) {
        console.error('❌ Error cargando promociones:', err.message);
        res.status(500).json([]);
    }
});

// ============================================================
// API: Enviar cotización por email con PDF adjunto
// ============================================================

// POST /api/send-quote — Recibe PDF en base64 y lo envía al cliente
app.post('/api/send-quote', requireAdminSession, async (req, res) => {
    const { to, subject, extraMsg, clientName, pdfBase64, filename, quoteDetails } = req.body;

    if (!to || !pdfBase64) {
        return res.status(400).json({ success: false, error: 'Faltan campos: to, pdfBase64' });
    }

    const transporter = createTransporter();

    if (!transporter) {
        return res.status(503).json({
            success: false,
            error: 'EMAIL_NOT_CONFIGURED',
            message: 'Configura EMAIL_USER y EMAIL_PASS en el servidor para enviar emails.'
        });
    }

    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    const fecha = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });

    const htmlBody = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;">
            <div style="background:#f97316;padding:24px 32px;border-radius:8px 8px 0 0;">
                <h1 style="color:#fff;margin:0;font-size:22px;">☀️ SolarWeb — Tu Cotización Solar</h1>
            </div>
            <div style="background:#f8fafc;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;">
                <p style="font-size:16px;">Hola <strong>${clientName || 'cliente'}</strong>,</p>
                ${extraMsg ? `<p style="font-size:15px;color:#334155;">${extraMsg.replace(/\n/g,'<br>')}</p>` : ''}
                <p>Adjunto encontrarás tu cotización personalizada de sistema solar fotovoltaico.</p>
                ${quoteDetails ? `
                <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
                    <tr style="background:#f1f5f9;">
                        <td style="padding:8px 12px;font-weight:bold;width:140px;">Servicio</td>
                        <td style="padding:8px 12px;">${quoteDetails.servicio || '—'}</td>
                    </tr>
                    <tr>
                        <td style="padding:8px 12px;font-weight:bold;">Fecha</td>
                        <td style="padding:8px 12px;">${fecha}</td>
                    </tr>
                    ${quoteDetails.total ? `
                    <tr style="background:#fff7ed;">
                        <td style="padding:8px 12px;font-weight:bold;color:#f97316;">Total</td>
                        <td style="padding:8px 12px;font-weight:bold;color:#f97316;font-size:16px;">${quoteDetails.total}</td>
                    </tr>` : ''}
                    ${quoteDetails.mensaje ? `
                    <tr style="background:#f1f5f9;">
                        <td style="padding:8px 12px;font-weight:bold;vertical-align:top;">Tu solicitud</td>
                        <td style="padding:8px 12px;">${quoteDetails.mensaje}</td>
                    </tr>` : ''}
                </table>` : ''}
                <p>¿Tienes preguntas? Responde este correo o llámanos — con gusto te atendemos.</p>
                <p style="margin-top:24px;">Saludos,<br><strong>Equipo SolarWeb</strong></p>
            </div>
            <p style="text-align:center;font-size:11px;color:#94a3b8;margin-top:12px;">Esta cotización es válida por 30 días a partir de la fecha de emisión.</p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"SolarWeb Cotizaciones" <${EMAIL_FROM}>`,
            to,
            subject: subject || 'Tu cotización solar — SolarWeb',
            html: htmlBody,
            attachments: [{
                filename: filename || 'cotizacion_solar.pdf',
                content: pdfBuffer,
                contentType: 'application/pdf'
            }]
        });

        console.log(`✅ Cotización enviada a ${to}`);
        res.json({ success: true, message: `Cotización enviada a ${to}` });

    } catch (err) {
        console.error('❌ Error enviando email:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/email-status — Verificar si el email está configurado
app.get('/api/email-status', requireAdminSession, (req, res) => {
    res.json({ configured: !!(EMAIL_USER && EMAIL_PASS), email: EMAIL_USER || null });
});

// ============================================================
// Fallback: servir index.html para rutas no encontradas
// ============================================================
app.get('*', (req, res) => {
    // Si la ruta no tiene extensión, redirigir a index.html
    if (!path.extname(req.path)) {
        res.sendFile(path.join(__dirname, 'index.html'));
    } else {
        res.status(404).send('Not found');
    }
});

app.listen(PORT, () => {
    console.log(`\n☀️  SolarWeb servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 Supabase conectado a: ${SUPABASE_URL}\n`);
});
