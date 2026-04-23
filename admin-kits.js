// admin-kits.js
// Manejo de Productos individuales y Kits solares (con productos incluidos)

let kits = [];           // todos los registros de la tabla kits
let editingKitId = null; // ID del kit/producto en edición
let editingProductId = null;
let currentKitImageBase64 = null;
let currentProductImageBase64 = null;

// ─── Carga desde API protegida ───────────────────────────────────────────────

async function loadKits() {
    try {
        const data = await window.adminApiRequest('/api/admin/kits');
        kits = Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error cargando kits:', error);
        kits = [];
    }

    window.kits = kits;
    renderKits();
}

// ─── Render de tablas ────────────────────────────────────────────────────────

function renderKits() {
    const tbody = document.getElementById('kitsTableBody');
    if (!tbody) return;

    if (kits.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--gray-400);">No hay productos registrados.</td></tr>';
        return;
    }

    tbody.innerHTML = kits.map(item => {
        const img = item.image || (item.capacity > 5 ? 'img/panel_comercial.png' : 'img/panel_residencial.png');
        const isKit = item.type === 'kit';
        const badge = isKit
            ? '<span style="background:rgba(249,115,22,0.2);color:#f97316;font-size:0.7rem;padding:0.15rem 0.4rem;border-radius:4px;margin-left:6px;">KIT</span>'
            : '<span style="background:rgba(59,130,246,0.2);color:#3b82f6;font-size:0.7rem;padding:0.15rem 0.4rem;border-radius:4px;margin-left:6px;">PRODUCTO</span>';
        const editFn = isKit ? `showKitBundleModal(${item.id})` : `showProductModal(${item.id})`;

        return `
        <tr>
            <td>
                <div style="display:flex;align-items:center;gap:0.75rem;">
                    <img src="${img}" alt="" style="width:40px;height:40px;border-radius:6px;object-fit:cover;border:1px solid rgba(255,255,255,0.1);">
                    <span><strong>${item.name}</strong>${badge}</span>
                </div>
            </td>
            <td>${item.capacity} kW</td>
            <td>$${Number(item.price).toLocaleString('es-MX')}</td>
            <td>${item.stock}</td>
            <td><span style="background:var(--primary);color:white;font-size:0.8rem;padding:0.2rem 0.5rem;border-radius:4px;">${item.status || 'Activo'}</span></td>
            <td>
                <button class="btn-action" style="color:#3b82f6;border-color:rgba(59,130,246,0.3);" onclick="${editFn}">Editar</button>
                <button class="btn-action" style="color:#ef4444;border-color:rgba(239,68,68,0.3);" onclick="deleteKit(${item.id})">Eliminar</button>
            </td>
        </tr>`;
    }).join('');
}

// ─── Modal: Producto individual ──────────────────────────────────────────────

function showProductModal(id = null) {
    const modal = document.getElementById('productModal');
    if (!modal) return;

    document.getElementById('productForm').reset();
    currentProductImageBase64 = null;
    const preview = document.getElementById('productImagePreview');
    if (preview) { preview.style.display = 'none'; preview.src = ''; }

    if (id) {
        editingProductId = id;
        document.getElementById('productModalTitle').textContent = '🔩 Editar Producto';
        const p = kits.find(k => k.id === id);
        if (p) {
            document.getElementById('productName').value     = p.name || '';
            document.getElementById('productCapacity').value = p.capacity || '';
            document.getElementById('productPrice').value    = p.price || '';
            document.getElementById('productStock').value    = p.stock || '';
            document.getElementById('productStatus').value   = p.status || 'Activo';
            document.getElementById('productDesc').value     = p.description || '';
            document.getElementById('productFeatures').value = p.features || '';
            if (p.image) {
                if (p.image.startsWith('data:image')) {
                    currentProductImageBase64 = p.image;
                } else {
                    document.getElementById('productImageURL').value = p.image;
                }
                if (preview) { preview.src = p.image; preview.style.display = 'block'; }
            }
        }
    } else {
        editingProductId = null;
        document.getElementById('productModalTitle').textContent = '🔩 Crear Producto';
    }

    modal.style.display = 'flex';
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.style.display = 'none';
}

function saveProduct(event) {
    event.preventDefault();

    const urlVal = document.getElementById('productImageURL').value.trim();
    const data = {
        name:        document.getElementById('productName').value.trim(),
        capacity:    parseFloat(document.getElementById('productCapacity').value),
        price:       parseFloat(document.getElementById('productPrice').value),
        stock:       parseInt(document.getElementById('productStock').value),
        status:      document.getElementById('productStatus').value,
        description: document.getElementById('productDesc').value.trim(),
        features:    document.getElementById('productFeatures').value.trim(),
        image:       currentProductImageBase64 || urlVal,
        type:        'producto',
        category:    'Residencial',
        panels:      1,
        inverter:    parseFloat(document.getElementById('productCapacity').value)
    };

    const method = editingProductId ? 'PATCH' : 'POST';
    const url = editingProductId ? `/api/admin/kits/${editingProductId}` : '/api/admin/kits';

    window.adminApiRequest(url, {
        method,
        body: JSON.stringify(data)
    }).then(() => {
        showNotification(editingProductId ? 'Producto actualizado' : 'Producto creado', 'success');
        loadKits();
        closeProductModal();
    }).catch(error => {
            showNotification('Error guardando producto', 'error');
            console.error(error);
    });
}

// ─── Modal: Kit solar (con checklist de productos) ───────────────────────────

function showKitBundleModal(id = null) {
    const modal = document.getElementById('kitModal');
    if (!modal) return;

    document.getElementById('kitForm').reset();
    currentKitImageBase64 = null;
    const preview = document.getElementById('kitImagePreview');
    if (preview) { preview.style.display = 'none'; preview.src = ''; }

    // Poblar checklist con productos individuales
    const checklist = document.getElementById('kitProductsChecklist');
    const products = kits.filter(k => k.type !== 'kit');
    let selectedIds = [];

    if (id) {
        editingKitId = id;
        document.getElementById('kitModalTitle').textContent = '📦 Editar Kit Solar';
        const kit = kits.find(k => k.id === id);
        if (kit) {
            document.getElementById('kitName').value     = kit.name || '';
            document.getElementById('kitCapacity').value = kit.capacity || '';
            document.getElementById('kitPrice').value    = kit.price || '';
            document.getElementById('kitStock').value    = kit.stock || '';
            document.getElementById('kitStatus').value   = kit.status || 'Activo';
            document.getElementById('kitDesc').value     = kit.description || '';
            document.getElementById('kitFeatures').value = kit.features || '';
            selectedIds = Array.isArray(kit.product_ids) ? kit.product_ids : [];
            if (kit.image) {
                if (kit.image.startsWith('data:image')) {
                    currentKitImageBase64 = kit.image;
                } else {
                    document.getElementById('kitImageURL').value = kit.image;
                }
                if (preview) { preview.src = kit.image; preview.style.display = 'block'; }
            }
        }
    } else {
        editingKitId = null;
        document.getElementById('kitModalTitle').textContent = '📦 Crear Kit Solar';
    }

    if (products.length === 0) {
        checklist.innerHTML = '<span style="color:var(--gray-400);font-size:0.85rem;">No hay productos disponibles. Crea productos primero.</span>';
    } else {
        checklist.innerHTML = products.map(p => `
            <label style="display:flex;align-items:center;gap:0.6rem;padding:0.5rem;border-radius:6px;cursor:pointer;transition:background 0.2s;"
                   onmouseover="this.style.background='rgba(255,255,255,0.05)'"
                   onmouseout="this.style.background='transparent'">
                <input type="checkbox" value="${p.id}" ${selectedIds.includes(p.id) ? 'checked' : ''}
                    style="width:16px;height:16px;accent-color:#f97316;cursor:pointer;">
                <span style="color:var(--gray-200);font-size:0.9rem;">${p.name}</span>
                <span style="color:var(--gray-400);font-size:0.8rem;margin-left:auto;">$${Number(p.price).toLocaleString('es-MX')} · ${p.capacity} kW</span>
            </label>
        `).join('');
    }

    modal.style.display = 'flex';
}

function closeKitModal() {
    const modal = document.getElementById('kitModal');
    if (modal) modal.style.display = 'none';
}

function saveKit(event) {
    event.preventDefault();

    // Leer productos seleccionados
    const checklist = document.getElementById('kitProductsChecklist');
    const checked = checklist ? Array.from(checklist.querySelectorAll('input[type=checkbox]:checked')).map(cb => parseInt(cb.value)) : [];

    const urlVal = document.getElementById('kitImageURL').value.trim();
    const capacity = parseFloat(document.getElementById('kitCapacity').value);
    const data = {
        name:        document.getElementById('kitName').value.trim(),
        capacity,
        price:       parseFloat(document.getElementById('kitPrice').value),
        stock:       parseInt(document.getElementById('kitStock').value),
        status:      document.getElementById('kitStatus').value,
        description: document.getElementById('kitDesc').value.trim(),
        features:    document.getElementById('kitFeatures').value.trim(),
        image:       currentKitImageBase64 || urlVal,
        type:        'kit',
        product_ids: checked,
        category:    'Residencial',
        panels:      Math.round(capacity / 0.55),
        inverter:    capacity
    };

    const method = editingKitId ? 'PATCH' : 'POST';
    const url = editingKitId ? `/api/admin/kits/${editingKitId}` : '/api/admin/kits';

    window.adminApiRequest(url, {
        method,
        body: JSON.stringify(data)
    }).then(() => {
        showNotification(editingKitId ? 'Kit actualizado' : 'Kit creado', 'success');
        loadKits();
        closeKitModal();
    }).catch(error => {
            showNotification('Error guardando kit', 'error');
            console.error(error);
    });
}

// ─── Eliminar (producto o kit) ────────────────────────────────────────────────

function deleteKit(id) {
    if (!confirm('¿Estás seguro de eliminar este elemento?')) return;

    window.adminApiRequest(`/api/admin/kits/${id}`, {
        method: 'DELETE'
    }).then(() => {
        showNotification('Eliminado correctamente', 'success');
        loadKits();
    }).catch(error => {
            showNotification('Error eliminando', 'error');
            console.error(error);
    });
}

// ─── Imagen listeners ─────────────────────────────────────────────────────────

function setupImageListeners() {
    // Producto
    const pFile = document.getElementById('productImageFile');
    const pUrl  = document.getElementById('productImageURL');
    const pPrev = document.getElementById('productImagePreview');
    if (pFile) {
        pFile.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = evt => {
                currentProductImageBase64 = evt.target.result;
                if (pPrev) { pPrev.src = currentProductImageBase64; pPrev.style.display = 'block'; }
            };
            reader.readAsDataURL(file);
            if (pUrl) pUrl.value = '';
        });
    }
    if (pUrl) {
        pUrl.addEventListener('input', function() {
            if (this.value.trim()) {
                currentProductImageBase64 = null;
                if (pPrev) { pPrev.src = this.value; pPrev.style.display = 'block'; }
            }
        });
    }

    // Kit
    const kFile = document.getElementById('kitImageFile');
    const kUrl  = document.getElementById('kitImageURL');
    const kPrev = document.getElementById('kitImagePreview');
    if (kFile) {
        kFile.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = evt => {
                currentKitImageBase64 = evt.target.result;
                if (kPrev) { kPrev.src = currentKitImageBase64; kPrev.style.display = 'block'; }
            };
            reader.readAsDataURL(file);
            if (kUrl) kUrl.value = '';
        });
    }
    if (kUrl) {
        kUrl.addEventListener('input', function() {
            if (this.value.trim()) {
                currentKitImageBase64 = null;
                if (kPrev) { kPrev.src = this.value; kPrev.style.display = 'block'; }
            }
        });
    }
}

// ─── Para selector de productos en Promociones ───────────────────────────────

function populateProductSelectForPromos() {
    const select = document.getElementById('promoProductSelect');
    if (!select) return;
    const all = kits.filter(k => k.status !== 'Oculto');
    select.innerHTML = '';
    all.forEach(k => {
        const opt = document.createElement('option');
        opt.value = k.id;
        opt.textContent = `${k.name} ($${Number(k.price).toLocaleString('es-MX')})`;
        select.appendChild(opt);
    });
}

// ─── Exponer funciones globales ───────────────────────────────────────────────

window.showProductModal  = showProductModal;
window.closeProductModal = closeProductModal;
window.showKitModal      = showKitBundleModal;   // alias para compatibilidad
window.showKitBundleModal = showKitBundleModal;
window.closeKitModal     = closeKitModal;
window.deleteKit         = deleteKit;
window.loadKits          = loadKits;
window.populateProductSelectForPromos = populateProductSelectForPromos;

document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('productForm');
    if (productForm) productForm.addEventListener('submit', saveProduct);

    const kitForm = document.getElementById('kitForm');
    if (kitForm) kitForm.addEventListener('submit', saveKit);

    setupImageListeners();
});
