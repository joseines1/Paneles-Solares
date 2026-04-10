# SolarWeb - Panel de Administración Solar

## 🚀 Estado Actual

**Versión:** 1.0.0 - Funcional sin dependencias externas
**Stack:** HTML/CSS/JavaScript vanilla + localStorage  
**Última actualización:** 10 de abril de 2026

## ✅ Cambios Realizados

### Fase 1: Eliminación de Dependencias Externas
- ✅ **Removido:** Supabase CDN y toda conexión a BD externa
- ✅ **Removido:** Archivo `js/ines.js` (código muerto nunca usado)
- ✅ **Reemplazado:** `supabase-config.js` → `js/auth-config.js` (autenticación local simple)

### Fase 2: Datos Locales con localStorage
- ✅ **Creado:** `js/seed-data.js` con datos iniciales pre-cargados
- ✅ **Datos inclusos:**
  - 5 kits solares (Básico, Plus, Comercial, Industrial, Off-Grid)
  - 3 promociones activas
  - 2 contactos de ejemplo

### Fase 3: Validación de Assets
- ✅ **Imágenes verificadas:** Todas las imágenes referenciadas existen en `/img/`
  - `solar_res_1.png`, `solar_res_2.png`, `solar_com_1.png`, `solar_batt_1.png`, `solar_sunset_1.png`, etc.

### Fase 4: Actualización de Autenticación
- ✅ **Login actualizado** → Usa `authClient` local
- ✅ **Admin panel actualizado** → Usa `authClient` en lugar de `supabaseClient`
- ✅ **Sesión en localStorage** → Token válido por 8 horas

## 🔐 Credenciales de Acceso (Demostración)

```
Email:     joseines@gmail.es
Contraseña: ines123
```

⚠️ **Nota:** Estas credenciales están hardcodeadas en `js/auth-config.js` para fines de demostración. 
En producción, implementar sistema de autenticación real.

## 📁 Estructura de Archivos

```
solar-web/
├── index.html                 # Landing page (inicio)
├── productos.html            # Catálogo de kits solares
├── promociones.html          # Ofertas especiales
├── servicios.html            # Servicios de instalación
├── proyectos.html            # Galería de proyectos
├── contacto.html             # Formulario de contacto
├── admin.html                # Panel administrativo protegido
├── login.html                # Página de autenticación
├── 404.html                  # Página de error
│
├── css/
│   ├── estilos.css           # Estilos globales y variables CSS
│   ├── admin.css             # Estilos del panel admin
│   ├── admin-modal.css       # Modal y notificaciones
│   ├── admin-pagination.css  # Paginación de tablas
│   └── admin-access.css      # Botón de acceso en público
│
├── js/
│   ├── auth-config.js        # ⭐ Nueva: Autenticación local (reemplaza supabase-config.js)
│   ├── seed-data.js          # ⭐ Nueva: Datos iniciales en localStorage
│   ├── script.js             # Funcionalidades globales (navbar, scroll, animaciones)
│   └── supabase-config.js    # ⚠️ DEPRECATED (mantener como referencia)
│
├── admin-*.js                # Gestión de admin panel
│   ├── admin-kits.js         # CRUD de productos/kits
│   ├── admin-promos.js       # CRUD de promociones
│   ├── admin-real-data.js    # Datos de prueba (simplificado)
│   └── admin-search-filter.js # Búsqueda y filtrado
│
└── img/
    ├── solar_res_*.png       # Imágenes residencial
    ├── solar_com_*.png       # Imágenes comercial
    ├── panel_*.png           # Imágenes de paneles
    └── ...                   # Más assets
```

## 🗄️ Estructura de Datos en localStorage

### `solar_kits`
```javascript
[
  {
    id: "kit-001",
    nombre: "SolarKit Básico 3kW",
    potencia: 3,
    precio: 24999,
    descripcion: "...",
    especificaciones: [...],
    imagen: "img/solar_res_1.png",
    categoria: "residencial"
  },
  // ... más kits
]
```

### `solar_promos`
```javascript
[
  {
    id: "promo-001",
    titulo: "30% Descuento Residencial",
    descripcion: "...",
    descuento: 30,
    kitId: "kit-001",
    condiciones: "...",
    activo: true
  },
  // ... más promos
]
```

### `solar_contactos`
```javascript
[
  {
    id: "contact-001",
    nombre: "Carlos Rodríguez",
    email: "carlos@example.com",
    telefono: "55-1234-5678",
    servicio: "Instalación Residencial",
    mensaje: "...",
    status: "Nuevo|En Proceso|Cerrado",
    fecha: "2026-04-10T14:30:00Z"
  },
  // ... más contactos
]
```

### `solar_quotes` (generado en contacto.html)
```javascript
[
  {
    id: 1,
    created_at: "2026-04-10T14:30:00Z",
    nombre: "María García",
    email: "maria@example.com",
    // ... resto de datos de cotización
    status: "Nuevo"
  }
]
```

### `solar_admin_session` (sesión activa)
```javascript
{
  user: { email: "joseines@gmail.es" },
  expires_at: 1744867200000 // timestamp de expiración (8 horas)
}
```

## 🧪 Checklist de Pruebas

### ✅ Pruebas de Navegación (Públicas)
- [ ] Página de inicio (`index.html`) carga sin errores
- [ ] Menú navbar funciona correctamente (desktop y móvil)
- [ ] Todas las páginas públicas cargan:
  - [ ] Productos
  - [ ] Promociones
  - [ ] Servicios
  - [ ] Proyectos
  - [ ] Contacto
- [ ] Botón de acceso admin visible en todas las páginas
- [ ] Link a admin enruta correctamente a `/login.html`

### ✅ Pruebas de Autenticación
- [ ] Ir a `http://localhost:8000/login.html`
- [ ] Ingresar credenciales incorrectas → muestra error
- [ ] Ingresar:
  - Email: `joseines@gmail.es`
  - Contraseña: `ines123`
  - ✅ Debería redirigir a `/admin.html`
- [ ] En `/admin.html` aparece mensaje "Sesión activa: joseines@gmail.es" en consola
- [ ] Botón "Cerrar Sesión" funciona y redirige a login

### ✅ Pruebas del Panel Admin
- [ ] ✅ Login exitoso redirige a `/admin.html`
- [ ] ✅ Cargan los datos iniciales (5 kits, 3 promos visibles)
- [ ] ✅ Tabs funcionan (Kits, Promociones, Clientes, Cotizaciones, Dashboard)

#### Pestaña Kits
- [ ] Tabla muestra 5 kits pre-cargados
- [ ] Expandir y editar un kit (cambiar precio) → guarda en localStorage
- [ ] Crear nuevo kit → aparece en tabla
- [ ] Eliminar kit → se remueve de tabla y localStorage
- [ ] Paginación funciona si hay > 10 kits

#### Pestaña Promociones
- [ ] Tabla muestra 3 promociones pre-cargadas
- [ ] Editar una promo → cambios guardan en localStorage
- [ ] Crear nueva promo → aparece en tabla
- [ ] Imágenes de kits vinculadas se muestran correctamente

#### Pestaña Clientes/Cotizaciones
- [ ] Búsqueda por nombre funciona
- [ ] Filtro por estado (Nuevo/En Proceso/Cerrado) funciona
- [ ] Datos de ejemplo visibles o vacío (según diseño)

#### Dashboard
- [ ] Gráficas cargan sin errores
- [ ] Métricas calculadas correctamente (si hay datos)

### ✅ Pruebas de Formularios (Públicas)
- [ ] Ir a `/contacto.html`
- [ ] Llenar formulario de contacto:
  - Nombre: "Test User"
  - Email: "test@example.com"
  - Teléfono: "1234567890"
  - Servicio: seleccionar uno
  - Mensaje: "Mensaje de prueba"
- [ ] ✅ Hacer click en "Enviar Solicitud"
- [ ] ✅ Debe guardarse en `localStorage['solar_quotes']`
- [ ] ✅ Mostrar mensaje de éxito
- [ ] Verificar en Admin → Pestaña "Cotizaciones" → aparezca la nueva cotización

### ✅ Pruebas de Persistencia (localStorage)
- [ ] Crear un nuevo kit en admin
- [ ] Recargar la página (F5) → el kit sigue visible
- [ ] Cerrar sesión y volver a entrar → datos persisten
- [ ] Limpiar localStorage (DevTools → Application → Clear All) → datos iniciales se recargan

### ✅ Pruebas de Responsividad
- [ ] Desktop (1920x1080) → todo se ve bien
- [ ] Tablet (768x1024) → layout se adapta
- [ ] Móvil (375x667):
  - [ ] Navbar hamburguesa funciona
  - [ ] Formularios son usables
  - [ ] Admin panel es accesible (aunque puede haber scroll)

### ✅ Pruebas de Consola (DevTools)
- [ ] Abrir DevTools (F12)
- [ ] Tab "Console" → **NO debe haber errores rojo**
- [ ] Esperado: mensajes verdes/azules como:
  - "✅ Datos iniciales cargados en localStorage"
  - "Sesión activa en admin: joseines@gmail.es"
  - "✅ {n} registros inicializados en localStorage"

### ✅ Pruebas de Red (Network Tab)
- [ ] Ninguna petición fallida (HTTP 404)
- [ ] NO debe haber intentos de conectar a `supabase.co` o APIs externas
- [ ] Archivo `js/supabase-config.js` no se carga (ya no se importa)

## 📊 Datos Iniciales Cargados Automáticamente

Al abrir cualquier página por primera vez:
```javascript
// Se ejecuta seed-data.js que carga en localStorage:
{
  solar_kits: [5 kits solares],
  solar_promos: [3 promociones],
  solar_contactos: [2 contactos de ejemplo]
}
```

Para **resetear datos**:
```javascript
// En DevTools Console:
localStorage.clear();
location.reload();
// Volverán los datos iniciales automáticamente
```

## 🚀 Despliegue

### Opción 1: Render.com (Recomendado - Conectado)
- Ya está configurado en `render.yaml`
- Hacer push a GitHub y Render deploying automáticamente
- URL: `https://paneles-solares.onrender.com`

### Opción 2: GitHub Pages
```bash
# Copiar contenido de solar-web a docs/ en raíz del repo
# Activar GitHub Pages en Settings
```

### Opción 3: Archivo .zip (Compartible)
- Comprimir carpeta `solar-web/`
- Descomprimir en navegador (simular con Python http.server)

## ⚠️ Limitaciones Conocidas

1. **Autenticación simple:** Las credenciales están hardcodeadas. Para producción, usar sistema real (OAuth, JWT, etc.)

2. **Datos efímeros:** localStorage se limpia si:
   - Usuario limpia caché del navegador
   - Usuario va a navegación privada/incógnito
   - Para producción, sincronizar con BD real

3. **Formulario de contacto:** El envío de correo usa formulario estándar. 
   - Puede fallar si no hay back-end configurado
   - Los datos SÍ se guardan localmente de todas formas

4. **Sin backup:** No hay respaldo de datos. En producción:
   - Usar BD (Supabase, Firebase, PostgreSQL)
   - Implementar sincronización

## 🔧 Próximos Pasos (Recomendado)

1. **Conectar BD real:**
   ```javascript
   // Reactivar Supabase o usar alternativa (Firebase, MongoDB)
   import { createClient } from '@supabase/supabase-js';
   ```

2. **Mejorar autenticación:**
   - JWT tokens
   - Google/Microsoft OAuth
   - 2FA

3. **Backend API:**
   - Endpoint para CRUD de productos
   - Validación de datos
   - Email real para cotizaciones

4. **Caching y Performance:**
   - Minificar CSS/JS
   - Lazy loading de imágenes
   - Service Workers para offline

5. **Seguridad:**
   - Remover credenciales hardcodeadas
   - Rate limiting en formularios
   - CORS correcto

## 📞 Soporte

**Email:** joseines@gmail.es  
**Documentación:** Ver archivos individuales para comentarios de código  
**Issues:** ...

---

**Última revisión:** 10 de abril 2026 | **Estado:** ✅ Funcional y listo para testing
