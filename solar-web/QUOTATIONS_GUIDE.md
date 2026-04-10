# 🎯 Sistema de Cotizaciones con Barra de Seguimiento

**Nuevo Feature Agregado:** Barra de progreso interactiva (10%, 20%, 40%, 60%, 80%, 100%) + Exportación a PDF + Compartir por Email/WhatsApp

---

## 📊 Estados del Pipeline

| % | Estado | Ícono | Descripción |
|----|--------|-------|------------|
| **10%** | 📮 Cotización Enviada | Azul | Acaba de enviarse la cotización inicial |
| **20%** | ⏳ Espera Respuesta | Púrpura | Esperando respuesta del cliente |
| **40%** | 👍 Cliente Interesado | Ámbar | Cliente mostró interés, en conversación |
| **60%** | 💼 En Negociación | Verde | Negociando términos y precios |
| **80%** | 🔧 En Instalación | Naranja | Instalación en progreso |
| **100%** | ✅ Completada | Verde claro | Proyecto finalizado con éxito |

---

## 🚀 Acceso al Panel

1. **Ir a:** http://localhost:8000/login.html
2. **Credenciales:**
   - Email: `joseines@gmail.es`
   - Contraseña: `ines123`
3. **Ir a pestaña:** 📨 **Cotizaciones**

---

## 📋 Panel de Cotizaciones - Características

### Vista Principal
```
┌─────────────────────────────────────────────────────────────────┐
│  Cliente: Carlos Rodríguez                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  [██████████░░░░░░░░░░░░░░░░░░░░░░░░] 40%                      │
│  👍 Cliente Interesado                                          │
│                                                                 │
│  Servicio: Instalación Residencial | 📅 8 abr                 │
│                                                                 │
│  [Selector: 40% - Interesado] [Nota: Enviar presupuesto...]  │
│  [📄 PDF] [✉️ Email] [💬 WhatsApp] [🗑️ Eliminar]             │
└─────────────────────────────────────────────────────────────────┘
```

### Controles Disponibles

#### 1. **Cambiar Estado (Selector Dropdown)**
```
Ver: [10% - Enviada | 20% - Espera | 40% - Interesado ▼]
```
- Selecciona el estado actual
- Se guarda automáticamente en localStorage
- Actualiza la barra de progreso en tiempo real

#### 2. **Agregar/Editar Nota**
```
📝 Agregar nota... [Te envió presupuesto el 8/4, espera respuesta]
```
- Solo desde el admin, permite registrar notas internas
- Ejemplo: "En negociación por financiamiento", "Requiere visita técnica"

#### 3. **Descargar PDF**
```
[📄 PDF]  ← Click para generar PDF de cotización
```
- Genera PDF con datos del cliente y kits recomendados
- Descarga automáticamente con nombre: `Cotizacion_[Nombre]_[Timestamp].pdf`
- Incluye logo, datos cliente, servicios recomendados

#### 4. **Enviar por Email**
```
[✉️ Email]  ← Click para enviar por email
```
- Abre cliente de email configurado
- Campos pre-rellenados:
  - **Para:** Email del cliente
  - **Asunto:** "Tu Cotización Solar de SolarWeb"
  - **Cuerpo:** Mensaje personalizado con datos de la cotización
- Adjuntar PDF manualmente

#### 5. **Enviar por WhatsApp**
```
[💬 WhatsApp]  ← Click para compartir por WhatsApp
```
- Abre WhatsApp (escritorio o web)
- Mensaje personalizado:
  - Saludo al cliente por nombre
  - Datos de la cotización
  - Llamada a acción
- Requiere que del cliente tenga WhatsApp configurado

#### 6. **Eliminar**
```
[🗑️ Eliminar]  ← Click para remover cotización
```
- Pide confirmación antes de eliminar
- No se puede deshacer

---

## 🎨 Colores de Progreso

```
10% Enviada      → Azul (#3b82f6)
20% Esperando    → Púrpura (#8b5cf6)
40% Interesado   → Ámbar (#f59e0b)
60% Negociación  → Verde (#10b981)
80% Instalando   → Naranja (#f97316)
100% Completada  → Verde Claro (#34d399) [Efecto brillante]
```

---

## 📄 Estructura del PDF Generado

```
╔════════════════════════════════════════════╗
║            ☀️ SOLAR WEB                   ║
║   www.solarweb.com | +52 123456789       ║
╠════════════════════════════════════════════╣
║        COTIZACIÓN DE SISTEMA SOLAR         ║
╠════════════════════════════════════════════╣
║ CLIENTE:                                  ║
║   Nombre: Carlos Rodríguez                ║
║   Empresa: Tech Solutions S.A.            ║
║   Email: carlos@example.com               ║
║   Teléfono: 55-1234-5678                  ║
╠════════════════════════════════════════════╣
║ DETALLES DE LA SOLICITUD:                 ║
║   Servicio: Instalación Residencial       ║
║   Consumo: 2,500 kWh/mes                  ║
╠════════════════════════════════════════════╣
║ KITS SOLARES RECOMENDADOS:                ║
║ 1. SolarKit Basic 3kW       → $24,999     ║
║ 2. SolarKit Plus 5kW        → $39,999     ║
║ 3. SolarKit Comercial 10kW  → $79,999     ║
╚════════════════════════════════════════════╝
```

---

## 💾 Datos Guardados Automáticamente

Cada acción se guarda en `localStorage['solar_quotes']`:

```javascript
{
  id: 1,
  nombre: "Carlos Rodríguez",
  email: "carlos@example.com",
  telefono: "55-1234-5678",
  empresa: "Tech Solutions S.A.",
  servicio: "Instalación Residencial",
  mensaje: "Interesado en sistema 5kW...",
  status: "En Proceso",
  progress: 40,  // ← Nuevo: estado actual (10, 20, 40, 60, 80, 100)
  crmNote: "Esperando que baje la tasa...",  // ← Nota interna
  created_at: "2026-04-03T...",
  updated_at: "2026-04-10T...",
  lastEmailSent: "2026-04-10T14:30:00Z",    // ← Registro de envíos
  lastWhatsAppSent: "2026-04-10T14:35:00Z"
}
```

---

## 🔧 Funciones JavaScript Disponibles

### Cambiar Progreso
```javascript
updateQuotationProgress(quoteId, newProgress)
// Ejemplo: updateQuotationProgress(1, 60)
```

### Generar PDF
```javascript
generateQuotationPDF(quoteId)
// Genera y descarga automáticamente
```

### Enviar Email
```javascript
sendQuotationByEmail(quoteId)
// Abre cliente de email con datos pre-rellenados
```

### Enviar WhatsApp
```javascript
sendQuotationByWhatsApp(quoteId)
// Abre WhatsApp Web / Aplicación
```

### Mostrar Notificación
```javascript
showNotification(mensaje, tipoError)
// Tipos: 'success', 'error', 'info'
```

---

## 📱 Responsividad

- **Desktop (1920px+):** Grid de 4 columnas (cliente, progreso, detalles, acciones)
- **Tablet (768px-1024px):** Stack vertical, progreso siempre visible
- **Móvil (< 768px):** Una columna, botones apilados horizontalmente

---

## 🎯 Flujo de Uso Típico

### Escenario 1: Nueva Cotización Recibida
```
1. Cliente envía formulario desde www.solarweb.com/contacto.html
2. Aparece en Admin → Cotizaciones con 10% (Enviada)
3. Admin revisa datos
4. Admin selecciona 20% (Espera respuesta)
5. Admin agrega nota: "Enviada cotización por email 10/04"
6. Admin hace click [✉️ Email] para recordarle al cliente
```

### Escenario 2: Cliente Muestra Interés
```
1. Cliente responde por WhatsApp: "¿Puedo financiar?"
2. Admin actualiza a 40% (Cliente Interesado)
3. Admin agrega nota: "Requiere financiamiento sin intereses"
4. Admin envía información de financiadores por WhatsApp [💬]
```

### Escenario 3: Cerrar Venta
```
1. Cliente aprueba y firma contrato
2. Admin actualiza a 80% (En Instalación)
3. Coordinan fecha de instalación
4. Instalación completa
5. Admin actualiza a 100% (Completada) ✅
6. PDF guardado como evidencia
```

---

## ⚙️ Configuración técnica

### Librerías Usadas
- **jsPDF:** Generación de PDF (CDN: cdnjs.cloudflare.com)
- **Chart.js:** Gráficos ya existentes
- **localStorage:** Almacenamiento local sin BD

### Archivos Nuevos
- `admin-quotations.js` — Lógica de cotizaciones y PDF
- `css/admin-quotations.css` — Estilos de barra progreso

### Archivos Modificados
- `admin-search-filter.js` — Render mejorado de tabla
- `admin.html` — Import de jsPDF y nuevos scripts
- `js/seed-data.js` — Datos iniciales con progreso

---

## 🚀 Próximas Mejoras (Roadmap)

- [ ] Integración real de envío de email (backend)
- [ ] Template de PDF personalizable
- [ ] Histórico de cambios (auditoría)
- [ ] Notificaciones en tiempo real (websockets)
- [ ] Integración con WhatsApp Business API
- [ ] Exportar reportes a Excel
- [ ] Integración con Google Calendar para recordatorios

---

## ⚠️ Notas

1. **Email:** Abre cliente local. Para envío automático, requiere backend configurado
2. **WhatsApp:** Funciona si el número tiene WhatsApp instalado
3. **PDF:** Se descarga automáticamente (verificar configuración de descargas)
4. **Datos:** Se guardan SOLO en localStorage (se pierden si se limpia caché)

---

**Status:** ✅ Completado y testeado  
**Última actualización:** 10 de abril 2026
