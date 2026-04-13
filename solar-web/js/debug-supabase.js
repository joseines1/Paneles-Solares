// debug-supabase.js - Diagnóstico de Supabase
console.clear();
console.log('%c🔍 DIAGNÓSTICO SUPABASE', 'color: #f97316; font-weight: bold; font-size: 16px');

async function debugSupabase() {
    // 1. Verificar cliente
    console.log('%n1️⃣ Verificando Supabase Client...', 'color: #3b82f6; font-weight: bold');
    const client = window.supabaseClient;
    if (!client) {
        console.error('❌ Supabase Client NO está disponible');
        console.log('   Intentando de nuevo en 1s...');
        await new Promise(r => setTimeout(r, 1000));
        debugSupabase();
        return;
    }
    console.log('✅ Supabase Client está disponible');

    // 2. Probar conexión a tablas
    console.log('%n2️⃣ Probando conexión a tablas...', 'color: #3b82f6; font-weight: bold');

    const tables = ['kits', 'promotions', 'contacts'];
    for (const table of tables) {
        const { count, error } = await client
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error(`❌ ${table}: ${error.message}`);
        } else {
            console.log(`✅ ${table}: ${count} registros encontrados`);
        }
    }

    // 3. Cargar y mostrar promociones
    console.log('%n3️⃣ Cargando promociones desde Supabase...', 'color: #3b82f6; font-weight: bold');
    const { data: promos, error: promosError } = await client
        .from('promotions')
        .select('*')
        .limit(3);

    if (promosError) {
        console.error('❌ Error cargando promociones:', promosError);
    } else {
        console.log(`✅ Promociones cargadas: ${promos.length}`);
        console.table(promos);
    }

    // 4. Cargar y mostrar kits
    console.log('%n4️⃣ Cargando kits desde Supabase...', 'color: #3b82f6; font-weight: bold');
    const { data: kits, error: kitsError } = await client
        .from('kits')
        .select('*');

    if (kitsError) {
        console.error('❌ Error cargando kits:', kitsError);
    } else {
        console.log(`✅ Kits cargados: ${kits.length}`);
        console.table(kits);
    }

    // 5. Verificar script de homepage
    console.log('%n5️⃣ Verificando función de carga de promociones...', 'color: #3b82f6; font-weight: bold');
    if (typeof loadHomePromosFromSupabase === 'function') {
        console.log('✅ Función loadHomePromosFromSupabase existe');
    } else {
        console.error('❌ Función loadHomePromosFromSupabase NO existe');
    }

    console.log('%n========================================', 'color: #f97316');
    console.log('%nPara recargar la página de inicio, ejecuta:', 'color: #10b981; font-weight: bold');
    console.log('loadHomePromosFromSupabase()');
}

// Ejecutar diagnóstico
debugSupabase();
