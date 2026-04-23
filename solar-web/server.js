// server.js - Backend SolarWeb con Express + Supabase
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase config (usa variables de entorno en producción)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ojswxnqgqikzmzihtmfu.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qc3d4bnFncWlrem16aWh0bWZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0OTU1NTksImV4cCI6MjA5MDA3MTU1OX0.K5LpkBcAN04yNfANiyBjiVSWZlQyGGtftVgVyt2MTEA';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Configuración de email (variables de entorno en producción)
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASS = process.env.EMAIL_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;

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

// Servir archivos estáticos desde el directorio actual
app.use(express.static(path.join(__dirname)));

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
        // Devolver éxito igual para no bloquear al usuario (los datos se guardan en localStorage)
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
app.post('/api/send-quote', async (req, res) => {
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
app.get('/api/email-status', (req, res) => {
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
