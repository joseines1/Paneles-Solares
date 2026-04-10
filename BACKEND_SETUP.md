# 🚀 Configuración del Backend - Paneles Solares

Este documento te guíará a través de la configuración del backend de Paneles Solares para enviar emails, WhatsApp y notificaciones al admin.

## 📋 Requisitos Previos

- Node.js 18.x o superior
- npm (incluido con Node.js)
- Cuentas en: SendGrid y Twilio

---

## 🔑 Paso 1: Configurar SendGrid (Para Emails)

### 1.1 Crear cuenta en SendGrid
1. Ve a [sendgrid.com](https://sendgrid.com)
2. Haz clic en **"Sign Up"** y crea una cuenta gratuita
3. Confirma tu email

### 1.2 Obtener API Key
1. Inicia sesión en SendGrid
2. Ve a **Settings → API Keys** (en el menú de la izquierda)
3. Haz clic en **"Create API Key"**
4. Dale un nombre: `paneles-solares-api`
5. Dale permisos de **"Mail Send"**
6. Copia la API key (solo se muestra una vez)

### 1.3 Verificar Email de Remitente
1. Ve a **Settings → Sender Authentication**
2. Haz clic en **"Verify a Single Sender"**
3. Completa con los detalles de tu empresa:
   - Email: `noreply@paneles-solares.com` (o tu dominio)
   - Nombre: `SolarWeb`
4. Confirma el email de verificación

---

## 💬 Paso 2: Configurar Twilio (Para WhatsApp)

### 2.1 Crear cuenta en Twilio
1. Ve a [twilio.com](https://www.twilio.com)
2. Haz clic en **"Sign Up"** y crea una cuenta
3. Completa el formulario de verificación

### 2.2 Obtener Credenciales
1. Ve al **[Twilio Console](https://www.twilio.com/console)**
2. Copia tu:
   - **Account SID** (lado izquierdo, debajo de "Account")
   - **Auth Token** (lado izquierdo, junto a Account SID)

### 2.3 Configurar WhatsApp Sandbox (Prueba Gratis)
1. Ve a **Messaging → Try it out → Send a WhatsApp Message**
2. Sigue los pasos para unir tu número de WhatsApp al sandbox
3. El número del sandbox se verá así: `+14155552671` (es un número de prueba)

⚠️ **Nota:** El sandbox tiene limitaciones. Para producción, necesitarás:
- Conectar un número de Twilio verificado
- Obtener aprobación de WhatsApp Business

---

## 📝 Paso 3: Configurar Variables de Entorno

### 3.1 Crear archivo `.env`
1. En la carpeta raíz del proyecto (donde está `package.json`), crea un archivo llamado `.env`
2. Copia el contenido de `.env.example`:
   ```bash
   cp .env.example .env
   ```

### 3.2 Llenar las credenciales
Abre `.env` y completa:

```env
# Tu API Key de SendGrid
SENDGRID_API_KEY=SG.xxx...

# Tu email de remitente (debe estar verificado en SendGrid)
SENDGRID_FROM_EMAIL=noreply@paneles-solares.com

# Credenciales de Twilio
TWILIO_ACCOUNT_SID=ACxxx...
TWILIO_AUTH_TOKEN=xxx...

# Número de Twilio para WhatsApp (sandbox o verificado)
TWILIO_PHONE=whatsapp:+14155552671

# Tu email de administrador
ADMIN_EMAIL=joseolivo78376@gmail.com
```

---

## 🏃 Paso 4: Ejecutar el Backend Localmente

### 4.1 Instalar dependencias
```bash
cd "c:\Users\joseo\OneDrive\Escritorio\Paneles Solares"
npm install
```

### 4.2 Iniciar el servidor
```bash
npm start
```

Deberías ver:
```
🚀 Servidor Paneles Solares corriendo en puerto 3000
📧 SendGrid: ✅ Configurado
💬 Twilio: ✅ Configurado
```

### 4.3 Probar localmente
1. Abre: http://localhost:3000
2. Ve a **Contacto**
3. Llena el formulario y envía
4. Verifica que recibas:
   - ✅ Email de confirmación
   - ✅ Email al admin
   - ✅ Mensaje WhatsApp (si Twilio está configurado)

---

## 🌍 Paso 5: Desplegar en Render

### 5.1 Conectar tu repositorio a Render
1. Revisa que has hecho push a GitHub:
   ```bash
   git add .
   git commit -m "feat: Add backend with email and WhatsApp integration"
   git push
   ```

2. Ve a [render.com](https://render.com)
3. Haz clic en **"New" → "Web Service"**
4. Conecta tu repositorio de GitHub (`joseines1/Paneles-Solares`)

### 5.2 Configurar Render
1. **Name:** `paneles-solares`
2. **Root Directory:** `.` (raíz)
3. **Runtime:** Node
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`

### 5.3 Agregar Variables de Entorno en Render
Antes de desplegar:
1. Ve a **"Environment"** en la página de configuración
2. Agrega cada variable de `.env`:
   - `SENDGRID_API_KEY`
   - `SENDGRID_FROM_EMAIL`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE`
   - `ADMIN_EMAIL`
   - `NODE_ENV` = `production`
   - `PORT` = `3000`

### 5.4 Desplegar
1. Haz clic en **"Deploy"**
2. Espera a que termine (2-5 minutos)
3. Tu URL será: `https://paneles-solares.onrender.com`

---

## ✅ Checklist de Verificación

Después de desplegar en Render, verifica:

- [ ] Abre `https://paneles-solares.onrender.com` - ¿Carga correctamente?
- [ ] Ve a `Contacto` - ¿Funcionan campos del formulario?
- [ ] Envía un formulario de prueba - ¿Ves "Enviando..."?
- [ ] Revisa tu email - ¿Recibiste confirmación?
- [ ] Revisa `joseolivo78376@gmail.com` - ¿Recibió notificación?
- [ ] Revisa WhatsApp - ¿Recibiste mensaje?
- [ ] Ve a panel admin - ¿Aparece la nueva solicitud?

---

## 🛠️ Solución de Problemas

### Email no llega
- ✅ Verifica que `SENDGRID_FROM_EMAIL` esté verificado en SendGrid
- ✅ Revisa logs de SendGrid: App → Settings → Email Activity
- ✅ Asegúrate que tu API key no ha expirado

### WhatsApp no funciona
- ✅ Verifica que te hayas unido al sandbox de Twilio
- ✅ El número debe estar en formato: `whatsapp:+14155552671`
- ✅ Revisa logs de Twilio: Console → Logs

### "Error 500" en formulario
- ✅ Revisa los logs de Render: Logs → tail
- ✅ Asegúrate que todas las variables de entorno están configuradas
- ✅ Verifica que Node.js v18+ está configurado

### API no responde
- ✅ Verifica que Render mostró "Deploy successful"
- ✅ Espera 1-2 minutos después del deploy
- ✅ Prueba: `curl https://paneles-solares.onrender.com/api/health`

---

## 📱 Pasos Siguientes (Opcional)

### Para ir a Producción con WhatsApp
1. Solicita un número de negocio en Twilio
2. Conecta tu Cuenta de WhatsApp Business
3. Reemplaza `TWILIO_PHONE` con tu número verificado

### Para Envíos en Masa
Considera usar:
- **SendGrid:** Unlimited emails después de plan gratuito
- **Mailgun:** Alternativa barata
- **AWS SES:** Muy económico

### Para Almacenamiento Permanente
Actualmente se guarda en `data/contacts.json`. Para producción:
- Conectar a **PostgreSQL** (Render ofrece)
- Usar **Supabase** (PostgreSQL gratuito)
- **MongoDB Atlas** (noSQL gratuito)

---

## 📞 Soporte

Si encuentras problemas:
1. Verifica el archivo `.env` está en la carpeta correcta
2. Revisa los logs: `npm install && npm start` localmente
3. Consulta las [FAQ de SendGrid](https://sendgrid.com/docs/) y [Twilio](https://www.twilio.com/docs/)

¡Éxito! 🎉
