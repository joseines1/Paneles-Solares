# 🗄️ Configurar Supabase - Guía Completa

## 1. Crear Tabla en Supabase

### Opción A: Via SQL Query (Recomendado - 2 minutos)

1. Ve a tu proyecto en [supabase.com/dashboard](https://supabase.com/dashboard)
2. Haz clic en **"SQL Editor"** (lado izquierdo)
3. Haz clic en **"New Query"**
4. Copia todo el contenido del archivo `supabase_create_contacts_table.sql`
5. Pégalo en el editor SQL
6. Haz clic en **"Run"**
7. ✅ Tabla creada

### Opción B: Via Table Editor (Manual)

1. Ve a **"Table Editor"** 
2. Haz clic en **"Create a new table"**
3. Nombre: `contacts`
4. Agrega columnas:

| Columna | Tipo | Requerido | Default |
|---------|------|-----------|---------|
| `id` | bigint | ✅ | auto-increment |
| `nombre` | text | ✅ | - |
| `empresa` | text | ❌ | NULL |
| `email` | text | ✅ | - |
| `telefono` | text | ✅ | - |
| `servicio` | text | ✅ | - |
| `factura` | text | ❌ | NULL |
| `mensaje` | text | ❌ | NULL |
| `status` | text | ❌ | 'Nueva solicitud' |
| `progress` | int | ❌ | 10 |
| `created_at` | timestamp | ✅ | now() |
| `updated_at` | timestamp | ✅ | now() |

5. Haz clic en **"Save"**

---

## 2. Habilitar Row Level Security (RLS)

⚠️ **IMPORTANTE PARA PRODUCCIÓN**

1. En la tabla `contacts`, haz clic en **"Settings"**
2. Sube a la sección **"Authentication"**
3. Habilita **"Enable Row Level Security"**

Luego crea las políticas (permisos):

### Política de Lectura
```sql
CREATE POLICY "Permitir lectura pública" ON contacts
FOR SELECT USING (true);
```

### Política de Inserción
```sql
CREATE POLICY "Permitir inserción pública" ON contacts
FOR INSERT WITH CHECK (true);
```

---

## 3. Obtener API Credentials

1. Ve a **"Settings"** → **"API"** (lado izquierdo)
2. Copia:
   - **Project URL** = `SUPABASE_URL`
   - **Anon Public** = `SUPABASE_ANON_KEY`

Tu URL debe ser: `https://ojswxnqgqikzmzihtmfu.supabase.co`

---

## 4. Ya Está Configurado

Tu backend ahora:
- ✅ Guarda contactos en Supabase (no se pierden)
- ✅ Envía emails a cliente y admin
- ✅ Envía WhatsApp
- ✅ Sincroniza datos en tiempo real

---

## 5. Pasos Siguientes

### Opción 1: Probar Localmente
```bash
npm install
npm start
# Abre: http://localhost:3000/contacto.html
```

### Opción 2: Desplegar en Render
Sigue [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)

**Agrega las nuevas variables en Render:**
- `SUPABASE_URL` = tu URL
- `SUPABASE_ANON_KEY` = tu anon key

---

## 🔍 Verificar que Funciona

1. Abre tu sitio
2. Llena el formulario de contacto
3. Envía
4. Ve a Supabase → Table Editor → `contacts`
5. ✅ Debería aparecer tu registro

---

## 💡 Troubleshooting

### "Error insertion"
- Verifica que la tabla `contacts` existe
- Verifica que RLS está habilitado correctamente
- Verifica que tu ANON_KEY es válida

### "No puedo ver datos en Supabase"
- Revisa que SUPABASE_URL y SUPABASE_ANON_KEY sean correctas
- Revisa los logs de Supabase: Project → Logs

### "Lentitud al guardar"
- Normal en plan gratuito
- Considera upgrade a Pro si hay alto volumen

---

## 🎯 Beneficios de Supabase

✅ Datos persistentes (no se pierden)  
✅ Acceso desde cualquier lugar  
✅ Backups automáticos  
✅ Escalable (gratis hasta 500k registros)  
✅ Panel admin integrado  
✅ API REST automática  

¡Listo! Tu base de datos está en la nube. 🚀
