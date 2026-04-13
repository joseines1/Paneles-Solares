// admin-promos.js - Gestión de promociones sincronizada con Supabase

let promos = [];
let editingPromoId = null;

// Vista previa de imágenes vinculadas (usa el array kits cargado globalmente)
window.updatePromoLinkedImagesPreview = function() {
    const previewDiv = document.getElementById('promoLinkedImagesPreview');
    if (!previewDiv || !window.kits) return;

    const select = document.getElementById('promoProductSelect');
    if (!select) return;
    
    const kitIds = Array.from(select.selectedOptions).map(opt => opt.value).filter(v => v);
    
    let html = '';
    kitIds.forEach(id => {
        const kit = window.kits.find(k => String(k.id) === String(id));
        if (kit) {
            let img = kit.image || (kit.capacity > 5 ? 'img/panel_comercial.png' : 'img/panel_residencial.png');
            html += `<div style="position:relative; width:60px; height:60px; border-radius:8px; overflow:hidden; border:1px solid rgba(255,255,255,0.1);" title="${kit.name}">
                <img src="${img}" style="width:100%;height:100%;object-fit:cover;">
            </div>`;
        }
    });
    previewDiv.innerHTML = html;
};

async function loadPromos() {
    if (!supabaseClient) return;

    const { data, error } = await supabaseClient
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error cargando promociones:', error);
        return;
    }

    window.promos = data || [];
    renderPromosTable(window.promos);
}

function renderPromosTable(data) {
    const tbody = document.getElementById('promosTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;">No hay promociones.</td></tr>';
        return;
    }

    data.forEach(promo => {
        const tr = document.createElement('tr');
        
        let imgThumb = promo.image;
        if (!imgThumb && promo.kit_ids && promo.kit_ids.length > 0 && window.kits) {
            const firstKit = window.kits.find(k => String(k.id) === String(promo.kit_ids[0]));
            if (firstKit) imgThumb = firstKit.image;
        }

        const visual = imgThumb 
            ? `<img src="${imgThumb}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;">` 
            : `<span style="font-size:1.5rem;">${promo.icon || '🏷️'}</span>`;

        tr.innerHTML = `
            <td><div style="display:flex;align-items:center;gap:0.8rem;">${visual} <strong>${promo.title}</strong></div></td>
            <td>${promo.original_price || '-'}</td>
            <td style="color:var(--primary); font-weight:bold;">${promo.promo_price}</td>
            <td><span class="status-badge" style="background:${promo.badge_color || '#f97316'}; color:#fff;">${promo.badge}</span></td>
            <td>
                <button class="btn-action" style="color:#3b82f6;" onclick="showPromoModal(${promo.id})">Editar</button>
                <button class="btn-action" style="color:#ef4444;" onclick="deletePromo(${promo.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showPromoModal(id = null) {
    editingPromoId = id;
    const modal = document.getElementById('promoModal');
    const form = document.getElementById('promoForm');
    if (!modal || !form) return;

    form.reset();
    if (typeof populateProductSelectForPromos === 'function') populateProductSelectForPromos();

    if (id && window.promos) {
        const promo = window.promos.find(p => p.id === id);
        if (promo) {
            document.getElementById('promoModalTitle').textContent = 'Editar Promoción';
            document.getElementById('promoTitle').value = promo.title;
            document.getElementById('promoDesc').value = promo.description;
            document.getElementById('promoOrigPrice').value = promo.original_price || '';
            document.getElementById('promoPrice').value = promo.promo_price;
            document.getElementById('promoBadge').value = promo.badge;
            document.getElementById('promoBadgeColor').value = promo.badge_color;
            document.getElementById('promoIcon').value = promo.icon;
            document.getElementById('promoFeatures').value = promo.features;
            
            const select = document.getElementById('promoProductSelect');
            if (select && promo.kit_ids) {
                Array.from(select.options).forEach(opt => {
                    opt.selected = promo.kit_ids.includes(opt.value);
                });
            }
        }
    } else {
        document.getElementById('promoModalTitle').textContent = 'Crear Promoción';
    }

    if (window.updatePromoLinkedImagesPreview) window.updatePromoLinkedImagesPreview();
    modal.classList.add('active');
}

function closePromoModal() {
    const modal = document.getElementById('promoModal');
    if (modal) modal.classList.remove('active');
}

async function savePromo(event) {
    event.preventDefault();
    if (!supabaseClient) return;

    const promoData = {
        title: document.getElementById('promoTitle').value,
        description: document.getElementById('promoDesc').value,
        original_price: document.getElementById('promoOrigPrice').value,
        promo_price: document.getElementById('promoPrice').value,
        badge: document.getElementById('promoBadge').value,
        badge_color: document.getElementById('promoBadgeColor').value,
        icon: document.getElementById('promoIcon').value,
        features: document.getElementById('promoFeatures').value,
        kit_ids: Array.from(document.getElementById('promoProductSelect').selectedOptions).map(o => o.value)
    };

    try {
        let result;
        if (editingPromoId) {
            result = await supabaseClient.from('promotions').update(promoData).eq('id', editingPromoId);
        } else {
            result = await supabaseClient.from('promotions').insert([promoData]);
        }

        if (result.error) throw result.error;

        showNotification('Promoción guardada', 'success');
        closePromoModal();
        loadPromos();
    } catch (err) {
        console.error('Error:', err);
        showNotification('Error al guardar promoción', 'error');
    }
}

async function deletePromo(id) {
    if (!confirm('¿Eliminar promoción?') || !supabaseClient) return;

    try {
        const { error } = await supabaseClient.from('promotions').delete().eq('id', id);
        if (error) throw error;
        showNotification('Promoción eliminada', 'success');
        loadPromos();
    } catch (err) {
        console.error('Error:', err);
        showNotification('Error al eliminar', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('promoForm');
    if (form) form.addEventListener('submit', savePromo);
});
