# 🚀 Guía de Despliegue en Render

## Paso 1: Acceder a Render

1. Ve a [render.com](https://render.com)
2. Si no tienes cuenta, haz clic en **"Sign Up"**
3. Conecta tu cuenta de GitHub (recomendado)
4. Autoriza a Render acceder a tu repositorio

---

## Paso 2: Crear Nuevo Web Service

1. Haz clic en **"+ New"** (esquina superior derecha)
2. Selecciona **"Web Service"**
3. Selecciona tu repositorio: **joseines1/Paneles-Solares**
4. Haz clic en **"Connect"**

---

## Paso 3: Configurar el Servicio

Completa los campos con estos valores:

| Campo | Valor |
|-------|-------|
| **Name** | `paneles-solares` |
| **Environment** | `Node` |
| **Region** | `Ohio` (o cercano a ti) |
| **Branch** | `main` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` (o pago si quieres más potencia) |

---

## Paso 4: Agregar Variables de Entorno

**Antes de desplegar**, ve a la sección **"Environment"** y agrega estas variables:

```
PORT=3000
NODE_ENV=production
SENDGRID_API_KEY=SG.tuApiKeyAqui...
SENDGRID_FROM_EMAIL=noreply@paneles-solares.com
TWILIO_ACCOUNT_SID=ACtuAccountSidAqui...
TWILIO_AUTH_TOKEN=tuAuthTokenAqui...
TWILIO_PHONE=whatsapp:+14155552671
ADMIN_EMAIL=joseolivo78376@gmail.com
```

⚠️ **Importante:** Reemplaza los valores con tus credenciales reales de SendGrid y Twilio

---

## Paso 5: Desplegar

1. Haz clic en **"Create Web Service"** (botón azul al final)
2. Render comenzará a construir y desplegar el proyecto
3. Espera 3-5 minutos mientras se instalan las dependencias
4. Verás en los logs:
   ```
   ✓ Build successful
   ✓ Web service is live at...
   ```

---

## Paso 6: Obtener tu URL

Una vez desplegado, Render te dará una URL como:
```
https://paneles-solares.onrender.com
```

Tu sitio estará en:
- 🏠 Homepage: `https://paneles-solares.onrender.com`
- 📧 Contacto: `https://paneles-solares.onrender.com/contacto.html`
- 🔐 Admin: `https://paneles-solares.onrender.com/admin.html`

---

## ✅ Verificar que Funciona

1. Abre tu sitio en producción: `https://paneles-solares.onrender.com`
2. Ve a **Contacto**
3. Llena el formulario y envía
4. Verifica que recibas:
   - ✅ Email de confirmación
   - ✅ Email al admin
   - ✅ Mensaje WhatsApp

---

## 🔄 Actualizaciones Futuras

Ahora, cada vez que hagas **push a GitHub**:
```bash
git add .
git commit -m "mi cambio"
git push
```

Render **automáticamente** detectará los cambios y redesplegará tu sitio (sin necesidad de hacer nada más).

---

## 📋 Troubleshooting

### "Deploy failed" o "Build error"
- Revisa los logs de Render (tab "Logs")
- Asegúrate que `npm start` funciona localmente
- Verifica que el archivo `.gitignore` no excluye archivos necesarios

### "La función de email no funciona"
- Revisa que las variables de entorno estén exactas
- Revisa los logs: Render → Logs
- Verifica que SendGrid API key sea válida

### "El sitio está muy lento"
- Usa plan de pago o usa Vercel/Netlify
- El plan gratuito de Render se "duerme" después de 15 min inactivo

---

## 🎯 Ya Está

¡Tu sitio está en producción! Ahora:
- 📱 Usuarios pueden contactarte desde cualquier lugar
- 📧 Recibes emails automáticamente
- 💬 Recibes mensajes en WhatsApp (cuando configures sandbox)
- 🔧 Los cambios se despliegan automáticamente con cada push

¿Necesitas ayuda con algo más?
