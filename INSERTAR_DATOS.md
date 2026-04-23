## 🗄️ Insertar Datos de Prueba en Supabase

### Opción 1: Usando Supabase Dashboard SQL Editor (Más Fácil)

1. **Abre Supabase**
   - Ve a: https://app.supabase.com
   - Selecciona tu proyecto "Paneles Solares"

2. **Abre el SQL Editor**
   - En el menú izquierdo, haz clic en **SQL Editor**
   - Haz clic en **New Query**

3. **Copia y pega el script**
   - Abre el archivo: `seed-supabase.sql` (en la carpeta raíz)
   - Copia TODO el contenido
   - Pégalo en el editor de Supabase

4. **Ejecuta la consulta**
   - Haz clic en el botón **▶ RUN** (arriba a la derecha)
   - Espera a que termine
   - Deberías ver un mensaje de éxito

### Opción 2: Desde la Terminal

```bash
# Si tienes Supabase CLI instalado:
supabase db push seed-supabase.sql
```

---

## ✅ Verificar que los datos se insertaron correctamente

1. Ve a **Supabase Dashboard > Table Editor**
2. Haz clic en la tabla **kits** - deberías ver 5 productos
3. Haz clic en la tabla **promotions** - deberías ver 4 promociones

---

## 🌐 Verificar en tu sitio web

Después de insertar los datos:

1. Recarga tu página: https://paneles-solares.onrender.com
2. Desplázate a la sección **"Ofertas Especiales"**
3. Deberías ver 3 promociones con imágenes y precios

---

## 📋 Estructura de los datos

### Tabla: kits
| Campo | Valor |
|-------|-------|
| name | Nombre del producto |
| capacity | Capacidad en kW |
| price | Precio en pesos |
| description | Descripción larga |
| image | URL de la imagen |
| is_active | true/false |

### Tabla: promotions
| Campo | Valor |
|-------|-------|
| title | Nombre de la promoción |
| description | Descripción corta |
| badge | Etiqueta (ej: "DESCUENTO") |
| badge_color | Color del badge (hex) |
| promo_price | Precio con descuento |
| features | Características (separadas por comas) |
| kit_ids | Array de IDs de kits relacionados |

---

## 🔧 Troubleshooting

Si la página aún muestra "Cargando promociones...":

1. **Verifica que Supabase está configurado**
   ```bash
   # En la consola del navegador, ejecuta:
   console.log(window.supabaseClient);
   ```
   Debe mostrar un objeto, no `null`

2. **Check logs en consola**
   - Abre DevTools (F12)
   - Ve a Console
   - Busca mensajes de error rojo

3. **Reinicia el servidor**
   ```bash
   npm start
   ```
