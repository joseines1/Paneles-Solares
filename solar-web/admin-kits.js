// admin-kits.js
// Logic for managing Products/Kits in the admin panel

let kits = JSON.parse(localStorage.getItem('solar_kits'));

// Default kits if none exist
if (!kits || kits.length === 0) {
    kits = [
        {
            id: 1,
            name: "Kit Residencial Básico 2kW",
            capacity: 2.2,
            price: 45000,
            stock: 15,
            status: "Activo",
            description: "Sistema básico para reducir tarifa DAC en consumos moderados.",
            features: "4 Paneles 550W, Microinversor 2kW, Estructura coplanar, Trámite CFE"
        },
        {
            id: 2,
            name: "Kit Residencial Plus 5kW",
            capacity: 5.5,
            price: 85000,
            stock: 8,
            status: "Activo",
            description: "Ideal para casas grandes con 2-3 minisplits.",
            features: "10 Paneles 550W, Inversor central 5kW, Monitoreo WiFi, Protecciones DC/AC"
        },
        {
            id: 3,
            name: "Kit Comercial Trifásico 10kW",
            capacity: 11.0,
            price: 160000,
            stock: 5,
            status: "Activo",
            description: "Solución para negocios, oficinas o talleres con tarifa GDMTO.",
            features: "20 Paneles 550W, Inversor Trifásico 10kW, Estructura inclinada, Ingeniería"
        }
    ];
    localStorage.setItem('solar_kits', JSON.stringify(kits));
}

let editingKitId = null;

function loadKits() {
    kits = JSON.parse(localStorage.getItem('solar_kits')) || [];
    renderKits();
}

function renderKits() {
    const tbody = document.getElementById('kitsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (kits.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--gray-400);">No hay productos registrados.</td></tr>';
        return;
    }

    kits.forEach(kit => {
        const tr = document.createElement('tr');
        
        let statusBadge = 'bg-gray-500';
        if (kit.status === 'Activo') statusBadge = 'bg-green-500';
        if (kit.status === 'Agotado') statusBadge = 'bg-red-500';
        if (kit.status === 'Oculto') statusBadge = 'bg-gray-600';

        tr.innerHTML = `
            <td><strong>${kit.name}</strong></td>
            <td>${kit.capacity} kW</td>
            <td>$${Number(kit.price).toLocaleString('es-MX')}</td>
            <td>${kit.stock}</td>
            <td><span class="status-badge" style="background:var(--primary); color:white; font-size:0.8rem; padding:0.2rem 0.5rem;">${kit.status}</span></td>
            <td>
                <button class="btn-action" style="color:#3b82f6; border-color:rgba(59,130,246,0.3);" onclick="editKit(${kit.id})">Editar</button>
                <button class="btn-action" style="color:#ef4444; border-color:rgba(239,68,68,0.3);" onclick="deleteKit(${kit.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showKitModal(id = null) {
    const modal = document.getElementById('kitModal');
    if (!modal) return;

    const form = document.getElementById('kitForm');
    form.reset();

    if (id) {
        editingKitId = id;
        document.getElementById('kitModalTitle').textContent = 'Editar Producto';
        const kit = kits.find(k => k.id === id);
        if (kit) {
            document.getElementById('kitName').value = kit.name;
            document.getElementById('kitCapacity').value = kit.capacity;
            document.getElementById('kitPrice').value = kit.price;
            document.getElementById('kitStock').value = kit.stock;
            document.getElementById('kitStatus').value = kit.status;
            document.getElementById('kitDesc').value = kit.description;
            document.getElementById('kitFeatures').value = kit.features;
        }
    } else {
        editingKitId = null;
        document.getElementById('kitModalTitle').textContent = 'Crear Producto';
    }

    modal.classList.add('active');
}

function closeKitModal() {
    const modal = document.getElementById('kitModal');
    if (modal) modal.classList.remove('active');
}

function saveKit(event) {
    event.preventDefault();

    const name = document.getElementById('kitName').value.trim();
    const capacity = parseFloat(document.getElementById('kitCapacity').value);
    const price = parseFloat(document.getElementById('kitPrice').value);
    const stock = parseInt(document.getElementById('kitStock').value);
    const status = document.getElementById('kitStatus').value;
    const description = document.getElementById('kitDesc').value.trim();
    const features = document.getElementById('kitFeatures').value.trim();

    if (editingKitId) {
        const index = kits.findIndex(k => k.id === editingKitId);
        if (index !== -1) {
            kits[index] = {
                id: editingKitId,
                name, capacity, price, stock, status, description, features
            };
        }
    } else {
        const newId = kits.length > 0 ? Math.max(...kits.map(k => k.id)) + 1 : 1;
        kits.push({
            id: newId,
            name, capacity, price, stock, status, description, features
        });
    }

    localStorage.setItem('solar_kits', JSON.stringify(kits));
    renderKits();
    closeKitModal();
    
    window.dispatchEvent(new Event('storage'));
}

function deleteKit(id) {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
        kits = kits.filter(k => k.id !== id);
        localStorage.setItem('solar_kits', JSON.stringify(kits));
        renderKits();
        
        window.dispatchEvent(new Event('storage'));
    }
}

// Update promotion logic to allow selecting a product
function populateProductSelectForPromos() {
    const select = document.getElementById('promoProductSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Seleccionar un Producto --</option>';
    kits.forEach(kit => {
        const option = document.createElement('option');
        option.value = kit.id;
        option.textContent = `${kit.name} ($${Number(kit.price).toLocaleString('es-MX')})`;
        select.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const kitForm = document.getElementById('kitForm');
    if (kitForm) {
        kitForm.addEventListener('submit', saveKit);
    }
    
    // Si estamos en la página del admin, sobreescribimos la función de mostrar el modal de promo
    // para cargar los productos en el select si existe.
    if (typeof window.showPromoModal !== 'undefined') {
        const originalShowPromoModal = window.showPromoModal;
        window.showPromoModal = function(id = null) {
            populateProductSelectForPromos();
            originalShowPromoModal(id);
        };
    }
});