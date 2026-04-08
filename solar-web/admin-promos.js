// admin-promos.js
// Logic for managing promotions in the admin panel

let promos = JSON.parse(localStorage.getItem('solar_promotions'));

// Default promos if none exist
if (!promos || promos.length === 0) {
    promos = [
        {
            id: 1,
            title: "Kit Residencial Básico",
            description: "Perfecto para hogares pequeños. Reduce hasta un 60% tu recibo bimestral.",
            originalPrice: "$65,000 MXN",
            promoPrice: "$54,999 MXN",
            badge: "¡Más Vendido!",
            badgeColor: "#ef4444",
            icon: "🏷️",
            features: "4 Paneles de 550W, Inversor de cadena, Instalación estándar incluida, Trámite ante CFE gratis"
        },
        {
            id: 2,
            title: "Kit Residencial Plus",
            description: "Ideal para hogares con alto consumo o aires acondicionados.",
            originalPrice: "$110,000 MXN",
            promoPrice: "$92,500 MXN",
            badge: "Premium",
            badgeColor: "#10b981",
            icon: "🔋",
            features: "8 Paneles de 550W, Microinversores, Monitoreo por panel individual, Mantenimiento gratis 1er año"
        },
        {
            id: 3,
            title: "Meses Sin Intereses",
            description: "Financia tu sistema solar pagando cómodas mensualidades con tarjetas participantes.",
            originalPrice: "",
            promoPrice: "Hasta 12 MSI",
            badge: "Facilidades",
            badgeColor: "#3b82f6",
            icon: "💳",
            features: "Aplica en todos los paquetes, Aprobación inmediata, Sin enganche requerido, Tarjetas Visa, Mastercard y AMEX"
        }
    ];
    localStorage.setItem('solar_promotions', JSON.stringify(promos));
}

let editingPromoId = null;

function loadPromos() {
    promos = JSON.parse(localStorage.getItem('solar_promotions')) || [];
    renderPromos();
}

function renderPromos() {
    const tbody = document.getElementById('promosTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (promos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--gray-400);">No hay promociones registradas.</td></tr>';
        return;
    }

    promos.forEach(promo => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                    <span style="font-size:1.5rem;">${promo.icon}</span>
                    <strong>${promo.title}</strong>
                </div>
            </td>
            <td>${promo.originalPrice || '-'}</td>
            <td style="color:var(--primary); font-weight:bold;">${promo.promoPrice}</td>
            <td><span class="status-badge" style="background:${promo.badgeColor}; color:white;">${promo.badge}</span></td>
            <td>
                <button class="btn-action" style="color:#3b82f6; border-color:rgba(59,130,246,0.3);" onclick="editPromo(${promo.id})">Editar</button>
                <button class="btn-action" style="color:#ef4444; border-color:rgba(239,68,68,0.3);" onclick="deletePromo(${promo.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showPromoModal(id = null) {
    const modal = document.getElementById('promoModal');
    if (!modal) return;

    const form = document.getElementById('promoForm');
    form.reset();

    if (id) {
        editingPromoId = id;
        document.getElementById('promoModalTitle').textContent = 'Editar Promoción';
        const promo = promos.find(p => p.id === id);
        if (promo) {
            document.getElementById('promoTitle').value = promo.title;
            document.getElementById('promoDesc').value = promo.description;
            document.getElementById('promoOrigPrice').value = promo.originalPrice;
            document.getElementById('promoPrice').value = promo.promoPrice;
            document.getElementById('promoBadge').value = promo.badge;
            document.getElementById('promoBadgeColor').value = promo.badgeColor;
            document.getElementById('promoIcon').value = promo.icon;
            document.getElementById('promoFeatures').value = promo.features;
        }
    } else {
        editingPromoId = null;
        document.getElementById('promoModalTitle').textContent = 'Crear Promoción';
        document.getElementById('promoBadgeColor').value = '#ef4444'; // Default color
    }

    modal.classList.add('active');
}

function closePromoModal() {
    const modal = document.getElementById('promoModal');
    if (modal) modal.classList.remove('active');
}

function savePromo(event) {
    event.preventDefault();

    const title = document.getElementById('promoTitle').value.trim();
    const description = document.getElementById('promoDesc').value.trim();
    const originalPrice = document.getElementById('promoOrigPrice').value.trim();
    const promoPrice = document.getElementById('promoPrice').value.trim();
    const badge = document.getElementById('promoBadge').value.trim();
    const badgeColor = document.getElementById('promoBadgeColor').value;
    const icon = document.getElementById('promoIcon').value.trim();
    const features = document.getElementById('promoFeatures').value.trim();

    if (editingPromoId) {
        const index = promos.findIndex(p => p.id === editingPromoId);
        if (index !== -1) {
            promos[index] = {
                id: editingPromoId,
                title, description, originalPrice, promoPrice, badge, badgeColor, icon, features
            };
        }
    } else {
        const newId = promos.length > 0 ? Math.max(...promos.map(p => p.id)) + 1 : 1;
        promos.push({
            id: newId,
            title, description, originalPrice, promoPrice, badge, badgeColor, icon, features
        });
    }

    localStorage.setItem('solar_promotions', JSON.stringify(promos));
    renderPromos();
    closePromoModal();
    
    // Forzar actualización en otras pestañas si están abiertas
    window.dispatchEvent(new Event('storage'));
}

function deletePromo(id) {
    if (confirm("¿Estás seguro de eliminar esta promoción?")) {
        promos = promos.filter(p => p.id !== id);
        localStorage.setItem('solar_promotions', JSON.stringify(promos));
        renderPromos();
        
        // Forzar actualización en otras pestañas si están abiertas
        window.dispatchEvent(new Event('storage'));
    }
}

// Event Listeners for the Promos section
document.addEventListener('DOMContentLoaded', () => {
    const promoForm = document.getElementById('promoForm');
    if (promoForm) {
        promoForm.addEventListener('submit', savePromo);
    }
});
