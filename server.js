import express from 'express';
import cors from 'cors';
import sgMail from '@sendgrid/mail';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'solar-web')));

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Configurar Twilios
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Configurar Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Ruta para servir archivos estáticos (fallback a index.html para SPA)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'solar-web', 'index.html'));
});

// API: Recibir formulario de contacto
app.post('/api/contact', async (req, res) => {
  try {
    const { nombre, empresa, email, telefono, servicio, factura, mensaje } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !telefono || !servicio) {
      return res.status(400).json({ error: 'Campos requeridos faltantes' });
    }

    // ✅ 1. Enviar email al cliente (confirmación)
    const clientEmailMsg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@paneles-solares.com',
      subject: '✅ Solicitud de Cotización Recibida - SolarWeb',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 10px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #06b6d4 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
            .content { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
            .btn { background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>☀️ SolarWeb - Solicitud Recibida</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${nombre}</strong>,</p>
              <p>Gracias por tu interés en nuestros servicios de energía solar. Hemos recibido tu solicitud de cotización con los siguientes detalles:</p>
              <ul>
                <li><strong>Servicio:</strong> ${servicio}</li>
                <li><strong>Empresa:</strong> ${empresa || 'No especificado'}</li>
                <li><strong>Factura CFE Promedio:</strong> ${factura || 'No especificado'}</li>
                <li><strong>Teléfono/WhatsApp:</strong> ${telefono}</li>
              </ul>
              <p><strong>Tu mensaje:</strong><br>${mensaje || '(Sin mensaje adicional)'}</p>
              <p>Nuestro equipo de asesores solares analizará tu solicitud y se pondrá en contacto contigo <strong>en menos de 24 horas</strong> vía:</p>
              <ul>
                <li>📧 Email</li>
                <li>📱 WhatsApp</li>
              </ul>
              <p style="background: #f0f9ff; padding: 15px; border-left: 4px solid #06b6d4; border-radius: 4px;">
                <strong>💡 Tip:</strong> Mientras esperas, puedes explorar nuestros <a href="https://paneles-solares.onrender.com/productos.html">productos y kits solares</a>.
              </p>
            </div>
            <div class="footer">
              <p>© 2024 SolarWeb. Soluciones en Energía Solar.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await sgMail.send(clientEmailMsg);
    console.log(`✅ Email de confirmación enviado a: ${email}`);

    // ✅ 2. Enviar email al admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@paneles-solares.com';
    const adminEmailMsg = {
      to: adminEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@paneles-solares.com',
      subject: `🔔 Nueva Solicitud de Cotización - ${nombre}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #06b6d4 100%); color: white; padding: 15px; border-radius: 8px; }
            .data { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #f59e0b; }
            .btn { background: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
            .timestamp { color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🔔 Nueva Solicitud de Cotización</h2>
            </div>
            <div class="data">
              <p><strong>👤 Nombre:</strong> ${nombre}</p>
              <p><strong>🏢 Empresa:</strong> ${empresa || '(No especificado)'}</p>
              <p><strong>📧 Email:</strong> ${email}</p>
              <p><strong>📱 Teléfono/WhatsApp:</strong> ${telefono}</p>
              <p><strong>⚡ Servicio:</strong> ${servicio}</p>
              <p><strong>💰 Factura CFE:</strong> ${factura || '(No especificado)'}</p>
              <p><strong>💬 Mensaje:</strong><br>${mensaje || '(Sin mensaje)'}</p>
              <p class="timestamp">Recibido: ${new Date().toLocaleString('es-MX')}</p>
            </div>
            <p>
              <a href="https://paneles-solares.onrender.com/admin.html" class="btn">Ver en Panel Admin</a>
            </p>
          </div>
        </body>
        </html>
      `
    };

    await sgMail.send(adminEmailMsg);
    console.log(`✅ Email de notificación enviado al admin: ${adminEmail}`);

    // ✅ 3. Enviar WhatsApp al cliente si está configurado
    if (process.env.TWILIO_PHONE && telefono) {
      try {
        const formattedPhone = telefono.replace(/\D/g, '');
        const phoneNumber = formattedPhone.length === 10 ? `+52${formattedPhone}` : `+${formattedPhone}`;

        await twilioClient.messages.create({
          body: `¡Hola ${nombre}! 👋\n\nGracias por tu interés en SolarWeb. Hemos recibido tu solicitud de cotización para: ${servicio}\n\n☀️ Nuestro equipo te contactará en menos de 24 horas con una propuesta personalizada.\n\nMientras tanto, conoce más en: https://paneles-solares.onrender.com\n\n🔌 SolarWeb - Energía Solar Inteligente`,
          from: `whatsapp:${process.env.TWILIO_PHONE}`,
          to: `whatsapp:${phoneNumber}`
        });
        console.log(`✅ WhatsApp enviado a: ${phoneNumber}`);
      } catch (twilioError) {
        console.error('⚠️ Error enviando WhatsApp:', twilioError.message);
      }
    }

    // ✅ 4. Guardar en Supabase (base de datos persistente)
    const newContact = {
      nombre,
      empresa,
      email,
      telefono,
      servicio,
      factura,
      mensaje,
      status: 'Nueva solicitud',
      progress: 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([newContact])
        .select();

      if (error) {
        console.error('⚠️ Error guardando en Supabase:', error);
      } else {
        console.log(`✅ Contacto guardado en Supabase:`, data);
      }
    } catch (supabaseError) {
      console.error('⚠️ Error con Supabase:', supabaseError.message);
    }

    // ✅ Respuesta exitosa
    res.json({
      success: true,
      message: 'Solicitud recibida correctamente. Te contactaremos pronto.',
      contactId: newContact.id
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error procesando la solicitud'
    });
  }
});

// API: Obtener lista de contactos desde Supabase
app.get('/api/contacts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error leyendo contacts:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error reading contacts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Manejo 404
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'solar-web', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor Paneles Solares corriendo en puerto ${PORT}`);
  console.log(`📧 SendGrid: ${process.env.SENDGRID_API_KEY ? '✅ Configurado' : '⚠️ No configurado'}`);
  console.log(`💬 Twilio: ${process.env.TWILIO_ACCOUNT_SID ? '✅ Configurado' : '⚠️ No configurado'}`);
  console.log(`🗄️  Supabase: ${process.env.SUPABASE_URL ? '✅ Configurado' : '⚠️ No configurado'}`);
  console.log(`\n📝 Variables de entorno necesarias:`);
  console.log(`   - SENDGRID_API_KEY`);
  console.log(`   - SENDGRID_FROM_EMAIL`);
  console.log(`   - TWILIO_ACCOUNT_SID`);
  console.log(`   - TWILIO_AUTH_TOKEN`);
  console.log(`   - TWILIO_PHONE (número de Twilio para WhatsApp)`);
  console.log(`   - SUPABASE_URL`);
  console.log(`   - SUPABASE_ANON_KEY`);
  console.log(`   - ADMIN_EMAIL\n`);
});
