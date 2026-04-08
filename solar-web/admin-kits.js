// admin-kits.js – Gestión de Kits / Promociones (100% localStorage, sin base de datos)

// ─── Catálogo fijo de componentes disponibles ─────────────────────────────────
const CATALOG = {
    paneles: [
        { id: 'p1', nombre: 'Panel Monocristalino 550W', watts: 550,  precio: 4200,  imagen: 'img/solar_res_1.png' },
        { id: 'p2', nombre: 'Panel Bifacial 600W',       watts: 600,  precio: 5100,  imagen: 'img/solar_com_1.png' },
        { id: 'p3', nombre: 'Panel Policristalino 400W', watts: 400,  precio: 2900,  imagen: 'img/solar_batt_1.png' },
        { id: 'p4', nombre: 'Panel Monocristalino 450W', watts: 450,  precio: 3500,  imagen: 'img/solar_res_2.png' },
    ],
    inversores: [
        { id: 'i1', nombre: 'Inversor Solax 3 kW',     kw: 3,   precio: 12000 },
        { id: 'i2', nombre: 'Inversor Solis 5 kW',     kw: 5,   precio: 18500 },
        { id: 'i3', nombre: 'Inversor Growatt 8 kW',   kw: 8,   precio: 27000 },
        { id: 'i4', nombre: 'Inversor Huawei 10 kW',   kw: 10,  precio: 35000 },
    ],
    baterias: [
        { id: 'b1', nombre: 'Batería LiFePO4 5 kWh',  kwh: 5,  precio: 28000 },
        { id: 'b2', nombre: 'Batería LiFePO4 10 kWh', kwh: 10, precio: 52000 },
        { id: 'b3', nombre: 'Batería Pylontech 7 kWh', kwh: 7,  precio: 38000 },
    ],
    extras: [
        { id: 'e1', nombre: 'Kit de montaje en techo',         precio: 1800 },
        { id: 'e2', nombre: 'Medidor bidireccional CFE',       precio: 2500 },
        { id: 'e3', nombre: 'Cableado y protecciones',         precio: 3200 },
        { id: 'e4', nombre: 'App de monitoreo (1 año)',        precio: 1200 },
        { id: 'e5', nombre: 'Instalación y mano de obra',      precio: 8000 },
    ]
};

const KITS_KEY = 'solar_kits';

// ─── Estado global ─────────────────────────────────────────────────────────────
const kitsState = {
    kits: [],
    currentPage: 1,
    itemsPerPage: 10,
};

// ─── Persistencia ──────────────────────────────────────────────────────────────
function kitsLoad()   { kitsState.kits = JSON.parse(localStorage.getItem(KITS_KEY) || '[]'); }
function kitsSave()   { localStorage.setItem(KITS_KEY, JSON.stringify(kitsState.kits)); }

// ─── CRUD ──────────────────────────────────────────────────────────────────────
async function loadKits() {
    kitsLoad();
    renderKitsTable();
}

function editKit(id) {
    const kit = kitsState.kits.find(k => k.id === id);
    if (kit) showKitModal(kit);
}

function deleteKit(id) {
    const kit = kitsState.kits.find(k => k.id === id);
    if (!kit) return;
    if (confirm(`¿Eliminar el kit "${kit.name}"? Esta acción no se puede deshacer.`)) {
        kitsState.kits = kitsState.kits.filter(k => k.id !== id);
        kitsSave();
        renderKitsTable();
        showNotification('Kit eliminado correctamente', 'success');
    }
}

// ─── Tabla ─────────────────────────────────────────────────────────────────────
function renderKitsTable() {
    const tbody = document.getElementById('kitsTableBody');
    if (!tbody) return;

    const start = (kitsState.currentPage - 1) * kitsState.itemsPerPage;
    const page  = kitsState.kits.slice(start, start + kitsState.itemsPerPage);

    if (!page.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--gray-400);">No hay kits ni promociones. Haz clic en "+ Crear" para empezar.</td></tr>';
        renderKitsPagination();
        return;
    }

    tbody.innerHTML = page.map(kit => {
        const totalW  = (kit.paneles || []).reduce((s, p) => s + (p.cantidad * p.watts), 0);
        const kw      = (totalW / 1000).toFixed(1);
        const badge   = kit.is_active
            ? '<span class="status-badge active">Activo</span>'
            : '<span class="status-badge inactive">Inactivo</span>';
        const tipoBadge = kit.tipo === 'Promoción'
            ? '<span style="background:rgba(168,85,247,0.2);color:#c084fc;border:1px solid rgba(168,85,247,0.4);padding:.2rem .6rem;border-radius:20px;font-size:.75rem;font-weight:700;">🏷️ Promo</span>'
            : '<span style="background:rgba(249,115,22,0.15);color:#fb923c;border:1px solid rgba(249,115,22,0.3);padding:.2rem .6rem;border-radius:20px;font-size:.75rem;font-weight:700;">📦 Kit</span>';
        return `
        <tr>
            <td>
                <div class="kit-cell">
                    <strong>${kit.name}</strong>
                    <small style="color:var(--gray-400);display:block;">${kit.category}</small>
                </div>
            </td>
            <td>${tipoBadge}</td>
            <td>${kw} kW</td>
            <td>$${parseFloat(kit.price).toLocaleString('es-MX')}</td>
            <td>${kit.stock ?? 0}</td>
            <td>${badge}</td>
            <td style="display:flex;gap:8px;">
                <button class="btn-action" onclick="editKit(${kit.id})">✏️</button>
                <button class="btn-action" style="color:#ef4444;border-color:rgba(239,68,68,0.3);" onclick="deleteKit(${kit.id})">🗑️</button>
            </td>
        </tr>`;
    }).join('');

    renderKitsPagination();
}

function renderKitsPagination() {
    const cont  = document.getElementById('kitsPaginationContainer');
    if (!cont) return;
    const total = Math.ceil(kitsState.kits.length / kitsState.itemsPerPage);
    if (total <= 1) { cont.innerHTML = ''; return; }

    let html = '<div class="pagination-controls">';
    html += `<button class="pagination-btn" ${kitsState.currentPage===1?'disabled':''} onclick="changeKitsPage(${kitsState.currentPage-1})">← Anterior</button>`;
    for (let i = 1; i <= total; i++)
        html += `<button class="pagination-btn ${i===kitsState.currentPage?'active':''}" onclick="changeKitsPage(${i})">${i}</button>`;
    html += `<button class="pagination-btn" ${kitsState.currentPage===total?'disabled':''} onclick="changeKitsPage(${kitsState.currentPage+1})">Siguiente →</button>`;
    html += '</div>';
    cont.innerHTML = html;
}

function changeKitsPage(page) {
    const total = Math.ceil(kitsState.kits.length / kitsState.itemsPerPage);
    if (page >= 1 && page <= total) { kitsState.currentPage = page; renderKitsTable(); }
}

// ─── MODAL (Crear / Editar Kit) ────────────────────────────────────────────────
function showKitModal(kit = null) {
    // Construir opciones de paneles
    const panelesHTML = CATALOG.paneles.map(p => `
        <div class="comp-row" data-type="panel" data-id="${p.id}" data-watts="${p.watts}" data-precio="${p.precio}" data-nombre="${p.nombre}">
            <span class="comp-name">${p.nombre}</span>
            <span class="comp-price">$${p.precio.toLocaleString('es-MX')}</span>
            <div class="comp-qty">
                <button type="button" onclick="compQty(this,-1)">−</button>
                <input type="number" min="0" value="${getKitComponentQty(kit, 'paneles', p.id)}" style="width:50px;text-align:center;" class="qty-input admin-input" />
                <button type="button" onclick="compQty(this,+1)">+</button>
            </div>
        </div>`).join('');

    const inversoresHTML = CATALOG.inversores.map(i => `
        <div class="comp-row" data-type="inversor" data-id="${i.id}" data-kw="${i.kw}" data-precio="${i.precio}" data-nombre="${i.nombre}">
            <span class="comp-name">${i.nombre}</span>
            <span class="comp-price">$${i.precio.toLocaleString('es-MX')}</span>
            <div class="comp-qty">
                <button type="button" onclick="compQty(this,-1)">−</button>
                <input type="number" min="0" value="${getKitComponentQty(kit, 'inversores', i.id)}" style="width:50px;text-align:center;" class="qty-input admin-input" />
                <button type="button" onclick="compQty(this,+1)">+</button>
            </div>
        </div>`).join('');

    const bateriasHTML = CATALOG.baterias.map(b => `
        <div class="comp-row" data-type="bateria" data-id="${b.id}" data-kwh="${b.kwh}" data-precio="${b.precio}" data-nombre="${b.nombre}">
            <span class="comp-name">${b.nombre}</span>
            <span class="comp-price">$${b.precio.toLocaleString('es-MX')}</span>
            <div class="comp-qty">
                <button type="button" onclick="compQty(this,-1)">−</button>
                <input type="number" min="0" value="${getKitComponentQty(kit, 'baterias', b.id)}" style="width:50px;text-align:center;" class="qty-input admin-input" />
                <button type="button" onclick="compQty(this,+1)">+</button>
            </div>
        </div>`).join('');

    const extrasHTML = CATALOG.extras.map(e => `
        <div class="comp-row" data-type="extra" data-id="${e.id}" data-precio="${e.precio}" data-nombre="${e.nombre}">
            <span class="comp-name">${e.nombre}</span>
            <span class="comp-price">$${e.precio.toLocaleString('es-MX')}</span>
            <div class="comp-qty">
                <button type="button" onclick="compQty(this,-1)">−</button>
                <input type="number" min="0" value="${getKitComponentQty(kit, 'extras', e.id)}" style="width:50px;text-align:center;" class="qty-input admin-input" />
                <button type="button" onclick="compQty(this,+1)">+</button>
            </div>
        </div>`).join('');

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:10000;';

    overlay.innerHTML = `
    <div style="background:var(--secondary-dark);padding:2rem;border-radius:16px;width:94%;max-width:720px;border:1px solid rgba(255,255,255,0.1);max-height:92vh;overflow-y:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
            <h3 style="color:var(--white);font-size:1.3rem;">${kit ? '✏️ Editar Kit' : '📦 Crear Nuevo Kit / Promoción'}</h3>
            <button type="button" onclick="this.closest('.modal-overlay').remove()" style="background:none;border:none;color:var(--gray-400);font-size:1.5rem;cursor:pointer;line-height:1;">✕</button>
        </div>

        <form id="kitForm">
            <!-- INFO BÁSICA -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
                <div>
                    <label style="display:block;margin-bottom:.4rem;color:var(--gray-300);font-size:.85rem;font-weight:600;">NOMBRE DEL KIT *</label>
                    <input type="text" id="kitName" value="${kit?.name||''}" class="admin-input" required placeholder="Ej: Kit Solar Residencial 3kW">
                </div>
                <div>
                    <label style="display:block;margin-bottom:.4rem;color:var(--gray-300);font-size:.85rem;font-weight:600;">CATEGORÍA *</label>
                    <select id="kitCategory" class="admin-select" required>
                        <option value="">Seleccionar...</option>
                        <option value="Residencial" ${kit?.category==='Residencial'?'selected':''}>Residencial</option>
                        <option value="Comercial"   ${kit?.category==='Comercial'?'selected':''}>Comercial</option>
                        <option value="Industrial"  ${kit?.category==='Industrial'?'selected':''}>Industrial</option>
                    </select>
                </div>
            </div>

            <div style="margin-bottom:1rem;">
                <label style="display:block;margin-bottom:.4rem;color:var(--gray-300);font-size:.85rem;font-weight:600;">DESCRIPCIÓN</label>
                <textarea id="kitDescription" class="admin-input" rows="2" style="resize:vertical;" placeholder="Breve descripción del kit...">${kit?.description||''}</textarea>
            </div>

            <!-- COMPONENTES -->
            <div style="border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:1.2rem;margin-bottom:1rem;">
                <h4 style="color:var(--primary);margin-bottom:1rem;font-size:1rem;">🔆 Paneles Solares</h4>
                <div id="panelesRows">${panelesHTML}</div>

                <h4 style="color:var(--primary);margin:1rem 0;font-size:1rem;">⚡ Inversores</h4>
                <div id="inversoresRows">${inversoresHTML}</div>

                <h4 style="color:var(--primary);margin:1rem 0;font-size:1rem;">🔋 Baterías (opcional)</h4>
                <div id="bateriasRows">${bateriasHTML}</div>

                <h4 style="color:var(--primary);margin:1rem 0;font-size:1rem;">🔧 Extras / Accesorios</h4>
                <div id="extrasRows">${extrasHTML}</div>
            </div>

            <!-- PRECIO Y STOCK -->
            <div style="background:rgba(249,115,22,0.07);border:1px solid rgba(249,115,22,0.2);border-radius:10px;padding:1.2rem;margin-bottom:1rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.8rem;">
                    <span style="color:var(--gray-300);font-size:.9rem;">Subtotal componentes:</span>
                    <span id="costoComponentes" style="color:var(--primary);font-weight:700;font-size:1.1rem;">$0 MXN</span>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;">
                    <div>
                        <label style="display:block;margin-bottom:.4rem;color:var(--gray-300);font-size:.85rem;font-weight:600;">PRECIO FINAL (MXN) *</label>
                        <input type="number" id="kitPrice" value="${kit?.price||''}" step="1" class="admin-input" required placeholder="0">
                    </div>
                    <div>
                        <label style="display:block;margin-bottom:.4rem;color:var(--gray-300);font-size:.85rem;font-weight:600;">GARANTÍA (años)</label>
                        <input type="number" id="kitWarranty" value="${kit?.warranty||25}" class="admin-input" placeholder="25">
                    </div>
                    <div>
                        <label style="display:block;margin-bottom:.4rem;color:var(--gray-300);font-size:.85rem;font-weight:600;">STOCK</label>
                        <input type="number" id="kitStock" value="${kit?.stock??10}" class="admin-input" placeholder="10">
                    </div>
                </div>
            </div>

            <!-- IMAGEN OPCIONAL -->
            <div style="margin-bottom:1rem;">
                <label style="display:block;margin-bottom:.4rem;color:var(--gray-300);font-size:.85rem;font-weight:600;">IMAGEN DEL KIT (opcional)</label>
                <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;">
                    <input type="file" id="kitImage" accept="image/*" style="display:none;">
                    <button type="button" onclick="document.getElementById('kitImage').click()" class="btn-success" style="padding:.4rem .9rem;font-size:.85rem;">📷 Seleccionar imagen</button>
                    <span id="imageFileName" style="color:var(--gray-400);font-size:.85rem;">${kit?.image_url?'Imagen guardada':'Sin imagen'}</span>
                </div>
                <div id="imagePreview" style="margin-top:.8rem;">
                    ${kit?.image_url ? `<img src="${kit.image_url}" style="max-width:160px;border-radius:8px;border:1px solid rgba(255,255,255,.15);">` : ''}
                </div>
            </div>

            <!-- ESTADO -->
            <div style="margin-bottom:1.5rem;">
                <label style="display:flex;align-items:center;gap:.6rem;color:var(--gray-300);cursor:pointer;">
                    <input type="checkbox" id="kitIsActive" ${kit?.is_active!==false?'checked':''}>
                    Kit visible en la página de Productos
                </label>
            </div>

            <div style="display:flex;gap:1rem;justify-content:flex-end;">
                <button type="button" onclick="this.closest('.modal-overlay').remove()" class="btn-danger" style="padding:.6rem 1.2rem;">Cancelar</button>
                <button type="submit" class="btn-success" style="padding:.6rem 1.4rem;">💾 ${kit?'Guardar cambios':'Crear Kit'}</button>
            </div>
        </form>
    </div>`;

    // Estilos para filas de componentes
    const style = document.createElement('style');
    style.textContent = `
        .comp-row { display:flex; align-items:center; gap:.8rem; padding:.5rem 0; border-bottom:1px solid rgba(255,255,255,.05); }
        .comp-row:last-child { border-bottom: none; }
        .comp-name { flex:1; color: var(--gray-200); font-size:.87rem; }
        .comp-price { color: var(--primary); font-size:.85rem; font-weight:600; min-width:90px; text-align:right; }
        .comp-qty { display:flex; align-items:center; gap:.3rem; }
        .comp-qty button { width:26px; height:26px; border-radius:6px; border:1px solid rgba(255,255,255,.15); background:rgba(255,255,255,.05); color:#fff; cursor:pointer; font-size:1rem; line-height:1; transition:.2s; }
        .comp-qty button:hover { background:var(--primary); border-color:var(--primary); }
        .qty-input { height:28px!important; padding:.2rem .4rem!important; }
    `;
    overlay.appendChild(style);
    document.body.appendChild(overlay);

    // Actualizar costo en tiempo real
    function updateCost() {
        let total = 0;
        overlay.querySelectorAll('.comp-row').forEach(row => {
            const qty   = parseInt(row.querySelector('.qty-input').value) || 0;
            const p     = parseInt(row.dataset.precio) || 0;
            total += qty * p;
        });
        const el = document.getElementById('costoComponentes');
        if (el) el.textContent = '$' + total.toLocaleString('es-MX') + ' MXN';
        // Autofill precio si está vacío
        const priceEl = document.getElementById('kitPrice');
        if (priceEl && !priceEl.value) priceEl.value = total;
    }

    overlay.querySelectorAll('.qty-input').forEach(i => i.addEventListener('input', updateCost));
    overlay.addEventListener('change', updateCost);
    updateCost();

    // Preview de imagen
    document.getElementById('kitImage').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = ev => {
            document.getElementById('imagePreview').innerHTML = `<img src="${ev.target.result}" style="max-width:160px;border-radius:8px;border:1px solid rgba(255,255,255,.15);">`;
            document.getElementById('imageFileName').textContent = file.name;
        };
        reader.readAsDataURL(file);
    });

    // Cerrar al click exterior
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    // Submit
    document.getElementById('kitForm').addEventListener('submit', async e => {
        e.preventDefault();

        const name     = document.getElementById('kitName').value.trim();
        const category = document.getElementById('kitCategory').value;
        const price    = parseFloat(document.getElementById('kitPrice').value);

        if (!name || !category || !price) {
            showNotification('Completa los campos obligatorios', 'error');
            return;
        }

        // Recolectar componentes seleccionados
        const paneles    = collectComponents(overlay, 'panel',   'watts');
        const inversores = collectComponents(overlay, 'inversor', 'kw');
        const baterias   = collectComponents(overlay, 'bateria',  'kwh');
        const extras     = collectComponents(overlay, 'extra',    null);

        // Imagen (base64 o la existente)
        let image_url = kit?.image_url || null;
        const imgFile = document.getElementById('kitImage').files[0];
        if (imgFile) {
            image_url = await fileToBase64(imgFile);
        }
        // Si no hay imagen personalizada, asignar por categoría
        if (!image_url) {
            const imgMap = { Residencial:'img/solar_res_1.png', Comercial:'img/solar_com_1.png', Industrial:'img/solar_batt_1.png' };
            image_url = imgMap[category] || 'img/solar_res_1.png';
        }

        const totalW = paneles.reduce((s, p) => s + p.cantidad * p.watts, 0);

        const kitData = {
            id:          kit ? kit.id : Date.now(),
            name,
            category,
            description: document.getElementById('kitDescription').value.trim(),
            price,
            warranty:    parseInt(document.getElementById('kitWarranty').value) || 25,
            stock:       parseInt(document.getElementById('kitStock').value) ?? 10,
            is_active:   document.getElementById('kitIsActive').checked,
            image_url,
            paneles,
            inversores,
            baterias,
            extras,
            capacity:    totalW,
            panels:      paneles.reduce((s, p) => s + p.cantidad, 0),
            created_at:  kit?.created_at || new Date().toISOString(),
        };

        if (kit) {
            const idx = kitsState.kits.findIndex(k => k.id === kit.id);
            if (idx !== -1) kitsState.kits[idx] = kitData;
            showNotification('Kit actualizado correctamente ✅', 'success');
        } else {
            kitsState.kits.unshift(kitData);
            showNotification('Kit creado correctamente 🎉', 'success');
        }

        kitsSave();
        renderKitsTable();
        overlay.remove();
    });
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getKitComponentQty(kit, type, id) {
    if (!kit || !kit[type]) return 0;
    const item = kit[type].find(c => c.id === id);
    return item ? item.cantidad : 0;
}

function collectComponents(overlay, type, specKey) {
    const rows = overlay.querySelectorAll(`.comp-row[data-type="${type}"]`);
    const result = [];
    rows.forEach(row => {
        const qty = parseInt(row.querySelector('.qty-input').value) || 0;
        if (qty > 0) {
            const obj = { id: row.dataset.id, nombre: row.dataset.nombre, cantidad: qty, precio: parseFloat(row.dataset.precio) };
            if (specKey && row.dataset[specKey]) obj[specKey] = parseFloat(row.dataset[specKey]);
            result.push(obj);
        }
    });
    return result;
}

function compQty(btn, delta) {
    const input = btn.parentElement.querySelector('.qty-input');
    const cur   = parseInt(input.value) || 0;
    input.value = Math.max(0, cur + delta);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

function fileToBase64(file) {
    return new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload  = e => res(e.target.result);
        reader.onerror = rej;
        reader.readAsDataURL(file);
    });
}

// ─── Notificaciones ────────────────────────────────────────────────────────────
function showNotification(message, type = 'info') {
    const n = document.createElement('div');
    n.style.cssText = `position:fixed;top:20px;right:20px;padding:1rem 1.5rem;background:${type==='success'?'#10b981':type==='error'?'#ef4444':'var(--primary)'};color:#fff;border-radius:8px;z-index:10001;box-shadow:0 4px 12px rgba(0,0,0,.3);animation:slideIn .3s ease;font-weight:600;`;
    n.textContent = message;
    document.body.appendChild(n);
    setTimeout(() => { n.style.opacity = '0'; n.style.transition = 'opacity .3s'; setTimeout(() => n.remove(), 300); }, 3000);
}

// ─── Global exports ────────────────────────────────────────────────────────────
window.showKitModal   = showKitModal;
window.editKit        = editKit;
window.deleteKit      = deleteKit;
window.changeKitsPage = changeKitsPage;
window.loadKits       = loadKits;
window.compQty        = compQty;
